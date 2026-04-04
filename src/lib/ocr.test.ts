import { describe, expect, it } from 'vitest'

import { extractFoodNamesFromReceiptText } from './ocr'

describe('extractFoodNamesFromReceiptText', () => {
  it('金額や合計行を除外して商品名候補だけ返す', () => {
    const text = ['玉ねぎ 198', '牛乳 258', '合計 456', 'TEL 03-0000-0000'].join('\n')

    expect(extractFoodNamesFromReceiptText(text)).toEqual(['玉ねぎ 198', '牛乳 258'])
  })
})
