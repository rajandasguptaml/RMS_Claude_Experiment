import { useWizardDraft } from '../../store/wizardDraft.js'
import { isAfterISO } from '../../../../shared/lib/date.js'

/**
 * FR-008 — Passport sub-section.
 * BR-GD-004 + NFR-C-008: When both Issue and Expiry dates are entered,
 * Expiry must be strictly after Issue.
 */
export function GuestPassportSection() {
  const draft = useWizardDraft((s) => s.registration.guests.draft)
  const setGuestDraft = useWizardDraft((s) => s.setGuestDraft)

  const bothDates =
    Boolean(draft.passportIssueDate) && Boolean(draft.passportExpiryDate)
  const expiryInvalid =
    bothDates && !isAfterISO(draft.passportExpiryDate, draft.passportIssueDate)

  return (
    <section
      className="space-y-4 rounded-md border border-slate-200 p-4"
      aria-label="Guest Passport Info"
    >
      <h3 className="text-base font-semibold">Passport Info</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Passport Number</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.passportNumber}
            onChange={(e) => setGuestDraft({ passportNumber: e.target.value })}
            data-testid="guest-passport-number"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Issue Date</span>
          <input
            type="date"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.passportIssueDate}
            onChange={(e) => setGuestDraft({ passportIssueDate: e.target.value })}
            data-testid="guest-passport-issue"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Expiry Date</span>
          <input
            type="date"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.passportExpiryDate}
            onChange={(e) => setGuestDraft({ passportExpiryDate: e.target.value })}
            data-testid="guest-passport-expiry"
          />
          {expiryInvalid ? (
            <span className="mt-1 block text-xs text-red-600">
              Passport Expiry must be after Issue.
            </span>
          ) : null}
        </label>
      </div>
    </section>
  )
}
