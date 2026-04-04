import { prisma } from '@/lib/prisma'
import { requireSessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

const NEXT_STATUS: Record<string, string | null> = {
  full: 'half',
  half: 'little',
  little: null,
}

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
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

    const nextStatus = NEXT_STATUS[existingFood.remainingStatus]

    if (!nextStatus) {
      await prisma.food.delete({ where: { id } })
      return NextResponse.json({ deleted: true })
    }

    const updatedFood = await prisma.food.update({
      where: { id },
      data: {
        remainingStatus: nextStatus,
      },
    })

    return NextResponse.json({
      ...updatedFood,
      expiryDate: updatedFood.expiryDate?.toISOString() ?? null,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: '消費更新に失敗しました' }, { status: 500 })
  }
}
