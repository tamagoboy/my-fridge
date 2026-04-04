import { generateStructuredContent } from '@/lib/ai'
import { inferCategory } from '@/lib/normalizer'

type StorageLocationOption = {
  id: string
  name: string
}

export type OcrCandidateItem = {
  name: string
  category: string | null
  remainingStatus: 'full'
  storageLocationId: string | null
  storageLocationName: string
}

export type ConsumeCandidate = {
  id: string
  name: string
  currentStatus: string
  newStatus: 'little' | 'delete'
}

const STORAGE_HINTS: Array<{ keywords: string[]; targets: string[] }> = [
  { keywords: ['アイス', '冷凍', 'ギョーザ', '餃子', 'うどん', '枝豆'], targets: ['冷凍庫'] },
  { keywords: ['米', 'パスタ', '缶', 'レトルト', '油', '醤油', '砂糖', '塩'], targets: ['常温', 'パントリー'] },
  { keywords: ['牛乳', '卵', '肉', '魚', '豆腐', 'チーズ', 'ヨーグルト', '野菜'], targets: ['冷蔵庫', '野菜室'] },
]

const RECIPE_RULES: Array<{ keywords: string[]; ingredients: string[] }> = [
  { keywords: ['カレー'], ingredients: ['玉ねぎ', 'にんじん', 'じゃがいも', '豚肉', '牛肉', '鶏肉'] },
  { keywords: ['肉じゃが'], ingredients: ['玉ねぎ', 'にんじん', 'じゃがいも', '豚肉', '牛肉'] },
  { keywords: ['炒め'], ingredients: ['キャベツ', '玉ねぎ', 'にんじん', '豚肉', '鶏肉', 'もやし'] },
  { keywords: ['シチュー'], ingredients: ['玉ねぎ', 'にんじん', 'じゃがいも', '牛乳', '鶏肉'] },
  { keywords: ['みそ汁', '味噌汁'], ingredients: ['豆腐', 'ねぎ', '玉ねぎ', 'じゃがいも'] },
  { keywords: ['オムレツ', 'オムライス'], ingredients: ['卵', '玉ねぎ', '牛乳'] },
]

function findStorageByName(locations: StorageLocationOption[], names: string[]) {
  for (const name of names) {
    const matched = locations.find((location) => location.name.includes(name) || name.includes(location.name))
    if (matched) {
      return matched
    }
  }

  return null
}

export function fallbackStorageLocation(name: string, locations: StorageLocationOption[]) {
  const category = inferCategory(name)

  for (const rule of STORAGE_HINTS) {
    if (rule.keywords.some((keyword) => name.includes(keyword) || category?.includes(keyword))) {
      const matched = findStorageByName(locations, rule.targets)
      if (matched) {
        return matched
      }
    }
  }

  return findStorageByName(locations, ['冷蔵庫', '常温']) ?? locations[0] ?? null
}

export async function classifyOcrItems(items: Array<{ name: string; category: string | null }>, locations: StorageLocationOption[]) {
  const aiResult = await generateStructuredContent<Array<{ name: string; storageLocationName: string | null }>>({
    systemPrompt: 'あなたは日本の家庭向け冷蔵庫管理アプリの分類器です。食材ごとに最も自然な保管場所を1つ選びます。JSONのみ返してください。',
    userPrompt: `利用可能な保管場所: ${locations.map((location) => location.name).join(', ')}\n食材: ${items.map((item) => `${item.name}(${item.category ?? '未分類'})`).join(', ')}`,
    responseSchema: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'storageLocationName'],
        properties: {
          name: { type: 'string' },
          storageLocationName: { type: ['string', 'null'] },
        },
      },
    },
  })

  return items.map((item) => {
    const aiMatch = aiResult?.find((result) => result.name === item.name)
    const aiLocation = aiMatch?.storageLocationName
      ? locations.find((location) => location.name === aiMatch.storageLocationName)
      : null
    const fallbackLocation = fallbackStorageLocation(item.name, locations)
    const location = aiLocation ?? fallbackLocation

    return {
      name: item.name,
      category: item.category,
      remainingStatus: 'full' as const,
      storageLocationId: location?.id ?? null,
      storageLocationName: location?.name ?? '未設定',
    }
  })
}

function nextConsumedStatus(currentStatus: string): 'little' | 'delete' {
  return currentStatus === 'little' ? 'delete' : 'little'
}

