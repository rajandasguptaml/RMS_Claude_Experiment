import { guests } from '../../fixtures/guests.js'

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms))

const ALLOWED_MIMES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
])
const MAX_BYTES = 5 * 1024 * 1024

/**
 * Case-insensitive substring match. Empty / null filter values are ignored.
 * @param {string} value
 * @param {string} filter
 */
function likeMatch(value, filter) {
  if (!filter) return true
  if (value == null) return false
  return String(value).toLowerCase().includes(String(filter).toLowerCase())
}

/**
 * Exact-match (case-insensitive for strings). Empty filter is ignored.
 */
function exactMatch(value, filter) {
  if (!filter) return true
  if (value == null) return false
  return String(value).toLowerCase() === String(filter).toLowerCase()
}

/**
 * Mock guest search. Supports all 11 filters from BR-SR-001 with AND logic.
 * Text filters (name, company, email, mobile, nationalId, passport, regNo)
 * use case-insensitive LIKE. Room No + DOB + dates use exact match.
 *
 * @param {object} filters
 * @param {string} [filters.guestName]
 * @param {string} [filters.companyName]
 * @param {string} [filters.email]
 * @param {string} [filters.mobile]
 * @param {string} [filters.nationalId]
 * @param {string} [filters.dob]
 * @param {string} [filters.passportNo]
 * @param {string} [filters.roomNo]
 * @param {string} [filters.regNo]
 * @param {string} [filters.fromDate]
 * @param {string} [filters.toDate]
 * @returns {Promise<{ guests: object[], total: number }>}
 */
export async function searchGuests(filters = {}) {
  await delay()
  const hasAnyFilter = Object.values(filters || {}).some(
    (v) => v != null && String(v).trim() !== ''
  )
  if (!hasAnyFilter) {
    const top = guests.slice(0, 50)
    return { guests: top, total: top.length }
  }

  const results = guests.filter((g) => {
    if (!likeMatch(g.fullName, filters.guestName)) return false
    if (!likeMatch(g.companyName, filters.companyName)) return false
    if (!likeMatch(g.email, filters.email)) return false
    if (!likeMatch(g.phone, filters.mobile)) return false
    if (!likeMatch(g.nationalId, filters.nationalId)) return false
    if (!likeMatch(g.passportNumber, filters.passportNo)) return false
    if (!exactMatch(g.roomNo, filters.roomNo)) return false
    if (!exactMatch(g.dateOfBirth, filters.dob)) return false
    // regNo / fromDate / toDate apply against stayHistory entries
    if (filters.regNo) {
      const match = g.stayHistory.some((s) => likeMatch(s.regNo, filters.regNo))
      if (!match) return false
    }
    if (filters.fromDate) {
      const match = g.stayHistory.some((s) => s.arrival >= filters.fromDate)
      if (!match) return false
    }
    if (filters.toDate) {
      const match = g.stayHistory.some((s) => s.checkout <= filters.toDate)
      if (!match) return false
    }
    return true
  })

  return { guests: results.slice(0, 500), total: results.length }
}

/**
 * Mock stay history by guest id.
 * @param {string} guestId
 * @returns {Promise<object[]>}
 */
export async function fetchGuestHistory(guestId) {
  await delay()
  const g = guests.find((x) => x.id === guestId)
  return g ? g.stayHistory : []
}

/**
 * Mock document upload. Emits onProgress 25 / 50 / 75 / 100 at ~80ms intervals.
 * Rejects files > 5MB (code: file_too_large) or MIME not in JPG/PNG/PDF set
 * (code: mime_invalid). Returns `{ documentId, filename, mimeType, sizeBytes }`.
 *
 * @param {{ file: File, onProgress?: (pct: number) => void, signal?: AbortSignal }} args
 */
export async function uploadGuestDocument({ file, onProgress, signal }) {
  if (!file) {
    throw { code: 'no_file', message: 'No file selected.' }
  }
  if (file.size > MAX_BYTES) {
    throw { code: 'file_too_large', message: 'File exceeds the 5 MB limit.' }
  }
  const mime = (file.type || '').toLowerCase()
  if (!ALLOWED_MIMES.has(mime)) {
    throw { code: 'mime_invalid', message: 'Only JPG, PNG, or PDF files are accepted.' }
  }

  const steps = [25, 50, 75, 100]
  for (const pct of steps) {
    if (signal && signal.aborted) {
      throw { code: 'aborted', message: 'Upload cancelled.' }
    }
    await delay(80)
    if (onProgress) onProgress(pct)
  }

  return {
    documentId: `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    filename: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
  }
}
