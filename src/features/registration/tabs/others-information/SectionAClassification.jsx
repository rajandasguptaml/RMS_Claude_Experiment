import { useWizardDraft } from '../../store/wizardDraft.js'
import { CHANNEL_OPTIONS } from '../../schemas/othersInformationSchema.js'

const FLAG_OPTIONS = [
  { value: '', label: '-- Please Select --' },
  { value: 'NO', label: 'NO' },
  { value: 'YES', label: 'YES' },
]

/**
 * FR-010 Section A — classification flags + Channel Discovery.
 * - 3 flags (Complimentary Guest / House Use / Room Owner) mutually exclusive (BR-OI-001).
 * - VIP toggle is disabled until RBAC claims are wired in the shell bolt (NFR-S-002/008).
 */
export function SectionAClassification() {
  const sectionA = useWizardDraft((s) => s.registration.othersInformation.sectionA)
  const setA = useWizardDraft((s) => s.setOthersSectionA)
  const canTouchVip = false // RBAC stub — shell bolt replaces with real claim.

  const toggleChannel = (opt) => {
    const next = sectionA.channelDiscovery.includes(opt)
      ? sectionA.channelDiscovery.filter((x) => x !== opt)
      : [...sectionA.channelDiscovery, opt]
    setA({ channelDiscovery: next })
  }

  return (
    <section className="space-y-4 rounded-md border border-slate-200 p-4" aria-label="Section A — Other Information">
      <h3 className="text-base font-semibold">Other Information</h3>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Coming From</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={sectionA.comingFrom}
            onChange={(e) => setA({ comingFrom: e.target.value })}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Next Destination</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={sectionA.nextDestination}
            onChange={(e) => setA({ nextDestination: e.target.value })}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Visit Purpose</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={sectionA.visitPurpose}
            onChange={(e) => setA({ visitPurpose: e.target.value })}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Complimentary Guest</span>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={sectionA.complimentaryGuest}
            onChange={(e) => setA({ complimentaryGuest: e.target.value })}
            data-testid="flag-complimentary-guest"
          >
            {FLAG_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">House Use</span>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={sectionA.houseUse}
            onChange={(e) => setA({ houseUse: e.target.value })}
            data-testid="flag-house-use"
          >
            {FLAG_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Room Owner</span>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={sectionA.roomOwner}
            onChange={(e) => setA({ roomOwner: e.target.value })}
            data-testid="flag-room-owner"
          >
            {FLAG_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={sectionA.isPreviouslyVisited}
            onChange={(e) => setA({ isPreviouslyVisited: e.target.checked })}
          />
          Previously Visited Guest?
        </label>

        <label
          className={`inline-flex items-center gap-2 text-sm ${
            canTouchVip ? '' : 'text-slate-400'
          }`}
          title={canTouchVip ? '' : 'Supervisor role required'}
        >
          <input
            type="checkbox"
            disabled={!canTouchVip}
            checked={sectionA.isVip}
            onChange={(e) => setA({ isVip: e.target.checked })}
            data-testid="flag-vip"
          />
          VIP Guest?
        </label>
      </div>

      <fieldset className="rounded border border-slate-200 p-3">
        <legend className="text-xs text-slate-500">
          How did you find out about our hotel?
        </legend>
        <div className="flex flex-wrap gap-4">
          {CHANNEL_OPTIONS.map((opt) => (
            <label key={opt} className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={sectionA.channelDiscovery.includes(opt)}
                onChange={() => toggleChannel(opt)}
                data-testid={`channel-${opt.toLowerCase()}`}
              />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>
    </section>
  )
}
