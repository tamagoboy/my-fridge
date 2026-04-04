import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'

export async function requireSessionUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id || !session.user.fridgeId) {
    throw new Error('UNAUTHORIZED')
  }

  return session.user
}
