import { useQuery, useMutation } from '@tanstack/react-query'
import { useMocks } from './client.js'
import { fetchAvailableRooms, acquireRoomLock, releaseRoomLock } from './__mocks__/rooms.mock.js'

function notImplemented(name) {
  return () => {
    throw new Error(`Real adapter for ${name} not implemented; enable VITE_USE_MOCKS`)
  }
}

/**
 * Available rooms filtered by type + date range.
 * @param {{ typeId: string|null, from: string, to: string, enabled?: boolean }} params
 */
export function useAvailableRooms({ typeId, from, to, enabled = true }) {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['rooms', 'available', typeId, from, to],
    queryFn: mocks
      ? () => fetchAvailableRooms({ typeId, from, to })
      : notImplemented('availableRooms'),
    enabled: enabled && Boolean(typeId),
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  })
}

export function useRoomLock() {
  const mocks = useMocks()
  return useMutation({
    mutationFn: mocks ? (roomId) => acquireRoomLock(roomId) : notImplemented('roomLock'),
  })
}

export function useRoomLockRelease() {
  const mocks = useMocks()
  return useMutation({
    mutationFn: mocks
      ? ({ roomId, token }) => releaseRoomLock(roomId, token)
      : notImplemented('releaseRoomLock'),
  })
}
