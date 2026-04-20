import { differenceInCalendarDays, addDays, format, parseISO, isValid } from 'date-fns'

/**
 * Return today's date in YYYY-MM-DD format.
 * @returns {string}
 */
export function todayISO() {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * Return tomorrow's date in YYYY-MM-DD format.
 * @returns {string}
 */
export function tomorrowISO() {
  return format(addDays(new Date(), 1), 'yyyy-MM-dd')
}

/**
 * Compute whole calendar nights between two ISO date strings.
 * @param {string} fromISO
 * @param {string} toISO
 * @returns {number}
 */
export function diffNights(fromISO, toISO) {
  if (!fromISO || !toISO) return 0
  const a = parseISO(fromISO)
  const b = parseISO(toISO)
  if (!isValid(a) || !isValid(b)) return 0
  return differenceInCalendarDays(b, a)
}

/**
 * Add N days to an ISO date string; returns ISO date string.
 * @param {string} iso
 * @param {number} days
 * @returns {string}
 */
export function addDaysISO(iso, days) {
  if (!iso) return ''
  const d = parseISO(iso)
  if (!isValid(d)) return ''
  return format(addDays(d, days), 'yyyy-MM-dd')
}

/**
 * Safe ISO date compare. Returns true if a > b.
 * @param {string} a
 * @param {string} b
 */
export function isAfterISO(a, b) {
  if (!a || !b) return false
  return parseISO(a).getTime() > parseISO(b).getTime()
}
