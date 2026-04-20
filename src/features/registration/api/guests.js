import { useCallback, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMocks } from './client.js'
import {
  searchGuests,
  fetchGuestHistory,
  uploadGuestDocument,
} from './__mocks__/guests.mock.js'

function notImplemented(name) {
  return () => {
    throw new Error(`Real adapter for ${name} not implemented; enable VITE_USE_MOCKS`)
  }
}

/**
 * React Query hook for guest search. The `filters` object is used as part of
 * the cache key, so the query auto-refetches when any filter changes. Default
 * staleTime 30s per plan; keepPreviousData for smoother UX.
 *
 * Set `enabled` to `false` while no filters have been submitted (the modal
 * waits for the Search click).
 *
 * @param {object} filters
 * @param {boolean} [enabled]
 */
export function useGuestSearch(filters, enabled = true) {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['guests', 'search', filters],
    queryFn: mocks ? () => searchGuests(filters) : notImplemented('guestSearch'),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: (previous) => previous,
  })
}

/**
 * Fetch stay history for a guest. Disabled until a guestId is provided.
 * @param {string|null} guestId
 */
export function useGuestHistory(guestId) {
  const mocks = useMocks()
  return useQuery({
    queryKey: ['guests', 'history', guestId],
    queryFn: mocks ? () => fetchGuestHistory(guestId) : notImplemented('guestHistory'),
    enabled: Boolean(guestId),
    staleTime: 60 * 1000,
  })
}

/**
 * Hook wrapping the mock document upload. Exposes `{ mutate, progress,
 * isUploading, error, reset, abort }`. Progress is a number 0..100. On error,
 * `error` is set to the rejected value from the mock. The caller can call
 * `abort()` while an upload is in flight (best-effort — the mock honours it).
 *
 * @returns {{
 *   mutate: (file: File) => Promise<object | null>,
 *   progress: number,
 *   isUploading: boolean,
 *   error: any,
 *   reset: () => void,
 *   abort: () => void,
 * }}
 */
export function useGuestDocumentUpload() {
  const mocks = useMocks()
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState(null)
  const controllerRef = useRef(null)

  const reset = useCallback(() => {
    setProgress(0)
    setIsUploading(false)
    setError(null)
    controllerRef.current = null
  }, [])

  const abort = useCallback(() => {
    if (controllerRef.current) controllerRef.current.abort()
  }, [])

  const mutate = useCallback(
    async (file) => {
      if (!mocks) {
        throw new Error('Real adapter for guestDocumentUpload not implemented; enable VITE_USE_MOCKS')
      }
      setError(null)
      setProgress(0)
      setIsUploading(true)
      const controller = new AbortController()
      controllerRef.current = controller
      try {
        const result = await uploadGuestDocument({
          file,
          onProgress: (pct) => setProgress(pct),
          signal: controller.signal,
        })
        setIsUploading(false)
        return result
      } catch (err) {
        setError(err)
        setIsUploading(false)
        return null
      }
    },
    [mocks]
  )

  return { mutate, progress, isUploading, error, reset, abort }
}
