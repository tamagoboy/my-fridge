import { prisma } from '@/lib/prisma'
import { requireSessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await requireSessionUser()
    const locations = await prisma.storageLocation.findMany({
      where: { fridgeId: user.fridgeId },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })

    return NextResponse.json(locations)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: '保管場所の取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser()
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''

    if (!name) {
      return NextResponse.json({ message: '保管場所名を入力してください' }, { status: 400 })
    }

    const lastLocation = await prisma.storageLocation.findFirst({
      where: { fridgeId: user.fridgeId },
      orderBy: { sortOrder: 'desc' },
      select: { sortOrder: true },
    })

    const location = await prisma.storageLocation.create({
      data: {
        fridgeId: user.fridgeId,
        name,
        sortOrder: (lastLocation?.sortOrder ?? -1) + 1,
      },
    })

    return NextResponse.json(location, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: '保管場所の追加に失敗しました' }, { status: 500 })
  }
}
