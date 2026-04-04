'use client'

import { ConsumeConfirmModal } from '@/components/ConsumeConfirmModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDeleteFood, useFoods } from '@/hooks/useFoods'
import type { ConsumeSuggestion } from '@/types/food'
import { ArrowLeft, Loader2, Utensils } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function ConsumePage() {
  const [recipeName, setRecipeName] = useState('')
  const [isEstimating, setIsEstimating] = useState(false)
  const [suggestions, setSuggestions] = useState<ConsumeSuggestion[] | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const { data: foods = [] } = useFoods(null)
  const deleteFood = useDeleteFood()

  const handleEstimate = async () => {
    if (!recipeName.trim()) {
      toast.error('レシピ名を入力してください')
      return
    }
    setIsEstimating(true)
    try {
      const res = await fetch('/api/consume/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipeName: recipeName.trim(),
          foods: foods.map((f) => ({
            id: f.id,
            name: f.name,
            remainingStatus: f.remainingStatus,
          })),
        }),
      })
      if (!res.ok) throw new Error('推定に失敗しました')
      const data = await res.json()
      setSuggestions(data.suggestions ?? [])
    } catch {
      toast.error('食材の推定に失敗しました')
    } finally {
      setIsEstimating(false)
    }
  }

  const handleConfirm = async (updates: { id: string; newStatus: 'little' | 'delete' }[]) => {
    setIsConfirming(true)
    try {
      for (const update of updates) {
        if (update.newStatus === 'delete') {
          await deleteFood.mutateAsync(update.id)
        } else {
          await fetch(`/api/foods/${update.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ remainingStatus: update.newStatus }),
          })
        }
      }
      toast.success(`${updates.length}件の食材を消費しました`)
      setSuggestions(null)
      setRecipeName('')
    } catch {
      toast.error('消費の更新に失敗しました')
    } finally {
      setIsConfirming(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* ヘッダー */}
      <div className="mb-6 flex items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm">
          <Link href="/dashboard">
            <ArrowLeft className="size-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold text-zinc-900">AIで食材を消費</h1>
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Utensils className="size-5 text-green-600" />
          <h2 className="font-semibold text-zinc-800">レシピ名から消費する食材を推定</h2>
        </div>
        <p className="mb-4 text-sm text-zinc-500">
          今日作る料理のレシピ名を入力すると、AIが冷蔵庫の食材から使いそうなものを推定します。
        </p>

        <div className="flex gap-2">
          <Input
            value={recipeName}
            onChange={(e) => setRecipeName(e.target.value)}
            placeholder="例: カレー、肉じゃが、炒め物"
            onKeyDown={(e) => e.key === 'Enter' && handleEstimate()}
            className="flex-1"
          />
          <Button onClick={handleEstimate} disabled={isEstimating || !recipeName.trim()}>
            {isEstimating ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                推定中...
              </>
            ) : (
              '推定する'
            )}
          </Button>
        </div>

        {foods.length === 0 && (
          <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            冷蔵庫に食材が登録されていません。まず食材を追加してください。
          </p>
        )}
      </div>

      {/* 食材消費確認モーダル */}
      {suggestions !== null && (
        <ConsumeConfirmModal
          suggestions={suggestions}
          onConfirm={handleConfirm}
          onClose={() => setSuggestions(null)}
          isConfirming={isConfirming}
        />
      )}
    </div>
  )
}
