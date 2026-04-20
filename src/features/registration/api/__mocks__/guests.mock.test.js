import { describe, it, expect } from 'vitest'
import {
  searchGuests,
  fetchGuestHistory,
  uploadGuestDocument,
} from './guests.mock.js'
import { guests as fixtureGuests } from '../../fixtures/guests.js'

describe('searchGuests', () => {
  it('returns first 50 (or fixture total) when no filter supplied', async () => {
    const result = await searchGuests({})
    const expected = Math.min(50, fixtureGuests.length)
    expect(result.guests).toHaveLength(expected)
    expect(result.total).toBe(expected)
  })

  it('filters by guestName (case-insensitive LIKE on fullName/firstName)', async () => {
    const result = await searchGuests({ guestName: 'sara' })
    expect(result.total).toBeGreaterThan(0)
    result.guests.forEach((g) => {
      const hay = (g.fullName + ' ' + g.firstName).toLowerCase()
      expect(hay.includes('sara')).toBe(true)
    })
  })

  it('filters by mobile substring', async () => {
    const result = await searchGuests({ mobile: '880' })
    expect(result.total).toBeGreaterThan(0)
    result.guests.forEach((g) => {
      expect(g.phone.includes('880')).toBe(true)
    })
  })

  it('applies AND logic across filters and returns [] on mismatched combo', async () => {
    const result = await searchGuests({ guestName: 'sara', mobile: 'xyz' })
    expect(result.guests).toEqual([])
    expect(result.total).toBe(0)
  })
})

describe('fetchGuestHistory', () => {
  it('returns a non-empty array for g-01', async () => {
    const history = await fetchGuestHistory('g-01')
    expect(Array.isArray(history)).toBe(true)
    expect(history.length).toBeGreaterThan(0)
  })

  it('returns [] for unknown id', async () => {
    const history = await fetchGuestHistory('g-unknown')
    expect(history).toEqual([])
  })
})

describe('uploadGuestDocument', () => {
  function makeFile({ name = 'a.jpg', type = 'image/jpeg', size = 1024 } = {}) {
    // Construct a File using a Blob-like approach; jsdom supports File constructor.
    const content = new Uint8Array(size)
    return new File([content], name, { type })
  }

  it('rejects files larger than 5 MB with code=file_too_large', async () => {
    const big = makeFile({ size: 6 * 1024 * 1024 })
    let err
    try {
      await uploadGuestDocument({ file: big })
    } catch (e) {
      err = e
    }
    expect(err).toBeDefined()
    expect(err.code).toBe('file_too_large')
  })

  it('rejects wrong mime with code=mime_invalid', async () => {
    const bad = makeFile({ name: 'a.txt', type: 'text/plain' })
    let err
    try {
      await uploadGuestDocument({ file: bad })
    } catch (e) {
      err = e
    }
    expect(err).toBeDefined()
    expect(err.code).toBe('mime_invalid')
  })

  it('on a valid JPG, calls onProgress at least twice and resolves with document info', async () => {
    const good = makeFile({ name: 'passport.jpg', type: 'image/jpeg', size: 256 })
    const progress = []
    const result = await uploadGuestDocument({
      file: good,
      onProgress: (pct) => progress.push(pct),
    })
    expect(progress.length).toBeGreaterThanOrEqual(2)
    expect(result.documentId).toBeTruthy()
    expect(result.filename).toBe('passport.jpg')
    expect(result.mimeType).toBe('image/jpeg')
    expect(result.sizeBytes).toBe(256)
  })
})
