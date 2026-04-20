import { useState } from 'react'
import {
  FIELDS,
  POLICY_CLAUSES,
  CONSENT_STATEMENT,
  CHECKOUT_REMINDER_PREFIX,
} from '../constants/blankCard.js'
import { PROPERTY_BRANDING } from '../constants/propertyBranding.js'

const PRINT_STYLES = `
@media print {
  @page { size: A4 portrait; margin: 10mm; }
  body { margin: 0; }
  .no-print { display: none !important; }
  .card-root { width: 100%; max-width: none; }
  .signature-block, .policy-block { page-break-inside: avoid; }
}
.card-root { color: #000; font-size: 11pt; line-height: 1.35; }
.card-root .field-box {
  border-bottom: 1.5pt solid #000;
  min-height: 18pt;
  padding: 2pt 4pt;
}
.card-root .field-label { font-size: 9pt; }
.card-root .signature-line {
  border-top: 1.5pt solid #000;
  height: 36pt;
}
`

function FieldCell({ label, required, fullWidth }) {
  return (
    <div className={fullWidth ? 'col-span-3' : 'col-span-1'}>
      <div className="field-label text-[9pt] uppercase tracking-wide">
        {label}
        {required ? <span className="ml-1 text-red-600">*</span> : null}
      </div>
      <div className="field-box" aria-label={label} />
    </div>
  )
}

function PolicyItem({ index, clause }) {
  const isObj = typeof clause === 'object'
  const text = isObj ? clause.text : clause
  const bold = isObj && clause.bold
  return (
    <li className={bold ? 'font-bold' : undefined}>
      <span className="mr-1">{index + 1}.</span>
      {text}
    </li>
  )
}

export function BlankRegistrationCard() {
  const [logoFailed, setLogoFailed] = useState(false)

  return (
    <>
      <style>{PRINT_STYLES}</style>
      <main className="card-root mx-auto max-w-[210mm] bg-white p-[10mm] print:p-0">
        <header className="mb-3 text-center">
          {logoFailed ? (
            <div className="text-lg font-semibold">{PROPERTY_BRANDING.name}</div>
          ) : (
            <img
              src={PROPERTY_BRANDING.logoSrc}
              alt={PROPERTY_BRANDING.logoAlt}
              onError={() => setLogoFailed(true)}
              className="mx-auto h-12"
            />
          )}
          <h3 className="mt-1 text-[13pt] font-semibold">{PROPERTY_BRANDING.name}</h3>
          <div className="text-[9pt]">{PROPERTY_BRANDING.address}</div>
          <div className="text-[9pt]">
            {PROPERTY_BRANDING.hotlines.map((h) => (
              <span key={h} className="mx-2">
                {h}
              </span>
            ))}
          </div>
          <div className="text-[9pt]">
            {PROPERTY_BRANDING.website} · {PROPERTY_BRANDING.email}
          </div>
        </header>

        <div className="mb-3 flex items-baseline justify-between border-t border-b border-black py-1">
          <h1 className="text-[16pt] font-semibold uppercase">Pre Registration Card</h1>
          <div className="flex items-center gap-2">
            <span className="field-label">Room No</span>
            <span className="field-box inline-block w-[120pt]" aria-label="Room No" />
          </div>
        </div>

        <section
          className="mb-3 grid grid-cols-3 gap-x-4 gap-y-2"
          aria-label="Guest registration fields"
        >
          {FIELDS.map((f) => (
            <FieldCell key={f.label} {...f} />
          ))}
        </section>

        <section className="policy-block mb-3 border-t border-black pt-2">
          <div className="mb-1 text-[10pt] font-semibold">Dear Guest, Please note the following:</div>
          <ol className="list-none pl-0 text-[9.5pt] leading-snug">
            {POLICY_CLAUSES.map((clause, i) => (
              <PolicyItem key={i} index={i} clause={clause} />
            ))}
          </ol>
        </section>

        <h2 className="mb-2 text-center text-[10pt]">{CONSENT_STATEMENT}</h2>

        <section className="signature-block grid grid-cols-2 gap-6 pt-6">
          <div>
            <div className="signature-line" />
            <div className="field-label mt-1 text-center">
              Checked in By<span className="ml-1 text-red-600">*</span>
            </div>
          </div>
          <div>
            <div className="signature-line" />
            <div className="field-label mt-1 text-center">
              Guest Signature<span className="ml-1 text-red-600">*</span>
            </div>
          </div>
        </section>

        <div className="mt-4 text-[9.5pt]">
          Check-In at <span className="inline-block w-[48pt] border-b border-black" />
          HRS. Check-Out at <span className="inline-block w-[48pt] border-b border-black" />
          HRS.
        </div>

        <div className="mt-3 border-t border-black pt-2 text-center font-bold">
          {CHECKOUT_REMINDER_PREFIX} <span>{PROPERTY_BRANDING.checkOutTimeLabel}</span> HRS.
        </div>
      </main>
    </>
  )
}

export default BlankRegistrationCard
