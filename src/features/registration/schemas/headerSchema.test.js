import { describe, it, expect } from 'vitest'
import { headerSchema } from './headerSchema.js'

const baseHeader = {
  reservationEnabled: false,
  reservationId: null,
  checkInDate: '2026-04-20',
  checkInTime: '14:00',
  departureDate: '2026-04-21',
  checkoutTime: '12:00',
  totalNights: 1,
  manualNights: false,
  listedCompany: false,
  companyId: null,
  contactPerson: '',
  mobile: '',
  paymentMode: '',
  payFor: '',
  currency: 'BDT',
  conversionRate: 1,
}

describe('headerSchema - BR-REG-004 Departure > Check-In', () => {
  it('passes when Departure is strictly after Check-In', () => {
    const result = headerSchema.safeParse(baseHeader)
    expect(result.success).toBe(true)
  })

  it('fails when Departure equals Check-In', () => {
    const result = headerSchema.safeParse({
      ...baseHeader,
      departureDate: '2026-04-20',
    })
    expect(result.success).toBe(false)
    const hasDepartureIssue =
      !result.success && result.error.issues.some((i) => i.path[0] === 'departureDate')
    expect(hasDepartureIssue).toBe(true)
  })

  it('fails when Departure is before Check-In', () => {
    const result = headerSchema.safeParse({
      ...baseHeader,
      departureDate: '2026-04-19',
    })
    expect(result.success).toBe(false)
  })
})

describe('headerSchema - conditional company fields', () => {
  it('listedCompany=false does not require contact/mobile/payment/payFor', () => {
    const result = headerSchema.safeParse({ ...baseHeader, listedCompany: false })
    expect(result.success).toBe(true)
  })

  it('listedCompany=true requires companyId', () => {
    const result = headerSchema.safeParse({
      ...baseHeader,
      listedCompany: true,
      companyId: null,
    })
    expect(result.success).toBe(false)
    const hasCompanyIssue =
      !result.success && result.error.issues.some((i) => i.path[0] === 'companyId')
    expect(hasCompanyIssue).toBe(true)
  })

  it('listedCompany=true with valid company and payment data passes', () => {
    const result = headerSchema.safeParse({
      ...baseHeader,
      listedCompany: true,
      companyId: 'co-01',
      contactPerson: 'Mr Ahmed',
      mobile: '+8801711000001',
      paymentMode: 'Company',
      payFor: 'Room & Food',
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid payment mode', () => {
    const result = headerSchema.safeParse({
      ...baseHeader,
      listedCompany: true,
      companyId: 'co-01',
      paymentMode: 'Bitcoin',
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid pay-for selection', () => {
    const result = headerSchema.safeParse({
      ...baseHeader,
      listedCompany: true,
      companyId: 'co-01',
      payFor: 'Free Everything',
    })
    expect(result.success).toBe(false)
  })
})

describe('headerSchema - reservation link', () => {
  it('reservationEnabled=true requires a reservationId', () => {
    const result = headerSchema.safeParse({
      ...baseHeader,
      reservationEnabled: true,
      reservationId: null,
    })
    expect(result.success).toBe(false)
  })

  it('reservationEnabled=true with a reservationId passes', () => {
    const result = headerSchema.safeParse({
      ...baseHeader,
      reservationEnabled: true,
      reservationId: 'rsv-0001',
    })
    expect(result.success).toBe(true)
  })
})

describe('headerSchema - base field validation', () => {
  it('rejects non-positive conversion rate', () => {
    const result = headerSchema.safeParse({ ...baseHeader, conversionRate: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects missing currency', () => {
    const result = headerSchema.safeParse({ ...baseHeader, currency: '' })
    expect(result.success).toBe(false)
  })
})
