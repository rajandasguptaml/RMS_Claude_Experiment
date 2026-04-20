import { create } from 'zustand'
import { todayISO, tomorrowISO, diffNights } from '../../../shared/lib/date.js'

/**
 * Wizard draft store. This tab writes to the `registration` slice.
 * Other tabs (guest, complimentary, others) will extend from their own bolts.
 *
 * Shape:
 *  registration: {
 *    header: {...},
 *    rooms: [...],
 *    services: [...],
 *    classification: {...}
 *  }
 */

const initialHeader = () => ({
  reservationEnabled: false,
  reservationId: null,
  checkInDate: todayISO(),
  checkInTime: '14:00',
  departureDate: tomorrowISO(),
  checkoutTime: '12:00',
  totalNights: diffNights(todayISO(), tomorrowISO()),
  manualNights: false,
  listedCompany: false,
  companyId: null,
  contactPerson: '',
  mobile: '',
  paymentMode: '',
  payFor: '',
  currency: 'BDT',
  conversionRate: 1,
})

const initialClassification = () => ({
  marketSegmentId: null,
  guestSourceId: null,
  mealPlanId: null,
  referenceId: null,
  hotelRemarks: '',
  posRemarks: '',
  channelDiscovery: [],
})

const initialRegistration = () => ({
  header: initialHeader(),
  rooms: [],
  services: [],
  classification: initialClassification(),
})

export const useWizardDraft = create((set, get) => ({
  registration: initialRegistration(),

  // in-memory room-lock tokens keyed by roomId; never persisted
  roomLocks: {},

  setHeader: (patch) =>
    set((state) => {
      const nextHeader = { ...state.registration.header, ...patch }
      if (!nextHeader.manualNights) {
        nextHeader.totalNights = diffNights(nextHeader.checkInDate, nextHeader.departureDate)
      }
      return {
        registration: { ...state.registration, header: nextHeader },
      }
    }),

  resetCompanyFields: () =>
    set((state) => ({
      registration: {
        ...state.registration,
        header: {
          ...state.registration.header,
          companyId: null,
          contactPerson: '',
          mobile: '',
          paymentMode: '',
          payFor: '',
        },
      },
    })),

  addRoom: (room) =>
    set((state) => ({
      registration: {
        ...state.registration,
        rooms: [...state.registration.rooms, room],
      },
    })),

  updateRoom: (id, patch) =>
    set((state) => ({
      registration: {
        ...state.registration,
        rooms: state.registration.rooms.map((r) => (r.id === id ? { ...r, ...patch } : r)),
      },
    })),

  removeRoom: (id) =>
    set((state) => {
      const nextLocks = { ...state.roomLocks }
      const room = state.registration.rooms.find((r) => r.id === id)
      if (room && room.roomId) delete nextLocks[room.roomId]
      return {
        registration: {
          ...state.registration,
          rooms: state.registration.rooms.filter((r) => r.id !== id),
        },
        roomLocks: nextLocks,
      }
    }),

  addService: (service) =>
    set((state) => ({
      registration: {
        ...state.registration,
        services: [...state.registration.services, service],
      },
    })),

  updateService: (id, patch) =>
    set((state) => ({
      registration: {
        ...state.registration,
        services: state.registration.services.map((s) =>
          s.id === id ? { ...s, ...patch } : s
        ),
      },
    })),

  removeService: (id) =>
    set((state) => ({
      registration: {
        ...state.registration,
        services: state.registration.services.filter((s) => s.id !== id),
      },
    })),

  setClassification: (patch) =>
    set((state) => ({
      registration: {
        ...state.registration,
        classification: { ...state.registration.classification, ...patch },
      },
    })),

  setLock: (roomId, token) =>
    set((state) => ({ roomLocks: { ...state.roomLocks, [roomId]: token } })),

  clearLock: (roomId) =>
    set((state) => {
      const next = { ...state.roomLocks }
      delete next[roomId]
      return { roomLocks: next }
    }),

  resetDraft: () => set({ registration: initialRegistration(), roomLocks: {} }),

  // selector helpers (not hooks — call inside React components via useWizardDraft)
  getHeader: () => get().registration.header,
  getRooms: () => get().registration.rooms,
  getServices: () => get().registration.services,
  getClassification: () => get().registration.classification,
}))
