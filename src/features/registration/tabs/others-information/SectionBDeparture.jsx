import { Autocomplete, TextField } from '@mui/material'
import { useAirlineMaster } from '../../api/masters.js'
import { useWizardDraft } from '../../store/wizardDraft.js'

const AIRPORT_DROP_OPTIONS = ['', 'NO', 'YES', 'TBA']

/**
 * FR-010 Section B — departure logistics.
 * - Airport Drop default NO; YES/TBA soft-requires airlines/flight/ETD (BR-OI-004).
 */
export function SectionBDeparture() {
  const sectionB = useWizardDraft((s) => s.registration.othersInformation.sectionB)
  const setB = useWizardDraft((s) => s.setOthersSectionB)
  const { data: airlines = [], isLoading } = useAirlineMaster()

  const conditionalRequired = sectionB.airportDrop === 'YES' || sectionB.airportDrop === 'TBA'

  const selectedAirline = airlines.find((a) => a.id === sectionB.airlineId) || null

  return (
    <section className="space-y-4 rounded-md border border-slate-200 p-4" aria-label="Section B — Departure Information">
      <h3 className="text-base font-semibold">Departure Information</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Airport Drop</span>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={sectionB.airportDrop}
            onChange={(e) => setB({ airportDrop: e.target.value })}
            data-testid="airport-drop"
          >
            {AIRPORT_DROP_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o === '' ? '-- Please Select --' : o}
              </option>
            ))}
          </select>
        </label>

        <div className="text-sm md:col-span-2">
          <span className="mb-1 block text-slate-600">
            Airlines Name{conditionalRequired ? <span className="ml-1 text-red-600">*</span> : null}
          </span>
          <Autocomplete
            options={airlines}
            value={selectedAirline}
            loading={isLoading}
            getOptionLabel={(opt) => (opt ? `${opt.name} (${opt.code})` : '')}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            onChange={(_, next) => setB({ airlineId: next ? next.id : '' })}
            size="small"
            renderInput={(params) => (
              <TextField
                {...params}
                inputProps={{
                  ...params.inputProps,
                  'data-testid': 'airline-input',
                }}
              />
            )}
          />
        </div>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">
            Flight Number
            {conditionalRequired ? <span className="ml-1 text-red-600">*</span> : null}
          </span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={sectionB.flightNumber}
            onChange={(e) => setB({ flightNumber: e.target.value })}
            data-testid="flight-number"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">
            Departure Time (ETD)
            {conditionalRequired ? <span className="ml-1 text-red-600">*</span> : null}
          </span>
          <input
            type="time"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={sectionB.etd}
            onChange={(e) => setB({ etd: e.target.value })}
            data-testid="etd-input"
          />
        </label>
      </div>

      {conditionalRequired ? (
        <p className="text-xs text-slate-500">
          Airlines, Flight Number, and ETD are recommended when Airport Drop is {sectionB.airportDrop}.
        </p>
      ) : null}
    </section>
  )
}
