import { describe, expect, it } from 'vitest'

import { inferCategory, normalizeFoodName } from './normalizer'

describe('normalizeFoodName', () => {
  it('修飾語と数量表記を落として正規化する', () => {
    expect(normalizeFoodName('国産 おいしいポークスライス 300g')).toBe('豚肉')
  })

  it('ひらがなをカタカナに寄せる', () => {
    expect(normalizeFoodName('たまねぎ')).toBe('タマネギ')
  })
})

describe('inferCategory', () => {
  it('肉カテゴリを推定できる', () => {
    expect(inferCategory('豚肉')).toBe('肉')
  })

  it('調味料カテゴリを推定できる', () => {
    expect(inferCategory('醤油')).toBe('調味料')
  })
})
