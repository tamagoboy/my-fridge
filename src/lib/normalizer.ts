const MODIFIER_PATTERNS = [
  /おいしい/g,
  /こだわりの/g,
  /国産/g,
  /鹿児島県産/g,
  /宮崎県産/g,
  /青森県産/g,
  /北海道産/g,
  /大容量/g,
  /特選/g,
  /やわらか/g,
  /新鮮/g,
  /おすすめ/g,
  /徳用/g,
  /スライス/g,
  /カット/g,
  /パック/g,
  /入り/g,
  /盛/g,
  /[()（）\[\]【】]/g,
]

const TRANSLATION_MAP: Array<[RegExp, string]> = [
  [/pork/gi, '豚'],
  [/beef/gi, '牛'],
  [/chicken/gi, '鶏'],
  [/milk/gi, '牛乳'],
  [/egg/gi, '卵'],
  [/onion/gi, '玉ねぎ'],
  [/potato/gi, 'じゃがいも'],
  [/carrot/gi, 'にんじん'],
  [/tofu/gi, '豆腐'],
  [/bread/gi, 'パン'],
  [/ポーク/g, '豚'],
  [/ビーフ/g, '牛'],
  [/チキン/g, '鶏'],
  [/ミルク/g, '牛乳'],
  [/エッグ/g, '卵'],
]

const CATEGORY_RULES: Array<{ category: string; keywords: string[] }> = [
  { category: '野菜', keywords: ['玉ねぎ', 'にんじん', '人参', 'じゃがいも', 'キャベツ', 'レタス', 'トマト', 'きゅうり', 'ほうれん草', 'ねぎ', 'もやし'] },
  { category: '肉', keywords: ['豚', '牛', '鶏', 'ひき肉', 'ベーコン', 'ハム', 'ソーセージ'] },
  { category: '魚', keywords: ['鮭', 'さば', 'マグロ', 'ぶり', 'あじ', 'しらす', 'えび', 'いか'] },
  { category: '乳製品', keywords: ['牛乳', 'ヨーグルト', 'チーズ', 'バター', '生クリーム'] },
  { category: '調味料', keywords: ['醤油', 'しょうゆ', 'みそ', '味噌', '塩', '砂糖', '油', '酢', 'こしょう', '胡椒', 'マヨネーズ', 'ケチャップ', 'ポン酢'] },
]

function toKatakana(input: string) {
  return input.replace(/[ぁ-ゖ]/g, (char) =>
    String.fromCharCode(char.charCodeAt(0) + 0x60)
  )
}

function cleanFoodName(input: string) {
  let cleaned = input.trim()

  for (const [pattern, replacement] of TRANSLATION_MAP) {
    cleaned = cleaned.replace(pattern, replacement)
  }

  cleaned = toKatakana(cleaned)
  cleaned = cleaned.replace(/[0-9０-９]+(?:g|kg|ml|l|個|本|袋|パック|枚)?/gi, ' ')

  for (const pattern of MODIFIER_PATTERNS) {
    cleaned = cleaned.replace(pattern, ' ')
  }

  cleaned = cleaned.replace(/[・,/]/g, ' ')
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  return cleaned
}

function simplifyProteinName(name: string) {
  if (name.includes('豚')) return '豚肉'
  if (name.includes('牛')) return '牛肉'
  if (name.includes('鶏')) return '鶏肉'
  return name
}

export function inferCategory(name: string) {
  const matched = CATEGORY_RULES.find(({ keywords }) =>
    keywords.some((keyword) => name.includes(keyword))
  )

  return matched?.category ?? null
}

export function normalizeFoodName(rawName: string) {
  const cleaned = simplifyProteinName(cleanFoodName(rawName))
  return cleaned || rawName.trim()
}

export async function normalizeFoodItem(rawName: string) {
  const name = normalizeFoodName(rawName)

  return {
    name,
    category: inferCategory(name),
  }
}
