import { describe, it, expect } from 'vitest'
import { formatMoney, round2 } from './money.js'

describe('formatMoney', () => {
  it('defaults to BDT currency prefix', () => {
    expect(formatMoney(1234.5)).toBe('BDT 1,234.50')
  })

  it('formats zero with two decimals', () => {
    expect(formatMoney(0)).toBe('BDT 0.00')
  })

  it('formats negative values', () => {
    expect(formatMoney(-250)).toBe('BDT -250.00')
  })

  it('formats large values with thousand separators', () => {
    expect(formatMoney(1234567.89, 'USD')).toBe('USD 1,234,567.89')
  })

  it('coerces non-finite to 0', () => {
    expect(formatMoney(Number.NaN)).toBe('BDT 0.00')
    expect(formatMoney(Number.POSITIVE_INFINITY, 'EUR')).toBe('EUR 0.00')
  })
})

describe('round2', () => {
  it('rounds to 2 decimal places', () => {
    expect(round2(1.005)).toBe(1.01)
    expect(round2(2.345)).toBe(2.35)
  })

  it('leaves whole numbers untouched', () => {
    expect(round2(10)).toBe(10)
  })

  it('handles negative numbers', () => {
    expect(round2(-1.234)).toBe(-1.23)
  })

  it('returns 0 for non-finite input', () => {
    expect(round2(Number.NaN)).toBe(0)
    expect(round2(Number.POSITIVE_INFINITY)).toBe(0)
  })

  it('avoids floating-point drift', () => {
    expect(round2(0.1 + 0.2)).toBe(0.3)
  })
})
