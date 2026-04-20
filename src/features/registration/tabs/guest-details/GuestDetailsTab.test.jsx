import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { GuestDetailsTab } from './GuestDetailsTab.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'

describe('GuestDetailsTab', () => {
  beforeEach(() => {
    useWizardDraft.getState().resetDraft()
  })

  it('smoke: mounts without error and shows Add button', () => {
    renderWithProviders(<GuestDetailsTab />)
    expect(screen.getByTestId('guest-add')).toBeInTheDocument()
  })

  it('BR-GD-002: clicking Add with empty draft surfaces a validation error and does not add to list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GuestDetailsTab />)
    await user.click(screen.getByTestId('guest-add'))
    await waitFor(() => {
      expect(screen.getByTestId('guest-form-error')).toBeInTheDocument()
    })
    expect(useWizardDraft.getState().registration.guests.list).toHaveLength(0)
  })

  it('clicking Add with Title + First + Country appends to the guest list', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GuestDetailsTab />)
    await user.selectOptions(screen.getByTestId('guest-title'), 'MR')
    await user.type(screen.getByTestId('guest-first-name'), 'Arif')
    // Set country directly via the store since Autocomplete popper is flaky in jsdom.
    useWizardDraft.getState().setGuestDraft({ country: 'Bangladesh' })
    await user.click(screen.getByTestId('guest-add'))
    await waitFor(() => {
      expect(useWizardDraft.getState().registration.guests.list).toHaveLength(1)
    })
    const entry = useWizardDraft.getState().registration.guests.list[0]
    expect(entry.firstName).toBe('Arif')
    expect(entry.country).toBe('Bangladesh')
  })

  it('Family/Group/Couple checkbox toggles familyGroupCouple in the store', async () => {
    renderWithProviders(<GuestDetailsTab />)
    const cb = screen.getByTestId('family-group-couple')
    fireEvent.click(cb)
    await waitFor(() => {
      expect(useWizardDraft.getState().registration.guests.familyGroupCouple).toBe(true)
    })
  })
})
