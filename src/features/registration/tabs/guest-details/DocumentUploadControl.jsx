import { useRef } from 'react'
import { LinearProgress } from '@mui/material'
import { useGuestDocumentUpload } from '../../api/guests.js'
import { useWizardDraft } from '../../store/wizardDraft.js'

const ACCEPT = '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf'
const MAX_BYTES = 5 * 1024 * 1024

function humanSize(bytes) {
  if (!bytes) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * FR-008 / NFR-S-005 / NFR-P-004 — async document upload control.
 * - Client-side guard: JPG/PNG/PDF, <= 5 MB.
 * - Progress via `useGuestDocumentUpload` (0..100).
 * - Cancel invokes the abort signal.
 * - On success, stores `{ documentId, filename, mimeType, sizeBytes }` on the
 *   guest draft. No file blob or base64 is persisted.
 */
export function DocumentUploadControl() {
  const inputRef = useRef(null)
  const uploader = useGuestDocumentUpload()
  const document = useWizardDraft((s) => s.registration.guests.draft.guestDocument)
  const setGuestDraft = useWizardDraft((s) => s.setGuestDraft)

  const onPick = async (e) => {
    const file = e.target.files && e.target.files[0]
    if (!file) return
    if (file.size > MAX_BYTES) {
      uploader.reset()
      // Reuse error object shape for consistency with mock rejections.
      alert('File exceeds the 5 MB limit.')
      e.target.value = ''
      return
    }
    const result = await uploader.mutate(file)
    if (result) {
      setGuestDraft({ guestDocument: result })
    }
    e.target.value = ''
  }

  const onRemove = () => {
    setGuestDraft({ guestDocument: null })
    uploader.reset()
  }

  return (
    <div
      className="space-y-2 rounded border border-slate-200 p-3"
      aria-label="Guest Document Upload"
    >
      <span className="block text-sm text-slate-600">Guest Document</span>
      {document ? (
        <div className="flex items-center gap-3 text-sm">
          <span
            className="rounded border border-slate-300 bg-slate-50 px-2 py-1 font-mono"
            data-testid="doc-chip"
          >
            {document.filename} — {document.mimeType} — {humanSize(document.sizeBytes)}
          </span>
          <button
            type="button"
            className="rounded border border-slate-400 px-2 py-1 text-xs hover:bg-slate-100"
            onClick={onRemove}
            data-testid="doc-remove"
          >
            Remove
          </button>
        </div>
      ) : (
        <>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            onChange={onPick}
            disabled={uploader.isUploading}
            data-testid="doc-input"
            className="block text-sm"
          />
          {uploader.isUploading ? (
            <div className="space-y-1">
              <LinearProgress
                variant="determinate"
                value={uploader.progress}
                data-testid="doc-progress"
              />
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Uploading… {uploader.progress}%</span>
                <button
                  type="button"
                  className="rounded border border-slate-400 px-2 py-0.5 hover:bg-slate-100"
                  onClick={uploader.abort}
                  data-testid="doc-cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : null}
          {uploader.error ? (
            <span className="block text-xs text-red-600" data-testid="doc-error">
              {uploader.error.message || 'Upload failed.'}
            </span>
          ) : null}
          <span className="block text-xs text-slate-500">
            JPG, PNG, or PDF up to 5 MB.
          </span>
        </>
      )}
    </div>
  )
}
