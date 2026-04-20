import { describe, it, expect } from 'vitest'
import { todayISO, tomorrowISO, diffNights, addDaysISO, isAfterISO } from './date.js'

describe('todayISO / tomorrowISO', () => {
  it('returns YYYY-MM-DD strings', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(tomorrowISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('tomorrow is one day after today', () => {
    expect(diffNights(todayISO(), tomorrowISO())).toBe(1)
  })
})

describe('diffNights', () => {
  it('returns 0 for equal dates', () => {
    expect(diffNights('2026-04-20', '2026-04-20')).toBe(0)
  })

  it('returns positive count for multi-day range', () => {
    expect(diffNights('2026-04-20', '2026-04-25')).toBe(5)
  })

  it('returns negative count when To is before From', () => {
    expect(diffNights('2026-04-25', '2026-04-20')).toBe(-5)
  })

  it('returns 0 when any input is missing or invalid', () => {
    expect(diffNights('', '2026-04-20')).toBe(0)
    expect(diffNights('2026-04-20', '')).toBe(0)
    expect(diffNights('not-a-date', '2026-04-20')).toBe(0)
  })
})

describe('addDaysISO', () => {
  it('advances days forward', () => {
    expect(addDaysISO('2026-04-20', 5)).toBe('2026-04-25')
  })

  it('rolls into next month', () => {
    expect(addDaysISO('2026-04-28', 5)).toBe('2026-05-03')
  })

  it('supports negative offsets', () => {
    expect(addDaysISO('2026-04-20', -1)).toBe('2026-04-19')
  })

  it('returns empty for invalid input', () => {
    expect(addDaysISO('', 1)).toBe('')
    expect(addDaysISO('bogus', 1)).toBe('')
  })
})

describe('isAfterISO', () => {
  it('true when a is strictly after b', () => {
    expect(isAfterISO('2026-04-21', '2026-04-20')).toBe(true)
  })

  it('false when equal', () => {
    expect(isAfterISO('2026-04-20', '2026-04-20')).toBe(false)
  })

  it('false when a is before b', () => {
    expect(isAfterISO('2026-04-19', '2026-04-20')).toBe(false)
  })

  it('false when either input is missing', () => {
    expect(isAfterISO('', '2026-04-20')).toBe(false)
    expect(isAfterISO('2026-04-21', '')).toBe(false)
  })
})
