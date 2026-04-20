import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { GuestBasicSection } from './GuestBasicSection.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'

describe('GuestBasicSection', () => {
  beforeEach(() => {
    useWizardDraft.getState().resetDraft()
  })

  it('Full Guest Name updates reactively as Title + First + Last are typed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<GuestBasicSection />)
    await user.selectOptions(screen.getByTestId('guest-title'), 'MR')
    await user.type(screen.getByTestId('guest-first-name'), 'Arif')
    await user.type(screen.getByTestId('guest-last-name'), 'Ahmed')
    await waitFor(() => {
      expect(screen.getByTestId('guest-full-name').value).toBe('MR Arif Ahmed')
    })
  })

  it('Full Guest Name input is read-only', () => {
    renderWithProviders(<GuestBasicSection />)
    const fullName = screen.getByTestId('guest-full-name')
    expect(fullName).toHaveAttribute('readonly')
  })
})
