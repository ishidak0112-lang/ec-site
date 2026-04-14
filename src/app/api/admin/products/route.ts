import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/admin/products - 全商品一覧（非公開含む）
export async function GET() {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(products)
}

// POST /api/admin/products - 商品新規作成
export async function POST(request: Request) {
  const session = await auth()
  if (!session || (session.user as any).role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, price, stock, imageUrl, categoryId, published } = body

  if (!name || price == null || stock == null) {
    return NextResponse.json({ error: 'name, price, stock は必須です' }, { status: 400 })
  }

  const product = await prisma.product.create({
    data: {
      name,
      description: description ?? null,
      price: Number(price),
      stock: Number(stock),
      imageUrl: imageUrl ?? null,
      categoryId: categoryId ?? null,
      published: published ?? false,
    },
    include: { category: true },
  })

  return NextResponse.json(product, { status: 201 })
}
