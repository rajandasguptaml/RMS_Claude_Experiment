import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { GuestSearchModal } from './GuestSearchModal.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'

describe('GuestSearchModal', () => {
  beforeEach(() => {
    useWizardDraft.getState().resetDraft()
  })

  it('renders all 11 filter inputs', async () => {
    renderWithProviders(
      <GuestSearchModal open={true} onClose={() => {}} onSelect={() => {}} />
    )
    const filterKeys = [
      'guestName',
      'companyName',
      'email',
      'mobile',
      'nationalId',
      'dob',
      'passportNo',
      'roomNo',
      'regNo',
      'fromDate',
      'toDate',
    ]
    for (const k of filterKeys) {
      expect(screen.getByTestId(`guest-search-${k}`)).toBeInTheDocument()
    }
  })

  it('typing a filter, clicking Search, then Select on a non-blocked row calls onSelect + closes', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClose = vi.fn()
    renderWithProviders(
      <GuestSearchModal open={true} onClose={onClose} onSelect={onSelect} />
    )
    await user.type(screen.getByTestId('guest-search-guestName'), 'Arif')
    await user.click(screen.getByTestId('guest-search-submit'))
    // Wait for the g-01 row to appear (mock has ~100ms delay)
    await waitFor(
      () => {
        expect(screen.getByTestId('guest-search-select-g-01')).toBeInTheDocument()
      },
      { timeout: 2000 }
    )
    await user.click(screen.getByTestId('guest-search-select-g-01'))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0].id).toBe('g-01')
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('selecting g-07 (blocked) surfaces the banner and does NOT call onSelect until Confirm', async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    const onClose = vi.fn()
    renderWithProviders(
      <GuestSearchModal open={true} onClose={onClose} onSelect={onSelect} />
    )
    await user.type(screen.getByTestId('guest-search-guestName'), 'Carlos')
    await user.click(screen.getByTestId('guest-search-submit'))
    await waitFor(
      () => {
        expect(screen.getByTestId('guest-search-select-g-07')).toBeInTheDocument()
      },
      { timeout: 2000 }
    )
    await user.click(screen.getByTestId('guest-search-select-g-07'))
    // Banner should appear; onSelect should NOT have been called yet.
    await waitFor(() => {
      expect(screen.getByTestId('blocked-guest-banner')).toBeInTheDocument()
    })
    expect(onSelect).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()

    // Confirm continues and closes
    await user.click(screen.getByTestId('blocked-confirm'))
    expect(onSelect).toHaveBeenCalledTimes(1)
    expect(onSelect.mock.calls[0][0].id).toBe('g-07')
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
