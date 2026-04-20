import { useMemo } from 'react'
import { Autocomplete, TextField } from '@mui/material'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { useProfessionMaster, useCountryMaster } from '../../api/masters.js'
import { guestContactSchema } from '../../schemas/guestSchema.js'

/**
 * FR-008 — Contact section.
 * Country is required per BR-GD-002 (enforced on Add).
 * Inline validation on Email / Phone / Zip per NFR-C-001 / C-006 / C-007.
 * Changing Country sets default Nationality from the country master
 * (Nationality remains editable afterwards).
 */
export function GuestContactSection() {
  const draft = useWizardDraft((s) => s.registration.guests.draft)
  const setGuestDraft = useWizardDraft((s) => s.setGuestDraft)
  const { data: professions = [] } = useProfessionMaster()
  const { data: countries = [] } = useCountryMaster()

  const selectedCountry = countries.find((c) => c.name === draft.country) || null

  const errors = useMemo(() => {
    const parsed = guestContactSchema.safeParse(draft)
    if (parsed.success) return {}
    const map = {}
    for (const issue of parsed.error.issues) {
      if (issue.path && issue.path[0]) map[issue.path[0]] = issue.message
    }
    return map
  }, [draft])

  const onCountryChange = (next) => {
    const patch = { country: next ? next.name : '' }
    // If the user hasn't customised Nationality, mirror the country's default.
    if (next) patch.nationality = next.nationality
    setGuestDraft(patch)
  }

  return (
    <section
      className="space-y-4 rounded-md border border-slate-200 p-4"
      aria-label="Guest Contact Info"
    >
      <h3 className="text-base font-semibold">Contact Info</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Email</span>
          <input
            type="email"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.email}
            onChange={(e) => setGuestDraft({ email: e.target.value })}
            data-testid="guest-email"
          />
          {errors.email ? (
            <span className="mt-1 block text-xs text-red-600">{errors.email}</span>
          ) : null}
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Phone</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.phone}
            onChange={(e) => setGuestDraft({ phone: e.target.value })}
            placeholder="+8801712345678"
            data-testid="guest-phone"
          />
          {errors.phone ? (
            <span className="mt-1 block text-xs text-red-600">{errors.phone}</span>
          ) : null}
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Profession</span>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.profession}
            onChange={(e) => setGuestDraft({ profession: e.target.value })}
            data-testid="guest-profession"
          >
            <option value="">-- Select --</option>
            {professions.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Company Name</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.companyName}
            onChange={(e) => setGuestDraft({ companyName: e.target.value })}
            data-testid="guest-company"
          />
        </label>

        <label className="text-sm md:col-span-2">
          <span className="mb-1 block text-slate-600">Address</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.address}
            onChange={(e) => setGuestDraft({ address: e.target.value })}
            data-testid="guest-address"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">City</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.city}
            onChange={(e) => setGuestDraft({ city: e.target.value })}
            data-testid="guest-city"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Zip Code</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.zipCode}
            onChange={(e) => setGuestDraft({ zipCode: e.target.value })}
            inputMode="numeric"
            data-testid="guest-zip"
          />
          {errors.zipCode ? (
            <span className="mt-1 block text-xs text-red-600">{errors.zipCode}</span>
          ) : null}
        </label>

        <div className="text-sm" data-testid="guest-country-wrapper">
          <span className="mb-1 block text-slate-600">
            Country<span className="ml-1 text-red-600">*</span>
          </span>
          <Autocomplete
            options={countries}
            value={selectedCountry}
            getOptionLabel={(opt) => (opt ? opt.name : '')}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, next) => onCountryChange(next)}
            size="small"
            renderInput={(params) => (
              <TextField {...params} data-testid="guest-country" />
            )}
          />
        </div>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Nationality</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.nationality}
            onChange={(e) => setGuestDraft({ nationality: e.target.value })}
            data-testid="guest-nationality"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">National ID</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.nationalId}
            onChange={(e) => setGuestDraft({ nationalId: e.target.value })}
            data-testid="guest-national-id"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Driving License</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={draft.drivingLicense}
            onChange={(e) => setGuestDraft({ drivingLicense: e.target.value })}
            data-testid="guest-driving-license"
          />
        </label>
      </div>
    </section>
  )
}
