import { normalizeFoodItem } from '@/lib/normalizer'

const RECEIPT_EXCLUDE_PATTERNS = [
  /合計/,
  /小計/,
  /税込/,
  /税抜/,
  /釣銭/,
  /現金/,
  /クレジット/,
  /ポイント/,
  /値引/,
  /割引/,
  /領収/,
  /TEL/,
  /No\./i,
  /[0-9]{2}:[0-9]{2}/,
]

function isLikelyFoodLine(line: string) {
  if (line.length < 2) {
    return false
  }

  if (RECEIPT_EXCLUDE_PATTERNS.some((pattern) => pattern.test(line))) {
    return false
  }

  return /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}A-Za-z]/u.test(line)
}

export function extractFoodNamesFromReceiptText(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.replace(/[¥￥].*$/, '').replace(/\s+/g, ' ').trim())
    .filter(isLikelyFoodLine)
    .slice(0, 20)
}

export async function parseReceiptText(text: string) {
  const lines = extractFoodNamesFromReceiptText(text)
  const normalized = await Promise.all(lines.map((line) => normalizeFoodItem(line)))

  return normalized.filter((item, index, array) =>
    item.name && array.findIndex((candidate) => candidate.name === item.name) === index
  )
}
