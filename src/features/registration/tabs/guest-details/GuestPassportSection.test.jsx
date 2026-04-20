import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { GuestPassportSection } from './GuestPassportSection.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'

describe('GuestPassportSection — BR-GD-004', () => {
  beforeEach(() => {
    useWizardDraft.getState().resetDraft()
  })

  it('shows error when Expiry is before Issue', async () => {
    renderWithProviders(<GuestPassportSection />)
    fireEvent.change(screen.getByTestId('guest-passport-issue'), {
      target: { value: '2025-01-01' },
    })
    fireEvent.change(screen.getByTestId('guest-passport-expiry'), {
      target: { value: '2020-01-01' },
    })
    await waitFor(() => {
      expect(
        screen.getByText(/Passport Expiry must be after Issue/i)
      ).toBeInTheDocument()
    })
  })

  it('passes silently when Expiry is after Issue', async () => {
    renderWithProviders(<GuestPassportSection />)
    fireEvent.change(screen.getByTestId('guest-passport-issue'), {
      target: { value: '2020-01-01' },
    })
    fireEvent.change(screen.getByTestId('guest-passport-expiry'), {
      target: { value: '2030-01-01' },
    })
    await waitFor(() => {
      expect(
        screen.queryByText(/Passport Expiry must be after Issue/i)
      ).not.toBeInTheDocument()
    })
  })
})
