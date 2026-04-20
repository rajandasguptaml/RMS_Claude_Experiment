import { useQuery } from '@tanstack/react-query'
import { useMocks } from './client.js'
import {
  fetchCompanies,
  fetchCurrencies,
  fetchReferences,
  fetchRoomTypes,
  fetchMealPlans,
  fetchMarketSegments,
  fetchGuestSources,
  fetchServices,
} from './__mocks__/masters.mock.js'

const longStaleOpts = {
  staleTime: 30 * 60 * 1000, // 30 min
  refetchOnWindowFocus: false,
}

function notImplemented(name) {
  return () => {
    throw new Error(`Real adapter for ${name} not implemented; enable VITE_USE_MOCKS`)
  }
}

export function useCompanyMaster() {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['master', 'companies'],
    queryFn: mocks ? fetchCompanies : notImplemented('companies'),
    ...longStaleOpts,
  })
}

export function useCurrencyMaster() {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['master', 'currencies'],
    queryFn: mocks ? fetchCurrencies : notImplemented('currencies'),
    ...longStaleOpts,
  })
}

export function useReferenceMaster() {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['master', 'references'],
    queryFn: mocks ? fetchReferences : notImplemented('references'),
    ...longStaleOpts,
  })
}

export function useRoomTypeMaster() {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['master', 'roomTypes'],
    queryFn: mocks ? fetchRoomTypes : notImplemented('roomTypes'),
    ...longStaleOpts,
  })
}

export function useMealPlanMaster() {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['master', 'mealPlans'],
    queryFn: mocks ? fetchMealPlans : notImplemented('mealPlans'),
    ...longStaleOpts,
  })
}

export function useMarketSegmentMaster() {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['master', 'marketSegments'],
    queryFn: mocks ? fetchMarketSegments : notImplemented('marketSegments'),
    ...longStaleOpts,
  })
}

export function useGuestSourceMaster() {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['master', 'guestSources'],
    queryFn: mocks ? fetchGuestSources : notImplemented('guestSources'),
    ...longStaleOpts,
  })
}

export function useServiceMaster() {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['master', 'services'],
    queryFn: mocks ? fetchServices : notImplemented('services'),
    ...longStaleOpts,
  })
}
