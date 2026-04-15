import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Gender } from '@prisma/client'
import { NextResponse } from 'next/server'
import { JAPAN_PREFECTURES } from '@/lib/japanPrefectures'

function parseGender(value: unknown): Gender | null {
  if (value === undefined || value === null || value === '') return null
  if (typeof value !== 'string') return null
  const u = value.toUpperCase() as Gender
  return Object.values(Gender).includes(u) ? u : null
}

function parsePrefecture(value: unknown): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  if (typeof value !== 'string') return undefined
  return JAPAN_PREFECTURES.includes(value as (typeof JAPAN_PREFECTURES)[number])
    ? value
    : undefined
}

// GET /api/user/profile — プロフィール取得
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role === 'ADMIN') {
    return NextResponse.json({ error: '管理者アカウントでは利用できません' }, { status: 403 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      gender: true,
      prefecture: true,
      role: true,
    },
  })
  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(user)
}

// PUT /api/user/profile — プロフィール更新
export async function PUT(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if ((session.user as { role?: string }).role === 'ADMIN') {
    return NextResponse.json(
      { error: '管理者アカウントでは利用できません' },
      { status: 403 }
    )
  }

  const body = await request.json()
  const { name } = body

  if (typeof name !== 'string' || name.trim() === '') {
    return NextResponse.json({ error: 'name は必須です' }, { status: 400 })
  }

  const gender = parseGender(body.gender)
  if (body.gender !== undefined && body.gender !== null && body.gender !== '' && gender === null) {
    return NextResponse.json({ error: '性別の値が不正です' }, { status: 400 })
  }

  const prefecture = parsePrefecture(body.prefecture)
  if (body.prefecture !== undefined && prefecture === undefined) {
    return NextResponse.json({ error: '都道府県の値が不正です' }, { status: 400 })
  }

  const data: { name: string; gender?: Gender; prefecture?: string | null } = {
    name: name.trim(),
  }
  if (gender !== null) data.gender = gender
  if (prefecture !== undefined) data.prefecture = prefecture

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      gender: true,
      prefecture: true,
      role: true,
    },
  })

  return NextResponse.json(user)
}
