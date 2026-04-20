import { describe, it, expect, beforeEach } from 'vitest'
import { screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ClassificationSection } from './ClassificationSection.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { CHANNEL_OPTIONS } from '../../schemas/classificationSchema.js'

beforeEach(() => {
  useWizardDraft.getState().resetDraft()
})

describe('ClassificationSection required markers', () => {
  it('walk-in: Meal Plan and Reference have no asterisk', () => {
    renderWithProviders(<ClassificationSection />)
    const mealPlanLabel = screen.getByText(/^Meal Plan/).closest('label')
    const referenceLabel = screen.getByText(/^Reference/).closest('label')
    expect(mealPlanLabel.textContent).not.toContain('*')
    expect(referenceLabel.textContent).not.toContain('*')
  })

  it('reservation-linked: Meal Plan and Reference show asterisk', () => {
    act(() => {
      useWizardDraft.getState().setHeader({ reservationEnabled: true })
    })
    renderWithProviders(<ClassificationSection />)
    const mealPlanLabel = screen.getByText(/^Meal Plan/).closest('label')
    const referenceLabel = screen.getByText(/^Reference/).closest('label')
    expect(mealPlanLabel.textContent).toContain('*')
    expect(referenceLabel.textContent).toContain('*')
    expect(screen.getAllByText('Required for reservation-linked').length).toBe(2)
  })
})

describe('ClassificationSection channel discovery group', () => {
  it('renders 4 channel checkboxes and toggles them', async () => {
    const user = userEvent.setup()
    renderWithProviders(<ClassificationSection />)
    CHANNEL_OPTIONS.forEach((opt) => {
      expect(screen.getByLabelText(opt)).toBeInTheDocument()
    })
    await user.click(screen.getByLabelText('Facebook'))
    await user.click(screen.getByLabelText('Google'))
    const state = useWizardDraft.getState().registration.classification.channelDiscovery
    expect(state).toEqual(['Facebook', 'Google'])
    await user.click(screen.getByLabelText('Facebook'))
    const state2 = useWizardDraft.getState().registration.classification.channelDiscovery
    expect(state2).toEqual(['Google'])
  })
})
