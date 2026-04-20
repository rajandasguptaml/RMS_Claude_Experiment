import { useMemo, useState } from 'react'
import { useRoomTypeMaster } from '../../api/masters.js'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { computeRoomTotal, DISCOUNT_TYPES, STAY_TYPES } from '../../schemas/roomSchema.js'
import { RoomListModal } from './RoomListModal.jsx'
import { RrcModal } from './RrcModal.jsx'

const EMPTY_ROOM = {
  id: '',
  roomTypeId: '',
  roomId: '',
  roomNumber: '',
  adults: 1,
  children: 0,
  rackRate: 0,
  negotiatedRate: '',
  discountType: 'Fixed',
  discountValue: 0,
  scPct: 10,
  vatPct: 15,
  city: 0,
  additional: 0,
  waiveSc: false,
  waiveVat: false,
  waiveCity: false,
  waiveAdditional: false,
  sameAsGlobalDate: true,
  checkInDate: '',
  departureDate: '',
  stayType: 'Standard',
  lockToken: null,
}

/**
 * RoomForm - story 004 (room type + auto-fill), 005 (room list), 006 (discount / RRC).
 * @param {{ editing?: object|null, onAdd:(room)=>void, onUpdate:(id,patch)=>void, onCancel:()=>void }} props
 */
