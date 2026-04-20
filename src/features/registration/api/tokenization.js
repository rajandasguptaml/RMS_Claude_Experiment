/**
 * PCI-DSS tokenization adapter.
 *
 * CRITICAL CONTRACT:
 * - `tokenize({ pan, expiryMonth, expiryYear })` returns `{ token, last4 }`.
 * - The raw PAN is consumed by this adapter only and never returned.
 * - Callers must clear their PAN input after a successful tokenize call.
 * - Real backend integration (Open Q #10) swaps the implementation here;
 *   the signature above is stable. JS-SDK, iframe-postMessage, and redirect
 *   flows are all compatible.
 *
 * This adapter is mock-only for bolt-others-information-tab-1.
 */

function luhnCheck(digits) {
  let sum = 0
  let alt = false
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i])
    if (alt) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
    alt = !alt
  }
  return sum % 10 === 0
}

export function isCardExpiryInPast(month, year, now = new Date()) {
  if (!month || !year) return true
  const m = Number(month)
  const y = Number(year) < 100 ? 2000 + Number(year) : Number(year)
  if (!Number.isFinite(m) || m < 1 || m > 12) return true
  const nowYear = now.getFullYear()
  const nowMonth = now.getMonth() + 1
  if (y < nowYear) return true
  if (y === nowYear && m < nowMonth) return true
  return false
}

function generateToken() {
  // Non-cryptographic, deterministic-ish UUID-shaped stub. Real service returns real token.
  const rnd = () => Math.random().toString(36).slice(2, 10)
  return `tok_${rnd()}-${rnd()}`
}

// Artificial latency so the UI exercises its loading state.
const MOCK_LATENCY_MS = 300

/**
 * Tokenize a card.
 * @param {{pan:string, expiryMonth:string|number, expiryYear:string|number}} input
 * @returns {Promise<{token:string, last4:string}>}
 */
export async function tokenize({ pan, expiryMonth, expiryYear }) {
  // Validation — cheap, local, does NOT leak PAN outside this function.
  if (typeof pan !== 'string') {
    throw { code: 'pan_missing', message: 'Card number is required.' }
  }
  const digits = pan.replace(/\D/g, '')
  if (digits.length < 13 || digits.length > 19) {
    throw { code: 'pan_length', message: 'Card number length is invalid.' }
  }
  if (!luhnCheck(digits)) {
    throw { code: 'pan_luhn', message: 'Card number failed checksum.' }
  }
  if (isCardExpiryInPast(expiryMonth, expiryYear)) {
    throw { code: 'expiry_past', message: 'Card expiry is in the past.' }
  }

  await new Promise((resolve) => setTimeout(resolve, MOCK_LATENCY_MS))

  return {
    token: generateToken(),
    last4: digits.slice(-4),
  }
}

/**
 * Error scrubber: ensures no secret material leaks into logs or UI when callers
 * pass through an unknown error. Only keeps `code` and `message` fields.
 */
export function scrubTokenizeError(err) {
  if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
    return { code: String(err.code), message: String(err.message) }
  }
  return { code: 'unknown', message: 'Tokenization failed.' }
}
