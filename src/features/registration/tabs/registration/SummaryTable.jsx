import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { useRoomTypeMaster } from '../../api/masters.js'
import { diffNights } from '../../../../shared/lib/date.js'

const ch = createColumnHelper()

/**
 * SummaryTable - story 010.
 * 11 columns per FR-006: Room Type, Room Number, Adult, Child, Check-In,
 * Checkout, Nights, Room Rate, Additional Service, Status, Action.
 */
export function SummaryTable({ onEditRoom }) {
  const rooms = useWizardDraft((s) => s.registration.rooms)
  const services = useWizardDraft((s) => s.registration.services)
  const removeRoom = useWizardDraft((s) => s.removeRoom)
  const { data: roomTypes = [] } = useRoomTypeMaster()

  const typeNameById = useMemo(() => {
    const map = {}
    roomTypes.forEach((t) => {
      map[t.id] = t.name
    })
    return map
  }, [roomTypes])

  const rows = useMemo(() => {
    const roomRows = rooms.map((r) => ({
      kind: 'room',
      id: r.id,
      roomType: typeNameById[r.roomTypeId] || r.roomTypeId,
      roomNumber: r.roomNumber,
      adult: r.adults,
      child: r.children,
      checkIn: r.checkInDate,
      checkout: r.departureDate,
      nights: diffNights(r.checkInDate, r.departureDate),
      rate: r.total,
      services: '-',
      status: 'Draft',
      raw: r,
    }))
    const serviceRows = services.map((s) => ({
      kind: 'service',
      id: s.id,
      roomType: '(Service)',
      roomNumber: '-',
      adult: '-',
      child: '-',
      checkIn: s.fromDate,
      checkout: s.toDate,
      nights: diffNights(s.fromDate, s.toDate) || 1,
      rate: s.total,
      services: s.serviceName,
      status: 'Draft',
      raw: s,
    }))
    return [...roomRows, ...serviceRows]
  }, [rooms, services, typeNameById])

  const columns = useMemo(
    () => [
      ch.accessor('roomType', { header: 'Room Type' }),
      ch.accessor('roomNumber', { header: 'Room Number' }),
      ch.accessor('adult', { header: 'Adult' }),
      ch.accessor('child', { header: 'Child' }),
      ch.accessor('checkIn', { header: 'Check-In Date' }),
      ch.accessor('checkout', { header: 'Checkout Date' }),
      ch.accessor('nights', { header: 'Nights' }),
      ch.accessor('rate', {
        header: 'Room Rate',
        cell: (info) => Number(info.getValue() || 0).toFixed(2),
      }),
      ch.accessor('services', { header: 'Additional Service' }),
      ch.accessor('status', { header: 'Status' }),
      ch.display({
        id: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex gap-2">
            {row.original.kind === 'room' && (
              <button
                type="button"
                className="text-cyan-700 underline text-xs"
                onClick={() => onEditRoom(row.original.raw)}
              >
                Edit
              </button>
            )}
            <button
              type="button"
              className="text-red-700 underline text-xs"
              onClick={() => {
                if (!window.confirm('Delete this row?')) return
                removeRoom(row.original.id)
              }}
            >
              Delete
            </button>
          </div>
        ),
      }),
    ],
    [onEditRoom, removeRoom]
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <section className="rounded border border-gray-200 p-4 bg-white mt-4 overflow-x-auto">
      <h2 className="text-lg font-semibold mb-3">Summary</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">No rooms or services added yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="text-left border-b bg-gray-50">
                {hg.headers.map((h) => (
                  <th key={h.id} className="py-2 px-2 whitespace-nowrap">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-2 px-2 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}
