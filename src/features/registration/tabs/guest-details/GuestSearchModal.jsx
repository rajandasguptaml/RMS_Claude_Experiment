import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import { useGuestSearch } from '../../api/guests.js'
import { BlockedGuestBanner } from './BlockedGuestBanner.jsx'

const EMPTY_FILTERS = {
  guestName: '',
  companyName: '',
  email: '',
  mobile: '',
  nationalId: '',
  dob: '',
  passportNo: '',
  roomNo: '',
  regNo: '',
  fromDate: '',
  toDate: '',
}

/**
 * FR-008 — Guest Search modal with 11 filters (BR-SR-001 AND logic).
 *
 * Enters `submittedFilters` on Search click so the query only runs when the
 * operator submits. Selecting a blocked guest shows the banner before firing
 * the `onSelect` callback (BR-GD-005).
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {(guest: object) => void} props.onSelect
 */
export function GuestSearchModal({ open, onClose, onSelect }) {
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [submitted, setSubmitted] = useState(null)
  const [pendingBlocked, setPendingBlocked] = useState(null)

  const { data, isFetching, isError } = useGuestSearch(submitted, Boolean(submitted))

  const results = data ? data.guests : []
  const total = data ? data.total : 0

  const onChange = (k, v) => setFilters((f) => ({ ...f, [k]: v }))

  const onSearch = () => setSubmitted({ ...filters })

  const onClear = () => {
    setFilters(EMPTY_FILTERS)
    setSubmitted(null)
  }

  const onRowSelect = (g) => {
    if (g.blocked) {
      setPendingBlocked(g)
      return
    }
    onSelect(g)
    onClose()
  }

  const confirmBlocked = () => {
    if (pendingBlocked) onSelect(pendingBlocked)
    setPendingBlocked(null)
    onClose()
  }

  const cancelBlocked = () => setPendingBlocked(null)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle>Guest Search</DialogTitle>
      <DialogContent dividers>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {[
            ['guestName', 'Guest Name', 'text'],
            ['companyName', 'Company Name', 'text'],
            ['email', 'Email', 'text'],
            ['mobile', 'Mobile', 'text'],
            ['nationalId', 'National ID', 'text'],
            ['dob', 'Date of Birth', 'date'],
            ['passportNo', 'Passport No.', 'text'],
            ['roomNo', 'Room No.', 'text'],
            ['regNo', 'Reg. No.', 'text'],
            ['fromDate', 'From Date', 'date'],
            ['toDate', 'To Date', 'date'],
          ].map(([key, label, type]) => (
            <label key={key} className="text-sm">
              <span className="mb-1 block text-slate-600">{label}</span>
              <input
                type={type}
                className="w-full rounded border border-slate-300 px-2 py-1.5"
                value={filters[key]}
                onChange={(e) => onChange(key, e.target.value)}
                data-testid={`guest-search-${key}`}
              />
            </label>
          ))}
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onSearch}
            className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white"
            data-testid="guest-search-submit"
          >
            Search
          </button>
          <button
            type="button"
            onClick={onClear}
            className="rounded border border-slate-400 px-3 py-1.5 text-sm"
            data-testid="guest-search-clear"
          >
            Clear
          </button>
        </div>

        {pendingBlocked ? (
          <div className="mt-3">
            <BlockedGuestBanner
              guest={pendingBlocked}
              confirmText="Use this blocked guest?"
              onConfirm={confirmBlocked}
              onCancel={cancelBlocked}
            />
          </div>
        ) : null}

        <div className="mt-4 overflow-x-auto" aria-label="Guest Search Results">
          {isError ? (
            <p className="text-sm text-red-600">
              Search failed. Please try again or adjust your filters.
            </p>
          ) : null}
          {submitted && !isFetching && results.length === 0 ? (
            <p className="text-sm text-slate-500">No matches found.</p>
          ) : null}
          {isFetching ? (
            <p className="text-sm text-slate-500">Searching…</p>
          ) : null}
          {results.length > 0 ? (
            <>
              <p className="text-xs text-slate-500 mb-1">
                Showing {results.length} of {total}
                {total > results.length ? ' — narrow your search to see more.' : ''}
              </p>
              <table className="w-full text-sm" data-testid="guest-search-results">
                <thead>
                  <tr className="text-left border-b bg-slate-50">
                    <th className="py-2 px-2">Guest Name</th>
                    <th className="py-2 px-2">Country</th>
                    <th className="py-2 px-2">Phone</th>
                    <th className="py-2 px-2">Email</th>
                    <th className="py-2 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((g) => (
                    <tr key={g.id} className="border-b last:border-0">
                      <td className="py-2 px-2">
                        {g.fullName}
                        {g.blocked ? (
                          <span className="ml-2 rounded bg-red-100 px-1.5 py-0.5 text-xs text-red-700">
                            Blocked
                          </span>
                        ) : null}
                      </td>
                      <td className="py-2 px-2">{g.country}</td>
                      <td className="py-2 px-2">{g.phone}</td>
                      <td className="py-2 px-2">{g.email}</td>
                      <td className="py-2 px-2">
                        <button
                          type="button"
                          className="rounded bg-cyan-700 px-2 py-1 text-xs text-white"
                          onClick={() => onRowSelect(g)}
                          data-testid={`guest-search-select-${g.id}`}
                        >
                          Select Guest
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : null}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
