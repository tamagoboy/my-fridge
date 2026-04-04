import { describe, expect, it } from 'vitest'

import { fallbackConsumeSuggestions, fallbackExpiryEstimate, fallbackStorageLocation } from './food-helpers'

describe('fallbackStorageLocation', () => {
  const locations = [
    { id: 'fridge', name: '冷蔵庫' },
    { id: 'freezer', name: '冷凍庫' },
    { id: 'room', name: '常温' },
  ]

  it('アイスを冷凍庫に分類する', () => {
    expect(fallbackStorageLocation('アイスクリーム', locations)?.id).toBe('freezer')
  })

  it('調味料を常温に分類する', () => {
    expect(fallbackStorageLocation('醤油', locations)?.id).toBe('room')
  })
})

describe('fallbackConsumeSuggestions', () => {
  it('カレー向けの食材を優先して返す', () => {
    const suggestions = fallbackConsumeSuggestions('カレー', [
      { id: '1', name: '玉ねぎ', remainingStatus: 'full' },
      { id: '2', name: 'にんじん', remainingStatus: 'half' },
      { id: '3', name: 'ヨーグルト', remainingStatus: 'full' },
    ])

    expect(suggestions.map((suggestion) => suggestion.id)).toEqual(['1', '2'])
  })
})

describe('fallbackExpiryEstimate', () => {
  it('牛乳は数日後の日付を返す', () => {
    const estimated = fallbackExpiryEstimate('牛乳', '冷蔵庫')
    const diffMs = estimated.getTime() - Date.now()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    expect(diffDays).toBeGreaterThanOrEqual(3)
    expect(diffDays).toBeLessThanOrEqual(5)
  })
})