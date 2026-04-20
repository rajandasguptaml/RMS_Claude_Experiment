import { useMemo, useState } from 'react'
import { useServiceMaster } from '../../api/masters.js'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { computeServiceTotal } from '../../schemas/serviceSchema.js'
import { RrcModal } from './RrcModal.jsx'

const EMPTY = {
  id: '',
  serviceId: '',
  serviceName: '',
  fromDate: '',
  toDate: '',
  unitRate: 0,
  quantity: 1,
}

/**
 * ServiceForm - story 007.
 * Add/Update/Cancel with multi-service support; service-level RRC.
 */
export function ServiceForm({ editing, onAdd, onUpdate, onCancel }) {
  const { data: services = [] } = useServiceMaster()
  const header = useWizardDraft((s) => s.registration.header)

  const [form, setForm] = useState(() =>
    editing ? { ...editing } : { ...EMPTY, fromDate: header.checkInDate, toDate: header.checkInDate }
  )
  const [rrcOpen, setRrcOpen] = useState(false)
  const [error, setError] = useState('')

  const total = useMemo(
    () =>
      computeServiceTotal({
        fromDate: form.fromDate,
        toDate: form.toDate,
        unitRate: Number(form.unitRate) || 0,
        quantity: Number(form.quantity) || 1,
      }),
    [form]
  )

  const patch = (p) => setForm((f) => ({ ...f, ...p }))

  const onServicePick = (id) => {
    const sv = services.find((s) => s.id === id)
    if (!sv) {
      patch({ serviceId: '', serviceName: '', unitRate: 0 })
      return
    }
    patch({
      serviceId: sv.id,
      serviceName: sv.name,
      unitRate: sv.unitRate,
      fromDate: form.fromDate || header.checkInDate,
      toDate: form.toDate || header.checkInDate,
    })
  }

  const handleSubmit = () => {
    if (!form.serviceId) {
      setError('Select a service')
      return
    }
    if (form.toDate < form.fromDate) {
      setError('To Date cannot be before From Date')
      return
    }
    const payload = {
      ...form,
      unitRate: Number(form.unitRate) || 0,
      quantity: Number(form.quantity) || 1,
      total,
    }
    if (editing) {
      onUpdate(editing.id, payload)
    } else {
      payload.id = `svc-${Date.now()}`
      onAdd(payload)
    }
    setForm({ ...EMPTY, fromDate: header.checkInDate, toDate: header.checkInDate })
    setError('')
  }

  const handleCancel = () => {
    setForm({ ...EMPTY, fromDate: header.checkInDate, toDate: header.checkInDate })
    setError('')
    onCancel()
  }

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-sm">
        <div className="md:col-span-2">
          <label className="block">Service Name</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={form.serviceId}
            onChange={(e) => onServicePick(e.target.value)}
          >
            <option value="">-- Select --</option>
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">From Date</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={form.fromDate}
            onChange={(e) => patch({ fromDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block">To Date</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={form.toDate}
            onChange={(e) => patch({ toDate: e.target.value })}
          />
        </div>
        <div>
          <label className="block">Rate</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={form.unitRate}
            onChange={(e) => patch({ unitRate: e.target.value })}
          />
        </div>
        <div>
          <label className="block">Qty</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded px-2 py-1"
            value={form.quantity}
            onChange={(e) => patch({ quantity: e.target.value })}
          />
        </div>
        <div className="md:col-span-2 flex items-end">
          <div className="text-sm">
            <span className="text-gray-600">Total: </span>
            <span className="font-semibold">{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <button type="button" className="px-3 py-1 border rounded" onClick={() => setRrcOpen(true)}>
          RRC
        </button>
        <button
          type="button"
          className="px-3 py-1 border rounded bg-blue-600 text-white"
          onClick={handleSubmit}
        >
          {editing ? 'Update' : 'Add'}
        </button>
        <button type="button" className="px-3 py-1 border rounded" onClick={handleCancel}>
          Cancel
        </button>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <RrcModal
        open={rrcOpen}
        onClose={() => setRrcOpen(false)}
        defaults={{ scPct: 0, vatPct: 0, city: 0, additional: 0 }}
        onApply={(rack) => patch({ unitRate: rack })}
      />
    </section>
  )
}
