import { describe, it, expect } from 'vitest'
import {
  classificationFlagsSchema,
  departureSchema,
  cardGuaranteeSchema,
  CHANNEL_OPTIONS,
} from './othersInformationSchema.js'

describe('classificationFlagsSchema', () => {
  it('accepts all three flags empty', () => {
    const parsed = classificationFlagsSchema.safeParse({})
    expect(parsed.success).toBe(true)
  })

  it('accepts one flag = YES (BR-OI-001 passes)', () => {
    const parsed = classificationFlagsSchema.safeParse({
      complimentaryGuest: 'YES',
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects two flags = YES (BR-OI-001 violation)', () => {
    const parsed = classificationFlagsSchema.safeParse({
      complimentaryGuest: 'YES',
      houseUse: 'YES',
    })
    expect(parsed.success).toBe(false)
  })

  it('accepts channel discovery array with valid values', () => {
    const parsed = classificationFlagsSchema.safeParse({
      channelDiscovery: ['Facebook', 'Google'],
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects channel discovery with unknown value', () => {
    const parsed = classificationFlagsSchema.safeParse({
      channelDiscovery: ['TikTok'],
    })
    expect(parsed.success).toBe(false)
  })

  it('CHANNEL_OPTIONS matches BRD exactly', () => {
    expect(CHANNEL_OPTIONS).toEqual(['Facebook', 'Website', 'Google', 'Others'])
  })
})

describe('departureSchema', () => {
  it('accepts Airport Drop = NO with empty details', () => {
    const parsed = departureSchema.safeParse({ airportDrop: 'NO' })
    expect(parsed.success).toBe(true)
  })

  it('surfaces soft-warnings when Airport Drop = YES without details (BR-OI-004)', () => {
    const parsed = departureSchema.safeParse({ airportDrop: 'YES' })
    expect(parsed.success).toBe(false)
    if (!parsed.success) {
      const paths = parsed.error.issues.map((i) => i.path.join('.'))
      expect(paths).toEqual(expect.arrayContaining(['airlineId', 'flightNumber', 'etd']))
    }
  })

  it('accepts YES + airlineId + flightNumber + etd', () => {
    const parsed = departureSchema.safeParse({
      airportDrop: 'YES',
      airlineId: 'al-01',
      flightNumber: 'BG123',
      etd: '10:30',
    })
    expect(parsed.success).toBe(true)
  })

  it('accepts TBA with conditional fields populated', () => {
    const parsed = departureSchema.safeParse({
      airportDrop: 'TBA',
      airlineId: 'al-04',
      flightNumber: 'EK583',
      etd: '23:59',
    })
    expect(parsed.success).toBe(true)
  })
})

describe('cardGuaranteeSchema', () => {
  it('accepts fully empty (optional section)', () => {
    const parsed = cardGuaranteeSchema.safeParse({})
    expect(parsed.success).toBe(true)
  })

  it('rejects past expiry (NFR-C-005)', () => {
    const parsed = cardGuaranteeSchema.safeParse({
      expiryMonth: '01',
      expiryYear: '2020',
    })
    expect(parsed.success).toBe(false)
  })

  it('rejects token without last4', () => {
    const parsed = cardGuaranteeSchema.safeParse({
      token: 'tok_abc',
      last4: '',
    })
    expect(parsed.success).toBe(false)
  })

  it('accepts full valid tokenized payload', () => {
    const parsed = cardGuaranteeSchema.safeParse({
      cardType: 'Visa Card',
      cardHolderName: 'Jane Doe',
      expiryMonth: '12',
      expiryYear: '2030',
      cardReference: 'AUTH123',
      token: 'tok_abc_xyz',
      last4: '4242',
    })
    expect(parsed.success).toBe(true)
  })

  it('has no pan field in shape', () => {
    const parsed = cardGuaranteeSchema.safeParse({})
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.data).not.toHaveProperty('pan')
    }
  })
})
