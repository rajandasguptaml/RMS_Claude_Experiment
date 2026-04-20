import { useState } from 'react'
import { HeaderSection } from './HeaderSection.jsx'
import { RoomForm } from './RoomForm.jsx'
import { ServiceForm } from './ServiceForm.jsx'
import { ClassificationSection } from './ClassificationSection.jsx'
import { SummaryTable } from './SummaryTable.jsx'
import { useWizardDraft } from '../../store/wizardDraft.js'

/**
 * RegistrationTab - orchestrates the 5 sections plus the summary table.
 */
export function RegistrationTab() {
  const addRoom = useWizardDraft((s) => s.addRoom)
  const updateRoom = useWizardDraft((s) => s.updateRoom)
  const addService = useWizardDraft((s) => s.addService)
  const updateService = useWizardDraft((s) => s.updateService)

  const [editingRoom, setEditingRoom] = useState(null)

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-3">
      <h1 className="text-xl font-bold">Registration</h1>

      <HeaderSection />

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

      <ServiceForm
        key="add-service"
        editing={null}
        onAdd={(svc) => addService(svc)}
        onUpdate={(id, patch) => updateService(id, patch)}
        onCancel={() => {}}
      />

      <ClassificationSection />

      <SummaryTable onEditRoom={(room) => setEditingRoom(room)} />
    </div>
  )
}
