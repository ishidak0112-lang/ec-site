import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// 売上計上対象ステータス（キャンセル除外）
const SALES_STATUSES = ['PAID', 'SHIPPED', 'DELIVERED'] as const

// GET /api/admin/sales?year=2026
export async function GET(request: Request) {
  try {
    const session = await auth()
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))

    const yearStart = new Date(`${year}-01-01T00:00:00+09:00`)
    const yearEnd = new Date(`${year}-12-31T23:59:59.999+09:00`)
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)

    // 累計サマリー
    const [totalAgg, thisMonthAgg, totalCount] = await Promise.all([
      prisma.order.aggregate({
        where: { status: { in: SALES_STATUSES } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.aggregate({
        where: { status: { in: SALES_STATUSES }, createdAt: { gte: monthStart } },
        _sum: { totalAmount: true },
        _count: true,
      }),
      prisma.order.count({ where: { status: { in: SALES_STATUSES } } }),
    ])

    const totalRevenue = totalAgg._sum.totalAmount ?? 0
    const avgOrderValue = totalCount > 0 ? Math.round(totalRevenue / totalCount) : 0

    // 月別売上（指定年）
    const ordersInYear = await prisma.order.findMany({
      where: {
        status: { in: SALES_STATUSES },
        createdAt: { gte: yearStart, lte: yearEnd },
      },
      select: { totalAmount: true, createdAt: true },
    })

    const monthly = Array.from({ length: 12 }, (_, i) => {
      const month = i + 1
      const orders = ordersInYear.filter(o => {
        const d = new Date(o.createdAt)
        return d.getMonth() + 1 === month
      })
      return {
        month,
        revenue: orders.reduce((s, o) => s + o.totalAmount, 0),
        count: orders.length,
      }
    })

    // カテゴリ別売上（累計）
    const itemsWithCategory = await prisma.orderItem.findMany({
      where: { order: { status: { in: SALES_STATUSES } } },
      include: {
        product: { select: { category: { select: { name: true } } } },
      },
    })

    const categoryMap: Record<string, { revenue: number; count: number }> = {}
    for (const item of itemsWithCategory) {
      const name = item.product.category?.name ?? '未設定'
      if (!categoryMap[name]) categoryMap[name] = { revenue: 0, count: 0 }
      categoryMap[name].revenue += item.unitPrice * item.quantity
      categoryMap[name].count += item.quantity
    }
    const byCategory = Object.entries(categoryMap)
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.revenue - a.revenue)

    // ステータス別件数
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
      _sum: { totalAmount: true },
    })

    return NextResponse.json({
      summary: {
        totalRevenue,
        thisMonthRevenue: thisMonthAgg._sum.totalAmount ?? 0,
        thisMonthCount: thisMonthAgg._count,
        totalCount,
        avgOrderValue,
      },
      monthly,
      byCategory,
      byStatus: statusCounts.map(s => ({
        status: s.status,
        count: s._count,
        revenue: s._sum.totalAmount ?? 0,
      })),
    })
  } catch (error) {
    console.error('[GET /api/admin/sales]', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
