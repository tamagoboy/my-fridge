'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { OcrResultItem, RemainingStatus, StorageLocationItem } from '@/types/food'
import { Loader2, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface ScanConfirmModalProps {
  items: OcrResultItem[]
  storageLocations: StorageLocationItem[]
  onConfirm: (items: OcrResultItem[]) => void
  onClose: () => void
}

const REMAINING_STATUS_OPTIONS: { value: RemainingStatus; label: string }[] = [
  { value: 'full', label: 'いっぱい' },
  { value: 'half', label: '半分' },
  { value: 'little', label: '少し' },
]

export function ScanConfirmModal({
  items: initialItems,
  storageLocations,
  onConfirm,
  onClose,
}: ScanConfirmModalProps) {
  const [items, setItems] = useState<OcrResultItem[]>(initialItems)
  const [isSaving, setIsSaving] = useState(false)

  const handleNameChange = (index: number, name: string) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, name } : item)))
  }

  const handleStorageChange = (index: number, storageLocationId: string) => {
    const location = storageLocations.find((loc) => loc.id === storageLocationId)
    setItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? {
              ...item,
              storageLocationId: storageLocationId === '__unset__' ? null : storageLocationId,
              storageLocationName: location?.name ?? '',
            }
          : item
      )
    )
  }

  const handleRemainingChange = (index: number, remainingStatus: RemainingStatus) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, remainingStatus } : item))
    )
  }

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    const validItems = items.filter((item) => item.name.trim())
    if (validItems.length === 0) {
      toast.error('保存する食材がありません')
      return
    }

    setIsSaving(true)
    try {
      // 各食材を順次保存
      for (const item of validItems) {
        const res = await fetch('/api/foods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: item.name.trim(),
            category: item.category,
            remainingStatus: item.remainingStatus,
            storageLocationId: item.storageLocationId,
          }),
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
          throw new Error(
            `${item.name}の保存に失敗しました: ${errorData.message || errorData.error || 'Unknown error'}`
          )
        }
      }
      toast.success(`${validItems.length}件の食材を保存しました`)
      onConfirm(validItems)
    } catch (err) {
      console.error('Save error:', err)
      toast.error(err instanceof Error ? err.message : '保存に失敗しました')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>OCR結果の確認</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {items.length === 0 && (
            <p className="py-4 text-center text-sm text-zinc-500">
              認識された食材がありません
            </p>
          )}
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-xl border border-zinc-100 bg-zinc-50 p-3 space-y-2"
            >
              <div className="flex items-center gap-2">
                <Input
                  value={item.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  placeholder="食材名"
                  className="flex-1 bg-white"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleRemove(index)}
                  className="text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={item.storageLocationId ?? '__unset__'}
                  onValueChange={(v) => handleStorageChange(index, v)}
                >
                  <SelectTrigger className="bg-white text-xs h-8">
                    <SelectValue placeholder="保管場所" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__unset__">未設定</SelectItem>
                    {storageLocations.map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={item.remainingStatus}
                  onValueChange={(v) => handleRemainingChange(index, v as RemainingStatus)}
                >
                  <SelectTrigger className="bg-white text-xs h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {REMAINING_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isSaving || items.length === 0}>
            {isSaving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                保存中...
              </>
            ) : (
              `一括保存（${items.length}件）`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
