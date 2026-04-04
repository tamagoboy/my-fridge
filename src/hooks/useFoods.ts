import type { FoodItem, StorageLocationItem } from '@/types/food'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

// 食材一覧取得
export function useFoods(storageLocationId?: string | null) {
  const params = new URLSearchParams()
  if (storageLocationId) {
    params.set('storageLocationId', storageLocationId)
  }
  const queryString = params.toString()

  return useQuery<FoodItem[]>({
    queryKey: ['foods', storageLocationId ?? null],
    queryFn: async () => {
      const res = await fetch(`/api/foods${queryString ? `?${queryString}` : ''}`)
      if (!res.ok) throw new Error('食材の取得に失敗しました')
      return res.json()
    },
  })
}

// 保管場所一覧取得
export function useStorageLocations() {
  return useQuery<StorageLocationItem[]>({
    queryKey: ['storage-locations'],
    queryFn: async () => {
      const res = await fetch('/api/storage-locations')
      if (!res.ok) throw new Error('保管場所の取得に失敗しました')
      return res.json()
    },
  })
}

// 食材追加
export function useCreateFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<FoodItem>) => {
      const res = await fetch('/api/foods', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('食材の追加に失敗しました')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
    },
  })
}

// 食材更新
export function useUpdateFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<FoodItem> & { id: string }) => {
      const res = await fetch(`/api/foods/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('食材の更新に失敗しました')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
    },
  })
}

// 食材削除
export function useDeleteFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/foods/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('食材の削除に失敗しました')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
    },
  })
}

// 食材消費（残量ステータス変更）
export function useConsumeFood() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/foods/${id}/consume`, { method: 'PATCH' })
      if (!res.ok) throw new Error('消費の更新に失敗しました')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['foods'] })
    },
  })
}

// 食材名サジェスト取得
export function useFoodSuggestions(query: string) {
  return useQuery<string[]>({
    queryKey: ['food-suggestions', query],
    queryFn: async () => {
      const res = await fetch(`/api/foods/suggestions?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('サジェストの取得に失敗しました')
      return res.json()
    },
    enabled: query.length > 0,
  })
}
