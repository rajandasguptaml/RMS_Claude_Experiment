import { useState } from 'react'
import { useWizardDraft } from '../../store/wizardDraft.js'
import { CARD_TYPES } from '../../schemas/othersInformationSchema.js'
import { tokenize, scrubTokenizeError, isCardExpiryInPast } from '../../api/tokenization.js'

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
const nowYear = new Date().getFullYear()
const YEARS = Array.from({ length: 15 }, (_, i) => String(nowYear + i))

/**
 * FR-010 Section C — credit-card guarantee.
 *
 * PCI discipline (non-negotiable):
 *  - Raw PAN is held ONLY in this component's local `useState`.
 *  - The Zustand store never has a `pan` field; store actions strip it (belt-and-braces).
 *  - PAN is passed once to `tokenize()` on the explicit "Tokenize" click.
 *  - On success, local PAN state is cleared and the store receives `{ token, last4 }` only.
 *  - All inputs use `autocomplete="off"` except the cardholder name (`cc-name`).
 */
export function SectionCCardGuarantee() {
  const cardGuarantee = useWizardDraft((s) => s.registration.othersInformation.cardGuarantee)
  const setCard = useWizardDraft((s) => s.setCardGuaranteeTokenized)
  const clearCard = useWizardDraft((s) => s.clearCardGuarantee)

  // Raw PAN — component local only. Never goes into the store.
  const [pan, setPan] = useState('')
  const [isTokenizing, setIsTokenizing] = useState(false)
  const [error, setError] = useState(null)

  const expiryPast =
    cardGuarantee.expiryMonth &&
    cardGuarantee.expiryYear &&
    isCardExpiryInPast(cardGuarantee.expiryMonth, cardGuarantee.expiryYear)

  const canTokenize =
    cardGuarantee.cardType !== '' && pan.length >= 13 && cardGuarantee.expiryMonth && cardGuarantee.expiryYear && !expiryPast

  const onTokenize = async () => {
    setError(null)
    setIsTokenizing(true)
    try {
      const { token, last4 } = await tokenize({
        pan,
        expiryMonth: cardGuarantee.expiryMonth,
        expiryYear: cardGuarantee.expiryYear,
      })
      setCard({ token, last4 })
      setPan('')
    } catch (err) {
      setError(scrubTokenizeError(err))
    } finally {
      setIsTokenizing(false)
    }
  }

  const onRemove = () => {
    clearCard()
    setPan('')
    setError(null)
  }

  return (
    <section className="space-y-4 rounded-md border border-slate-200 p-4" aria-label="Section C — Credit Card Information">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-semibold">Credit Card Information</h3>
        <span className="text-xs text-slate-500">Guarantee only — not a payment.</span>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Card Type</span>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={cardGuarantee.cardType}
            onChange={(e) => setCard({ cardType: e.target.value })}
            data-testid="card-type"
          >
            <option value="">-- Please Select --</option>
            {CARD_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Card Holder Name</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={cardGuarantee.cardHolderName}
            onChange={(e) => setCard({ cardHolderName: e.target.value })}
            autoComplete="cc-name"
            data-testid="card-holder-name"
          />
        </label>

        <label className="text-sm md:col-span-1">
          <span className="mb-1 block text-slate-600">Card Reference</span>
          <input
            type="text"
            className="w-full rounded border border-slate-300 px-2 py-1.5"
            value={cardGuarantee.cardReference}
            onChange={(e) => setCard({ cardReference: e.target.value })}
            autoComplete="off"
            data-testid="card-reference"
          />
        </label>

        <div className="text-sm md:col-span-2">
          <span className="mb-1 block text-slate-600">Card Number</span>
          {cardGuarantee.token ? (
            <div className="flex items-center gap-3">
              <span
                className="rounded border border-slate-300 bg-slate-50 px-2 py-1.5 font-mono text-slate-900"
                data-testid="card-number-masked"
              >
                {`****-****-****-${cardGuarantee.last4 || 'xxxx'}`}
              </span>
              <button
                type="button"
                className="rounded border border-slate-400 px-2 py-1 text-xs hover:bg-slate-100"
                onClick={onRemove}
                data-testid="card-remove"
              >
                Remove
              </button>
            </div>
          ) : (
            <input
              type="text"
              className="w-full rounded border border-slate-300 px-2 py-1.5 font-mono"
              value={pan}
              onChange={(e) => setPan(e.target.value)}
              autoComplete="off"
              inputMode="numeric"
              placeholder="Enter card number"
              data-testid="card-number-input"
            />
          )}
        </div>

        <label className="text-sm">
          <span className="mb-1 block text-slate-600">Expiry (MM / YYYY)</span>
          <div className="flex gap-2">
            <select
              className="rounded border border-slate-300 px-2 py-1.5"
              value={cardGuarantee.expiryMonth}
              onChange={(e) => setCard({ expiryMonth: e.target.value })}
              data-testid="expiry-month"
            >
              <option value="">MM</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              className="rounded border border-slate-300 px-2 py-1.5"
              value={cardGuarantee.expiryYear}
              onChange={(e) => setCard({ expiryYear: e.target.value })}
              data-testid="expiry-year"
            >
              <option value="">YYYY</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          {expiryPast ? (
            <span className="mt-1 block text-xs text-red-600">Expiry is in the past.</span>
          ) : null}
        </label>
      </div>

      {!cardGuarantee.token ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!canTokenize || isTokenizing}
            onClick={onTokenize}
            className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white disabled:bg-slate-400"
            data-testid="card-tokenize"
          >
            {isTokenizing ? 'Tokenizing…' : 'Tokenize Card'}
          </button>
          {error ? (
            <span className="text-xs text-red-600" data-testid="tokenize-error">
              {error.message}
            </span>
          ) : null}
        </div>
      ) : (
        <p className="text-xs text-slate-500" data-testid="card-tokenized-indicator">
          Card tokenized. Raw number is no longer held in this form.
        </p>
      )}
    </section>
  )
}
