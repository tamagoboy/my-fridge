import { getFridgeMembers } from '@/lib/fridge'
import { requireSessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const user = await requireSessionUser()
    const members = await getFridgeMembers(user.fridgeId)

    return NextResponse.json(members)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: 'メンバー取得に失敗しました' }, { status: 500 })
  }
}
