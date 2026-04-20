import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RoomListModal } from './RoomListModal.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'

beforeEach(() => {
  useWizardDraft.getState().resetDraft()
})

describe('RoomListModal', () => {
  it('lists available rooms filtered by the selected type', async () => {
    renderWithProviders(
      <RoomListModal
        open
        onClose={() => {}}
        typeId="rt-deluxe"
        from="2026-04-20"
        to="2026-04-21"
        onConfirm={() => {}}
      />
    )
    // rt-deluxe has rm-101, rm-102, rm-104(conflict) available/listable; rm-103 is occupied.
    await screen.findByText('101')
    expect(screen.getByText('101')).toBeInTheDocument()
    expect(screen.getByText('102')).toBeInTheDocument()
    expect(screen.getByText('104')).toBeInTheDocument()
    expect(screen.queryByText('103')).toBeNull()
  })

  it('selecting a non-conflict room acquires a lock and closes the modal', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    const onConfirm = vi.fn()
    renderWithProviders(
      <RoomListModal
        open
        onClose={onClose}
        typeId="rt-deluxe"
        from="2026-04-20"
        to="2026-04-21"
        onConfirm={onConfirm}
      />
    )
    await screen.findByText('101')
    const radios = screen.getAllByRole('radio')
    // radios are in the same order as the rooms: [101, 102, 104]
    await user.click(radios[0])
    await user.click(screen.getByRole('button', { name: 'Select' }))
    await waitFor(() => expect(onConfirm).toHaveBeenCalled())
    const payload = onConfirm.mock.calls[0][0]
    expect(payload.roomId).toBe('rm-101')
    expect(payload.roomNumber).toBe('101')
    expect(payload.lockToken).toMatch(/^lock-rm-101-/)
    expect(onClose).toHaveBeenCalled()
  })

  it('clicking rm-104 (conflict) surfaces the conflict error', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithProviders(
      <RoomListModal
        open
        onClose={onClose}
        typeId="rt-deluxe"
        from="2026-04-20"
        to="2026-04-21"
        onConfirm={() => {}}
      />
    )
    await screen.findByText('104')
    const conflictRadio = screen.getAllByRole('radio')[2]
    await user.click(conflictRadio)
    await user.click(screen.getByRole('button', { name: 'Select' }))
    await waitFor(() =>
      expect(
        screen.getByText('This room was just taken by another agent. Please pick another.')
      ).toBeInTheDocument()
    )
    expect(onClose).not.toHaveBeenCalled()
  })
})
