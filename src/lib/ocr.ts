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

/**
 * 商品行を判定するヘルパー関数
 * レシート形式：「商品コード 商品名 ¥価格」
 * 例：0010 ノンオイル海苔 4号 ¥139
 */
function isProductLine(line: string): boolean {
  // 先頭が4〜5桁の数字（商品コード）かつ末尾が ¥ 付き価格
  const productPattern = /^\d{4,5}\s+.+[¥￥]\d+$/
  return productPattern.test(line.trim())
}

/**
 * 商品行から商品名を抽出
 * 入力：「0010 ノンオイル海苔 4号 ¥139」
 * 出力：「ノンオイル海苔 4号」
 */
function extractProductNameFromLine(line: string): string {
  const trimmed = line.trim()

  // 先頭の商品コード（数字）を削除
  const afterCode = trimmed.replace(/^\d{4,5}\s+/, '')

  // 末尾の価格（¥XXX）を削除
  const productName = afterCode.replace(/[¥￥]\d+.*$/, '').trim()

  return productName
}

export function extractFoodNamesFromReceiptText(text: string) {
  const lines = text.split(/\r?\n/)

  // 方法 1: 商品コード＋価格パターンで抽出（最も信頼性が高い）
  const productLines = lines
    .filter((line) => isProductLine(line))
    .map((line) => extractProductNameFromLine(line))
    .filter((name) => name.length > 0)

  // 方法 2: 商品コード＋価格パターンがない場合は従来の方法にフォールバック
  if (productLines.length > 0) {
    return productLines.slice(0, 20)
  }

  // フォールバック：従来のフィルタリング方式
  return lines
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
