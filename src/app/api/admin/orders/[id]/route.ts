import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  OrderAccountingStatus,
  OrderPackageCondition,
  OrderReturnStatus,
  OrderStatus,
} from '@prisma/client'
import { NextResponse } from 'next/server'

function parseEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  if (typeof value !== 'string') return null
  const upper = value.toUpperCase() as T
  return allowed.includes(upper) ? upper : null
}

// PUT /api/admin/orders/[id] — 注文の更新（ADMIN 専用）
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, packageCondition, accountingStatus, returnStatus } = body as Record<
      string,
      unknown
    >

    const data: {
      status?: OrderStatus
      packageCondition?: OrderPackageCondition
      accountingStatus?: OrderAccountingStatus
      returnStatus?: OrderReturnStatus
    } = {}

    if (status !== undefined) {
      const s = parseEnum(status, Object.values(OrderStatus))
      if (!s) {
        return NextResponse.json({ error: '無効な注文ステータスです' }, { status: 400 })
      }
      data.status = s
    }
    if (packageCondition !== undefined) {
      const p = parseEnum(packageCondition, Object.values(OrderPackageCondition))
      if (!p) {
        return NextResponse.json({ error: '無効な開封状態です' }, { status: 400 })
      }
      data.packageCondition = p
    }
    if (accountingStatus !== undefined) {
      const a = parseEnum(accountingStatus, Object.values(OrderAccountingStatus))
      if (!a) {
        return NextResponse.json({ error: '無効な会計状態です' }, { status: 400 })
      }
      data.accountingStatus = a
    }
    if (returnStatus !== undefined) {
      const r = parseEnum(returnStatus, Object.values(OrderReturnStatus))
      if (!r) {
        return NextResponse.json({ error: '無効な返品ステータスです' }, { status: 400 })
      }
      data.returnStatus = r
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: 'status / packageCondition / accountingStatus / returnStatus のいずれかを指定してください' },
        { status: 400 }
      )
    }

    const order = await prisma.order.update({
      where: { id },
      data,
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
        user: { select: { name: true, email: true, gender: true, prefecture: true } },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('[PUT /api/admin/orders/[id]]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
