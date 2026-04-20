import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import { renderWithProviders } from '../../../../test/renderWithProviders.jsx'
import { DocumentUploadControl } from './DocumentUploadControl.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'

function makeFile({ name = 'a.jpg', type = 'image/jpeg', size = 1024 } = {}) {
  const content = new Uint8Array(size)
  return new File([content], name, { type })
}

describe('DocumentUploadControl', () => {
  beforeEach(() => {
    useWizardDraft.getState().resetDraft()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('oversize file surfaces scrubbed error (file_too_large via alert)', async () => {
    // Oversize is caught client-side before mutate; the control calls window.alert.
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    renderWithProviders(<DocumentUploadControl />)
    const input = screen.getByTestId('doc-input')
    const big = makeFile({ size: 6 * 1024 * 1024 })
    fireEvent.change(input, { target: { files: [big] } })
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalled()
      expect(alertSpy.mock.calls[0][0]).toMatch(/5 MB/i)
    })
  })

  it('wrong mime surfaces scrubbed error (mime_invalid) from the mock', async () => {
    renderWithProviders(<DocumentUploadControl />)
    const input = screen.getByTestId('doc-input')
    const bad = makeFile({ name: 'a.txt', type: 'text/plain', size: 512 })
    fireEvent.change(input, { target: { files: [bad] } })
    await waitFor(
      () => {
        expect(screen.getByTestId('doc-error')).toBeInTheDocument()
      },
      { timeout: 2000 }
    )
    expect(screen.getByTestId('doc-error').textContent).toMatch(
      /JPG, PNG, or PDF/i
    )
  })

  it('valid JPG shows a progress bar then a file chip on success', async () => {
    renderWithProviders(<DocumentUploadControl />)
    const input = screen.getByTestId('doc-input')
    const good = makeFile({ name: 'passport.jpg', type: 'image/jpeg', size: 2048 })
    fireEvent.change(input, { target: { files: [good] } })
    // progress appears while uploading
    await waitFor(() => {
      expect(screen.getByTestId('doc-progress')).toBeInTheDocument()
    })
    // chip appears on success
    await waitFor(
      () => {
        expect(screen.getByTestId('doc-chip')).toBeInTheDocument()
      },
      { timeout: 3000 }
    )
    expect(screen.getByTestId('doc-chip').textContent).toMatch(/passport\.jpg/)
  })
})
