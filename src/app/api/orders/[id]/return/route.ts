import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { OrderPackageCondition, OrderReturnStatus, OrderStatus } from '@prisma/client'

const RETURNABLE_STATUSES: OrderStatus[] = ['PAID', 'SHIPPED', 'DELIVERED']

// POST /api/orders/[id]/return - ユーザー返品申請
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if ((session.user as { role?: string }).role === 'ADMIN') {
      return NextResponse.json({ error: '管理者は申請できません' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json().catch(() => ({}))
    const packageConditionRaw = body?.packageCondition
    const packageCondition =
      typeof packageConditionRaw === 'string'
        ? (packageConditionRaw.toUpperCase() as OrderPackageCondition)
        : undefined

    if (
      packageCondition &&
      !Object.values(OrderPackageCondition).includes(packageCondition)
    ) {
      return NextResponse.json({ error: '無効な開封状態です' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        returnStatus: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!RETURNABLE_STATUSES.includes(order.status)) {
      return NextResponse.json(
        { error: '現在の注文ステータスでは返品申請できません' },
        { status: 400 }
      )
    }
    if (order.returnStatus !== OrderReturnStatus.NONE) {
      return NextResponse.json({ error: 'すでに返品申請済みです' }, { status: 409 })
    }

    const updated = await prisma.order.update({
      where: { id },
      data: {
        returnStatus: OrderReturnStatus.REQUESTED,
        ...(packageCondition ? { packageCondition } : {}),
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true, imageUrl: true },
            },
          },
        },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Prisma.PrismaClientValidationError) {
      return NextResponse.json(
        {
          error:
            'サーバーの Prisma スキーマが古い状態です。`npx prisma generate` 後に dev サーバーを再起動してください。',
        },
        { status: 500 }
      )
    }
    console.error('[POST /api/orders/[id]/return]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
