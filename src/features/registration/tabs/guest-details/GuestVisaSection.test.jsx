import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { GuestVisaSection } from './GuestVisaSection.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'

describe('GuestVisaSection — BR-GD-004', () => {
  beforeEach(() => {
    useWizardDraft.getState().resetDraft()
  })

  it('shows error when Expiry equals Issue', async () => {
    renderWithProviders(<GuestVisaSection />)
    // date inputs behave better via fireEvent.change in jsdom
    fireEvent.change(screen.getByTestId('guest-visa-issue'), {
      target: { value: '2024-06-01' },
    })
    fireEvent.change(screen.getByTestId('guest-visa-expiry'), {
      target: { value: '2024-06-01' },
    })
    await waitFor(() => {
      expect(screen.getByText(/Visa Expiry must be after Issue/i)).toBeInTheDocument()
    })
  })

  it('passes silently when Expiry is after Issue', async () => {
    renderWithProviders(<GuestVisaSection />)
    fireEvent.change(screen.getByTestId('guest-visa-issue'), {
      target: { value: '2024-06-01' },
    })
    fireEvent.change(screen.getByTestId('guest-visa-expiry'), {
      target: { value: '2025-06-01' },
    })
    await waitFor(() => {
      expect(screen.queryByText(/Visa Expiry must be after Issue/i)).not.toBeInTheDocument()
    })
  })
})
