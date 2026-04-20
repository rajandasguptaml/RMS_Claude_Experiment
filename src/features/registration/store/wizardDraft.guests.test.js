import { describe, it, expect, beforeEach } from 'vitest'
import { useWizardDraft } from './wizardDraft.js'

function getGuests() {
  return useWizardDraft.getState().registration.guests
}

const minimalDraft = {
  title: 'MR',
  firstName: 'Arif',
  country: 'Bangladesh',
}

describe('wizardDraft — guests slice', () => {
  beforeEach(() => {
    useWizardDraft.getState().resetDraft()
  })

  describe('addGuest', () => {
    it('rejects when draft is invalid (missing Title/First/Country)', () => {
      const result = useWizardDraft.getState().addGuest()
      expect(result.ok).toBe(false)
      expect(result.error).toBeDefined()
      expect(getGuests().list).toHaveLength(0)
    })

    it('accepts a valid draft; assigns id; pushes to list; resets draft', () => {
      useWizardDraft.getState().setGuestDraft(minimalDraft)
      const result = useWizardDraft.getState().addGuest()
      expect(result.ok).toBe(true)
      expect(result.id).toBeTruthy()
      const g = getGuests()
      expect(g.list).toHaveLength(1)
      expect(g.list[0].id).toBe(result.id)
      expect(g.list[0].title).toBe('MR')
      expect(g.list[0].firstName).toBe('Arif')
      expect(g.list[0].country).toBe('Bangladesh')
      // draft reset
      expect(g.draft.title).toBe('')
      expect(g.draft.firstName).toBe('')
      expect(g.draft.country).toBe('')
      expect(g.mode).toBe('idle')
      expect(g.editingId).toBeNull()
    })
  })

  describe('updateGuest', () => {
    it('patches list entry; resets draft + editingId', () => {
      useWizardDraft.getState().setGuestDraft(minimalDraft)
      const add = useWizardDraft.getState().addGuest()
      useWizardDraft.getState().loadGuestForEdit(add.id)
      useWizardDraft.getState().setGuestDraft({ lastName: 'Ahmed', firstName: 'Ahmad' })
      const res = useWizardDraft.getState().updateGuest()
      expect(res.ok).toBe(true)
      const g = getGuests()
      expect(g.list).toHaveLength(1)
      expect(g.list[0].lastName).toBe('Ahmed')
      expect(g.list[0].firstName).toBe('Ahmad')
      expect(g.list[0].id).toBe(add.id)
      expect(g.draft.firstName).toBe('')
      expect(g.editingId).toBeNull()
      expect(g.mode).toBe('idle')
    })
  })

  describe('removeGuest', () => {
    it('filters list by id', () => {
      useWizardDraft.getState().setGuestDraft(minimalDraft)
      const a = useWizardDraft.getState().addGuest()
      useWizardDraft.getState().setGuestDraft({ ...minimalDraft, firstName: 'Bob' })
      const b = useWizardDraft.getState().addGuest()
      useWizardDraft.getState().removeGuest(a.id)
      const g = getGuests()
      expect(g.list).toHaveLength(1)
      expect(g.list[0].id).toBe(b.id)
    })
  })

  describe('loadGuestForEdit', () => {
    it('copies list entry to draft; sets editingId + mode=editing', () => {
      useWizardDraft.getState().setGuestDraft({ ...minimalDraft, lastName: 'Khan' })
      const add = useWizardDraft.getState().addGuest()
      useWizardDraft.getState().loadGuestForEdit(add.id)
      const g = getGuests()
      expect(g.editingId).toBe(add.id)
      expect(g.mode).toBe('editing')
      expect(g.draft.title).toBe('MR')
      expect(g.draft.firstName).toBe('Arif')
      expect(g.draft.lastName).toBe('Khan')
      expect(g.draft.country).toBe('Bangladesh')
    })
  })

  describe('clearGuestDraft', () => {
    it('resets draft without touching list', () => {
      useWizardDraft.getState().setGuestDraft(minimalDraft)
      useWizardDraft.getState().addGuest()
      useWizardDraft.getState().setGuestDraft({ firstName: 'Draftname' })
      useWizardDraft.getState().clearGuestDraft()
      const g = getGuests()
      expect(g.list).toHaveLength(1)
      expect(g.draft.firstName).toBe('')
      expect(g.mode).toBe('idle')
      expect(g.editingId).toBeNull()
    })
  })

  describe('setFamilyGroupCouple', () => {
    it('with existing guest in list, copies previous Room No to draft.roomNo', () => {
      useWizardDraft.getState().setGuestDraft({ ...minimalDraft, roomNo: '505' })
      useWizardDraft.getState().addGuest()
      // After add, draft is blank. Toggle on:
      useWizardDraft.getState().setFamilyGroupCouple(true)
      const g = getGuests()
      expect(g.familyGroupCouple).toBe(true)
      expect(g.draft.roomNo).toBe('505')
    })

    it('without list, toggles flag without mutation', () => {
      useWizardDraft.getState().setFamilyGroupCouple(true)
      const g = getGuests()
      expect(g.familyGroupCouple).toBe(true)
      expect(g.draft.roomNo).toBe('')
      expect(g.list).toHaveLength(0)
    })
  })

  describe('setGuestBlocked', () => {
    it('flips blocked on the matching list entry', () => {
      useWizardDraft.getState().setGuestDraft(minimalDraft)
      const add = useWizardDraft.getState().addGuest()
      useWizardDraft.getState().setGuestBlocked(add.id, true)
      const g = getGuests()
      expect(g.list[0].blocked).toBe(true)
    })
  })

  describe('getGuests selector', () => {
    it('returns the full guests slice', () => {
      const slice = useWizardDraft.getState().getGuests()
      expect(slice).toBeDefined()
      expect(slice.list).toEqual([])
      expect(slice.draft).toBeDefined()
      expect(slice.mode).toBe('idle')
      expect(slice.editingId).toBeNull()
      expect(slice.familyGroupCouple).toBe(false)
    })
  })
})
