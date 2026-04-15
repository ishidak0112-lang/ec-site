import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'

const YMD = /^\d{4}-\d{2}-\d{2}$/

/** 管理画面の日付（YYYY-MM-DD）を日本時間の日の範囲に変換 */
function createdAtFromQuery(dateFrom: string | null, dateTo: string | null) {
  const from = dateFrom?.trim() || null
  const to = dateTo?.trim() || null
  if (!from && !to) return null
  if (from && !YMD.test(from)) return 'bad'
  if (to && !YMD.test(to)) return 'bad'
  const filter: Prisma.DateTimeFilter = {}
  if (from) filter.gte = new Date(`${from}T00:00:00+09:00`)
  if (to) filter.lte = new Date(`${to}T23:59:59.999+09:00`)
  if (filter.gte && filter.lte && filter.gte > filter.lte) return 'range'
  return filter
}

// GET /api/admin/orders - 全注文一覧（ADMIN専用）
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    const createdFilter = createdAtFromQuery(dateFrom, dateTo)
    if (createdFilter === 'bad') {
      return NextResponse.json({ error: '日付は YYYY-MM-DD で指定してください' }, { status: 400 })
    }
    if (createdFilter === 'range') {
      return NextResponse.json({ error: '開始日は終了日以前にしてください' }, { status: 400 })
    }

    const searchWhere: Prisma.OrderWhereInput | undefined = search
      ? {
          OR: [
            { shippingName: { contains: search, mode: 'insensitive' } },
            { shippingEmail: { contains: search, mode: 'insensitive' } },
            { shippingPrefecture: { contains: search } },
            { id: { contains: search } },
            {
              user: {
                email: { contains: search, mode: 'insensitive' },
              },
            },
            {
              user: {
                prefecture: { contains: search },
              },
            },
          ],
        }
      : undefined

    const where: Prisma.OrderWhereInput | undefined =
      searchWhere && createdFilter
        ? { AND: [searchWhere, { createdAt: createdFilter }] }
        : searchWhere
          ? searchWhere
          : createdFilter
            ? { createdAt: createdFilter }
            : undefined

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: { select: { name: true } },
          },
        },
        user: { select: { name: true, email: true, gender: true, prefecture: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('[GET /api/admin/orders]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