export function RoomForm({ editing, onAdd, onUpdate, onCancel }) {
  const { data: roomTypes = [] } = useRoomTypeMaster()
  const header = useWizardDraft((s) => s.registration.header)
  const setLock = useWizardDraft((s) => s.setLock)

  // initialise from `editing` snapshot; parent remounts via `key` when editing changes
  const [form, setForm] = useState(() =>
    editing ? { ...editing, negotiatedRate: editing.negotiatedRate ?? '' } : EMPTY_ROOM
  )
  const [modalOpen, setModalOpen] = useState(false)
  const [rrcOpen, setRrcOpen] = useState(false)
  const [error, setError] = useState('')

  const patch = (p) => setForm((f) => ({ ...f, ...p }))

  const total = useMemo(
    () =>
      computeRoomTotal({
        ...form,
        negotiatedRate: form.negotiatedRate === '' ? null : Number(form.negotiatedRate),
        discountValue: Number(form.discountValue) || 0,
        rackRate: Number(form.rackRate) || 0,
        scPct: Number(form.scPct) || 0,
        vatPct: Number(form.vatPct) || 0,
        city: Number(form.city) || 0,
        additional: Number(form.additional) || 0,
      }),
    [form]
  )

  const onTypeChange = (id) => {
    const rt = roomTypes.find((t) => t.id === id)
    if (!rt) {
      patch({ roomTypeId: '', rackRate: 0, roomId: '', roomNumber: '' })
      setError('')
      return
    }
    patch({
      roomTypeId: rt.id,
      rackRate: rt.rackRate,
      scPct: rt.scPct,
      vatPct: rt.vatPct,
      city: rt.city,
      additional: rt.additional,
      discountValue: 0,
      roomId: '',
      roomNumber: '',
    })
    setError('')
  }

  const onRoomPicked = (picked) => {
    patch({ roomId: picked.roomId, roomNumber: picked.roomNumber, lockToken: picked.lockToken })
    setLock(picked.roomId, picked.lockToken)
  }

  const canSubmit = form.roomTypeId && form.roomId
  const handleSubmit = () => {
    if (!canSubmit) {
      setError('Room Type and Room Number are required')
      return
    }
    // BR-REG-005 check
    if (
      form.discountType === 'Fixed' &&
      Number(form.discountValue) > Number(form.rackRate)
    ) {
      setError('Fixed discount cannot exceed Rack Rate')
      return
    }
    const payload = {
      ...form,
      rackRate: Number(form.rackRate) || 0,
      negotiatedRate: form.negotiatedRate === '' ? null : Number(form.negotiatedRate),
      discountValue: Number(form.discountValue) || 0,
      scPct: Number(form.scPct) || 0,
      vatPct: Number(form.vatPct) || 0,
      city: Number(form.city) || 0,
      additional: Number(form.additional) || 0,
      adults: Number(form.adults) || 1,
      children: Number(form.children) || 0,
      total,
      checkInDate: form.sameAsGlobalDate ? header.checkInDate : form.checkInDate,
      departureDate: form.sameAsGlobalDate ? header.departureDate : form.departureDate,
    }
    if (editing) {
      onUpdate(editing.id, payload)
    } else {
      payload.id = `room-${Date.now()}`
      onAdd(payload)
    }
    setForm(EMPTY_ROOM)
    setError('')
  }

  const handleCancel = () => {
    setForm(EMPTY_ROOM)
    setError('')
    onCancel()
  }

  return (
    <section className="rounded border border-gray-200 p-4 bg-white mt-4">
      <h2 className="text-lg font-semibold mb-3">Room Detailed Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
        <div>
          <label className="block">Room Type</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={form.roomTypeId}
            onChange={(e) => onTypeChange(e.target.value)}
          >
            <option value="">-- Select --</option>
            {roomTypes.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">Room Number</label>
          <div className="flex gap-2">
            <input className="flex-1 border rounded px-2 py-1 bg-gray-50" value={form.roomNumber} readOnly />
            <button
              type="button"
              className="px-2 py-1 border rounded bg-gray-100 disabled:opacity-50"
              disabled={!form.roomTypeId}
              onClick={() => setModalOpen(true)}
            >
              Room List
            </button>
          </div>
        </div>
        <div>
          <label className="block">Adults / Room</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded px-2 py-1"
            value={form.adults}
            onChange={(e) => patch({ adults: e.target.value })}
          />
        </div>
        <div>
          <label className="block">Children / Room</label>
          <input
            type="number"
            min={0}
            className="w-full border rounded px-2 py-1"
            value={form.children}
            onChange={(e) => patch({ children: e.target.value })}
          />
        </div>
        <div>
          <label className="block">Rack Rate</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={form.rackRate}
            onChange={(e) => patch({ rackRate: e.target.value })}
          />
        </div>
        <div>
          <label className="block">Service Charge %</label>
          <input type="number" className="w-full border rounded px-2 py-1 bg-gray-50" value={form.scPct} disabled />
        </div>
        <div>
          <label className="block">VAT %</label>
          <input type="number" className="w-full border rounded px-2 py-1 bg-gray-50" value={form.vatPct} disabled />
        </div>
        <div>
          <label className="block">City Charge</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={form.city}
            onChange={(e) => patch({ city: e.target.value })}
          />
        </div>
        <div>
          <label className="block">Additional Charges</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1"
            value={form.additional}
            onChange={(e) => patch({ additional: e.target.value })}
          />
        </div>
        <div>
          <label className="block">Discount Type</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={form.discountType}
            onChange={(e) => patch({ discountType: e.target.value })}
          >
            {DISCOUNT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">Discount Value</label>
          <input
            type="number"
            min={0}
            className="w-full border rounded px-2 py-1"
            value={form.discountValue}
            onChange={(e) => patch({ discountValue: e.target.value })}
          />
        </div>
        <div>
          <label className="block">Negotiated Rate</label>
          <input
            type="number"
            min={0}
            className="w-full border rounded px-2 py-1"
            value={form.negotiatedRate}
            onChange={(e) => patch({ negotiatedRate: e.target.value })}
          />
        </div>
        <div>
          <label className="block">Stay Type</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={form.stayType}
            onChange={(e) => patch({ stayType: e.target.value })}
          >
            {STAY_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-3 text-sm">
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={form.waiveSc} onChange={(e) => patch({ waiveSc: e.target.checked })} />
          Waive SC
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={form.waiveVat} onChange={(e) => patch({ waiveVat: e.target.checked })} />
          Waive VAT
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={form.waiveCity}
            onChange={(e) => patch({ waiveCity: e.target.checked })}
          />
          Waive City
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={form.waiveAdditional}
            onChange={(e) => patch({ waiveAdditional: e.target.checked })}
          />
          Waive Additional
        </label>
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={form.sameAsGlobalDate}
            onChange={(e) => patch({ sameAsGlobalDate: e.target.checked })}
          />
          Same as global date
        </label>
      </div>

      {!form.sameAsGlobalDate && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
          <div>
            <label className="block">Per-Room Check-In</label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1"
              value={form.checkInDate}
              onChange={(e) => patch({ checkInDate: e.target.value })}
            />
          </div>
          <div>
            <label className="block">Per-Room Departure</label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1"
              value={form.departureDate}
              onChange={(e) => patch({ departureDate: e.target.value })}
            />
          </div>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
        <div className="text-sm">
          <span className="text-gray-600">Total Room Rent: </span>
          <span className="font-semibold">{total.toFixed(2)}</span>
        </div>
        <div className="flex gap-2">
          <button type="button" className="px-3 py-1 border rounded" onClick={() => setRrcOpen(true)}>
            RRC
          </button>
          <button
            type="button"
            className="px-3 py-1 border rounded bg-blue-600 text-white disabled:opacity-50"
            onClick={handleSubmit}
            disabled={!canSubmit}
          >
            {editing ? 'Update' : 'Add'}
          </button>
          <button type="button" className="px-3 py-1 border rounded" onClick={handleCancel}>
            Cancel
          </button>
        </div>
      </div>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}

      <RoomListModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        typeId={form.roomTypeId}
        from={header.checkInDate}
        to={header.departureDate}
        onConfirm={onRoomPicked}
      />
      <RrcModal
        open={rrcOpen}
        onClose={() => setRrcOpen(false)}
        defaults={{
          scPct: Number(form.scPct) || 0,
          vatPct: Number(form.vatPct) || 0,
          city: Number(form.city) || 0,
          additional: Number(form.additional) || 0,
        }}
        onApply={(rack) => patch({ rackRate: rack })}
      />
    </section>
  )
}
