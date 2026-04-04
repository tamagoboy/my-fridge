'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Refrigerator, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface InviteJoinClientProps {
  token: string
}

type InvitationSummary = {
  fridgeId: string
  fridgeName: string
  memberCount: number
  expiresAt: string
}

export function InviteJoinClient({ token }: InviteJoinClientProps) {
  const router = useRouter()
  const [summary, setSummary] = useState<InvitationSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)

  useEffect(() => {
    const loadSummary = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/fridge/invite/${token}`)
        if (!response.ok) {
          throw new Error('招待リンクが無効です')
        }

        setSummary(await response.json())
      } catch {
        toast.error('招待リンクを確認できませんでした')
      } finally {
        setIsLoading(false)
      }
    }

    void loadSummary()
  }, [token])

  const handleJoin = async () => {
    setIsJoining(true)
    try {
      const response = await fetch(`/api/fridge/join/${token}`, { method: 'POST' })
      if (!response.ok) {
        throw new Error('参加に失敗しました')
      }

      toast.success('冷蔵庫に参加しました')
      router.push('/dashboard')
      router.refresh()
    } catch {
      toast.error('冷蔵庫への参加に失敗しました')
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <Card className="rounded-[2rem] border-zinc-200 shadow-xl shadow-zinc-950/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl text-zinc-950">
          <Refrigerator className="size-6 text-orange-600" />
          招待された冷蔵庫に参加
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-6 animate-spin text-zinc-400" />
          </div>
        ) : summary ? (
          <>
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50 p-4">
              <p className="text-sm text-zinc-500">冷蔵庫名</p>
              <p className="mt-1 text-lg font-semibold text-zinc-950">{summary.fridgeName}</p>
              <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
                <Users className="size-4" />
                現在のメンバー: {summary.memberCount} 人
              </p>
            </div>

            <Alert>
              <Users className="size-4" />
              <AlertTitle>参加時の挙動</AlertTitle>
              <AlertDescription>
                既に別の冷蔵庫に所属している場合は、現在の所属先から離れてこの冷蔵庫に切り替わります。
              </AlertDescription>
            </Alert>

            <Button onClick={handleJoin} disabled={isJoining} className="w-full">
              {isJoining ? <Loader2 className="size-4 animate-spin" /> : null}
              この冷蔵庫に参加する
            </Button>
          </>
        ) : (
          <Alert variant="destructive">
            <Users className="size-4" />
            <AlertTitle>招待リンクが無効です</AlertTitle>
            <AlertDescription>
              有効期限切れの可能性があります。招待した人に再発行を依頼してください。
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
