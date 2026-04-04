import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, context: { params: Promise<{ token: string }> }) {
  const { token } = await context.params

  const invitation = await prisma.fridgeInvitation.findUnique({
    where: { token },
    include: {
      fridge: {
        select: {
          id: true,
          name: true,
          members: {
            select: { id: true },
          },
        },
      },
    },
  })

  if (!invitation || invitation.expiresAt < new Date()) {
    return NextResponse.json({ message: '招待リンクが無効です' }, { status: 404 })
  }

  return NextResponse.json({
    fridgeId: invitation.fridge.id,
    fridgeName: invitation.fridge.name,
    memberCount: invitation.fridge.members.length,
    expiresAt: invitation.expiresAt.toISOString(),
  })
}
