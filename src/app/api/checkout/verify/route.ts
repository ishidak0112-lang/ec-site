import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createOrderFromCheckoutSession } from '@/lib/checkoutOrder'
import { Prisma } from '@prisma/client'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
  }

  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch (e) {
    console.error('[checkout/verify] Stripe retrieve failed', e)
    return NextResponse.json(
      { error: 'セッションの取得に失敗しました。URL を確認するか、しばらくしてから注文履歴を確認してください。' },
      { status: 502 }
    )
  }

  let orderId = session.id

  // Webhook未達（ローカル開発など）でも、決済済みセッションはここで注文を確定させる
  if (session.payment_status === 'paid') {
    try {
      const result = await prisma.$transaction((tx) =>
        createOrderFromCheckoutSession(tx, session)
      )
      orderId = result.order.id
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const existing = await prisma.order.findUnique({
          where: { stripeCheckoutSessionId: session.id },
          select: { id: true },
        })
        if (existing) orderId = existing.id
      } else {
        console.error('[checkout/verify] failed to reconcile paid session', err)
        const message =
          err instanceof Error && err.message === 'INSUFFICIENT_STOCK'
            ? '在庫不足のため注文を確定できませんでした。サポートまでお問い合わせください。'
            : err instanceof Error && err.message === 'MISSING_METADATA'
              ? '注文メタデータが欠落しています。サポートまでお問い合わせください。'
              : '注文の確定処理に失敗しました。マイページの注文履歴を確認するか、時間をおいて再度お試しください。'
        return NextResponse.json({ error: message }, { status: 500 })
      }
    }
  }

  return NextResponse.json({
    orderId,
    totalAmount: session.amount_total ?? 0,
    shippingName: session.metadata?.shippingName ?? '',
  })
}
