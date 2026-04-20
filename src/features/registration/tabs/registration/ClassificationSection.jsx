import { useWizardDraft } from '../../store/wizardDraft.js'
import {
  useMarketSegmentMaster,
  useGuestSourceMaster,
  useMealPlanMaster,
  useReferenceMaster,
} from '../../api/masters.js'
import { CHANNEL_OPTIONS } from '../../schemas/classificationSchema.js'

/**
 * Stories 008 (classification) + 009 (channel discovery).
 */
export function ClassificationSection() {
  const classification = useWizardDraft((s) => s.registration.classification)
  const setClassification = useWizardDraft((s) => s.setClassification)
  const reservationEnabled = useWizardDraft((s) => s.registration.header.reservationEnabled)

  const { data: marketSegments = [] } = useMarketSegmentMaster()
  const { data: guestSources = [] } = useGuestSourceMaster()
  const { data: mealPlans = [] } = useMealPlanMaster()
  const { data: references = [] } = useReferenceMaster()

  const toggleChannel = (opt, checked) => {
    const current = new Set(classification.channelDiscovery || [])
    if (checked) current.add(opt)
    else current.delete(opt)
    setClassification({ channelDiscovery: Array.from(current) })
  }

  return (
    <section className="rounded border border-gray-200 p-4 bg-white mt-4">
      <h2 className="text-lg font-semibold mb-3">Supplemental Classification</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div>
          <label className="block">Market Segment</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={classification.marketSegmentId || ''}
            onChange={(e) =>
              setClassification({ marketSegmentId: e.target.value || null })
            }
          >
            <option value="">-- Select --</option>
            {marketSegments.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">Guest Source</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={classification.guestSourceId || ''}
            onChange={(e) =>
              setClassification({ guestSourceId: e.target.value || null })
            }
          >
            <option value="">-- Select --</option>
            {guestSources.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">
            Meal Plan {reservationEnabled && <span className="text-red-600">*</span>}
          </label>
          <select
            className="w-full border rounded px-2 py-1"
            value={classification.mealPlanId || ''}
            onChange={(e) =>
              setClassification({ mealPlanId: e.target.value || null })
            }
          >
            <option value="">-- Select --</option>
            {mealPlans.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
          {reservationEnabled && !classification.mealPlanId && (
            <p className="text-xs text-red-600 mt-1">Required for reservation-linked</p>
          )}
        </div>
        <div>
          <label className="block">
            Reference {reservationEnabled && <span className="text-red-600">*</span>}
          </label>
          <select
            className="w-full border rounded px-2 py-1"
            value={classification.referenceId || ''}
            onChange={(e) =>
              setClassification({ referenceId: e.target.value || null })
            }
          >
            <option value="">-- Select --</option>
            {references.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          {reservationEnabled && !classification.referenceId && (
            <p className="text-xs text-red-600 mt-1">Required for reservation-linked</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="block">Hotel Remarks</label>
          <textarea
            className="w-full border rounded px-2 py-1"
            rows={2}
            value={classification.hotelRemarks}
            onChange={(e) => setClassification({ hotelRemarks: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="block">POS Remarks</label>
          <textarea
            className="w-full border rounded px-2 py-1"
            rows={2}
            value={classification.posRemarks}
            onChange={(e) => setClassification({ posRemarks: e.target.value })}
          />
        </div>
      </div>

      <div className="mt-4">
        <label className="block text-sm font-medium mb-1">
          How did you find out about our hotel?
        </label>
        <div className="flex flex-wrap gap-4 text-sm">
          {CHANNEL_OPTIONS.map((opt) => (
            <label key={opt} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={(classification.channelDiscovery || []).includes(opt)}
                onChange={(e) => toggleChannel(opt, e.target.checked)}
              />
              {opt}
            </label>
          ))}
        </div>
      </div>
    </section>
  )
}
