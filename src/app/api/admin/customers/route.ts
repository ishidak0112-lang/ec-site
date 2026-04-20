import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

const PAGE_SIZE_MAX = 100

/** GET /api/admin/customers */
export async function GET(request: Request) {
  const session = await auth()
  if (!session || (session.user as { role?: string }).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = new URL(request.url)
  const search     = url.searchParams.get('search')?.trim() ?? ''
  const prefecture = url.searchParams.get('prefecture')?.trim() ?? ''
  const gender     = url.searchParams.get('gender')?.trim() ?? ''       // MALE | FEMALE | UNKNOWN
  const hasOrders  = url.searchParams.get('hasOrders') ?? ''            // 'yes' | 'no'
  const sortBy     = url.searchParams.get('sortBy') ?? 'createdAt'      // createdAt | name | orderCount
  const sortOrder  = url.searchParams.get('sortOrder') === 'asc' ? 'asc' : 'desc'
  const page       = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'))
  const limit      = Math.min(PAGE_SIZE_MAX, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20')))

  const where: any = { role: 'USER' }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (prefecture) where.prefecture = prefecture
  if (gender)     where.gender = gender
  if (hasOrders === 'yes') where.orders = { some: {} }
  if (hasOrders === 'no')  where.orders = { none: {} }

  // orderCount ソートは Prisma の orderBy では直接使えないため件数取得後にソート
  const orderBy =
    sortBy === 'name' ? { name: sortOrder as 'asc' | 'desc' } :
    sortBy === 'email' ? { email: sortOrder as 'asc' | 'desc' } :
    { createdAt: sortOrder as 'asc' | 'desc' }

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        gender: true,
        prefecture: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: sortBy === 'orderCount' ? undefined : orderBy,
      ...(sortBy === 'orderCount' ? {} : { skip: (page - 1) * limit, take: limit }),
    }),
  ])

  // orderCount ソートはアプリ側で処理
  let result = users
  if (sortBy === 'orderCount') {
    result = users.sort((a, b) =>
      sortOrder === 'desc'
        ? b._count.orders - a._count.orders
        : a._count.orders - b._count.orders
    ).slice((page - 1) * limit, page * limit)
  }

  return NextResponse.json({
    users: result,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit,
  })
}
