import { describe, it, expect } from 'vitest'
import { serviceSchema, computeServiceTotal } from './serviceSchema.js'

const baseService = {
  serviceId: 'sv-01',
  serviceName: 'Airport Drop',
  fromDate: '2026-04-20',
  toDate: '2026-04-22',
  unitRate: 2500,
  quantity: 1,
  total: 5000,
}

describe('serviceSchema', () => {
  it('accepts valid payload', () => {
    const result = serviceSchema.safeParse(baseService)
    expect(result.success).toBe(true)
  })

  it('rejects missing serviceId', () => {
    const result = serviceSchema.safeParse({ ...baseService, serviceId: '' })
    expect(result.success).toBe(false)
  })

  it('From <= To invariant: rejects To before From', () => {
    const result = serviceSchema.safeParse({
      ...baseService,
      fromDate: '2026-04-22',
      toDate: '2026-04-20',
    })
    expect(result.success).toBe(false)
  })

  it('From <= To invariant: equal dates allowed', () => {
    const result = serviceSchema.safeParse({
      ...baseService,
      fromDate: '2026-04-20',
      toDate: '2026-04-20',
    })
    expect(result.success).toBe(true)
  })

  it('rejects quantity below 1', () => {
    const result = serviceSchema.safeParse({ ...baseService, quantity: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects negative unit rate', () => {
    const result = serviceSchema.safeParse({ ...baseService, unitRate: -1 })
    expect(result.success).toBe(false)
  })
})

describe('computeServiceTotal', () => {
  it('returns 0 for null', () => {
    expect(computeServiceTotal(null)).toBe(0)
  })

  it('single-day service: rate * qty (days floored at 1)', () => {
    expect(
      computeServiceTotal({
        unitRate: 500,
        fromDate: '2026-04-20',
        toDate: '2026-04-20',
        quantity: 1,
      })
    ).toBe(500)
  })

  it('multi-day service: rate * days * qty', () => {
    expect(
      computeServiceTotal({
        unitRate: 500,
        fromDate: '2026-04-20',
        toDate: '2026-04-23',
        quantity: 2,
      })
    ).toBe(3000)
  })
})
