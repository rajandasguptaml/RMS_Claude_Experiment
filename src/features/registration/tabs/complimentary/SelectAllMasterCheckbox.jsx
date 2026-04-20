/**
 * Master checkbox that toggles all non-mandatory items.
 * Mandatory items are preserved regardless of this toggle.
 * Visual state is "indeterminate" when some but not all non-mandatory are selected.
 */
import { useEffect, useRef } from 'react'

export function SelectAllMasterCheckbox({
  totalNonMandatory,
  selectedNonMandatoryCount,
  onToggle,
}) {
  const ref = useRef(null)
  const allSelected = totalNonMandatory > 0 && selectedNonMandatoryCount === totalNonMandatory
  const someSelected =
    selectedNonMandatoryCount > 0 && selectedNonMandatoryCount < totalNonMandatory

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = someSelected
  }, [someSelected])

  return (
    <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium">
      <input
        ref={ref}
        type="checkbox"
        checked={allSelected}
        onChange={onToggle}
        className="h-4 w-4"
        data-testid="comp-select-all"
      />
      <span>Select All</span>
      <span className="ml-2 text-xs text-slate-500">
        ({selectedNonMandatoryCount}/{totalNonMandatory} optional)
      </span>
    </label>
  )
}