export function fallbackConsumeSuggestions(
  recipeName: string,
  foods: Array<{ id: string; name: string; remainingStatus: string }>
) {
  const rule = RECIPE_RULES.find(({ keywords }) => keywords.some((keyword) => recipeName.includes(keyword)))

  if (!rule) {
    return foods.slice(0, 3).map((food) => ({
      id: food.id,
      name: food.name,
      currentStatus: food.remainingStatus,
      newStatus: nextConsumedStatus(food.remainingStatus),
    }))
  }

  return foods
    .filter((food) => rule.ingredients.some((ingredient) => food.name.includes(ingredient) || ingredient.includes(food.name)))
    .slice(0, 6)
    .map((food) => ({
      id: food.id,
      name: food.name,
      currentStatus: food.remainingStatus,
      newStatus: nextConsumedStatus(food.remainingStatus),
    }))
}

export async function suggestFoodsForRecipe(
  recipeName: string,
  foods: Array<{ id: string; name: string; remainingStatus: string }>
) {
  const aiResult = await generateStructuredContent<Array<ConsumeCandidate>>({
    systemPrompt: 'あなたは家庭の冷蔵庫在庫から料理に使いそうな食材を推定するアシスタントです。JSONのみ返してください。newStatus は little または delete のみです。',
    userPrompt: `レシピ名: ${recipeName}\n候補食材: ${foods.map((food) => `${food.id}:${food.name}:${food.remainingStatus}`).join(', ')}`,
    responseSchema: {
      type: 'array',
      items: {
        type: 'object',
        required: ['id', 'name', 'currentStatus', 'newStatus'],
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          currentStatus: { type: 'string' },
          newStatus: { type: 'string', enum: ['little', 'delete'] },
        },
      },
    },
  })

  if (aiResult && aiResult.length > 0) {
    return aiResult
  }

  return fallbackConsumeSuggestions(recipeName, foods)
}

const EXPIRY_RULES: Array<{ keywords: string[]; refrigeratedDays: number; frozenDays?: number; roomTemperatureDays?: number }> = [
  { keywords: ['牛乳'], refrigeratedDays: 4 },
  { keywords: ['卵'], refrigeratedDays: 14 },
  { keywords: ['豚肉', '牛肉', '鶏肉', 'ひき肉'], refrigeratedDays: 2, frozenDays: 21 },
  { keywords: ['魚', '鮭', 'さば', 'マグロ'], refrigeratedDays: 2, frozenDays: 14 },
  { keywords: ['豆腐'], refrigeratedDays: 3 },
  { keywords: ['ヨーグルト'], refrigeratedDays: 10 },
  { keywords: ['チーズ'], refrigeratedDays: 14 },
  { keywords: ['キャベツ', 'レタス', 'きゅうり', 'トマト', 'ほうれん草'], refrigeratedDays: 5 },
  { keywords: ['玉ねぎ', 'じゃがいも', 'にんじん'], refrigeratedDays: 7, roomTemperatureDays: 14 },
  { keywords: ['パン'], refrigeratedDays: 4, frozenDays: 14 },
  { keywords: ['味噌', '醤油', '油', '砂糖', '塩'], refrigeratedDays: 90, roomTemperatureDays: 120 },
]

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next
}

export function fallbackExpiryEstimate(foodName: string, storageLocationName?: string | null) {
  const baseDate = new Date()
  const matchedRule = EXPIRY_RULES.find(({ keywords }) => keywords.some((keyword) => foodName.includes(keyword)))
  const location = storageLocationName ?? ''

  const defaultDays = location.includes('冷凍') ? 21 : location.includes('常温') ? 14 : 5

  if (!matchedRule) {
    return addDays(baseDate, defaultDays)
  }

  const estimatedDays = location.includes('冷凍')
    ? matchedRule.frozenDays ?? Math.max(matchedRule.refrigeratedDays, 14)
    : location.includes('常温')
      ? matchedRule.roomTemperatureDays ?? Math.max(matchedRule.refrigeratedDays, 7)
      : matchedRule.refrigeratedDays

  return addDays(baseDate, estimatedDays)
}

export async function estimateExpiryDate(foodName: string, storageLocationName?: string | null) {
  const aiResult = await generateStructuredContent<{ days: number | null }>({
    systemPrompt: 'あなたは日本の家庭向け食品保存アシスタントです。一般的な保存期間を日数で返します。JSONのみ返してください。',
    userPrompt: `食材名: ${foodName}\n保管場所: ${storageLocationName ?? '未設定'}\n開封直後の一般的な目安日数のみ返してください。`,
    responseSchema: {
      type: 'object',
      required: ['days'],
      properties: {
        days: { type: ['number', 'null'] },
      },
    },
  })

  if (typeof aiResult?.days === 'number' && Number.isFinite(aiResult.days) && aiResult.days > 0) {
    const estimated = new Date()
    estimated.setDate(estimated.getDate() + Math.round(aiResult.days))
    return estimated
  }

  return fallbackExpiryEstimate(foodName, storageLocationName)
}
