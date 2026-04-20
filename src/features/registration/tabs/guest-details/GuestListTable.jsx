import { useMemo } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { useWizardDraft } from '../../store/wizardDraft.js'

const ch = createColumnHelper()

/**
 * FR-008 — Guest list table with Add / Update / Delete actions.
 * Per BR-GD-001, at least one guest must exist for Check-in; this table
 * does NOT gate deletion below 1 (the cross-tab validator in the shell
 * raises the blocking error at Check-in).
 *
 * @param {object} props
 * @param {(guest: object) => void} [props.onRowInfo] — open info modal
 */
export function GuestListTable({ onRowInfo }) {
  const list = useWizardDraft((s) => s.registration.guests.list)
  const loadGuestForEdit = useWizardDraft((s) => s.loadGuestForEdit)
  const removeGuest = useWizardDraft((s) => s.removeGuest)

  const columns = useMemo(
    () => [
      ch.accessor('fullName', {
        header: 'Guest Name',
        cell: (info) => (
          <button
            type="button"
            className="text-cyan-700 underline"
            onClick={() => onRowInfo && onRowInfo(info.row.original)}
          >
            {info.getValue() || '(unnamed)'}
          </button>
        ),
      }),
      ch.accessor('email', { header: 'Email' }),
      ch.accessor('roomNo', { header: 'Room No.' }),
      ch.accessor('isContactPerson', {
        header: 'Is Contact Person',
        cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      }),
      ch.display({
        id: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              type="button"
              className="text-cyan-700 underline text-xs"
              onClick={() => loadGuestForEdit(row.original.id)}
              data-testid={`guest-edit-${row.original.id}`}
            >
              Edit
            </button>
            <button
              type="button"
              className="text-red-700 underline text-xs"
              onClick={() => {
                if (!window.confirm('Delete this guest?')) return
                removeGuest(row.original.id)
              }}
              data-testid={`guest-delete-${row.original.id}`}
            >
              Delete
            </button>
          </div>
        ),
      }),
    ],
    [loadGuestForEdit, removeGuest, onRowInfo]
  )

  // Recompose fullName on render so edits stay consistent with Title/First/Last.
  const rows = useMemo(
    () =>
      list.map((g) => ({
        ...g,
        fullName:
          g.fullName ||
          [g.title, g.firstName, g.lastName].map((p) => String(p || '').trim()).filter(Boolean).join(' '),
      })),
    [list]
  )

  const table = useReactTable({
    data: rows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <section
      className="rounded border border-slate-200 bg-white p-4 overflow-x-auto"
      aria-label="Guest List"
    >
      <h3 className="text-base font-semibold mb-2">Guest List</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No guests added yet.</p>
      ) : (
        <table className="w-full text-sm" data-testid="guest-list-table">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="text-left border-b bg-slate-50">
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
