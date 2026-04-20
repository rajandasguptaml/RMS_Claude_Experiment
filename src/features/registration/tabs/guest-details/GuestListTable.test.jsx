import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { GuestListTable } from './GuestListTable.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'

function seedGuest(patch) {
  useWizardDraft.getState().setGuestDraft({
    title: 'MR',
    firstName: 'Seed',
    country: 'Bangladesh',
    ...patch,
  })
  return useWizardDraft.getState().addGuest()
}

describe('GuestListTable', () => {
  beforeEach(() => {
    useWizardDraft.getState().resetDraft()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders a table with 5 headers when the list has rows', () => {
    seedGuest({ firstName: 'Arif' })
    renderWithProviders(<GuestListTable />)
    expect(screen.getByText('Guest Name')).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Room No.')).toBeInTheDocument()
    expect(screen.getByText('Is Contact Person')).toBeInTheDocument()
    expect(screen.getByText('Action')).toBeInTheDocument()
  })

  it('shows empty-state when the list is empty', () => {
    renderWithProviders(<GuestListTable />)
    expect(screen.getByText(/No guests added yet/i)).toBeInTheDocument()
  })

  it('seeding 2 guests via the store renders 2 rows', async () => {
    const a = seedGuest({ firstName: 'Arif' })
    const b = seedGuest({ firstName: 'Bob' })
    renderWithProviders(<GuestListTable />)
    await waitFor(() => {
      expect(screen.getByTestId(`guest-edit-${a.id}`)).toBeInTheDocument()
      expect(screen.getByTestId(`guest-edit-${b.id}`)).toBeInTheDocument()
    })
  })

  it('Delete with window.confirm(true) removes the row', async () => {
    const user = userEvent.setup()
    const a = seedGuest({ firstName: 'Arif' })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderWithProviders(<GuestListTable />)
    await user.click(screen.getByTestId(`guest-delete-${a.id}`))
    await waitFor(() => {
      expect(useWizardDraft.getState().registration.guests.list).toHaveLength(0)
    })
  })
})
