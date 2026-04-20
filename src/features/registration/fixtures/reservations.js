import { todayISO, addDaysISO } from '../../../shared/lib/date.js'

const today = todayISO()

/**
 * Sample reservations — selecting one auto-populates booking fields (story 002).
 */
export const reservations = [
  {
    id: 'rsv-0001',
    code: 'RSV-0001',
    guestName: 'Md. Shafiqul Islam',
    checkInDate: today,
    departureDate: addDaysISO(today, 2),
    roomTypeId: 'rt-deluxe',
    rackRate: 9500,
    currency: 'BDT',
  },
  {
    id: 'rsv-0002',
    code: 'RSV-0002',
    guestName: 'John Doe',
    checkInDate: addDaysISO(today, 1),
    departureDate: addDaysISO(today, 4),
    roomTypeId: 'rt-super-deluxe',
    rackRate: 12000,
    currency: 'USD',
  },
  {
    id: 'rsv-0003',
    code: 'RSV-0003',
    guestName: 'Priya Sharma',
    checkInDate: today,
    departureDate: addDaysISO(today, 3),
    roomTypeId: 'rt-executive-suite',
    rackRate: 20000,
    currency: 'BDT',
  },
  {
    id: 'rsv-0004',
    code: 'RSV-0004',
    guestName: 'Emma Thompson',
    checkInDate: addDaysISO(today, 2),
    departureDate: addDaysISO(today, 5),
    roomTypeId: 'rt-signature-suite',
    rackRate: 25000,
    currency: 'EUR',
  },
  {
    id: 'rsv-0005',
    code: 'RSV-0005',
    guestName: 'Rahim Uddin',
    checkInDate: today,
    departureDate: addDaysISO(today, 1),
    roomTypeId: 'rt-business-king',
    rackRate: 15500,
    currency: 'BDT',
  },
]
