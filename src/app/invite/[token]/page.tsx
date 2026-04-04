import { InviteJoinClient } from '@/components/InviteJoinClient'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

interface InvitePageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const session = await getServerSession(authOptions)
  const { token } = await params

  if (!session?.user) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`)
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_28%)] px-6 py-16">
      <div className="mx-auto max-w-xl">
        <InviteJoinClient token={token} />
      </div>
    </main>
  )
}
