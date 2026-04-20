import { useEffect, useMemo } from 'react'
import { useComplimentaryMaster } from '../../api/masters.js'
import { useReservation } from '../../api/reservations.js'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { ComplimentaryTile } from './ComplimentaryTile.jsx'
import { SelectAllMasterCheckbox } from './SelectAllMasterCheckbox.jsx'

/**
 * FR-009 Complimentary Item tab.
 * - 4-col responsive grid of active items from master
 * - Select All toggles only non-mandatory
 * - Mandatory items disabled (BR-CI-002)
 * - Auto-applies suggested + mandatory from reservation (once per reservation change)
 */
export function ComplimentaryTab() {
  const { data: activeItems = [], isLoading, isError } = useComplimentaryMaster()
  const reservationId = useWizardDraft((s) => s.registration.header.reservationId)
  const reservationEnabled = useWizardDraft((s) => s.registration.header.reservationEnabled)
  const { data: reservation } = useReservation(reservationEnabled ? reservationId : null)
  const complimentary = useWizardDraft((s) => s.registration.complimentary)
  const toggle = useWizardDraft((s) => s.toggleComplimentary)
  const selectAll = useWizardDraft((s) => s.selectAllComplimentary)
  const apply = useWizardDraft((s) => s.applyReservationComplimentary)
  const resetWalkIn = useWizardDraft((s) => s.resetComplimentaryForWalkIn)

  // Walk-in mode: wipe any prior pre-selection.
  useEffect(() => {
    if (!reservationEnabled && complimentary.sourceReservationId) {
      resetWalkIn()
    }
  }, [reservationEnabled, complimentary.sourceReservationId, resetWalkIn])

  // Reservation-linked pre-selection (applied once per reservationId change).
  useEffect(() => {
    if (!reservationEnabled || !reservation) return
    if (complimentary.sourceReservationId === reservation.id && complimentary.initialized) return
    apply({
      reservationId: reservation.id,
      suggestedIds: reservation.suggested_item_ids ?? [],
      mandatoryIds: reservation.mandatory_item_ids ?? [],
    })
  }, [reservationEnabled, reservation, apply, complimentary.sourceReservationId, complimentary.initialized])

  const activeIds = useMemo(() => activeItems.map((i) => i.id), [activeItems])
  const nonMandatoryActiveIds = useMemo(
    () => activeIds.filter((id) => !complimentary.mandatoryIds.includes(id)),
    [activeIds, complimentary.mandatoryIds]
  )
  const selectedNonMandatoryCount = useMemo(
    () => complimentary.selected.filter((id) => !complimentary.mandatoryIds.includes(id)).length,
    [complimentary.selected, complimentary.mandatoryIds]
  )

  // Historically-saved selected IDs that no longer appear in the active master.
  const legacyInactiveIds = useMemo(
    () => complimentary.selected.filter((id) => !activeIds.includes(id)),
    [complimentary.selected, activeIds]
  )

  if (isLoading) return <p className="p-4 text-sm text-slate-500">Loading complimentary items…</p>
  if (isError) return <p className="p-4 text-sm text-red-600">Failed to load complimentary items.</p>

  return (
    <section className="space-y-4 p-4" aria-label="Complimentary Item">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Complimentary Items</h2>
          <p className="text-sm text-slate-500">
            Select the services included with your reservation. Required items cannot be removed.
          </p>
        </div>
        <SelectAllMasterCheckbox
          totalNonMandatory={nonMandatoryActiveIds.length}
          selectedNonMandatoryCount={selectedNonMandatoryCount}
          onToggle={() => selectAll(activeIds)}
        />
      </header>

      <div
        className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
        role="group"
        aria-label="Complimentary items list"
      >
        {activeItems.map((item) => (
          <ComplimentaryTile
            key={item.id}
            item={item}
            selected={complimentary.selected.includes(item.id)}
            mandatory={complimentary.mandatoryIds.includes(item.id)}
            onToggle={toggle}
          />
        ))}

        {legacyInactiveIds.map((id) => (
          <ComplimentaryTile
            key={`legacy-${id}`}
            item={{ id, name: id }}
            selected
            inactive
            onToggle={() => {}}
          />
        ))}
      </div>

      <footer className="text-xs text-slate-500">
        {complimentary.selected.length === 0
          ? 'Zero complimentary items is valid.'
          : `${complimentary.selected.length} item(s) selected${
              complimentary.mandatoryIds.length > 0
                ? ` · ${complimentary.mandatoryIds.length} required by package`
                : ''
            }`}
      </footer>
    </section>
  )
}

export default ComplimentaryTab
