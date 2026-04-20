import { useWizardDraft } from '../../store/wizardDraft.js'
import { DocumentUploadControl } from './DocumentUploadControl.jsx'

/**
 * FR-008 — Additional section.
 * Blocked toggle is RBAC-gated: disabled for non-Supervisor roles
 * (NFR-S-002 / NFR-S-008). The stub here sets `canTouchBlocked = false`.
 * Only one guest per registration can be Contact Person; enforcement is in
 * the orchestrator (see GuestDetailsTab).
 */
export function GuestAdditionalSection() {
  const draft = useWizardDraft((s) => s.registration.guests.draft)
  const setGuestDraft = useWizardDraft((s) => s.setGuestDraft)

  // RBAC stub — real claim wiring happens in shell bolt.
  const canTouchBlocked = false

  return (
    <section
      className="space-y-4 rounded-md border border-slate-200 p-4"
      aria-label="Guest Additional Info"
    >
      <h3 className="text-base font-semibold">Additional Info</h3>

      <DocumentUploadControl />

      <div className="flex flex-wrap items-center gap-6">
        <label
          className={`inline-flex items-center gap-2 text-sm ${
            canTouchBlocked ? '' : 'text-slate-400'
          }`}
          title={canTouchBlocked ? '' : 'Supervisor role required'}
        >
          <input
            type="checkbox"
            disabled={!canTouchBlocked}
            checked={draft.blocked}
            onChange={(e) => setGuestDraft({ blocked: e.target.checked })}
            data-testid="guest-blocked"
          />
          Blocked Guest
        </label>

        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.isContactPerson}
            onChange={(e) => setGuestDraft({ isContactPerson: e.target.checked })}
            data-testid="guest-is-contact"
          />
          Is Contact Person
        </label>
      </div>
    </section>
  )
}
