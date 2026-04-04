'use client'

import { Button } from '@/components/ui/button'
import { useConsumeFood } from '@/hooks/useFoods'
import { cn } from '@/lib/utils'
import type { FoodItem } from '@/types/food'
import {
  Apple,
  Beef,
  Carrot,
  Edit2,
  Fish,
  Milk,
  MoreVertical,
  Package2,
  Trash2,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface FoodCardProps {
  food: FoodItem
  onEdit: (food: FoodItem) => void
  onDelete: (id: string) => void
  className?: string
}

const REMAINING_STATUS_META = {
  full: {
    fillClassName: 'bg-primary w-full',
    label: 'FULL',
    pillClassName: 'bg-primary-container/40 text-primary',
    progress: 100,
  },
  half: {
    fillClassName: 'bg-tertiary w-1/2',
    label: 'HALF',
    pillClassName: 'bg-tertiary-container/40 text-tertiary',
    progress: 50,
  },
  little: {
    fillClassName: 'bg-error w-[18%]',
    label: 'EMPTY',
    pillClassName: 'bg-error-container/20 text-error',
    progress: 18,
  },
} as const

const CATEGORY_META = {
  野菜: { icon: Carrot, iconClassName: 'text-primary', bgClassName: 'bg-primary-container/60' },
  肉: { icon: Beef, iconClassName: 'text-primary', bgClassName: 'bg-primary-container/60' },
  魚: { icon: Fish, iconClassName: 'text-secondary', bgClassName: 'bg-secondary-container/70' },
  乳製品: { icon: Milk, iconClassName: 'text-tertiary', bgClassName: 'bg-tertiary-container/20' },
  調味料: { icon: Package2, iconClassName: 'text-on-surface-variant', bgClassName: 'bg-surface-variant/60' },
  その他: { icon: Apple, iconClassName: 'text-on-surface-variant', bgClassName: 'bg-surface-variant/60' },
} as const

function getDaysUntilExpiry(expiryDate: string | null): number | null {
  if (!expiryDate) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getExpiryLabel(food: FoodItem): string {
  const diffDays = getDaysUntilExpiry(food.expiryDate)

  if (food.remainingStatus === 'little' && diffDays === null) {
    return '残りわずか'
  }

  if (diffDays === null) {
    return food.storageLocation?.name ?? '保管場所未設定'
  }

  if (diffDays < 0) {
    return `${Math.abs(diffDays)}日期限切れ`
  }

  if (diffDays === 0) {
    return '今日が期限です'
  }

  return `期限まであと${diffDays}日`
}

function getExpiryTone(expiryDate: string | null): string {
  const diffDays = getDaysUntilExpiry(expiryDate)

  if (diffDays === null) return 'text-on-surface-variant'
  if (diffDays <= 0) return 'text-error'
  if (diffDays <= 3) return 'text-primary'
  return 'text-on-surface-variant'
}

function getFoodVisualMeta(food: FoodItem) {
  if (food.category && food.category in CATEGORY_META) {
    return CATEGORY_META[food.category as keyof typeof CATEGORY_META]
  }

  if (food.storageLocation?.name?.includes('冷凍')) {
    return { icon: Package2, iconClassName: 'text-tertiary', bgClassName: 'bg-tertiary-container/20' }
  }

  return CATEGORY_META['その他']
}

export function FoodCard({ food, onEdit, onDelete, className }: FoodCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const consumeFood = useConsumeFood()

  const handleConsume = async () => {
    setIsMenuOpen(false)
    try {
      await consumeFood.mutateAsync(food.id)
      toast.success(`${food.name}の残量を更新しました`)
    } catch {
      toast.error('残量の更新に失敗しました')
    }
  }

  const handleEdit = () => {
    setIsMenuOpen(false)
    onEdit(food)
  }

  const handleDelete = () => {
    setIsMenuOpen(false)
    onDelete(food.id)
  }

  const remainingMeta = REMAINING_STATUS_META[food.remainingStatus]
  const visualMeta = getFoodVisualMeta(food)
  const Icon = visualMeta.icon
  const expiryLabel = getExpiryLabel(food)
  const expiryTone = getExpiryTone(food.expiryDate)
  const isLowStock = food.remainingStatus === 'little'

  return (
    <article
      className={cn(
        'relative flex min-h-[190px] flex-col rounded-[40px] border border-transparent bg-surface-container-lowest px-5 pb-6 pt-5 shadow-[0_20px_40px_rgba(0,54,41,0.03)] transition-transform duration-200 hover:-translate-y-0.5',
        isLowStock && 'border-outline-variant/30 border-dashed bg-surface-container-low/40',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex size-12 items-center justify-center rounded-full', visualMeta.bgClassName)}>
          <Icon className={cn('size-5', visualMeta.iconClassName)} strokeWidth={2.3} />
        </div>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              'rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]',
              remainingMeta.pillClassName
            )}
          >
            {remainingMeta.label}
          </span>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="メニューを開く"
              className="size-8 rounded-full text-on-surface-variant opacity-70 hover:bg-surface-variant/50 hover:opacity-100"
            >
              <MoreVertical className="size-4" />
            </Button>

            {isMenuOpen && (
              <>
                {/* オーバーレイ */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsMenuOpen(false)}
                />
                {/* ドロップダウンメニュー */}
                <div className="absolute right-0 top-10 z-20 min-w-36 rounded-[24px] border border-outline-variant/20 bg-surface-container-lowest py-2 shadow-[0_20px_40px_rgba(0,54,41,0.08)]">
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-low"
                    onClick={handleConsume}
                    disabled={consumeFood.isPending}
                  >
                    <Zap className="size-4 text-primary" />
                    消費する
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm font-bold text-on-surface hover:bg-surface-container-low"
                    onClick={handleEdit}
                  >
                    <Edit2 className="size-4 text-tertiary" />
                    編集
                  </button>
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm font-bold text-error hover:bg-error-container/10"
                    onClick={handleDelete}
                  >
                    <Trash2 className="size-4" />
                    削除
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="pt-5">
        <h3 className={cn('line-clamp-2 text-[22px] leading-[1.3] tracking-[-0.02em] text-on-surface', isLowStock && 'text-on-surface-variant')}>
          {food.name}
        </h3>
      </div>

      <div className="pb-5 pt-1">
        <p className={cn('text-sm font-bold tracking-[-0.04em]', expiryTone)}>{expiryLabel}</p>
        {food.category && (
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-outline-variant">
            {food.category}
          </p>
        )}
      </div>

      <div className="mt-auto h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
        <div
          className={cn('h-full rounded-full', remainingMeta.fillClassName)}
          style={{ width: `${remainingMeta.progress}%` }}
        />
      </div>
    </article>
  )
}
