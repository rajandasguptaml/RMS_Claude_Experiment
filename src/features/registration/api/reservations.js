import { useQuery } from '@tanstack/react-query'
import { useMocks } from './client.js'
import { searchReservations, fetchReservation } from './__mocks__/reservations.mock.js'

function notImplemented(name) {
  return () => {
    throw new Error(`Real adapter for ${name} not implemented; enable VITE_USE_MOCKS`)
  }
}

export function useReservationSearch(query = '') {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['reservations', 'search', query],
    queryFn: mocks ? () => searchReservations(query) : notImplemented('reservationSearch'),
    staleTime: 30 * 1000,
  })
}

export function useReservation(id) {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['reservations', 'byId', id],
    queryFn: mocks ? () => fetchReservation(id) : notImplemented('reservation'),
    enabled: Boolean(id),
  })
}
