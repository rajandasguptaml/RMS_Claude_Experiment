import { describe, it, expect } from 'vitest'
import {
  formatFullGuestName,
  guestBasicSchema,
  guestContactSchema,
  guestVisaSchema,
  guestPassportSchema,
  guestSchema,
} from './guestSchema.js'

describe('formatFullGuestName', () => {
  it('joins Title + First + Last with single spaces', () => {
    expect(formatFullGuestName({ title: 'MR', firstName: 'Arif', lastName: 'Ahmed' })).toBe(
      'MR Arif Ahmed'
    )
  })

  it('handles Title + First only (no Last)', () => {
    expect(formatFullGuestName({ title: 'MS', firstName: 'Aiko' })).toBe('MS Aiko')
  })

  it('returns empty string when all parts are blank', () => {
    expect(formatFullGuestName({ title: '', firstName: '', lastName: '' })).toBe('')
  })

  it('returns empty string when called with no argument', () => {
    expect(formatFullGuestName()).toBe('')
  })

  it('trims surrounding whitespace from each part', () => {
    expect(
      formatFullGuestName({ title: '  MR ', firstName: ' Arif ', lastName: '  Ahmed  ' })
    ).toBe('MR Arif Ahmed')
  })

  it('drops blank-only parts so partial values stay tidy', () => {
    expect(formatFullGuestName({ title: 'MR', firstName: '', lastName: 'Ahmed' })).toBe(
      'MR Ahmed'
    )
  })
})

