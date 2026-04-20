import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'
import { resolveSiteUrl } from '@/lib/siteUrl'
import { JAPAN_PREFECTURES } from '@/lib/japanPrefectures'

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
  imageUrl?: string
}

interface ShippingInfo {
  name: string
  email: string
  phone: string
  zipCode: string
  /** 都道府県（47都道府県のいずれか） */
  prefecture: string
  city: string
  address: string
}

interface CheckoutSessionRequest {
  items: CartItem[]
  shipping: ShippingInfo
  totalAmount: number
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role === 'ADMIN') {
    return NextResponse.json(
      { error: '管理者アカウントでは購入手続きは利用できません' },
      { status: 403 }
    )
  }

  const body: CheckoutSessionRequest = await req.json()
  const { items, shipping, totalAmount } = body

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const productIds = [...new Set(items.map(i => i.productId))]
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, published: true },
    select: { id: true, stock: true },
  })
  const stockById = new Map(dbProducts.map(p => [p.id, p.stock]))

  for (const item of items) {
    const stock = stockById.get(item.productId)
    if (stock === undefined || stock < item.quantity) {
      return NextResponse.json(
        { error: '在庫が不足しているか、取り扱いのない商品が含まれています' },
        { status: 400 }
      )
    }
  }

  if (
    !shipping.prefecture ||
    !JAPAN_PREFECTURES.includes(
      shipping.prefecture as (typeof JAPAN_PREFECTURES)[number]
    )
  ) {
    return NextResponse.json({ error: '配送先の都道府県を選択してください' }, { status: 400 })
  }

  const lineItems = items.map((item) => {
    const isValidImageUrl = (() => {
      if (!item.imageUrl) return false
      try {
        const u = new URL(item.imageUrl)
        return u.protocol === 'https:'
      } catch {
        return false
      }
    })()
    return {
      price_data: {
        currency: 'jpy',
        product_data: {
          name: item.name,
          ...(isValidImageUrl ? { images: [item.imageUrl!] } : {}),
        },
        unit_amount: item.price,
      },
      quantity: item.quantity,
    }
  })

  try {
    const siteUrl = resolveSiteUrl(req)
    console.log('[checkout/session] siteUrl:', siteUrl)
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${siteUrl}/order-complete`,
      cancel_url: `${siteUrl}/checkout`,
      metadata: {
        userId: session.user.id,
        shippingName: shipping.name,
        shippingEmail: shipping.email,
        shippingPhone: shipping.phone,
        shippingZip: shipping.zipCode,
        shippingPrefecture: shipping.prefecture,
        shippingCity: shipping.city,
        shippingAddress: shipping.address,
        itemsJson: JSON.stringify(
          items.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          }))
        ),
      },
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    console.error('Stripe session error:', err?.message, 'param:', err?.param)
    const message = err instanceof Error ? err.message : 'Stripe error'
    const param = err?.param ?? 'unknown'
    const keyHint = (process.env.STRIPE_SECRET_KEY ?? '').slice(0, 14) + '...'
    return NextResponse.json({ error: `${message} | param=${param} | key=${keyHint}` }, { status: 500 })
  }
}
