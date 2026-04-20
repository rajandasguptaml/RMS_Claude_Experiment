/**
 * Format a numeric amount as a currency string.
 * @param {number} amount
 * @param {string} currency ISO 4217 code (BDT, USD, EUR, ...)
 * @returns {string}
 */
export function formatMoney(amount, currency = 'BDT') {
  const value = Number.isFinite(amount) ? amount : 0
  const formatted = value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${currency} ${formatted}`
}

/**
 * Round to 2 decimal places without fp drift.
 * @param {number} n
 * @returns {number}
 */
export function round2(n) {
  if (!Number.isFinite(n)) return 0
  return Math.round((n + Number.EPSILON) * 100) / 100
}
