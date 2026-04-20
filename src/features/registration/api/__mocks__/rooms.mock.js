import { rooms } from '../../fixtures/rooms.js'

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Return rooms filtered by typeId and availability.
 * Any room with status !== 'available' is excluded except 'conflict' rooms,
 * which remain listed but will trigger a 409 on lock attempt.
 */
export async function fetchAvailableRooms({ typeId }) {
  await delay()
  const filtered = rooms.filter(
    (r) => r.typeId === typeId && (r.status === 'available' || r.status === 'conflict')
  )
  return filtered
}

/**
 * Mock lock acquisition. Rooms with status 'conflict' always fail with 409.
 */
export async function acquireRoomLock(roomId) {
  await delay(120)
  const room = rooms.find((r) => r.id === roomId)
  if (!room) {
    const err = new Error('Room not found')
    err.status = 404
    throw err
  }
  if (room.status === 'conflict') {
    const err = new Error('Room just taken by another agent')
    err.status = 409
    throw err
  }
  return {
    token: `lock-${roomId}-${Date.now()}`,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  }
}

/**
 * Release a lock (best-effort). Never throws.
 */
export async function releaseRoomLock(roomId, token) {
  // roomId + token are echoed back for callers that want to verify the release.
  void roomId
  void token
  await delay(40)
  return { ok: true }
}
