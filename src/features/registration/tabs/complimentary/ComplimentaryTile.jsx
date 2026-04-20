import { Check } from 'lucide-react'
import { cx } from '../../../../shared/lib/conditional.js'

/**
 * A single complimentary item tile.
 * - Selected: navy bg, white text, check icon.
 * - Unselected: white bg, border, empty.
 * - Mandatory: disabled + "Required" badge. Cannot be toggled off (BR-CI-002).
 * - Inactive+legacy: the tile is rendered read-only with an "(inactive)" badge.
 */
export function ComplimentaryTile({
  item,
  selected,
  mandatory,
  inactive = false,
  onToggle,
}) {
  const disabled = mandatory || inactive
  const label = inactive ? `${item.name} (inactive)` : item.name

  return (
    <label
      className={cx(
        'flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors',
        selected
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-300 bg-white text-slate-900',
        disabled ? 'cursor-not-allowed opacity-95' : 'cursor-pointer hover:border-slate-500'
      )}
      aria-label={label}
      data-testid={`comp-tile-${item.id}`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={selected}
        disabled={disabled}
        onChange={() => !disabled && onToggle(item.id)}
        data-testid={`comp-tile-checkbox-${item.id}`}
      />
      <span
        className={cx(
          'inline-flex h-4 w-4 flex-none items-center justify-center rounded border',
          selected ? 'border-white bg-white/20' : 'border-slate-400 bg-white'
        )}
        aria-hidden="true"
      >
        {selected ? <Check size={12} className="text-white" /> : null}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {mandatory ? (
        <span
          className={cx(
            'rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase',
            selected ? 'bg-white/25 text-white' : 'bg-slate-900 text-white'
          )}
        >
          Required
        </span>
      ) : null}
    </label>
  )
}
