import { suggestFoodsForRecipe } from '@/lib/food-helpers'
import { requireSessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    await requireSessionUser()
    const body = await request.json()
    const recipeName = typeof body.recipeName === 'string' ? body.recipeName.trim() : ''
    const foods = Array.isArray(body.foods) ? body.foods : []

    if (!recipeName) {
      return NextResponse.json({ message: 'レシピ名を入力してください' }, { status: 400 })
    }

    const suggestions = await suggestFoodsForRecipe(recipeName, foods)

    return NextResponse.json({ suggestions })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: '食材推定に失敗しました' }, { status: 500 })
  }
}
