import { useWizardDraft } from '../../store/wizardDraft.js'
import { isAfterISO } from '../../../../shared/lib/date.js'

/**
 * FR-008 — Visa sub-section.
 * BR-GD-004 + NFR-C-008: When both Issue and Expiry dates are entered,
 * Expiry must be strictly after Issue.
 */
export function GuestVisaSection() {
  const draft = useWizardDraft((s) => s.registration.guests.draft)
  const setGuestDraft = useWizardDraft((s) => s.setGuestDraft)

  const bothDates = Boolean(draft.visaIssueDate) && Boolean(draft.visaExpiryDate)
  const expiryInvalid =
    bothDates && !isAfterISO(draft.visaExpiryDate, draft.visaIssueDate)

  return (
    <section
      className="space-y-4 rounded-md border border-slate-200 p-4"
      aria-label="Guest Visa Info"
    >
      <h3 className="text-base font-semibold">Visa Info</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Visa Number</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.visaNumber}
            onChange={(e) => setGuestDraft({ visaNumber: e.target.value })}
            data-testid="guest-visa-number"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Issue Date</span>
          <input
            type="date"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.visaIssueDate}
            onChange={(e) => setGuestDraft({ visaIssueDate: e.target.value })}
            data-testid="guest-visa-issue"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Expiry Date</span>
          <input
            type="date"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.visaExpiryDate}
            onChange={(e) => setGuestDraft({ visaExpiryDate: e.target.value })}
            data-testid="guest-visa-expiry"
          />
          {expiryInvalid ? (
            <span className="mt-1 block text-xs text-red-600">
              Visa Expiry must be after Issue.
            </span>
          ) : null}
        </label>
      </div>
    </section>
  )
}
