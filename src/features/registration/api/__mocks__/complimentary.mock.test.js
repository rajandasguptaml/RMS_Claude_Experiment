import { describe, it, expect } from 'vitest'
import { fetchComplimentaryItems } from './masters.mock.js'
import { complimentaryItems } from '../../fixtures/complimentaryItems.js'

describe('fetchComplimentaryItems', () => {
  it('returns 29 items by default', async () => {
    const items = await fetchComplimentaryItems()
    expect(items).toHaveLength(29)
  })

  it('returns items with the expected shape', async () => {
    const items = await fetchComplimentaryItems()
    for (const item of items) {
      expect(typeof item.id).toBe('string')
      expect(typeof item.name).toBe('string')
      expect(item.is_active).toBe(true)
    }
  })

  it('filters out is_active=false items', async () => {
    // Mutate fixture temporarily
    const original = complimentaryItems[0].is_active
    complimentaryItems[0].is_active = false
    try {
      const items = await fetchComplimentaryItems()
      expect(items).toHaveLength(28)
      expect(items.find((i) => i.id === complimentaryItems[0].id)).toBeUndefined()
    } finally {
      complimentaryItems[0].is_active = original
    }
  })
})
