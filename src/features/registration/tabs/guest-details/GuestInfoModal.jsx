import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import { useGuestHistory } from '../../api/guests.js'

function Row({ label, value }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="col-span-2 text-slate-800">{value || '—'}</span>
    </div>
  )
}

/**
 * FR-008 — Guest Info modal. Read-only profile + stay history table.
 * The stay history is loaded via React Query; errors degrade gracefully while
 * the profile remains visible.
 *
 * @param {object} props
 * @param {boolean} props.open
 * @param {object|null} props.guest
 * @param {() => void} props.onClose
 */
export function GuestInfoModal({ open, guest, onClose }) {
  const { data: history = [], isFetching, isError } = useGuestHistory(guest ? guest.id : null)

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Guest Info</DialogTitle>
      <DialogContent dividers>
        {!guest ? (
          <p className="text-sm text-slate-500">No guest selected.</p>
        ) : (
          <div className="space-y-4">
            <section className="space-y-1">
              <h4 className="text-sm font-semibold">Basic</h4>
              <Row label="Full Name" value={guest.fullName} />
              <Row label="Gender" value={guest.gender} />
              <Row label="Date of Birth" value={guest.dateOfBirth} />
              <Row label="Room No." value={guest.roomNo} />
            </section>

            <section className="space-y-1">
              <h4 className="text-sm font-semibold">Contact</h4>
              <Row label="Email" value={guest.email} />
              <Row label="Phone" value={guest.phone} />
              <Row label="Company" value={guest.companyName} />
              <Row label="Address" value={guest.address} />
              <Row label="City" value={guest.city} />
              <Row label="Zip Code" value={guest.zipCode} />
              <Row label="Country" value={guest.country} />
              <Row label="Nationality" value={guest.nationality} />
              <Row label="National ID" value={guest.nationalId} />
              <Row label="Driving License" value={guest.drivingLicense} />
            </section>

            <section className="space-y-1">
              <h4 className="text-sm font-semibold">Visa</h4>
              <Row label="Visa Number" value={guest.visaNumber} />
              <Row label="Issue Date" value={guest.visaIssueDate} />
              <Row label="Expiry Date" value={guest.visaExpiryDate} />
            </section>

            <section className="space-y-1">
              <h4 className="text-sm font-semibold">Passport</h4>
              <Row label="Passport Number" value={guest.passportNumber} />
              <Row label="Issue Date" value={guest.passportIssueDate} />
              <Row label="Expiry Date" value={guest.passportExpiryDate} />
              <Row label="Issue Place" value="—" />
            </section>

            <section className="space-y-2" aria-label="Stay History">
              <h4 className="text-sm font-semibold">Stay History</h4>
              {isFetching ? <p className="text-xs text-slate-500">Loading history…</p> : null}
              {isError ? (
                <p className="text-xs text-red-600">Stay history unavailable.</p>
              ) : null}
              {!isFetching && history.length === 0 ? (
                <p className="text-xs text-slate-500">First-time guest.</p>
              ) : null}
              {history.length > 0 ? (
                <table className="w-full text-sm" data-testid="guest-history-table">
                  <thead>
                    <tr className="text-left border-b bg-slate-50">
                      <th className="py-2 px-2">Reg. No.</th>
                      <th className="py-2 px-2">Arrival</th>
                      <th className="py-2 px-2">Checkout</th>
                      <th className="py-2 px-2">Room Info</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.regNo} className="border-b last:border-0">
                        <td className="py-2 px-2">{h.regNo}</td>
                        <td className="py-2 px-2">{h.arrival}</td>
                        <td className="py-2 px-2">{h.checkout}</td>
                        <td className="py-2 px-2">{h.roomInfo}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : null}
            </section>
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}
