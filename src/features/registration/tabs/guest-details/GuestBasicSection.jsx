import { useMemo } from 'react'
import { useWizardDraft } from '../../store/wizardDraft.js'
import {
  TITLE_OPTIONS,
  GENDER_OPTIONS,
  formatFullGuestName,
} from '../../schemas/guestSchema.js'

/**
 * FR-008 — Basic info section.
 * Title and First Name are required per BR-GD-002 (enforced on Add).
 * Full Guest Name is a read-only derived display (BR-GD-003, NFR-P-003).
 */
export function GuestBasicSection() {
  const draft = useWizardDraft((s) => s.registration.guests.draft)
  const setGuestDraft = useWizardDraft((s) => s.setGuestDraft)

  const fullName = useMemo(
    () => formatFullGuestName(draft),
    [draft.title, draft.firstName, draft.lastName] // eslint-disable-line react-hooks/exhaustive-deps
  )

  return (
    <section
      className="space-y-4 rounded-md border border-slate-200 p-4"
      aria-label="Guest Basic Info"
    >
      <h3 className="text-base font-semibold">Basic Info</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">
            Title<span className="ml-1 text-red-600">*</span>
          </span>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.title}
            onChange={(e) => setGuestDraft({ title: e.target.value })}
            data-testid="guest-title"
          >
            <option value="">-- Select --</option>
            {TITLE_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">
            First Name<span className="ml-1 text-red-600">*</span>
          </span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.firstName}
            onChange={(e) => setGuestDraft({ firstName: e.target.value })}
            data-testid="guest-first-name"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Last Name</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.lastName}
            onChange={(e) => setGuestDraft({ lastName: e.target.value })}
            data-testid="guest-last-name"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Gender</span>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.gender}
            onChange={(e) => setGuestDraft({ gender: e.target.value })}
            data-testid="guest-gender"
          >
            {GENDER_OPTIONS.map((o) => (
              <option key={o || 'none'} value={o}>
                {o || '-- Select --'}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Room No.</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.roomNo}
            onChange={(e) => setGuestDraft({ roomNo: e.target.value })}
            data-testid="guest-room-no"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Date of Birth</span>
          <input
            type="date"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.dateOfBirth}
            onChange={(e) => setGuestDraft({ dateOfBirth: e.target.value })}
            data-testid="guest-dob"
          />
        </label>

        <label className="text-sm md:col-span-3">
          <span className="mb-1 block text-slate-600">Full Guest Name (auto)</span>
          <input
            type="text"
            readOnly
            className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1.5 text-slate-700"
            value={fullName}
            data-testid="guest-full-name"
          />
        </label>
      </div>
    </section>
  )
}
