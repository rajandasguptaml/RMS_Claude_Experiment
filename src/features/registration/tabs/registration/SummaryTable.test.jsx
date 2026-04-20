import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SummaryTable } from './SummaryTable.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'

const noop = () => {}

const sampleRoom = {
  id: 'room-1',
  roomTypeId: 'rt-deluxe',
  roomId: 'rm-101',
  roomNumber: '101',
  adults: 2,
  children: 1,
  rackRate: 9500,
  discountType: 'Fixed',
  discountValue: 0,
  scPct: 10,
  vatPct: 15,
  city: 150,
  additional: 100,
  waiveSc: false,
  waiveVat: false,
  waiveCity: false,
  waiveAdditional: false,
  sameAsGlobalDate: true,
  checkInDate: '2026-04-20',
  departureDate: '2026-04-22',
  stayType: 'Standard',
  lockToken: null,
  total: 12500,
}

beforeEach(() => {
  useWizardDraft.getState().resetDraft()
})

describe('SummaryTable empty state', () => {
  it('renders placeholder when no rows', () => {
    renderWithProviders(<SummaryTable onEditRoom={noop} />)
    expect(screen.getByText('No rooms or services added yet.')).toBeInTheDocument()
  })
})

describe('SummaryTable with a room row', () => {
  beforeEach(() => {
    act(() => {
      useWizardDraft.getState().addRoom(sampleRoom)
    })
  })

  it('renders 11 header columns with the expected names', async () => {
    renderWithProviders(<SummaryTable onEditRoom={noop} />)
    // wait for row type master to load (the row uses it to resolve type name)
    await screen.findByText('Deluxe')
    const headers = screen.getAllByRole('columnheader')
    expect(headers).toHaveLength(11)
    const titles = headers.map((h) => h.textContent)
    expect(titles).toEqual([
      'Room Type',
      'Room Number',
      'Adult',
      'Child',
      'Check-In Date',
      'Checkout Date',
      'Nights',
      'Room Rate',
      'Additional Service',
      'Status',
      'Action',
    ])
  })

  it('row surfaces room data', async () => {
    renderWithProviders(<SummaryTable onEditRoom={noop} />)
    await screen.findByText('Deluxe')
    expect(screen.getByText('101')).toBeInTheDocument()
    expect(screen.getByText('12500.00')).toBeInTheDocument()
  })

  it('Delete removes the row (with confirm)', async () => {
    const user = userEvent.setup()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    renderWithProviders(<SummaryTable onEditRoom={noop} />)
    await screen.findByText('Deluxe')
    const deleteBtn = screen.getByRole('button', { name: 'Delete' })
    await user.click(deleteBtn)
    expect(useWizardDraft.getState().registration.rooms.length).toBe(0)
  })
})
