import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { ComplimentaryTab } from './ComplimentaryTab.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'

function resetStore() {
  useWizardDraft.getState().resetDraft()
}

async function renderAndWaitForItems() {
  const result = renderWithProviders(<ComplimentaryTab />)
  await waitFor(() => {
    expect(screen.getByTestId('comp-tile-ci-01')).toBeInTheDocument()
  })
  return result
}

describe('ComplimentaryTab', () => {
  beforeEach(() => {
    resetStore()
  })

  it('renders 29 tiles from the master (no hard-code)', async () => {
    await renderAndWaitForItems()
    const tileRoots = document.querySelectorAll(
      '[data-testid^="comp-tile-ci-"]'
    )
    // 29 tile containers; checkbox inputs have a different testid prefix (comp-tile-checkbox-)
    const containerOnly = Array.from(tileRoots).filter(
      (el) => !el.getAttribute('data-testid').startsWith('comp-tile-checkbox-')
    )
    expect(containerOnly.length).toBe(29)
  })

  it('toggles a non-mandatory tile via click (BR-CI-001)', async () => {
    const user = userEvent.setup()
    await renderAndWaitForItems()
    const checkbox = screen.getByTestId('comp-tile-checkbox-ci-02')
    expect(checkbox.checked).toBe(false)
    await user.click(checkbox)
    expect(useWizardDraft.getState().registration.complimentary.selected).toContain('ci-02')
  })

  it('select-all picks every non-mandatory item', async () => {
    const user = userEvent.setup()
    await renderAndWaitForItems()
    const master = screen.getByTestId('comp-select-all')
    await user.click(master)
    const selected = useWizardDraft.getState().registration.complimentary.selected
    expect(selected.length).toBe(29)
  })

  it('applies a selected style to selected tiles', async () => {
    const user = userEvent.setup()
    await renderAndWaitForItems()
    const tile = screen.getByTestId('comp-tile-ci-03')
    await user.click(tile.querySelector('input'))
    await waitFor(() => {
      expect(
        screen.getByTestId('comp-tile-ci-03').className
      ).toMatch(/bg-slate-900/)
    })
  })

  it('mandatory tile cannot be toggled off (BR-CI-002)', async () => {
    // Seed a reservation-linked header so the walk-in reset effect does not fire.
    useWizardDraft.getState().setHeader({
      reservationEnabled: true,
      reservationId: 'rsv-0003',
    })
    // rsv-0003 fixture carries mandatory ci-12 + ci-14. Wait for sync.
    await renderAndWaitForItems()
    await waitFor(() => {
      expect(
        useWizardDraft.getState().registration.complimentary.mandatoryIds
      ).toContain('ci-14')
    })
    const checkbox = screen.getByTestId('comp-tile-checkbox-ci-14')
    expect(checkbox.disabled).toBe(true)
    // Direct click: store guard rejects toggle
    fireEvent.click(checkbox)
    expect(useWizardDraft.getState().registration.complimentary.selected).toContain('ci-14')
  })

  it('reservation-sync auto-selects mandatory + suggested items once', async () => {
    // Seed header state to simulate the Registration tab having picked rsv-0003
    useWizardDraft.getState().setHeader({
      reservationEnabled: true,
      reservationId: 'rsv-0003',
    })
    await renderAndWaitForItems()
    await waitFor(() => {
      const comp = useWizardDraft.getState().registration.complimentary
      expect(comp.initialized).toBe(true)
      expect(comp.mandatoryIds.sort()).toEqual(['ci-12', 'ci-14'])
      // selected is the union of suggested + mandatory
      expect(comp.selected).toEqual(expect.arrayContaining(['ci-12', 'ci-14']))
    })
  })

  it('walk-in mode clears any prior reservation-driven state', async () => {
    useWizardDraft.getState().applyReservationComplimentary({
      reservationId: 'rsv-0001',
      suggestedIds: ['ci-04'],
      mandatoryIds: ['ci-14'],
    })
    // ensure header reflects walk-in
    useWizardDraft.getState().setHeader({ reservationEnabled: false, reservationId: null })
    await renderAndWaitForItems()
    await waitFor(() => {
      const comp = useWizardDraft.getState().registration.complimentary
      expect(comp.mandatoryIds).toEqual([])
      expect(comp.selected).toEqual([])
    })
  })
})
