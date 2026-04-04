import { create } from 'zustand'

interface FoodStore {
  selectedStorageLocationId: string | null // null = all
  setSelectedStorageLocationId: (id: string | null) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
}

export const useFoodStore = create<FoodStore>((set) => ({
  selectedStorageLocationId: null,
  setSelectedStorageLocationId: (id) => set({ selectedStorageLocationId: id }),
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}))
