import { create } from 'zustand'
import { todayISO, tomorrowISO, diffNights } from '../../../shared/lib/date.js'
import { initialGuests, createGuestActions } from './guestSlice.js'

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

const initialComplimentary = () => ({
  selected: [],
  mandatoryIds: [],
  initialized: false,
  sourceReservationId: null,
})

const initialOthersSectionA = () => ({
  comingFrom: '',
  nextDestination: '',
  visitPurpose: '',
  complimentaryGuest: '',
  houseUse: '',
  roomOwner: '',
  isPreviouslyVisited: false,
  isVip: false,
  channelDiscovery: [],
})

const initialOthersSectionB = () => ({
  airportDrop: '',
  airlineId: '',
  flightNumber: '',
  etd: '',
})

// PCI: cardGuarantee shape holds ONLY tokenized values. No `pan` field exists.
const initialCardGuarantee = () => ({
  cardType: '',
  cardHolderName: '',
  expiryMonth: '',
  expiryYear: '',
  cardReference: '',
  token: '',
  last4: '',
})

const initialOthersInformation = () => ({
  sectionA: initialOthersSectionA(),
  sectionB: initialOthersSectionB(),
  cardGuarantee: initialCardGuarantee(),
})

const initialRegistration = () => ({
  header: initialHeader(),
  rooms: [],
  services: [],
  classification: initialClassification(),
  complimentary: initialComplimentary(),
  othersInformation: initialOthersInformation(),
  guests: initialGuests(),
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

  toggleComplimentary: (id) =>
    set((state) => {
      const comp = state.registration.complimentary
      if (comp.mandatoryIds.includes(id)) return state // BR-CI-002: mandatory cannot be toggled
      const selected = comp.selected.includes(id)
        ? comp.selected.filter((x) => x !== id)
        : [...comp.selected, id]
      return {
        registration: {
          ...state.registration,
          complimentary: { ...comp, selected },
        },
      }
    }),

  selectAllComplimentary: (allActiveIds) =>
    set((state) => {
      const comp = state.registration.complimentary
      // All non-mandatory active IDs + preserved mandatory IDs
      const nonMandatoryActive = allActiveIds.filter((id) => !comp.mandatoryIds.includes(id))
      const alreadyAllSelected = nonMandatoryActive.every((id) => comp.selected.includes(id))
      const nextNonMandatory = alreadyAllSelected ? [] : nonMandatoryActive
      const selected = [...new Set([...comp.mandatoryIds, ...nextNonMandatory])]
      return {
        registration: {
          ...state.registration,
          complimentary: { ...comp, selected },
        },
      }
    }),

  clearComplimentary: () =>
    set((state) => ({
      registration: {
        ...state.registration,
        complimentary: {
          ...state.registration.complimentary,
          selected: [...state.registration.complimentary.mandatoryIds],
        },
      },
    })),

  applyReservationComplimentary: ({ reservationId, suggestedIds = [], mandatoryIds = [] }) =>
    set((state) => ({
      registration: {
        ...state.registration,
        complimentary: {
          selected: [...new Set([...mandatoryIds, ...suggestedIds])],
          mandatoryIds,
          initialized: true,
          sourceReservationId: reservationId,
        },
      },
    })),

  resetComplimentaryForWalkIn: () =>
    set((state) => ({
      registration: {
        ...state.registration,
        complimentary: initialComplimentary(),
      },
    })),

  setOthersSectionA: (patch) =>
    set((state) => {
      const next = { ...state.registration.othersInformation.sectionA, ...patch }
      // BR-OI-001: mutual exclusivity across Complimentary Guest / House Use / Room Owner.
      const flipped = ['complimentaryGuest', 'houseUse', 'roomOwner'].find(
        (k) => patch[k] === 'YES'
      )
      if (flipped) {
        for (const other of ['complimentaryGuest', 'houseUse', 'roomOwner']) {
          if (other !== flipped) next[other] = ''
        }
      }
      return {
        registration: {
          ...state.registration,
          othersInformation: {
            ...state.registration.othersInformation,
            sectionA: next,
          },
        },
      }
    }),

  setOthersSectionB: (patch) =>
    set((state) => ({
      registration: {
        ...state.registration,
        othersInformation: {
          ...state.registration.othersInformation,
          sectionB: { ...state.registration.othersInformation.sectionB, ...patch },
        },
      },
    })),

  // PCI: accepts only tokenized + display fields. Any caller attempting to pass a `pan`
  // or `cvv` key will have those keys stripped — belt-and-braces; the schema and
  // components should never supply one.
  setCardGuaranteeTokenized: (patch) =>
    set((state) => {
      const safe = { ...(patch || {}) }
      delete safe.pan
      delete safe.cvv
      return {
        registration: {
          ...state.registration,
          othersInformation: {
            ...state.registration.othersInformation,
            cardGuarantee: {
              ...state.registration.othersInformation.cardGuarantee,
              ...safe,
            },
          },
        },
      }
    }),

  clearCardGuarantee: () =>
    set((state) => ({
      registration: {
        ...state.registration,
        othersInformation: {
          ...state.registration.othersInformation,
          cardGuarantee: initialCardGuarantee(),
        },
      },
    })),

  resetOthersInformation: () =>
    set((state) => ({
      registration: {
        ...state.registration,
        othersInformation: initialOthersInformation(),
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

  // -------- Guest Details (FR-008) --------
  ...createGuestActions(set, get),

  resetDraft: () => set({ registration: initialRegistration(), roomLocks: {} }),

  // selector helpers (not hooks — call inside React components via useWizardDraft)
  getHeader: () => get().registration.header,
  getRooms: () => get().registration.rooms,
  getServices: () => get().registration.services,
  getClassification: () => get().registration.classification,
  getComplimentary: () => get().registration.complimentary,
  getOthersInformation: () => get().registration.othersInformation,
  getGuests: () => get().registration.guests,
}))
