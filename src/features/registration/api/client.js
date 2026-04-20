/**
 * Thin fetch wrapper. When VITE_USE_MOCKS is truthy (or undefined during dev),
 * consumers should use the mock adapters directly instead of this client.
 * Real adapters are stubbed to throw.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/front_office'

/**
 * Check if mocks are enabled.  Treats undefined as true for dev convenience.
 */
export function useMocks() {
  const flag = import.meta.env.VITE_USE_MOCKS
  if (flag === undefined || flag === null || flag === '') return true
  return flag === 'true' || flag === true || flag === '1' || flag === 1
}

/**
 * JSON fetch helper. Throws on non-2xx.
 * @param {string} path - relative path appended to BASE_URL
 * @param {RequestInit} [init]
 */
export async function apiFetch(path, init = {}) {
  const url = `${BASE_URL}${path}`
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    const err = new Error(`API ${res.status}: ${body}`)
    err.status = res.status
    throw err
  }
  if (res.status === 204) return null
  return res.json()
}
