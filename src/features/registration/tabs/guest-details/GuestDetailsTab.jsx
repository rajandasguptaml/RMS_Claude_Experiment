import { useMemo, useState } from 'react'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { formatFullGuestName } from '../../schemas/guestSchema.js'
import { GuestBasicSection } from './GuestBasicSection.jsx'
import { GuestContactSection } from './GuestContactSection.jsx'
import { GuestVisaSection } from './GuestVisaSection.jsx'
import { GuestPassportSection } from './GuestPassportSection.jsx'
import { GuestAdditionalSection } from './GuestAdditionalSection.jsx'
import { GuestListTable } from './GuestListTable.jsx'
import { GuestSearchModal } from './GuestSearchModal.jsx'
import { GuestInfoModal } from './GuestInfoModal.jsx'

/**
 * FR-008 Guest Details tab — orchestrator. Reads declared Adult/Child counts
 * from the Registration tab header rooms[] to display a non-blocking header
 * summary (shell bolt owns the hard Check-in validation per BR-REG-001).
 */
export function GuestDetailsTab() {
  const rooms = useWizardDraft((s) => s.registration.rooms)
  const guests = useWizardDraft((s) => s.registration.guests)
  const setFamilyGroupCouple = useWizardDraft((s) => s.setFamilyGroupCouple)
  const addGuest = useWizardDraft((s) => s.addGuest)
  const updateGuest = useWizardDraft((s) => s.updateGuest)
  const removeGuest = useWizardDraft((s) => s.removeGuest)
  const clearGuestDraft = useWizardDraft((s) => s.clearGuestDraft)
  const setGuestDraft = useWizardDraft((s) => s.setGuestDraft)

  const [searchOpen, setSearchOpen] = useState(false)
  const [infoGuest, setInfoGuest] = useState(null)
  const [formError, setFormError] = useState('')

  const totalAdults = useMemo(
    () => rooms.reduce((sum, r) => sum + (Number(r.adults) || 0), 0),
    [rooms]
  )
  const totalChildren = useMemo(
    () => rooms.reduce((sum, r) => sum + (Number(r.children) || 0), 0),
    [rooms]
  )

  const inEditMode = guests.mode === 'editing' && Boolean(guests.editingId)

  const firstIssueMessage = (zerr) => {
    if (!zerr || !zerr.issues || zerr.issues.length === 0) return 'Invalid form'
    const first = zerr.issues[0]
    return first.message || 'Invalid form'
  }

  const onAdd = () => {
    setFormError('')
    const result = addGuest()
    if (!result.ok) setFormError(firstIssueMessage(result.error))
  }

  const onUpdate = () => {
    setFormError('')
    const result = updateGuest()
    if (!result.ok) setFormError(firstIssueMessage(result.error))
  }

  const onClear = () => {
    setFormError('')
    clearGuestDraft()
  }

  const onDelete = () => {
    if (!inEditMode) return
    if (!window.confirm('Delete this guest?')) return
    removeGuest(guests.editingId)
  }

  const onSelectFromSearch = (g) => {
    // Copy fields into the draft; recompute fullName in case the fixture is stale.
    const next = { ...g }
    next.fullName = formatFullGuestName(g)
    // Drop the source id so this becomes a fresh draft entry.
    delete next.id
    delete next.stayHistory
    setGuestDraft(next)
  }

  return (
    <div className="space-y-4 p-4" aria-label="Guest Details">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold">Guest Details</h2>
        <p className="text-sm text-slate-500">
          Declared Adults: <strong>{totalAdults}</strong> / Children:{' '}
          <strong>{totalChildren}</strong> (from Registration tab). Guest count reconciliation
          happens at Check-in.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={guests.familyGroupCouple}
            onChange={(e) => setFamilyGroupCouple(e.target.checked)}
            data-testid="family-group-couple"
          />
          Family / Group / Couple (share Room No.)
        </label>

        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="rounded border border-slate-400 px-3 py-1.5 text-sm hover:bg-slate-100"
          data-testid="open-search-modal"
        >
          Search Guest
        </button>
      </div>

      <GuestBasicSection />
      <GuestContactSection />
      <GuestVisaSection />
      <GuestPassportSection />
      <GuestAdditionalSection />

      {formError ? (
        <p className="text-sm text-red-600" data-testid="guest-form-error">
          {formError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        {inEditMode ? (
          <button
            type="button"
            onClick={onUpdate}
            className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white"
            data-testid="guest-update"
          >
            Update
          </button>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white"
            data-testid="guest-add"
          >
            Add
          </button>
        )}
        <button
          type="button"
          onClick={onDelete}
          disabled={!inEditMode}
          className="rounded border border-red-400 px-3 py-1.5 text-sm text-red-700 disabled:opacity-50"
          data-testid="guest-delete"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={onClear}
          className="rounded border border-slate-400 px-3 py-1.5 text-sm"
          data-testid="guest-clear"
        >
          Clear
        </button>
      </div>

      <GuestListTable onRowInfo={setInfoGuest} />

      <GuestSearchModal
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSelect={onSelectFromSearch}
      />

      <GuestInfoModal
        open={Boolean(infoGuest)}
        guest={infoGuest}
        onClose={() => setInfoGuest(null)}
      />
    </div>
  )
}

export default GuestDetailsTab
