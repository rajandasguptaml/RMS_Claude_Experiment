import { describe, it, expect } from 'vitest'
import { fetchAvailableRooms, acquireRoomLock, releaseRoomLock } from './rooms.mock.js'

describe('fetchAvailableRooms', () => {
  it('returns rooms filtered by typeId', async () => {
    const result = await fetchAvailableRooms({ typeId: 'rt-deluxe' })
    expect(result.length).toBeGreaterThan(0)
    result.forEach((r) => expect(r.typeId).toBe('rt-deluxe'))
  })

  it('excludes rooms that are occupied or out-of-service', async () => {
    const result = await fetchAvailableRooms({ typeId: 'rt-deluxe' })
    result.forEach((r) => {
      expect(['available', 'conflict']).toContain(r.status)
    })
  })

  it('includes the conflict sentinel rm-104 in rt-deluxe', async () => {
    const result = await fetchAvailableRooms({ typeId: 'rt-deluxe' })
    const conflict = result.find((r) => r.id === 'rm-104')
    expect(conflict).toBeDefined()
    expect(conflict.status).toBe('conflict')
  })

  it('returns empty for unknown type', async () => {
    const result = await fetchAvailableRooms({ typeId: 'rt-unknown' })
    expect(result).toEqual([])
  })
})

describe('acquireRoomLock', () => {
  it('returns a token for a non-conflict room', async () => {
    const res = await acquireRoomLock('rm-101')
    expect(res.token).toMatch(/^lock-rm-101-/)
    expect(res.expiresAt).toBeTruthy()
  })

  it('throws 409 for the conflict sentinel rm-104', async () => {
    let err
    try {
      await acquireRoomLock('rm-104')
    } catch (e) {
      err = e
    }
    expect(err).toBeDefined()
    expect(err.status).toBe(409)
  })

  it('throws 404 for unknown roomId', async () => {
    let err
    try {
      await acquireRoomLock('rm-9999')
    } catch (e) {
      err = e
    }
    expect(err).toBeDefined()
    expect(err.status).toBe(404)
  })
})

describe('releaseRoomLock', () => {
  it('returns { ok: true } best-effort', async () => {
    const res = await releaseRoomLock('rm-101', 'lock-rm-101-123')
    expect(res).toEqual({ ok: true })
  })
})
