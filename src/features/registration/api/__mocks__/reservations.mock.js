import { reservations } from '../../fixtures/reservations.js'

const delay = (ms = 80) => new Promise((resolve) => setTimeout(resolve, ms))

export async function searchReservations(query = '') {
  await delay()
  const q = query.trim().toLowerCase()
  if (!q) return reservations
  return reservations.filter(
    (r) =>
      r.code.toLowerCase().includes(q) ||
      (r.guestName || '').toLowerCase().includes(q)
  )
}

export async function fetchReservation(id) {
  await delay()
  return reservations.find((r) => r.id === id) || null
}
