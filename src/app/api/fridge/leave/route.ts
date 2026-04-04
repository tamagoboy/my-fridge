import { leaveCurrentFridge } from '@/lib/fridge'
import { requireSessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const user = await requireSessionUser()
    const result = await leaveCurrentFridge(user.id)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: '冷蔵庫からの離脱に失敗しました' }, { status: 500 })
  }
}