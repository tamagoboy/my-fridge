import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { FoodForm } from './FoodForm'

vi.mock('@/hooks/useFoods', () => ({
  useFoodSuggestions: () => ({ data: [] }),
}))

describe('FoodForm', () => {
  it('新規追加時に登録するボタンが表示される', () => {
    render(
      <FoodForm
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
        storageLocations={[]}
      />
    )

    expect(screen.getByRole('button', { name: '登録する' })).toBeInTheDocument()
  })

  it('食材名を入力して登録すると onSubmit が呼ばれる', async () => {
    const user = userEvent.setup()
    const handleSubmit = vi.fn()

    render(
      <FoodForm
        onSubmit={handleSubmit}
        onCancel={vi.fn()}
        storageLocations={[]}
      />
    )

    await user.type(screen.getByLabelText('食材名 *'), '牛乳')
    await user.click(screen.getByRole('button', { name: '登録する' }))

    expect(handleSubmit).toHaveBeenCalledWith({
      name: '牛乳',
      category: null,
      remainingStatus: 'full',
      storageLocationId: null,
      expiryDate: null,
    })
  })
})