describe('guestBasicSchema', () => {
  const valid = {
    title: 'MR',
    firstName: 'Arif',
    lastName: 'Ahmed',
    gender: 'Male',
    roomNo: '101',
    dateOfBirth: '1985-04-12',
  }

  it('accepts a valid basic object', () => {
    const result = guestBasicSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('accepts empty title at the basic level (composite schema enforces)', () => {
    const result = guestBasicSchema.safeParse({ ...valid, title: '' })
    expect(result.success).toBe(true)
  })

  it('accepts empty firstName at the basic level (composite schema enforces)', () => {
    const result = guestBasicSchema.safeParse({ ...valid, firstName: '' })
    expect(result.success).toBe(true)
  })
})

describe('guestContactSchema', () => {
  const blank = {
    email: '',
    phone: '',
    profession: '',
    companyName: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    nationality: '',
    nationalId: '',
    drivingLicense: '',
  }

  it('accepts a valid email', () => {
    const result = guestContactSchema.safeParse({ ...blank, email: 'a@b.co' })
    expect(result.success).toBe(true)
  })

  it('rejects an email without @', () => {
    const result = guestContactSchema.safeParse({ ...blank, email: 'foo' })
    expect(result.success).toBe(false)
    expect(
      !result.success && result.error.issues.some((i) => i.path[0] === 'email')
    ).toBe(true)
  })

  it('accepts empty email (optional)', () => {
    const result = guestContactSchema.safeParse({ ...blank, email: '' })
    expect(result.success).toBe(true)
  })

  it('accepts +880 formatted phone', () => {
    const result = guestContactSchema.safeParse({
      ...blank,
      phone: '+880 1711-2223334',
    })
    expect(result.success).toBe(true)
  })

  it('accepts 01711222333 plain phone', () => {
    const result = guestContactSchema.safeParse({ ...blank, phone: '01711222333' })
    expect(result.success).toBe(true)
  })

  it('rejects phone "abc"', () => {
    const result = guestContactSchema.safeParse({ ...blank, phone: 'abc' })
    expect(result.success).toBe(false)
  })

  it('rejects a too-short phone', () => {
    const result = guestContactSchema.safeParse({ ...blank, phone: '12' })
    expect(result.success).toBe(false)
  })

  it('accepts zip "1216"', () => {
    const result = guestContactSchema.safeParse({ ...blank, zipCode: '1216' })
    expect(result.success).toBe(true)
  })

  it('accepts zip "110001"', () => {
    const result = guestContactSchema.safeParse({ ...blank, zipCode: '110001' })
    expect(result.success).toBe(true)
  })

  it('rejects zip "abc"', () => {
    const result = guestContactSchema.safeParse({ ...blank, zipCode: 'abc' })
    expect(result.success).toBe(false)
  })

  it('rejects zip "12" (too short)', () => {
    const result = guestContactSchema.safeParse({ ...blank, zipCode: '12' })
    expect(result.success).toBe(false)
  })

  it('accepts all optional fields empty', () => {
    const result = guestContactSchema.safeParse(blank)
    expect(result.success).toBe(true)
  })
})

describe('guestVisaSchema — BR-GD-004', () => {
  it('accepts empty visa object', () => {
    const result = guestVisaSchema.safeParse({
      visaNumber: '',
      visaIssueDate: '',
      visaExpiryDate: '',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid date range (Expiry > Issue)', () => {
    const result = guestVisaSchema.safeParse({
      visaNumber: 'V-001',
      visaIssueDate: '2024-01-01',
      visaExpiryDate: '2025-01-01',
    })
    expect(result.success).toBe(true)
  })

  it('rejects when Expiry equals Issue', () => {
    const result = guestVisaSchema.safeParse({
      visaNumber: 'V-001',
      visaIssueDate: '2024-01-01',
      visaExpiryDate: '2024-01-01',
    })
    expect(result.success).toBe(false)
  })

  it('rejects when Expiry is before Issue', () => {
    const result = guestVisaSchema.safeParse({
      visaNumber: 'V-001',
      visaIssueDate: '2024-06-01',
      visaExpiryDate: '2024-01-01',
    })
    expect(result.success).toBe(false)
  })
})

describe('guestPassportSchema — BR-GD-004', () => {
  it('accepts empty passport object', () => {
    const result = guestPassportSchema.safeParse({
      passportNumber: '',
      passportIssueDate: '',
      passportExpiryDate: '',
    })
    expect(result.success).toBe(true)
  })

  it('accepts valid date range (Expiry > Issue)', () => {
    const result = guestPassportSchema.safeParse({
      passportNumber: 'P-001',
      passportIssueDate: '2020-01-01',
      passportExpiryDate: '2030-01-01',
    })
    expect(result.success).toBe(true)
  })

  it('rejects when Expiry equals Issue', () => {
    const result = guestPassportSchema.safeParse({
      passportNumber: 'P-001',
      passportIssueDate: '2020-01-01',
      passportExpiryDate: '2020-01-01',
    })
    expect(result.success).toBe(false)
  })

  it('rejects when Expiry is before Issue', () => {
    const result = guestPassportSchema.safeParse({
      passportNumber: 'P-001',
      passportIssueDate: '2025-01-01',
      passportExpiryDate: '2020-01-01',
    })
    expect(result.success).toBe(false)
  })
})

describe('guestSchema composed — BR-GD-002', () => {
  const minimalValid = {
    title: 'MR',
    firstName: 'Arif',
    country: 'Bangladesh',
  }

  it('rejects when Title is missing', () => {
    const result = guestSchema.safeParse({ firstName: 'Arif', country: 'Bangladesh' })
    expect(result.success).toBe(false)
    expect(
      !result.success && result.error.issues.some((i) => i.path[0] === 'title')
    ).toBe(true)
  })

  it('rejects when First Name is missing', () => {
    const result = guestSchema.safeParse({ title: 'MR', country: 'Bangladesh' })
    expect(result.success).toBe(false)
    expect(
      !result.success && result.error.issues.some((i) => i.path[0] === 'firstName')
    ).toBe(true)
  })

  it('rejects when Country is missing', () => {
    const result = guestSchema.safeParse({ title: 'MR', firstName: 'Arif' })
    expect(result.success).toBe(false)
    expect(
      !result.success && result.error.issues.some((i) => i.path[0] === 'country')
    ).toBe(true)
  })

  it('accepts the minimum valid guest (Title + First + Country)', () => {
    const result = guestSchema.safeParse(minimalValid)
    expect(result.success).toBe(true)
  })
})
