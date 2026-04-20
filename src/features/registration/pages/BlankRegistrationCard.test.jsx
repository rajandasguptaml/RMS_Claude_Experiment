import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { BlankRegistrationCard } from './BlankRegistrationCard.jsx'
import { FIELDS, POLICY_CLAUSES } from '../constants/blankCard.js'

function renderCard() {
  return render(
    <MemoryRouter>
      <BlankRegistrationCard />
    </MemoryRouter>
  )
}

describe('BlankRegistrationCard', () => {
  let fetchSpy
  beforeEach(() => {
    fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() => {
      throw new Error('network call not allowed in this test')
    })
  })
  afterEach(() => {
    fetchSpy.mockRestore()
  })

  it('makes zero network calls', () => {
    renderCard()
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('renders the card title', () => {
    renderCard()
    expect(screen.getByText('Pre Registration Card')).toBeInTheDocument()
  })

  it('renders all 27 data-entry fields', () => {
    renderCard()
    const fieldBoxes = document.querySelectorAll('[aria-label]')
    // 27 fields + 1 Room No field in the title row
    expect(fieldBoxes.length).toBeGreaterThanOrEqual(FIELDS.length)
  })

  it('shows 13 total required-markers (11 fields + 2 signature labels) per FR-013', () => {
    renderCard()
    const fieldRequired = FIELDS.filter((f) => f.required).length
    expect(fieldRequired).toBe(11)
    // Field-level asterisks (11) + 2 signature lines = 13 per BRD.
    const asterisks = document.querySelectorAll('.text-red-600')
    expect(asterisks.length).toBe(fieldRequired + 2)
  })

  it('renders all 14 policy clauses', () => {
    renderCard()
    const listItems = document.querySelectorAll('ol li')
    expect(listItems.length).toBe(POLICY_CLAUSES.length)
    expect(POLICY_CLAUSES.length).toBe(14)
  })

  it('renders clause 14 bold (BR-BRC-003)', () => {
    renderCard()
    const listItems = document.querySelectorAll('ol li')
    const last = listItems[listItems.length - 1]
    expect(last.className).toMatch(/font-bold/)
  })

  it('renders the consent statement above the signature block', () => {
    renderCard()
    const consent = screen.getByRole('heading', { level: 2 })
    expect(consent.textContent).toMatch(/By signing this form/i)
  })

  it('renders dual signature labels (Checked in By + Guest Signature)', () => {
    renderCard()
    expect(screen.getByText(/Checked in By/i)).toBeInTheDocument()
    expect(screen.getByText(/Guest Signature/i)).toBeInTheDocument()
  })

  it('renders the bold checkout reminder at the bottom', () => {
    renderCard()
    expect(
      screen.getByText(/We respectfully remind you that check-out time at/i)
    ).toBeInTheDocument()
  })

  it('renders the time-entry line with Check-In and Check-Out at ... HRS.', () => {
    renderCard()
    expect(screen.getByText(/Check-In at/)).toBeInTheDocument()
    expect(screen.getByText(/Check-Out at/)).toBeInTheDocument()
  })

  it('embeds the print stylesheet with A4 portrait rules', () => {
    renderCard()
    const styles = Array.from(document.querySelectorAll('style'))
      .map((s) => s.textContent)
      .join('\n')
    expect(styles).toMatch(/@media print/)
    expect(styles).toMatch(/size: A4 portrait/)
    expect(styles).toMatch(/page-break-inside: avoid/)
  })

  it('renders identically across two invocations (BR-BRC-002)', () => {
    const { container: a, unmount } = renderCard()
    const htmlA = a.innerHTML
    unmount()
    const { container: b } = renderCard()
    expect(b.innerHTML).toBe(htmlA)
  })

  it('renders hotel branding header (name visible)', () => {
    renderCard()
    // Name may show in logo fallback or H3.
    const headings = screen.getAllByText(/Kazi Resort/i)
    expect(headings.length).toBeGreaterThan(0)
  })
})
