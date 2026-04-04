'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useFoodSuggestions } from '@/hooks/useFoods'
import type { FoodItem, RemainingStatus, StorageLocationItem } from '@/types/food'
import { Loader2, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface FoodFormData {
  name: string
  category: string | null
  remainingStatus: RemainingStatus
  storageLocationId: string | null
  expiryDate: string | null
}

interface FoodFormProps {
  food?: FoodItem
  onSubmit: (data: FoodFormData) => void
  onCancel: () => void
  storageLocations: StorageLocationItem[]
  isSubmitting?: boolean
}

const CATEGORIES = ['野菜', '肉', '魚', '乳製品', '調味料', 'その他']

const REMAINING_STATUS_OPTIONS: { value: RemainingStatus; label: string }[] = [
  { value: 'full', label: 'いっぱい' },
  { value: 'half', label: '半分' },
  { value: 'little', label: '少し' },
]

export function FoodForm({ food, onSubmit, onCancel, storageLocations, isSubmitting }: FoodFormProps) {
  const [name, setName] = useState(food?.name ?? '')
  const [category, setCategory] = useState<string>(food?.category ?? '')
  const [remainingStatus, setRemainingStatus] = useState<RemainingStatus>(
    food?.remainingStatus ?? 'full'
  )
  const [storageLocationId, setStorageLocationId] = useState<string>(
    food?.storageLocationId ?? ''
  )
  const [expiryDate, setExpiryDate] = useState<string>(
    food?.expiryDate ? food.expiryDate.slice(0, 10) : ''
  )
  const [isEstimating, setIsEstimating] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [nameQuery, setNameQuery] = useState('')
  const nameInputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const { data: suggestions } = useFoodSuggestions(nameQuery)

  // nameが変わったら少し遅れてクエリを更新
  useEffect(() => {
    const timer = setTimeout(() => {
      if (name.length > 0) setNameQuery(name)
    }, 300)
    return () => clearTimeout(timer)
  }, [name])

  const handleNameChange = (value: string) => {
    setName(value)
    setShowSuggestions(true)
  }

  const handleSuggestionSelect = (suggestion: string) => {
    setName(suggestion)
    setShowSuggestions(false)
    setNameQuery('')
  }

  const handleEstimateExpiry = async () => {
    if (!name) {
      toast.error('食材名を入力してください')
      return
    }
    setIsEstimating(true)
    try {
      const res = await fetch('/api/foods/expiry-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, storageLocationId: storageLocationId || null }),
      })
      if (!res.ok) throw new Error('推定に失敗しました')
      const data = await res.json()
      if (data.expiryDate) {
        setExpiryDate(data.expiryDate.slice(0, 10))
        toast.success('賞味期限を推定しました')
      }
    } catch {
      toast.error('賞味期限の推定に失敗しました')
    } finally {
      setIsEstimating(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('食材名を入力してください')
      return
    }
    onSubmit({
      name: name.trim(),
      category: category || null,
      remainingStatus,
      storageLocationId: storageLocationId || null,
      expiryDate: expiryDate || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 px-2 py-4">
      {/* 食材名 */}
      <div className="space-y-2 relative">
        <Label htmlFor="food-name" className="text-[12px] uppercase tracking-[1.2px] text-on-surface-variant font-bold ml-4">食材名 *</Label>
        <div className="relative">
          <Input
            id="food-name"
            ref={nameInputRef}
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            placeholder="例: 牛乳、卵、豚肉"
            required
            className="h-[56px] rounded-[32px] bg-surface-container-lowest border-0 editorial-shadow text-lg px-6 placeholder:text-outline-variant/60 focus-visible:ring-primary/50"
          />
          {/* サジェスト一覧 */}
          {showSuggestions && suggestions && suggestions.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute left-0 right-0 top-full z-50 mt-2 max-h-48 overflow-y-auto rounded-3xl border-0 bg-surface-container-lowest editorial-shadow"
            >
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="w-full px-6 py-3 text-left text-sm font-bold text-on-surface hover:bg-surface-container-low transition-colors"
                  onMouseDown={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* カテゴリ */}
      <div className="space-y-2">
        <Label htmlFor="food-category" className="text-[12px] uppercase tracking-[1.2px] text-on-surface-variant font-bold ml-4">カテゴリ</Label>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setCategory('')}
            className={`px-6 py-3 rounded-full text-sm font-bold transition-colors ${
              category === ''
                ? 'bg-primary text-on-primary editorial-shadow'
                : 'bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80'
            }`}
          >
            なし
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-6 py-3 rounded-full text-sm font-bold transition-colors ${
                category === cat
                  ? 'bg-primary text-on-primary editorial-shadow'
                  : 'bg-surface-variant text-on-surface-variant hover:bg-surface-variant/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 残量ステータス */}
      <div className="space-y-2">
        <Label className="text-[12px] uppercase tracking-[1.2px] text-on-surface-variant font-bold ml-4">現在の残量</Label>
        <div className="flex gap-2 p-2 bg-surface-container-low rounded-full">
          {REMAINING_STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRemainingStatus(opt.value)}
              className={`flex-1 py-3 px-4 rounded-full text-sm font-bold transition-all duration-200 ${
                remainingStatus === opt.value
                  ? 'bg-surface-container-lowest text-on-surface shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-lowest/50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Expiry & Location Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* 保管場所 */}
        <div className="space-y-2">
          <Label htmlFor="food-storage" className="text-[12px] uppercase tracking-[1.2px] text-on-surface-variant font-bold ml-4">保管場所</Label>
          <Select value={storageLocationId} onValueChange={setStorageLocationId}>
            <SelectTrigger id="food-storage" className="h-[56px] rounded-[32px] bg-surface-container-lowest border-0 editorial-shadow text-base px-6 focus:ring-primary/50 [&>span]:text-on-surface [&>span:not(:first-child)]:text-on-surface-variant">
              <SelectValue placeholder="選択（任意）" />
            </SelectTrigger>
            <SelectContent className="rounded-3xl border-0 editorial-shadow bg-surface-container-lowest">
              <SelectItem value="none" className="rounded-2xl mx-1 cursor-pointer hover:bg-surface-container-low font-bold">なし</SelectItem>
              {storageLocations.map((loc) => (
                <SelectItem key={loc.id} value={loc.id} className="rounded-2xl mx-1 cursor-pointer hover:bg-surface-container-low font-bold text-on-surface">
                  {loc.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 賞味期限 */}
        <div className="space-y-2 flex flex-col justify-start">
          <Label htmlFor="food-expiry" className="text-[12px] uppercase tracking-[1.2px] text-on-surface-variant font-bold ml-4 mb-2">賞味期限（任意）</Label>
          <div className="relative">
            <Input
              id="food-expiry"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="h-[56px] rounded-[32px] bg-surface-container-lowest border-0 editorial-shadow text-base px-6 text-on-surface focus-visible:ring-primary/50 w-full appearance-none [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
            />
          </div>
          <div className="min-h-[28px] pl-2 mt-2">
            <button
              type="button"
              onClick={handleEstimateExpiry}
              disabled={isEstimating || !name}
              className="group flex items-center justify-center text-xs font-bold text-on-primary-container bg-primary-container/40 hover:bg-primary-container/80 px-4 py-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEstimating ? (
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
              ) : (
                <Sparkles className="size-3.5 mr-1.5" />
              )}
              AI推定
            </button>
          </div>
        </div>
      </div>

      {/* ボタン */}
      <div className="sticky bottom-0 z-10 -mx-2 mt-2 flex gap-3 border-t border-outline-variant/30 bg-surface/95 px-2 pb-2 pt-4 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
        <button 
          type="button" 
          onClick={onCancel} 
          className="flex-1 h-[56px] rounded-[32px] font-bold text-on-surface-variant hover:bg-surface-variant/50 transition-colors"
        >
          キャンセル
        </button>
        <button 
          type="submit" 
          disabled={isSubmitting} 
          className="flex-[2] h-[56px] rounded-[32px] signature-gradient text-on-primary font-bold editorial-shadow hover:opacity-90 transition-opacity flex items-center justify-center disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin mr-2" />
              処理中...
            </>
          ) : food ? (
            '更新する'
          ) : (
            '登録する'
          )}
        </button>
      </div>
    </form>
  )
}
