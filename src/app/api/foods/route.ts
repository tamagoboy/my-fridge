import { requireSessionUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

function toFoodPayload(food: Awaited<ReturnType<typeof prisma.food.findMany>>[number]) {
  return {
    ...food,
    expiryDate: food.expiryDate?.toISOString() ?? null,
  }
}

async function upsertInputHistory(fridgeId: string, name: string, category: string | null) {
  await prisma.inputHistory.upsert({
    where: {
      fridgeId_name: {
        fridgeId,
        name,
      },
    },
    update: {
      count: { increment: 1 },
      category,
    },
    create: {
      fridgeId,
      name,
      category,
    },
  })
}

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser()
    const { searchParams } = new URL(request.url)
    const storageLocationId = searchParams.get('storageLocationId')

    const foods = await prisma.food.findMany({
      where: {
        fridgeId: user.fridgeId,
        ...(storageLocationId ? { storageLocationId } : {}),
      },
      include: {
        storageLocation: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    })

    return NextResponse.json(foods.map(toFoodPayload))
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: '食材の取得に失敗しました' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSessionUser()
    const body = await request.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const category = typeof body.category === 'string' ? body.category : null
    const remainingStatus = typeof body.remainingStatus === 'string' ? body.remainingStatus : 'full'
    const storageLocationId = typeof body.storageLocationId === 'string' && body.storageLocationId ? body.storageLocationId : null
    const expiryDate = typeof body.expiryDate === 'string' && body.expiryDate ? new Date(body.expiryDate) : null

    if (!name) {
      return NextResponse.json({ message: '食材名は必須です' }, { status: 400 })
    }

    if (storageLocationId) {
      const location = await prisma.storageLocation.findFirst({
        where: { id: storageLocationId, fridgeId: user.fridgeId },
      })

      if (!location) {
        return NextResponse.json({ message: '保管場所が見つかりません' }, { status: 400 })
      }
    }

    const food = await prisma.food.create({
      data: {
        fridgeId: user.fridgeId,
        name,
        category,
        remainingStatus,
        storageLocationId,
        expiryDate,
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

    await upsertInputHistory(user.fridgeId, name, category).catch((err) => {
      console.warn('InputHistory upsert failed:', err)
    })

    return NextResponse.json(toFoodPayload(food), { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    console.error('POST /api/foods error:', error)
    const message = error instanceof Error ? error.message : '食材の追加に失敗しました'
    return NextResponse.json({ message }, { status: 500 })
  }
}
