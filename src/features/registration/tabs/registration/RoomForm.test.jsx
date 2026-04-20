import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoomForm } from './RoomForm.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'

beforeEach(() => {
  useWizardDraft.getState().resetDraft()
})

/** Locate the input sibling of a wrapping <label>. */
function inputByLabelText(label) {
  const labelEl = screen.getByText(label)
  const wrapper = labelEl.parentElement
  const control = wrapper.querySelector('input, select, textarea')
  if (!control) throw new Error(`No input found under label ${label}`)
  return control
}

const noop = () => {}

describe('RoomForm room type auto-fill', () => {
  it('selecting a room type auto-populates Rack Rate / SC / VAT / City / Additional', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <RoomForm editing={null} onAdd={noop} onUpdate={noop} onCancel={noop} />
    )
    // Wait for room types loaded via React Query + mocks
    await screen.findByRole('option', { name: 'Deluxe' })
    const typeSelect = inputByLabelText('Room Type')
    await user.selectOptions(typeSelect, 'rt-deluxe')
    await waitFor(() => {
      expect(inputByLabelText('Rack Rate')).toHaveValue(9500)
    })
    expect(inputByLabelText('Service Charge %')).toHaveValue(10)
    expect(inputByLabelText('VAT %')).toHaveValue(15)
    expect(inputByLabelText('City Charge')).toHaveValue(150)
    expect(inputByLabelText('Additional Charges')).toHaveValue(100)
  })
})

describe('RoomForm discount cap (BR-REG-005)', () => {
  it('BR-REG-005 error surfaces when Fixed discount > Rack Rate', async () => {
    const user = userEvent.setup()
    const editing = {
      id: 'room-1',
      roomTypeId: 'rt-deluxe',
      roomId: 'rm-101',
      roomNumber: '101',
      adults: 1,
      children: 0,
      rackRate: 9500,
      negotiatedRate: null,
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
      checkInDate: '',
      departureDate: '',
      stayType: 'Standard',
      lockToken: null,
    }
    renderWithProviders(
      <RoomForm editing={editing} onAdd={noop} onUpdate={noop} onCancel={noop} />
    )
    await screen.findByRole('option', { name: 'Deluxe' })
    const discount = inputByLabelText('Discount Value')
    await user.clear(discount)
    await user.type(discount, '99999')
    const updateBtn = screen.getByRole('button', { name: 'Update' })
    await user.click(updateBtn)
    expect(screen.getByText('Fixed discount cannot exceed Rack Rate')).toBeInTheDocument()
  })
})

describe('RoomForm waive VAT', () => {
  it('checking waive VAT recomputes total without VAT', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <RoomForm editing={null} onAdd={noop} onUpdate={noop} onCancel={noop} />
    )
    await screen.findByRole('option', { name: 'Deluxe' })
    await user.selectOptions(inputByLabelText('Room Type'), 'rt-deluxe')
    await waitFor(() => {
      expect(inputByLabelText('Rack Rate')).toHaveValue(9500)
    })
    // 9500 + 950 SC + 1567.5 VAT + 150 city + 100 add = 12267.5
    expect(screen.getByText('12267.50')).toBeInTheDocument()
    await user.click(screen.getByLabelText('Waive VAT'))
    // 9500 + 950 SC + 150 + 100 = 10700
    expect(screen.getByText('10700.00')).toBeInTheDocument()
  })
})
