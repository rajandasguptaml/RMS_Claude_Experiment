import { describe, it, expect } from 'vitest'
import { complimentarySchema } from './complimentarySchema.js'

describe('complimentarySchema', () => {
  it('accepts empty selected and empty mandatoryIds (BR-CI-001)', () => {
    const parsed = complimentarySchema.safeParse({ selected: [], mandatoryIds: [] })
    expect(parsed.success).toBe(true)
  })

  it('accepts selected containing all mandatoryIds', () => {
    const parsed = complimentarySchema.safeParse({
      selected: ['ci-01', 'ci-14'],
      mandatoryIds: ['ci-14'],
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects when a mandatory id is missing from selected', () => {
    const parsed = complimentarySchema.safeParse({
      selected: ['ci-01'],
      mandatoryIds: ['ci-14'],
    })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      expect(parsed.error.issues[0].message).toMatch(/Mandatory/i)
    }
  })

  it('uses default empty arrays', () => {
    const parsed = complimentarySchema.parse({})
    expect(parsed.selected).toEqual([])
    expect(parsed.mandatoryIds).toEqual([])
  })
})
