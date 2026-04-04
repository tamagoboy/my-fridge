import { estimateExpiryDate } from '@/lib/food-helpers'
import { prisma } from '@/lib/prisma'
import { requireSessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser()
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const storageLocationId = typeof body.storageLocationId === 'string' && body.storageLocationId ? body.storageLocationId : null

    if (!name) {
      return NextResponse.json({ message: '食材名を入力してください' }, { status: 400 })
    }

    const storageLocation = storageLocationId
      ? await prisma.storageLocation.findFirst({
          where: {
            id: storageLocationId,
            fridgeId: user.fridgeId,
          },
          select: {
            name: true,
          },
        })
      : null

    const expiryDate = await estimateExpiryDate(name, storageLocation?.name ?? null)

    return NextResponse.json({ expiryDate: expiryDate.toISOString() })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: '賞味期限の推定に失敗しました' }, { status: 500 })
  }
}
