import { useMemo } from 'react'
import { useWizardDraft } from '../../store/wizardDraft.js'
import {
  useCompanyMaster,
  useCurrencyMaster,
} from '../../api/masters.js'
import { useReservationSearch } from '../../api/reservations.js'
import { paymentModeOptions, payForValues } from '../../schemas/headerSchema.js'
import { diffNights, isAfterISO } from '../../../../shared/lib/date.js'

/**
 * HeaderSection - dates, reservation link, listed company, currency.
 * Stories: 001 (dates), 002 (reservation), 003 (listed company).
 */
export function HeaderSection() {
  const header = useWizardDraft((s) => s.registration.header)
  const setHeader = useWizardDraft((s) => s.setHeader)
  const resetCompanyFields = useWizardDraft((s) => s.resetCompanyFields)

  const { data: companies = [] } = useCompanyMaster()
  const { data: currencies = [] } = useCurrencyMaster()
  const { data: reservations = [] } = useReservationSearch('')

  const dateError = useMemo(() => {
    if (!header.checkInDate || !header.departureDate) return ''
    if (!isAfterISO(header.departureDate, header.checkInDate)) {
      return 'Departure must be after Check-In'
    }
    return ''
  }, [header.checkInDate, header.departureDate])

  const onReservationToggle = (checked) => {
    setHeader({ reservationEnabled: checked, reservationId: checked ? header.reservationId : null })
  }

  const onReservationPick = (id) => {
    const rsv = reservations.find((r) => r.id === id)
    if (!rsv) {
      setHeader({ reservationId: null })
      return
    }
    setHeader({
      reservationId: rsv.id,
      checkInDate: rsv.checkInDate,
      departureDate: rsv.departureDate,
      currency: rsv.currency,
      totalNights: diffNights(rsv.checkInDate, rsv.departureDate),
    })
  }

  const onCompanyToggle = (checked) => {
    if (!checked) {
      resetCompanyFields()
    }
    setHeader({ listedCompany: checked })
  }

  const onCompanyPick = (id) => {
    const co = companies.find((c) => c.id === id)
    if (!co) {
      setHeader({ companyId: null })
      return
    }
    setHeader({
      companyId: co.id,
      contactPerson: co.contactPerson || '',
      mobile: co.mobile || '',
      paymentMode: co.defaultPaymentMode || '',
      payFor: co.defaultPayFor || '',
    })
  }

  const onCurrencyPick = (code) => {
    const ccy = currencies.find((c) => c.code === code)
    setHeader({ currency: code, conversionRate: ccy?.conversionRate || 1 })
  }

  return (
    <section className="rounded border border-gray-200 p-4 bg-white">
      <h2 className="text-lg font-semibold mb-3">Header</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-2 flex items-center gap-2">
          <input
            id="hdr-rsv-toggle"
            type="checkbox"
            checked={header.reservationEnabled}
            onChange={(e) => onReservationToggle(e.target.checked)}
          />
          <label htmlFor="hdr-rsv-toggle">Reservation</label>
          <select
            className="ml-2 border rounded px-2 py-1 flex-1 disabled:bg-gray-100"
            disabled={!header.reservationEnabled}
            value={header.reservationId || ''}
            onChange={(e) => onReservationPick(e.target.value)}
          >
            <option value="">-- Select reservation --</option>
            {reservations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code} — {r.guestName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm">Check-In Date</label>
          {/* Open Q #1: read-only per plan decision */}
          <input
            type="date"
            className="w-full border rounded px-2 py-1 bg-gray-50"
            value={header.checkInDate}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm">Check-In Time</label>
          <input
            type="time"
            className="w-full border rounded px-2 py-1"
            value={header.checkInTime}
            onChange={(e) => setHeader({ checkInTime: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm">Departure Date</label>
          <input
            type="date"
            className="w-full border rounded px-2 py-1"
            value={header.departureDate}
            onChange={(e) => setHeader({ departureDate: e.target.value })}
          />
          {dateError && <p className="text-xs text-red-600 mt-1">{dateError}</p>}
        </div>
        <div>
          <label className="block text-sm">Checkout Time</label>
          <input
            type="time"
            className="w-full border rounded px-2 py-1 bg-gray-50"
            value={header.checkoutTime}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm">Total Nights</label>
          <input
            type="number"
            min={1}
            className="w-full border rounded px-2 py-1 disabled:bg-gray-50"
            value={header.totalNights}
            disabled={!header.manualNights}
            onChange={(e) => setHeader({ totalNights: Number(e.target.value) || 0 })}
          />
          <label className="text-xs flex items-center gap-1 mt-1">
            <input
              type="checkbox"
              checked={header.manualNights}
              onChange={(e) => setHeader({ manualNights: e.target.checked })}
            />
            Manual override
          </label>
        </div>
        <div>
          <label className="block text-sm">Currency</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={header.currency}
            onChange={(e) => onCurrencyPick(e.target.value)}
          >
            {currencies.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm">Conversion Rate</label>
          <input
            type="number"
            className="w-full border rounded px-2 py-1 bg-gray-50"
            value={header.conversionRate}
            readOnly
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <input
          id="hdr-co-toggle"
          type="checkbox"
          checked={header.listedCompany}
          onChange={(e) => onCompanyToggle(e.target.checked)}
        />
        <label htmlFor="hdr-co-toggle">Listed Company</label>
      </div>

      {header.listedCompany && (
        <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm">Company</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={header.companyId || ''}
              onChange={(e) => onCompanyPick(e.target.value)}
            >
              <option value="">-- Select company --</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Contact Person</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={header.contactPerson}
              onChange={(e) => setHeader({ contactPerson: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm">Mobile</label>
            <input
              className="w-full border rounded px-2 py-1"
              value={header.mobile}
              onChange={(e) => setHeader({ mobile: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm">Payment Mode</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={header.paymentMode}
              onChange={(e) => setHeader({ paymentMode: e.target.value })}
            >
              <option value="">-- Select --</option>
              {paymentModeOptions.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm">Pay For</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={header.payFor}
              onChange={(e) => setHeader({ payFor: e.target.value })}
            >
              <option value="">-- Select --</option>
              {payForValues.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </section>
  )
}
