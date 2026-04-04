import { createOrRefreshInvitation } from '@/lib/fridge'
import { requireSessionUser } from '@/lib/session'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const user = await requireSessionUser()
    const invitation = await createOrRefreshInvitation(user.fridgeId)

    return NextResponse.json(invitation)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ message: '認証が必要です' }, { status: 401 })
    }

    return NextResponse.json({ message: '招待リンクの発行に失敗しました' }, { status: 500 })
  }
}
