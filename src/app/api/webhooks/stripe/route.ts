import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { createOrderFromCheckoutSession } from '@/lib/checkoutOrder'
import { Prisma } from '@prisma/client'
import Stripe from 'stripe'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      Buffer.from(body),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Webhook] Signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const sessionId = session.id

    try {
      await prisma.$transaction(async tx => {
        await createOrderFromCheckoutSession(tx, session)
      })

      console.log(`[Webhook] Order processed for session: ${sessionId}`)
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        console.log(
          `[Webhook] Duplicate stripeCheckoutSessionId ignored: ${sessionId}`
        )
        return NextResponse.json({ received: true })
      }

      if (err instanceof Error && err.message === 'INSUFFICIENT_STOCK') {
        console.error(
          '[Webhook] Insufficient stock after payment — manual handling may be required:',
          sessionId
        )
        return NextResponse.json(
          { error: 'Insufficient stock' },
          { status: 500 }
        )
      }

      if (err instanceof Error && err.message === 'MISSING_METADATA') {
        console.error('[Webhook] Missing userId in metadata')
        return NextResponse.json({ error: 'Missing metadata' }, { status: 400 })
      }

      console.error('[Webhook] Failed to process order:', err)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }
  }

  return NextResponse.json({ received: true })
}
