import { describe, it, expect, vi } from 'vitest'
import { tokenize, isCardExpiryInPast, scrubTokenizeError } from './tokenization.js'

describe('isCardExpiryInPast', () => {
  it('returns true when year is before now', () => {
    expect(isCardExpiryInPast(12, 2020, new Date('2026-04-20'))).toBe(true)
  })

  it('returns true when same year but earlier month', () => {
    expect(isCardExpiryInPast(3, 2026, new Date('2026-04-20'))).toBe(true)
  })

  it('returns false when same year and same month', () => {
    expect(isCardExpiryInPast(4, 2026, new Date('2026-04-20'))).toBe(false)
  })

  it('returns false when future year', () => {
    expect(isCardExpiryInPast(1, 2030, new Date('2026-04-20'))).toBe(false)
  })

  it('returns true when month or year is missing', () => {
    expect(isCardExpiryInPast('', 2030)).toBe(true)
    expect(isCardExpiryInPast(1, '')).toBe(true)
  })

  it('supports 2-digit years by adding 2000', () => {
    expect(isCardExpiryInPast(1, 30, new Date('2026-04-20'))).toBe(false)
    expect(isCardExpiryInPast(1, 20, new Date('2026-04-20'))).toBe(true)
  })
})

describe('tokenize (mock)', () => {
  it('rejects non-string PAN', async () => {
    await expect(tokenize({ pan: null, expiryMonth: 12, expiryYear: 2030 })).rejects.toMatchObject({
      code: 'pan_missing',
    })
  })

  it('rejects PAN shorter than 13 digits', async () => {
    await expect(
      tokenize({ pan: '123456789012', expiryMonth: 12, expiryYear: 2030 })
    ).rejects.toMatchObject({ code: 'pan_length' })
  })

  it('rejects PAN failing Luhn', async () => {
    await expect(
      tokenize({ pan: '4242424242424241', expiryMonth: 12, expiryYear: 2030 })
    ).rejects.toMatchObject({ code: 'pan_luhn' })
  })

  it('rejects past expiry', async () => {
    await expect(
      tokenize({ pan: '4242424242424242', expiryMonth: 1, expiryYear: 2020 })
    ).rejects.toMatchObject({ code: 'expiry_past' })
  })

  it('returns { token, last4 } on valid PAN + future expiry', async () => {
    vi.useFakeTimers()
    const promise = tokenize({
      pan: '4242 4242 4242 4242',
      expiryMonth: 12,
      expiryYear: 2030,
    })
    await vi.advanceTimersByTimeAsync(350)
    const result = await promise
    expect(result.token).toMatch(/^tok_/)
    expect(result.last4).toBe('4242')
    expect(result).not.toHaveProperty('pan')
    vi.useRealTimers()
  })
})

describe('scrubTokenizeError', () => {
  it('keeps only code and message from known errors', () => {
    expect(scrubTokenizeError({ code: 'x', message: 'y', extra: 'z' })).toEqual({
      code: 'x',
      message: 'y',
    })
  })

  it('returns unknown fallback for unknown shapes', () => {
    expect(scrubTokenizeError(null)).toEqual({ code: 'unknown', message: 'Tokenization failed.' })
    expect(scrubTokenizeError('boom')).toEqual({ code: 'unknown', message: 'Tokenization failed.' })
    expect(scrubTokenizeError({ other: 'x' })).toEqual({
      code: 'unknown',
      message: 'Tokenization failed.',
    })
  })
})
