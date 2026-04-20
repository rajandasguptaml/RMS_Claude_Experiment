import { guestSchema } from '../schemas/guestSchema.js'

/**
 * Guest slice helpers. Kept separate from wizardDraft.js to keep that file
 * under the 300-line budget and to make the guest-specific logic easier to
 * unit-test in Stage 3.
 *
 * Consumers: `wizardDraft.js` only.
 */

/** Default guest draft shape (all strings empty, booleans false). */
export function initialGuestDraft() {
  return {
    title: '',
    firstName: '',
    lastName: '',
    gender: '',
    roomNo: '',
    dateOfBirth: '',
    email: '',
    phone: '',
    profession: '',
    companyName: '',
    address: '',
    city: '',
    zipCode: '',
    country: '',
    nationality: '',
    nationalId: '',
    drivingLicense: '',
    visaNumber: '',
    visaIssueDate: '',
    visaExpiryDate: '',
    passportNumber: '',
    passportIssueDate: '',
    passportExpiryDate: '',
    guestDocument: null,
    blocked: false,
    isContactPerson: false,
  }
}

/** Initial value of `registration.guests`. */
export function initialGuests() {
  return {
    list: [],
    draft: initialGuestDraft(),
    mode: 'idle',
    editingId: null,
    familyGroupCouple: false,
  }
}

function genId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `g-${Date.now()}-${Math.floor(Math.random() * 10000)}`
}

/**
 * Build the guest-related action set bound to the given Zustand `set`/`get`.
 * Returns an object that can be spread into the store's `create()` return
 * value.
 */
export function createGuestActions(set, get) {
  return {
    setGuestDraft: (patch) =>
      set((state) => ({
        registration: {
          ...state.registration,
          guests: {
            ...state.registration.guests,
            draft: { ...state.registration.guests.draft, ...patch },
          },
        },
      })),

    clearGuestDraft: () =>
      set((state) => ({
        registration: {
          ...state.registration,
          guests: {
            ...state.registration.guests,
            draft: initialGuestDraft(),
            mode: 'idle',
            editingId: null,
          },
        },
      })),

    addGuest: () => {
      const state = get()
      const draft = state.registration.guests.draft
      const result = guestSchema.safeParse(draft)
      if (!result.success) return { ok: false, error: result.error }
      const id = genId()
      const entry = { ...result.data, id }
      set((s) => ({
        registration: {
          ...s.registration,
          guests: {
            ...s.registration.guests,
            list: [...s.registration.guests.list, entry],
            draft: initialGuestDraft(),
            mode: 'idle',
            editingId: null,
          },
        },
      }))
      return { ok: true, id }
    },

    updateGuest: () => {
      const state = get()
      const { draft, editingId } = state.registration.guests
      if (!editingId) return { ok: false, error: new Error('Not in edit mode') }
      const result = guestSchema.safeParse(draft)
      if (!result.success) return { ok: false, error: result.error }
      const entry = { ...result.data, id: editingId }
      set((s) => ({
        registration: {
          ...s.registration,
          guests: {
            ...s.registration.guests,
            list: s.registration.guests.list.map((g) => (g.id === editingId ? entry : g)),
            draft: initialGuestDraft(),
            mode: 'idle',
            editingId: null,
          },
        },
      }))
      return { ok: true, id: editingId }
    },

    removeGuest: (id) =>
      set((state) => {
        const g = state.registration.guests
        const wasEditing = g.editingId === id
        return {
          registration: {
            ...state.registration,
            guests: {
              ...g,
              list: g.list.filter((x) => x.id !== id),
              draft: wasEditing ? initialGuestDraft() : g.draft,
              mode: wasEditing ? 'idle' : g.mode,
              editingId: wasEditing ? null : g.editingId,
            },
          },
        }
      }),

    loadGuestForEdit: (id) =>
      set((state) => {
        const found = state.registration.guests.list.find((g) => g.id === id)
        if (!found) return state
        const { id: _omit, ...rest } = found
        return {
          registration: {
            ...state.registration,
            guests: {
              ...state.registration.guests,
              draft: { ...initialGuestDraft(), ...rest },
              mode: 'editing',
              editingId: id,
            },
          },
        }
      }),

    setFamilyGroupCouple: (flag) =>
      set((state) => {
        const g = state.registration.guests
        const nextDraft = { ...g.draft }
        if (flag) {
          const last = g.list[g.list.length - 1]
          if (last && last.roomNo) nextDraft.roomNo = last.roomNo
        }
        return {
          registration: {
            ...state.registration,
            guests: { ...g, familyGroupCouple: Boolean(flag), draft: nextDraft },
          },
        }
      }),

    setGuestBlocked: (id, blocked) =>
      set((state) => ({
        registration: {
          ...state.registration,
          guests: {
            ...state.registration.guests,
            list: state.registration.guests.list.map((g) =>
              g.id === id ? { ...g, blocked: Boolean(blocked) } : g
            ),
          },
        },
      })),
  }
}
