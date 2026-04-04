'use client'

import { FoodCard } from '@/components/FoodCard'
import { FoodForm } from '@/components/FoodForm'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCreateFood, useDeleteFood, useFoods, useStorageLocations, useUpdateFood } from '@/hooks/useFoods'
import { useFoodStore } from '@/stores/foodStore'
import type { FoodItem } from '@/types/food'
import { Loader2, Plus, Search, Utensils } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const { selectedStorageLocationId, setSelectedStorageLocationId, searchQuery, setSearchQuery } =
    useFoodStore()
  const [sortBy, setSortBy] = useState<'expiry' | 'name'>('expiry')
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingFood, setEditingFood] = useState<FoodItem | null>(null)
  const [deletingFoodId, setDeletingFoodId] = useState<string | null>(null)

  const { data: storageLocations = [], isLoading: isLoadingLocations } = useStorageLocations()
  const { data: allFoods = [], isLoading: isLoadingFoods, error } = useFoods(null)
  const createFood = useCreateFood()
  const updateFood = useUpdateFood()
  const deleteFood = useDeleteFood()

  // 保管場所でフィルタ
  const filteredByLocation =
    selectedStorageLocationId === null
      ? allFoods
      : allFoods.filter((f) => f.storageLocationId === selectedStorageLocationId)

  // 検索クエリでフィルタ
  const displayedFoods = searchQuery
    ? filteredByLocation.filter((f) =>
        f.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : filteredByLocation

  const sortedFoods = [...displayedFoods].sort((leftFood, rightFood) => {
    if (sortBy === 'name') {
      return leftFood.name.localeCompare(rightFood.name, 'ja')
    }

    const getExpiryPriority = (food: FoodItem) => {
      if (!food.expiryDate) return Number.POSITIVE_INFINITY
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const expiry = new Date(food.expiryDate)
      expiry.setHours(0, 0, 0, 0)
      return expiry.getTime() - today.getTime()
    }

    return getExpiryPriority(leftFood) - getExpiryPriority(rightFood)
  })

  const usageScoreMap = {
    full: 100,
    half: 60,
    little: 20,
  } satisfies Record<FoodItem['remainingStatus'], number>

  const usageRate =
    sortedFoods.length === 0
      ? 0
      : Math.round(
          sortedFoods.reduce((total, food) => total + usageScoreMap[food.remainingStatus], 0) /
            sortedFoods.length
        )

  const nearExpiryCount = sortedFoods.filter((food) => {
    if (!food.expiryDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const expiry = new Date(food.expiryDate)
    expiry.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 3
  }).length

  const summaryText =
    sortedFoods.length === 0
      ? 'まだ食材が登録されていません'
      : `使用率 ${usageRate}% — ${nearExpiryCount}件の食材がまもなく期限です`

  const handleAddSubmit = async (data: Parameters<typeof createFood.mutateAsync>[0]) => {
    try {
      await createFood.mutateAsync(data)
      toast.success('食材を追加しました')
      setIsAddOpen(false)
    } catch {
      toast.error('食材の追加に失敗しました')
    }
  }

  const handleEditSubmit = async (
    data: Omit<Parameters<typeof updateFood.mutateAsync>[0], 'id'>
  ) => {
    if (!editingFood) return
    try {
      await updateFood.mutateAsync({ ...data, id: editingFood.id })
      toast.success('食材を更新しました')
      setEditingFood(null)
    } catch {
      toast.error('食材の更新に失敗しました')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteFood.mutateAsync(id)
      toast.success('食材を削除しました')
    } catch {
      toast.error('食材の削除に失敗しました')
    } finally {
      setDeletingFoodId(null)
    }
  }

  const isLoading = isLoadingLocations || isLoadingFoods

  return (
    <div className="relative mx-auto min-h-screen max-w-6xl px-4 py-8 md:px-6 md:py-10 xl:px-8">
      {/* ストレージタブ */}
      <div className="mb-8 overflow-x-auto pb-2 hide-scrollbar xl:mb-10">
        <Tabs
          value={selectedStorageLocationId ?? 'all'}
          onValueChange={(value) => setSelectedStorageLocationId(value === 'all' ? null : value)}
        >
          <TabsList className="flex h-auto min-w-max gap-1 rounded-full bg-transparent p-0">
            <TabsTrigger
              value="all"
              className="rounded-full px-8 py-4 text-base font-bold text-on-surface-variant transition-colors data-[state=active]:bg-surface-container-low data-[state=active]:text-on-surface data-[state=active]:shadow-none"
            >
              冷蔵庫
            </TabsTrigger>
            {storageLocations.map((loc) => (
              <TabsTrigger
                key={loc.id}
                value={loc.id}
                className="rounded-full px-8 py-4 text-base font-bold text-on-surface-variant transition-colors data-[state=active]:bg-surface-container-low data-[state=active]:text-on-surface data-[state=active]:shadow-none"
              >
                {loc.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* ヘッダー */}
      <div className="mb-8 flex flex-col gap-5 xl:mb-10 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-xl">
          <h1 className="text-4xl font-headline font-extrabold tracking-[-0.05em] text-on-surface md:text-5xl xl:text-6xl">
            食材一覧
          </h1>
          <p className="mt-2 text-sm font-bold text-on-surface-variant md:text-base">{summaryText}</p>
        </div>

        <div className="flex items-center gap-3 self-start rounded-full bg-surface-container-low px-2 py-2">
          <button
            type="button"
            onClick={() => setSortBy('expiry')}
            className={cn(
              'rounded-full px-6 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors',
              sortBy === 'expiry'
                ? 'bg-primary text-on-primary editorial-shadow'
                : 'text-on-surface-variant'
            )}
          >
            期限順
          </button>
          <button
            type="button"
            onClick={() => setSortBy('name')}
            className={cn(
              'rounded-full px-6 py-2 text-xs font-bold uppercase tracking-[0.14em] transition-colors',
              sortBy === 'name'
                ? 'bg-primary text-on-primary editorial-shadow'
                : 'text-on-surface-variant'
            )}
          >
            名前順
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between gap-3 xl:mb-8">
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="hidden md:flex rounded-full border-0 editorial-shadow text-on-surface-variant font-bold h-10 px-5 bg-surface-container-lowest hover:bg-surface-container-low transition-colors">
            <Link href="/dashboard/consume">
              <Utensils className="size-4 mr-2" />
              AIで消費
            </Link>
          </Button>
          <Button size="sm" onClick={() => setIsAddOpen(true)} className="hidden md:flex rounded-full signature-gradient text-on-primary border-0 editorial-shadow font-bold h-10 px-5 hover:opacity-90 transition-opacity">
            <Plus className="size-4 mr-2" />
            追加
          </Button>
        </div>

        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-outline-variant" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="食材を検索..."
            className="h-14 rounded-full border-0 bg-surface-container-lowest pl-12 text-[16px] placeholder:text-outline-variant/60 editorial-shadow focus-visible:ring-primary/50"
          />
        </div>
      </div>

      {/* ローディング */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      )}

      {/* エラー */}
      {error && (
        <p className="rounded-2xl bg-error-container/30 px-6 py-4 text-sm text-error text-center font-bold">
          食材の取得に失敗しました。再読み込みしてください。
        </p>
      )}

      {/* 食材一覧 */}
      {!isLoading && !error && (
        <FoodList foods={sortedFoods} onEdit={setEditingFood} onDelete={setDeletingFoodId} />
      )}

      {/* モバイル用 Floating Action Buttons */}
      <div className="fixed bottom-[112px] right-6 z-40 md:hidden flex flex-col gap-4">
        {/* レシピボタン（小さいFAB） */}
        <button 
          className="size-14 rounded-full bg-surface-container-lowest border border-outline-variant/20 editorial-shadow flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
          onClick={() => window.location.href = '/dashboard/consume'}
        >
          <Utensils className="size-6" />
        </button>
        {/* 追加ボタン（大きいFAB） */}
        <button 
          className="size-20 rounded-full signature-gradient editorial-shadow flex items-center justify-center text-on-primary shadow-[0_20px_40px_rgba(0,105,68,0.2)] active:scale-95 transition-transform"
          onClick={() => setIsAddOpen(true)}
        >
          <Plus className="size-10" />
        </button>
      </div>

      {/* 食材追加ダイアログ */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="flex max-h-[90vh] max-w-md flex-col overflow-hidden rounded-t-[48px] border-0 bg-surface p-0 shadow-2xl md:rounded-[48px] md:p-6 pb-SAFE">
          <DialogHeader className="px-6 py-4 md:px-0 bg-surface-container-low/50 md:bg-transparent glass-header md:glass-none">
            <DialogTitle className="text-2xl font-headline font-extrabold text-on-surface">食材を追加</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2 md:px-0 md:pb-0">
            <FoodForm
              onSubmit={handleAddSubmit}
              onCancel={() => setIsAddOpen(false)}
              storageLocations={storageLocations}
              isSubmitting={createFood.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* 食材編集ダイアログ */}
      <Dialog open={!!editingFood} onOpenChange={(open) => !open && setEditingFood(null)}>
        <DialogContent className="flex max-h-[90vh] max-w-md flex-col overflow-hidden rounded-t-[48px] border-0 bg-surface p-0 shadow-2xl md:rounded-[48px] md:p-6 pb-SAFE">
          <DialogHeader className="px-6 py-4 md:px-0 bg-surface-container-low/50 md:bg-transparent glass-header md:glass-none">
            <DialogTitle className="text-2xl font-headline font-extrabold text-on-surface">食材を編集</DialogTitle>
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-6 pt-2 md:px-0 md:pb-0">
            {editingFood && (
              <FoodForm
                food={editingFood}
                onSubmit={handleEditSubmit}
                onCancel={() => setEditingFood(null)}
                storageLocations={storageLocations}
                isSubmitting={updateFood.isPending}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={!!deletingFoodId} onOpenChange={(open) => !open && setDeletingFoodId(null)}>
        <DialogContent className="max-w-sm bg-surface border-0 rounded-[32px] md:rounded-[32px] shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-headline font-extrabold text-on-surface">食材を削除</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-zinc-600">この食材を削除してもよいですか？</p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeletingFoodId(null)}>
              キャンセル
            </Button>
            <Button
              variant="destructive"
              onClick={() => deletingFoodId && handleDelete(deletingFoodId)}
              disabled={deleteFood.isPending}
            >
              {deleteFood.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  処理中...
                </>
              ) : (
                '削除する'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface FoodListProps {
  foods: FoodItem[]
  onEdit: (food: FoodItem) => void
  onDelete: (id: string) => void
}

function FoodList({ foods, onEdit, onDelete }: FoodListProps) {
  if (foods.length === 0) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-[40px] bg-surface-container-lowest px-6 py-16 text-center editorial-shadow">
        <p className="text-2xl font-headline font-extrabold text-on-surface">食材がありません</p>
        <p className="mt-2 text-sm font-bold text-on-surface-variant">右上の「追加」ボタンから食材を登録してください</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4 xl:gap-6">
      {foods.map((food) => (
        <FoodCard key={food.id} food={food} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  )
}
