import { describe, it, expect } from 'vitest'
import {
  classificationSchema,
  CHANNEL_OPTIONS,
  validateConditionalClassification,
} from './classificationSchema.js'

describe('classificationSchema - base validation', () => {
  it('accepts empty classification', () => {
    const result = classificationSchema.safeParse({})
    expect(result.success).toBe(true)
    // defaults applied
    if (result.success) {
      expect(result.data.channelDiscovery).toEqual([])
    }
  })

  it('accepts full classification', () => {
    const result = classificationSchema.safeParse({
      marketSegmentId: 'ms-01',
      guestSourceId: 'gs-01',
      mealPlanId: 'mp-01',
      referenceId: 'ref-01',
      hotelRemarks: 'VIP',
      posRemarks: 'Group',
      channelDiscovery: ['Facebook', 'Website'],
    })
    expect(result.success).toBe(true)
  })
})

describe('classificationSchema - channel discovery', () => {
  it('exposes the 4 expected options', () => {
    expect(CHANNEL_OPTIONS).toEqual(['Facebook', 'Website', 'Google', 'Others'])
  })

  it('accepts all valid options', () => {
    const result = classificationSchema.safeParse({ channelDiscovery: CHANNEL_OPTIONS })
    expect(result.success).toBe(true)
  })

  it('empty array is allowed', () => {
    const result = classificationSchema.safeParse({ channelDiscovery: [] })
    expect(result.success).toBe(true)
  })

  it('rejects unknown option', () => {
    const result = classificationSchema.safeParse({
      channelDiscovery: ['TikTok'],
    })
    expect(result.success).toBe(false)
  })
})

describe('validateConditionalClassification - BR-REG-002', () => {
  it('no errors when reservation disabled', () => {
    const errs = validateConditionalClassification(
      { mealPlanId: null, referenceId: null },
      false
    )
    expect(errs).toEqual([])
  })

  it('requires mealPlan and reference when reservation-linked', () => {
    const errs = validateConditionalClassification(
      { mealPlanId: null, referenceId: null },
      true
    )
    expect(errs).toHaveLength(2)
    expect(errs.map((e) => e.path)).toEqual(['mealPlanId', 'referenceId'])
  })

  it('no errors when both provided and reservation-linked', () => {
    const errs = validateConditionalClassification(
      { mealPlanId: 'mp-01', referenceId: 'ref-01' },
      true
    )
    expect(errs).toEqual([])
  })
})
