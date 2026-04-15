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

  const session = await stripe.checkout.sessions.retrieve(sessionId)
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
      }
    }
  }

  return NextResponse.json({
    orderId,
    totalAmount: session.amount_total ?? 0,
    shippingName: session.metadata?.shippingName ?? '',
  })
}
