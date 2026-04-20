import { describe, it, expect } from 'vitest'
import { registrationTabSchema } from './registrationTabSchema.js'

const validHeader = {
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

const validRoom = {
  roomTypeId: 'rt-deluxe',
  roomId: 'rm-101',
  roomNumber: '101',
  adults: 2,
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

const emptyClassification = {
  marketSegmentId: null,
  guestSourceId: null,
  mealPlanId: null,
  referenceId: null,
  hotelRemarks: '',
  posRemarks: '',
  channelDiscovery: [],
}

describe('registrationTabSchema - walk-in', () => {
  it('walk-in mode does not require mealPlan/reference', () => {
    const result = registrationTabSchema.safeParse({
      header: validHeader,
      rooms: [validRoom],
      services: [],
      classification: emptyClassification,
    })
    expect(result.success).toBe(true)
  })

  it('requires at least one room', () => {
    const result = registrationTabSchema.safeParse({
      header: validHeader,
      rooms: [],
      services: [],
      classification: emptyClassification,
    })
    expect(result.success).toBe(false)
  })
})

describe('registrationTabSchema - BR-REG-002 reservation-linked', () => {
  it('reservation-linked without mealPlan/reference fails', () => {
    const result = registrationTabSchema.safeParse({
      header: { ...validHeader, reservationEnabled: true, reservationId: 'rsv-0001' },
      rooms: [validRoom],
      services: [],
      classification: emptyClassification,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const paths = result.error.issues.map((i) => i.path.join('.'))
      expect(paths).toContain('classification.mealPlanId')
      expect(paths).toContain('classification.referenceId')
    }
  })

  it('reservation-linked with mealPlan and reference passes', () => {
    const result = registrationTabSchema.safeParse({
      header: { ...validHeader, reservationEnabled: true, reservationId: 'rsv-0001' },
      rooms: [validRoom],
      services: [],
      classification: {
        ...emptyClassification,
        mealPlanId: 'mp-01',
        referenceId: 'ref-01',
      },
    })
    expect(result.success).toBe(true)
  })

  it('reservation-linked with mealPlan only still fails (reference missing)', () => {
    const result = registrationTabSchema.safeParse({
      header: { ...validHeader, reservationEnabled: true, reservationId: 'rsv-0001' },
      rooms: [validRoom],
      services: [],
      classification: { ...emptyClassification, mealPlanId: 'mp-01' },
    })
    expect(result.success).toBe(false)
  })
})
