import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { GuestContactSection } from './GuestContactSection.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'

describe('GuestContactSection', () => {
  beforeEach(() => {
    useWizardDraft.getState().resetDraft()
  })

  it('shows inline error when email is invalid', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GuestContactSection />)
    await user.type(screen.getByTestId('guest-email'), 'foo')
    await waitFor(() => {
      expect(screen.getByText(/Invalid email/i)).toBeInTheDocument()
    })
  })

  it('shows inline error when zip is non-numeric', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GuestContactSection />)
    await user.type(screen.getByTestId('guest-zip'), 'abc')
    await waitFor(() => {
      expect(screen.getByText(/Zip must be numeric/i)).toBeInTheDocument()
    })
  })

  it('renders the Country Autocomplete input testid', async () => {
    renderWithProviders(<GuestContactSection />)
    // Per test-plan: assert the input is present — do not drive the popper.
    await waitFor(() => {
      expect(screen.getByTestId('guest-country')).toBeInTheDocument()
    })
  })
})
