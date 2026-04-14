import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/categories - カテゴリ一覧
export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(categories)
}
