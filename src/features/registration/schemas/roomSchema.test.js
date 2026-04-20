import { describe, it, expect } from 'vitest'
import { roomSchema, computeRoomTotal, reverseRate } from './roomSchema.js'

const baseRoom = {
  roomTypeId: 'rt-deluxe',
  roomId: 'rm-101',
  roomNumber: '101',
  adults: 1,
  children: 0,
  rackRate: 9500,
  negotiatedRate: null,
  discountType: 'Fixed',
  discountValue: 0,
  scPct: 10,
  vatPct: 15,
  city: 150,
  additional: 100,
  waiveSc: false,
  waiveVat: false,
  waiveCity: false,
  waiveAdditional: false,
  sameAsGlobalDate: true,
  checkInDate: '',
  departureDate: '',
  stayType: 'Standard',
  lockToken: null,
}

describe('roomSchema - BR-REG-005 Fixed discount cap', () => {
  it('passes when Fixed discount <= Rack Rate', () => {
    const result = roomSchema.safeParse({ ...baseRoom, discountValue: 500 })
    expect(result.success).toBe(true)
  })

  it('fails when Fixed discount > Rack Rate', () => {
    const result = roomSchema.safeParse({
      ...baseRoom,
      discountValue: 10000,
    })
    expect(result.success).toBe(false)
    const hit =
      !result.success && result.error.issues.some((i) => i.path[0] === 'discountValue')
    expect(hit).toBe(true)
  })

  it('Percent discount rejected above 100', () => {
    const result = roomSchema.safeParse({
      ...baseRoom,
      discountType: 'Percent',
      discountValue: 150,
    })
    expect(result.success).toBe(false)
  })

  it('Percent discount accepted at 100', () => {
    const result = roomSchema.safeParse({
      ...baseRoom,
      discountType: 'Percent',
      discountValue: 100,
    })
    expect(result.success).toBe(true)
  })
})

describe('roomSchema - occupants', () => {
  it('requires at least 1 adult', () => {
    const result = roomSchema.safeParse({ ...baseRoom, adults: 0 })
    expect(result.success).toBe(false)
  })
})

describe('computeRoomTotal - happy paths', () => {
  it('returns 0 for null', () => {
    expect(computeRoomTotal(null)).toBe(0)
  })

  it('chains SC then VAT on (rack - discount)', () => {
    const total = computeRoomTotal({
      rackRate: 1000,
      discountType: 'Fixed',
      discountValue: 0,
      scPct: 10,
      vatPct: 15,
      city: 0,
      additional: 0,
      waiveSc: false,
      waiveVat: false,
      waiveCity: false,
      waiveAdditional: false,
    })
    // 1000 + 100 SC = 1100, + 165 VAT = 1265
    expect(total).toBe(1265)
  })

  it('applies fixed discount before taxes', () => {
    const total = computeRoomTotal({
      rackRate: 1000,
      discountType: 'Fixed',
      discountValue: 100,
      scPct: 10,
      vatPct: 15,
      city: 0,
      additional: 0,
    })
    // 900 + 90 = 990 + 148.5 = 1138.5
    expect(total).toBe(1138.5)
  })

  it('applies percent discount', () => {
    const total = computeRoomTotal({
      rackRate: 1000,
      discountType: 'Percent',
      discountValue: 10,
      scPct: 10,
      vatPct: 15,
      city: 0,
      additional: 0,
    })
    expect(total).toBe(1138.5)
  })

  it('adds city and additional at the end (no tax on them)', () => {
    const total = computeRoomTotal({
      rackRate: 1000,
      discountType: 'Fixed',
      discountValue: 0,
      scPct: 10,
      vatPct: 15,
      city: 150,
      additional: 100,
    })
    expect(total).toBe(1265 + 150 + 100)
  })
})

describe('computeRoomTotal - waive flags', () => {
  it('waiveSc removes service charge component', () => {
    const total = computeRoomTotal({
      rackRate: 1000,
      discountType: 'Fixed',
      discountValue: 0,
      scPct: 10,
      vatPct: 15,
      waiveSc: true,
      city: 0,
      additional: 0,
    })
    // 1000 + 0 SC + 150 VAT(on 1000) = 1150
    expect(total).toBe(1150)
  })

  it('waiveVat removes VAT component', () => {
    const total = computeRoomTotal({
      rackRate: 1000,
      discountType: 'Fixed',
      discountValue: 0,
      scPct: 10,
      vatPct: 15,
      waiveVat: true,
    })
    expect(total).toBe(1100)
  })

  it('waiveCity and waiveAdditional drop those charges', () => {
    const total = computeRoomTotal({
      rackRate: 1000,
      discountType: 'Fixed',
      discountValue: 0,
      scPct: 0,
      vatPct: 0,
      city: 150,
      additional: 100,
      waiveCity: true,
      waiveAdditional: true,
    })
    expect(total).toBe(1000)
  })
})

describe('computeRoomTotal - negotiated override + zero rate', () => {
  it('negotiatedRate overrides rackRate when provided and > 0', () => {
    const total = computeRoomTotal({
      rackRate: 5000,
      negotiatedRate: 1000,
      discountType: 'Fixed',
      discountValue: 0,
      scPct: 10,
      vatPct: 15,
    })
    expect(total).toBe(1265)
  })

  it('falls back to rack when negotiated is 0 or null', () => {
    const total = computeRoomTotal({
      rackRate: 1000,
      negotiatedRate: 0,
      discountType: 'Fixed',
      discountValue: 0,
      scPct: 10,
      vatPct: 15,
    })
    expect(total).toBe(1265)
  })

  it('zero-rate room with zero taxes returns 0', () => {
    const total = computeRoomTotal({
      rackRate: 0,
      discountType: 'Fixed',
      discountValue: 0,
      scPct: 0,
      vatPct: 0,
      city: 0,
      additional: 0,
    })
    expect(total).toBe(0)
  })
})

describe('computeRoomTotal - rounding', () => {
  it('rounds to 2 decimal places', () => {
    const total = computeRoomTotal({
      rackRate: 999.99,
      discountType: 'Fixed',
      discountValue: 0,
      scPct: 10,
      vatPct: 15,
    })
    // 999.99 + 99.999 + (1099.989 * 0.15) = 999.99 + 99.999 + 164.99835 = 1264.98735
    expect(total).toBe(1264.99)
  })
})

describe('reverseRate - round-trip with computeRoomTotal', () => {
  it('reversal yields back a rack rate whose total is the target', () => {
    const rates = { scPct: 10, vatPct: 15, city: 150, additional: 100 }
    const target = 5000
    const rack = reverseRate(target, rates)
    const total = computeRoomTotal({
      rackRate: rack,
      discountType: 'Fixed',
      discountValue: 0,
      scPct: rates.scPct,
      vatPct: rates.vatPct,
      city: rates.city,
      additional: rates.additional,
    })
    expect(Math.abs(total - target)).toBeLessThanOrEqual(0.01)
  })

  it('returns 0 when target is less than flat fees', () => {
    const rates = { scPct: 10, vatPct: 15, city: 300, additional: 200 }
    expect(reverseRate(100, rates)).toBe(0)
  })

  it('round-trip with zero taxes', () => {
    const rates = { scPct: 0, vatPct: 0, city: 0, additional: 0 }
    const target = 1234.56
    const rack = reverseRate(target, rates)
    expect(rack).toBe(1234.56)
  })
})
