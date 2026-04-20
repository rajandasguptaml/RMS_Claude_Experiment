import { SectionAClassification } from './SectionAClassification.jsx'
import { SectionBDeparture } from './SectionBDeparture.jsx'
import { SectionCCardGuarantee } from './SectionCCardGuarantee.jsx'

/**
 * FR-010 Others Information tab — orchestrates the 3 sections.
 * Cross-tab validation and Check-in orchestration belong to bolt-shell-and-check-in-1.
 */
export function OthersInformationTab() {
  return (
    <div className="space-y-4 p-4" aria-label="Others Information">
      <header>
        <h2 className="text-lg font-semibold">Others Information</h2>
        <p className="text-sm text-slate-500">
          Classification, departure logistics, and credit-card guarantee.
        </p>
      </header>
      <SectionAClassification />
      <SectionBDeparture />
      <SectionCCardGuarantee />
    </div>
  )
}

export default OthersInformationTab
