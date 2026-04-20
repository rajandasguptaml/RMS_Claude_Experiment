import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ServiceForm } from './ServiceForm.jsx'
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

describe('ServiceForm Add', () => {
  it('clicking Add invokes onAdd with the selected service payload', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    renderWithProviders(
      <ServiceForm editing={null} onAdd={onAdd} onUpdate={vi.fn()} onCancel={vi.fn()} />
    )
    await screen.findByRole('option', { name: 'Airport Drop' })
    await user.selectOptions(inputByLabelText('Service Name'), 'sv-01')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(onAdd).toHaveBeenCalled())
    const payload = onAdd.mock.calls[0][0]
    expect(payload.serviceId).toBe('sv-01')
    expect(payload.serviceName).toBe('Airport Drop')
    expect(payload.unitRate).toBe(2500)
    expect(payload.id).toMatch(/^svc-/)
  })

  it('clicking Add without selecting a service shows an error', async () => {
    const user = userEvent.setup()
    renderWithProviders(
      <ServiceForm editing={null} onAdd={vi.fn()} onUpdate={vi.fn()} onCancel={vi.fn()} />
    )
    await user.click(screen.getByRole('button', { name: 'Add' }))
    expect(screen.getByText('Select a service')).toBeInTheDocument()
  })
})

describe('ServiceForm Update', () => {
  it('editing an existing service invokes onUpdate', async () => {
    const user = userEvent.setup()
    const onUpdate = vi.fn()
    const editing = {
      id: 'svc-1',
      serviceId: 'sv-01',
      serviceName: 'Airport Drop',
      fromDate: '2026-04-20',
      toDate: '2026-04-20',
      unitRate: 2500,
      quantity: 1,
      total: 2500,
    }
    renderWithProviders(
      <ServiceForm editing={editing} onAdd={vi.fn()} onUpdate={onUpdate} onCancel={vi.fn()} />
    )
    await screen.findByRole('option', { name: 'Airport Drop' })
    const qty = inputByLabelText('Qty')
    await user.clear(qty)
    await user.type(qty, '3')
    await user.click(screen.getByRole('button', { name: 'Update' }))
    await waitFor(() => expect(onUpdate).toHaveBeenCalled())
    const [id, payload] = onUpdate.mock.calls[0]
    expect(id).toBe('svc-1')
    expect(payload.quantity).toBe(3)
  })
})

describe('ServiceForm Cancel', () => {
  it('Cancel calls onCancel and clears the form', async () => {
    const user = userEvent.setup()
    const onCancel = vi.fn()
    renderWithProviders(
      <ServiceForm editing={null} onAdd={vi.fn()} onUpdate={vi.fn()} onCancel={onCancel} />
    )
    await screen.findByRole('option', { name: 'Airport Drop' })
    await user.selectOptions(inputByLabelText('Service Name'), 'sv-01')
    await user.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalled()
  })
})

describe('ServiceForm multi-service', () => {
  it('allows multiple Add invocations (multi-service per registration)', async () => {
    const user = userEvent.setup()
    const onAdd = vi.fn()
    renderWithProviders(
      <ServiceForm editing={null} onAdd={onAdd} onUpdate={vi.fn()} onCancel={vi.fn()} />
    )
    await screen.findByRole('option', { name: 'Airport Drop' })
    await user.selectOptions(inputByLabelText('Service Name'), 'sv-01')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(1))
    await user.selectOptions(inputByLabelText('Service Name'), 'sv-02')
    await user.click(screen.getByRole('button', { name: 'Add' }))
    await waitFor(() => expect(onAdd).toHaveBeenCalledTimes(2))
    expect(onAdd.mock.calls[0][0].serviceId).toBe('sv-01')
    expect(onAdd.mock.calls[1][0].serviceId).toBe('sv-02')
  })
})
