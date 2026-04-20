import { useState } from 'react'
import { Check, Save } from 'lucide-react'
import { HeaderSection } from './HeaderSection.jsx'
import { RoomForm } from './RoomForm.jsx'
import { ServiceForm } from './ServiceForm.jsx'
import { ClassificationSection } from './ClassificationSection.jsx'
import { SummaryTable } from './SummaryTable.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { Card } from '../../../../shared/ui/Card.jsx'

/**
 * RegistrationTab — Zoho-style layout. Page header + section cards.
 * Composition: 5 sections wrapped in Cards with clear titles + subtitles.
 */
export function RegistrationTab() {
  const addRoom = useWizardDraft((s) => s.addRoom)
  const updateRoom = useWizardDraft((s) => s.updateRoom)
  const addService = useWizardDraft((s) => s.addService)
  const updateService = useWizardDraft((s) => s.updateService)
  const rooms = useWizardDraft((s) => s.registration.rooms)
  const reservationEnabled = useWizardDraft((s) => s.registration.header.reservationEnabled)

  const [editingRoom, setEditingRoom] = useState(null)

  const canCheckIn = rooms.length > 0

  return (
    <>
      <div className="z-page-header">
        <div>
          <h1 className="z-page-title">Registration</h1>
          <div className="z-page-subtitle">
            {reservationEnabled
              ? 'Reservation-linked check-in'
              : 'Walk-in check-in'}{' '}
            · {rooms.length} {rooms.length === 1 ? 'room' : 'rooms'} added
          </div>
        </div>
        <div className="z-page-actions">
          <button type="button" className="z-btn z-btn-outline">
            <Save size={15} />
            <span>Save draft</span>
          </button>
          <button
            type="button"
            className="z-btn z-btn-primary"
            disabled={!canCheckIn}
            id="check-in"
            title={canCheckIn ? 'Finalise check-in' : 'Add at least one room first'}
          >
            <Check size={15} />
            <span>Check-in</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Card
          title="Booking context"
          subtitle="Reservation link, stay dates, listed company, currency."
        >
          <HeaderSection />
        </Card>

        <Card
          title="Room assignment"
          subtitle="Select room type, pick a room, configure rate and occupancy."
        >
          <RoomForm
            key={editingRoom ? `edit-${editingRoom.id}` : 'add-room'}
            editing={editingRoom}
            onAdd={(room) => addRoom(room)}
            onUpdate={(id, patch) => {
              updateRoom(id, patch)
              setEditingRoom(null)
            }}
            onCancel={() => setEditingRoom(null)}
          />
        </Card>

        <Card
          title="Additional services"
          subtitle="Attach billable services (airport drop, laundry, spa, etc.)."
        >
          <ServiceForm
            key="add-service"
            editing={null}
            onAdd={(svc) => addService(svc)}
            onUpdate={(id, patch) => updateService(id, patch)}
            onCancel={() => {}}
          />
        </Card>

        <Card
          title="Classification"
          subtitle={
            reservationEnabled
              ? 'Meal Plan and Reference are required for reservation-linked bookings.'
              : 'Market segment, guest source, meal plan, reference, channel discovery.'
          }
        >
          <ClassificationSection />
        </Card>

        <Card
          title="Summary"
          subtitle="Review rooms and services added to this registration."
        >
          <SummaryTable onEditRoom={(room) => setEditingRoom(room)} />
        </Card>
      </div>
    </>
  )
}
