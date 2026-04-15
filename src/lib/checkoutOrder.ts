import { Prisma, PrismaClient } from '@prisma/client'
import Stripe from 'stripe'

type Tx = PrismaClient | Prisma.TransactionClient

function parseItemsJson(session: Stripe.Checkout.Session) {
  const raw = session.metadata?.itemsJson ?? '[]'
  const parsed = JSON.parse(raw) as Array<{
    productId: string
    name: string
    price: number
    quantity: number
  }>
  return Array.isArray(parsed) ? parsed : []
}

export async function createOrderFromCheckoutSession(
  tx: Tx,
  session: Stripe.Checkout.Session
) {
  const sessionId = session.id
  const metadata = session.metadata

  if (!metadata?.userId) {
    throw new Error('MISSING_METADATA')
  }

  const existing = await tx.order.findUnique({
    where: { stripeCheckoutSessionId: sessionId },
  })
  if (existing) {
    return { kind: 'existing' as const, order: existing }
  }

  const items = parseItemsJson(session)
  for (const item of items) {
    const result = await tx.product.updateMany({
      where: {
        id: item.productId,
        stock: { gte: item.quantity },
      },
      data: {
        stock: { decrement: item.quantity },
      },
    })
    if (result.count !== 1) {
      throw new Error('INSUFFICIENT_STOCK')
    }
  }

  const paymentIntentId =
    typeof session.payment_intent === 'string'
      ? session.payment_intent
      : session.payment_intent?.id ?? null

  const order = await tx.order.create({
    data: {
      userId: metadata.userId,
      totalAmount: session.amount_total ?? 0,
      status: 'PAID',
      paymentMethod: 'credit',
      stripePaymentId: paymentIntentId,
      stripeCheckoutSessionId: sessionId,
      shippingName: metadata.shippingName ?? '',
      shippingEmail: metadata.shippingEmail ?? '',
      shippingPhone: metadata.shippingPhone ?? '',
      shippingZip: metadata.shippingZip ?? '',
      shippingPrefecture: metadata.shippingPrefecture ?? '',
      shippingCity: metadata.shippingCity ?? '',
      shippingAddress: metadata.shippingAddress ?? '',
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      },
    },
  })

  return { kind: 'created' as const, order }
}
