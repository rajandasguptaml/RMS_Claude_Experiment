import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { BlockedGuestBanner } from './BlockedGuestBanner.jsx'

const blockedGuest = {
  id: 'g-07',
  fullName: 'MR Carlos Mendes',
  blocked: true,
}

describe('BlockedGuestBanner', () => {
  it('renders warning + Confirm + Cancel buttons when a blocked guest is supplied', () => {
    renderWithProviders(
      <BlockedGuestBanner guest={blockedGuest} onConfirm={() => {}} onCancel={() => {}} />
    )
    expect(screen.getByTestId('blocked-guest-banner')).toBeInTheDocument()
    expect(screen.getByTestId('blocked-confirm')).toBeInTheDocument()
    expect(screen.getByTestId('blocked-cancel')).toBeInTheDocument()
    expect(screen.getByText(/MR Carlos Mendes/i)).toBeInTheDocument()
  })

  it('renders nothing when guest is null', () => {
    renderWithProviders(
      <BlockedGuestBanner guest={null} onConfirm={() => {}} onCancel={() => {}} />
    )
    expect(screen.queryByTestId('blocked-guest-banner')).not.toBeInTheDocument()
  })

  it('Confirm calls onConfirm', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    renderWithProviders(
      <BlockedGuestBanner guest={blockedGuest} onConfirm={onConfirm} onCancel={onCancel} />
    )
    await user.click(screen.getByTestId('blocked-confirm'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onCancel).not.toHaveBeenCalled()
  })

  it('Cancel calls onCancel', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    renderWithProviders(
      <BlockedGuestBanner guest={blockedGuest} onConfirm={onConfirm} onCancel={onCancel} />
    )
    await user.click(screen.getByTestId('blocked-cancel'))
    expect(onCancel).toHaveBeenCalledTimes(1)
    expect(onConfirm).not.toHaveBeenCalled()
  })
})
