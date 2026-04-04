import { prisma } from '@/lib/prisma'
import { requireSessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireSessionUser()
    const { id } = await context.params
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''

    if (!name) {
      return NextResponse.json({ message: '保管場所名を入力してください' }, { status: 400 })
    }

    const location = await prisma.storageLocation.findFirst({
      where: { id, fridgeId: user.fridgeId },
    })

    if (!location) {
      return NextResponse.json({ message: '保管場所が見つかりません' }, { status: 404 })
    }

    const updated = await prisma.storageLocation.update({
      where: { id },
      data: { name },
    })

    return NextResponse.json(updated)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: '保管場所の更新に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireSessionUser()
    const { id } = await context.params
    const location = await prisma.storageLocation.findFirst({
      where: { id, fridgeId: user.fridgeId },
      include: { foods: { select: { id: true } } },
    })

    if (!location) {
      return NextResponse.json({ message: '保管場所が見つかりません' }, { status: 404 })
    }

    if (location.foods.length > 0) {
      await prisma.food.updateMany({
        where: { storageLocationId: id },
        data: { storageLocationId: null },
      })
    }

    await prisma.storageLocation.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: '保管場所の削除に失敗しました' }, { status: 500 })
  }
}
