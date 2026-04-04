import { joinFridgeByInvitation } from '@/lib/fridge'
import { requireSessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST(_request: Request, context: { params: Promise<{ token: string }> }) {
  try {
    const user = await requireSessionUser()
    const { token } = await context.params
    const result = await joinFridgeByInvitation(user.id, token)

    return NextResponse.json(result)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    if (error instanceof Error && error.message === 'INVALID_INVITATION') {
      return NextResponse.json({ message: '招待リンクが無効です' }, { status: 400 })
    }

    return NextResponse.json({ message: '参加処理に失敗しました' }, { status: 500 })
  }
}
