import { describe, it, expect, beforeEach } from 'vitest'
import { useWizardDraft } from './wizardDraft.js'

function getComp() {
  return useWizardDraft.getState().registration.complimentary
}

describe('wizardDraft — complimentary slice', () => {
  beforeEach(() => {
    useWizardDraft.getState().resetDraft()
  })

  it('initialises with empty selected, empty mandatory, initialized=false', () => {
    const c = getComp()
    expect(c.selected).toEqual([])
    expect(c.mandatoryIds).toEqual([])
    expect(c.initialized).toBe(false)
    expect(c.sourceReservationId).toBeNull()
  })

  describe('toggleComplimentary', () => {
    it('adds an unselected id', () => {
      useWizardDraft.getState().toggleComplimentary('ci-01')
      expect(getComp().selected).toContain('ci-01')
    })

    it('removes a selected id', () => {
      useWizardDraft.getState().toggleComplimentary('ci-01')
      useWizardDraft.getState().toggleComplimentary('ci-01')
      expect(getComp().selected).not.toContain('ci-01')
    })

    it('skips toggle when id is mandatory (BR-CI-002)', () => {
      useWizardDraft.getState().applyReservationComplimentary({
        reservationId: 'rsv-test',
        suggestedIds: ['ci-14'],
        mandatoryIds: ['ci-14'],
      })
      useWizardDraft.getState().toggleComplimentary('ci-14')
      expect(getComp().selected).toContain('ci-14')
    })
  })

  describe('selectAllComplimentary', () => {
    const allIds = ['ci-01', 'ci-02', 'ci-03', 'ci-14']

    it('selects all when none selected', () => {
      useWizardDraft.getState().selectAllComplimentary(allIds)
      expect(getComp().selected.sort()).toEqual(allIds.slice().sort())
    })

    it('deselects all non-mandatory when all already selected', () => {
      useWizardDraft.getState().selectAllComplimentary(allIds)
      useWizardDraft.getState().selectAllComplimentary(allIds)
      expect(getComp().selected).toEqual([])
    })

    it('preserves mandatory ids on deselect-all', () => {
      useWizardDraft.getState().applyReservationComplimentary({
        reservationId: 'rsv-test',
        suggestedIds: ['ci-14'],
        mandatoryIds: ['ci-14'],
      })
      useWizardDraft.getState().selectAllComplimentary(allIds)
      // Now all selected including mandatory. Toggle again:
      useWizardDraft.getState().selectAllComplimentary(allIds)
      const c = getComp()
      expect(c.selected).toEqual(['ci-14']) // mandatory preserved, non-mandatory cleared
    })
  })

  describe('applyReservationComplimentary', () => {
    it('sets selected = union(suggested, mandatory) and flips initialized', () => {
      useWizardDraft.getState().applyReservationComplimentary({
        reservationId: 'rsv-0003',
        suggestedIds: ['ci-03', 'ci-04'],
        mandatoryIds: ['ci-12', 'ci-14'],
      })
      const c = getComp()
      expect(c.selected.sort()).toEqual(['ci-03', 'ci-04', 'ci-12', 'ci-14'])
      expect(c.mandatoryIds).toEqual(['ci-12', 'ci-14'])
      expect(c.initialized).toBe(true)
      expect(c.sourceReservationId).toBe('rsv-0003')
    })
  })

  describe('resetComplimentaryForWalkIn', () => {
    it('wipes selection and mandatory', () => {
      useWizardDraft.getState().applyReservationComplimentary({
        reservationId: 'rsv-test',
        suggestedIds: ['ci-01'],
        mandatoryIds: ['ci-14'],
      })
      useWizardDraft.getState().resetComplimentaryForWalkIn()
      const c = getComp()
      expect(c.selected).toEqual([])
      expect(c.mandatoryIds).toEqual([])
      expect(c.initialized).toBe(false)
      expect(c.sourceReservationId).toBeNull()
    })
  })
})
