export type RemainingStatus = 'full' | 'half' | 'little'

export interface FoodItem {
  id: string
  name: string
  category: string | null
  remainingStatus: RemainingStatus
  storageLocationId: string | null
  fridgeId: string
  expiryDate: string | null
  createdAt: string
  updatedAt: string
  storageLocation?: { id: string; name: string } | null
}

export interface StorageLocationItem {
  id: string
  name: string
  sortOrder: number
  fridgeId: string
}

export interface OcrResultItem {
  name: string
  category: string | null
  remainingStatus: RemainingStatus
  storageLocationId: string | null
  storageLocationName: string
}

export interface ConsumeSuggestion {
  id: string
  name: string
  currentStatus: string
  newStatus: 'little' | 'delete'
}
