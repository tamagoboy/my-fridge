import { prisma } from '@/lib/prisma'
import { requireSessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const user = await requireSessionUser()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() ?? ''

    if (!query) {
      return NextResponse.json([])
    }

    const suggestions = await prisma.inputHistory.findMany({
      where: {
        fridgeId: user.fridgeId,
        name: {
          contains: query,
          mode: 'insensitive',
        },
      },
      orderBy: [{ count: 'desc' }, { name: 'asc' }],
      take: 8,
      select: {
        name: true,
      },
    })

    return NextResponse.json(suggestions.map((suggestion) => suggestion.name))
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: 'サジェストの取得に失敗しました' }, { status: 500 })
  }
}
