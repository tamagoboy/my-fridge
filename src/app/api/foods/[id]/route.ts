import { prisma } from '@/lib/prisma'
import { requireSessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

function serializeFood(food: Awaited<ReturnType<typeof prisma.food.findFirstOrThrow>>) {
  return {
    ...food,
    expiryDate: food.expiryDate?.toISOString() ?? null,
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireSessionUser()
    const { id } = await context.params
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : undefined
    const category = typeof body.category === 'string' ? body.category : body.category === null ? null : undefined
    const remainingStatus = typeof body.remainingStatus === 'string' ? body.remainingStatus : undefined
    const storageLocationId = typeof body.storageLocationId === 'string'
      ? body.storageLocationId || null
      : body.storageLocationId === null
        ? null
        : undefined
    const expiryDate = typeof body.expiryDate === 'string'
      ? (body.expiryDate ? new Date(body.expiryDate) : null)
      : body.expiryDate === null
        ? null
        : undefined

    const existingFood = await prisma.food.findFirst({
      where: {
        id,
        fridgeId: user.fridgeId,
      },
    })

    if (!existingFood) {
      return NextResponse.json({ message: '食材が見つかりません' }, { status: 404 })
    }

    const food = await prisma.food.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(category !== undefined ? { category } : {}),
        ...(remainingStatus !== undefined ? { remainingStatus } : {}),
        ...(storageLocationId !== undefined ? { storageLocationId } : {}),
        ...(expiryDate !== undefined ? { expiryDate } : {}),
      },
      include: {
        storageLocation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(serializeFood(food))
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: '食材の更新に失敗しました' }, { status: 500 })
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireSessionUser()
    const { id } = await context.params
    const existingFood = await prisma.food.findFirst({
      where: {
        id,
        fridgeId: user.fridgeId,
      },
    })

    if (!existingFood) {
      return NextResponse.json({ message: '食材が見つかりません' }, { status: 404 })
    }

    await prisma.food.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: '食材の削除に失敗しました' }, { status: 500 })
  }
}
