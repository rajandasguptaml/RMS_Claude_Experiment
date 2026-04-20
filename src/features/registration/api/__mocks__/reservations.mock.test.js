import { describe, it, expect } from 'vitest'
import { searchReservations, fetchReservation } from './reservations.mock.js'

describe('searchReservations', () => {
  it('returns all reservations for empty query', async () => {
    const data = await searchReservations('')
    expect(data.length).toBeGreaterThanOrEqual(5)
  })

  it('matches by code (case-insensitive)', async () => {
    const data = await searchReservations('rsv-0001')
    expect(data.length).toBeGreaterThanOrEqual(1)
    expect(data[0].code).toBe('RSV-0001')
  })

  it('matches by guest name', async () => {
    const data = await searchReservations('John')
    expect(data.some((r) => r.guestName.includes('John'))).toBe(true)
  })

  it('returns empty for non-matching query', async () => {
    const data = await searchReservations('zzzz-no-match-zzzz')
    expect(data).toEqual([])
  })
})

describe('fetchReservation', () => {
  it('returns one by id', async () => {
    const r = await fetchReservation('rsv-0001')
    expect(r).toBeTruthy()
    expect(r.id).toBe('rsv-0001')
  })

  it('returns null for missing id', async () => {
    const r = await fetchReservation('rsv-missing')
    expect(r).toBeNull()
  })
})
