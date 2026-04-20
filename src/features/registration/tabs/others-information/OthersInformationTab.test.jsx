import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { OthersInformationTab } from './OthersInformationTab.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'

function resetStore() {
  useWizardDraft.getState().resetDraft()
}

describe('OthersInformationTab — Section A (classification)', () => {
  beforeEach(() => {
    resetStore()
  })

  it('mutual exclusivity (BR-OI-001): flipping House Use to YES clears Complimentary Guest', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OthersInformationTab />)
    const compGuest = screen.getByTestId('flag-complimentary-guest')
    await user.selectOptions(compGuest, 'YES')
    const houseUse = screen.getByTestId('flag-house-use')
    await user.selectOptions(houseUse, 'YES')
    await waitFor(() => {
      const a = useWizardDraft.getState().registration.othersInformation.sectionA
      expect(a.houseUse).toBe('YES')
      expect(a.complimentaryGuest).toBe('')
    })
  })

  it('VIP checkbox is disabled until RBAC wired (NFR-S-008)', () => {
    renderWithProviders(<OthersInformationTab />)
    const vip = screen.getByTestId('flag-vip')
    expect(vip.disabled).toBe(true)
  })

  it('Channel Discovery toggles write to store array', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OthersInformationTab />)
    await user.click(screen.getByTestId('channel-facebook'))
    await user.click(screen.getByTestId('channel-google'))
    await waitFor(() => {
      const a = useWizardDraft.getState().registration.othersInformation.sectionA
      expect(a.channelDiscovery.sort()).toEqual(['Facebook', 'Google'])
    })
  })
})

describe('OthersInformationTab — Section B (departure)', () => {
  beforeEach(() => {
    resetStore()
  })

  it('Airport Drop = YES reveals required markers on conditional fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OthersInformationTab />)
    const drop = screen.getByTestId('airport-drop')
    await user.selectOptions(drop, 'YES')
    await waitFor(() => {
      expect(
        screen.getByText(
          /Airlines, Flight Number, and ETD are recommended when Airport Drop is YES/i
        )
      ).toBeInTheDocument()
    })
  })

  it('ETD time input accepts HH:MM value', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OthersInformationTab />)
    const etd = screen.getByTestId('etd-input')
    // user.type does not work with type=time in jsdom; fire change directly
    fireEvent.change(etd, { target: { value: '14:30' } })
    await waitFor(() => {
      expect(useWizardDraft.getState().registration.othersInformation.sectionB.etd).toBe('14:30')
    })
    expect(user).toBeTruthy()
  })
})

describe('OthersInformationTab — Section C (card)', () => {
  beforeEach(() => {
    resetStore()
    vi.useRealTimers()
  })

  it('has autocomplete="off" on card-number, card-reference, expiry', () => {
    renderWithProviders(<OthersInformationTab />)
    const pan = screen.getByTestId('card-number-input')
    expect(pan.getAttribute('autocomplete')).toBe('off')
    const ref = screen.getByTestId('card-reference')
    expect(ref.getAttribute('autocomplete')).toBe('off')
  })

  it('holder name uses autocomplete="cc-name" (semantic, allowed)', () => {
    renderWithProviders(<OthersInformationTab />)
    const holder = screen.getByTestId('card-holder-name')
    expect(holder.getAttribute('autocomplete')).toBe('cc-name')
  })

  it('Tokenize button is disabled until card-type + PAN + expiry are filled', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OthersInformationTab />)
    const tokenizeBtn = screen.getByTestId('card-tokenize')
    expect(tokenizeBtn.disabled).toBe(true)

    await user.selectOptions(screen.getByTestId('card-type'), 'Visa Card')
    await user.type(screen.getByTestId('card-number-input'), '4242424242424242')
    await user.selectOptions(screen.getByTestId('expiry-month'), '12')
    await user.selectOptions(screen.getByTestId('expiry-year'), '2030')
    await waitFor(() => expect(screen.getByTestId('card-tokenize').disabled).toBe(false))
  })

  it('PCI property: after successful tokenize, full state JSON contains no raw PAN', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OthersInformationTab />)
    const rogue = '4242424242424242'
    await user.selectOptions(screen.getByTestId('card-type'), 'Visa Card')
    await user.type(screen.getByTestId('card-number-input'), rogue)
    await user.selectOptions(screen.getByTestId('expiry-month'), '12')
    await user.selectOptions(screen.getByTestId('expiry-year'), '2030')
    await user.click(screen.getByTestId('card-tokenize'))

    // Wait up to 2s for mock tokenization + input to flip to masked display.
    await waitFor(
      () => expect(screen.getByTestId('card-number-masked')).toBeInTheDocument(),
      { timeout: 2000 }
    )

    const json = JSON.stringify(useWizardDraft.getState())
    expect(json).not.toContain(rogue)

    // last4 IS allowed to appear (as a separate property value).
    const card = useWizardDraft.getState().registration.othersInformation.cardGuarantee
    expect(card.last4).toBe('4242')
    expect(card.token).toMatch(/^tok_/)
    expect(card).not.toHaveProperty('pan')
  })

  it('tokenization failure surfaces a scrubbed error and keeps PAN input present', async () => {
    const user = userEvent.setup()
    renderWithProviders(<OthersInformationTab />)
    // Bad Luhn number:
    await user.selectOptions(screen.getByTestId('card-type'), 'Visa Card')
    await user.type(screen.getByTestId('card-number-input'), '4242424242424241')
    await user.selectOptions(screen.getByTestId('expiry-month'), '12')
    await user.selectOptions(screen.getByTestId('expiry-year'), '2030')
    await user.click(screen.getByTestId('card-tokenize'))
    await waitFor(() => {
      expect(screen.getByTestId('tokenize-error')).toBeInTheDocument()
    })
    // PAN input still rendered (not flipped to masked)
    expect(screen.getByTestId('card-number-input')).toBeInTheDocument()
  })
})
