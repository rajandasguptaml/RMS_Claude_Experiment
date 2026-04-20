import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { HeaderSection } from './HeaderSection.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { todayISO, tomorrowISO } from '../../../../shared/lib/date.js'

beforeEach(() => {
  useWizardDraft.getState().resetDraft()
})

/** Locate the input sibling of a <label> that just wraps text. */
function inputByLabelText(label) {
  const labelEl = screen.getByText(label)
  const wrapper = labelEl.parentElement
  const control = wrapper.querySelector('input, select, textarea')
  if (!control) throw new Error(`No input found under label ${label}`)
  return control
}

describe('HeaderSection defaults', () => {
  it('renders today / 14:00 / tomorrow / 12:00 and computes total nights', () => {
    renderWithProviders(<HeaderSection />)
    expect(inputByLabelText('Check-In Date')).toHaveValue(todayISO())
    expect(inputByLabelText('Check-In Time')).toHaveValue('14:00')
    expect(inputByLabelText('Departure Date')).toHaveValue(tomorrowISO())
    expect(inputByLabelText('Checkout Time')).toHaveValue('12:00')
    expect(inputByLabelText('Total Nights')).toHaveValue(1)
  })
})

describe('HeaderSection reservation toggle', () => {
  it('reservation dropdown disabled by default, enabled when checked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HeaderSection />)
    const toggle = screen.getByLabelText('Reservation')
    const selects = screen.getAllByRole('combobox')
    const reservationSelect = selects[0]
    expect(reservationSelect).toBeDisabled()
    await user.click(toggle)
    expect(reservationSelect).not.toBeDisabled()
  })
})

describe('HeaderSection listed company', () => {
  it('reveals Contact Person, Mobile, Payment Mode, Pay For when checked', async () => {
    const user = userEvent.setup()
    renderWithProviders(<HeaderSection />)
    expect(screen.queryByText('Contact Person')).toBeNull()
    expect(screen.queryByText('Mobile')).toBeNull()
    expect(screen.queryByText('Payment Mode')).toBeNull()
    expect(screen.queryByText('Pay For')).toBeNull()
    await user.click(screen.getByLabelText('Listed Company'))
    expect(screen.getByText('Contact Person')).toBeInTheDocument()
    expect(screen.getByText('Mobile')).toBeInTheDocument()
    expect(screen.getByText('Payment Mode')).toBeInTheDocument()
    expect(screen.getByText('Pay For')).toBeInTheDocument()
  })
})

describe('HeaderSection nights auto-calc', () => {
  it('store updates nights when departure changes', async () => {
    renderWithProviders(<HeaderSection />)
    act(() => {
      useWizardDraft.getState().setHeader({ departureDate: '2099-12-31' })
    })
    await waitFor(() => {
      expect(Number(inputByLabelText('Total Nights').value)).toBeGreaterThan(1)
    })
  })
})
