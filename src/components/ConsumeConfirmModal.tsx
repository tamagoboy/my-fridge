'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ConsumeSuggestion } from '@/types/food'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface ConsumeConfirmModalProps {
  suggestions: ConsumeSuggestion[]
  onConfirm: (updates: { id: string; newStatus: 'little' | 'delete' }[]) => void
  onClose: () => void
  isConfirming?: boolean
}

const STATUS_LABELS: Record<string, string> = {
  full: 'いっぱい',
  half: '半分',
  little: '少し',
}

const NEW_STATUS_OPTIONS = [
  { value: 'little', label: '少し（に変更）' },
  { value: 'delete', label: '削除（使い切り）' },
]

export function ConsumeConfirmModal({
  suggestions: initialSuggestions,
  onConfirm,
  onClose,
  isConfirming,
}: ConsumeConfirmModalProps) {
  const [suggestions, setSuggestions] = useState<ConsumeSuggestion[]>(initialSuggestions)

  const handleStatusChange = (id: string, newStatus: 'little' | 'delete') => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, newStatus } : s))
    )
  }

  const handleRemove = (id: string) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id))
  }

  const handleConfirm = () => {
    const updates = suggestions.map((s) => ({ id: s.id, newStatus: s.newStatus }))
    onConfirm(updates)
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>食材の消費確認</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-zinc-500">
          AIが推定した使用食材を確認してください。変更・削除できます。
        </p>

        <div className="space-y-2">
          {suggestions.length === 0 && (
            <p className="py-4 text-center text-sm text-zinc-500">
              消費する食材がありません
            </p>
          )}
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="flex items-center gap-2 rounded-xl border border-zinc-100 bg-zinc-50 p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-zinc-900 truncate">{suggestion.name}</p>
                <p className="text-xs text-zinc-500">
                  現在: {STATUS_LABELS[suggestion.currentStatus] ?? suggestion.currentStatus}
                </p>
              </div>

              <Select
                value={suggestion.newStatus}
                onValueChange={(v) => handleStatusChange(suggestion.id, v as 'little' | 'delete')}
              >
                <SelectTrigger className="w-36 bg-white text-xs h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NEW_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => handleRemove(suggestion.id)}
                className="shrink-0 text-red-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isConfirming}>
            キャンセル
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isConfirming || suggestions.length === 0}
          >
            {isConfirming ? '処理中...' : `確定（${suggestions.length}件）`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
