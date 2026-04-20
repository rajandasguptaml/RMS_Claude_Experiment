import { useState } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import { reverseRate } from '../../schemas/roomSchema.js'

/**
 * RrcModal - Reverse Rate Calculator.
 * Given a target inclusive total + the tax/charge rates, computes a Rack Rate.
 * Story 006.
 */
export function RrcModal({ open, onClose, defaults, onApply }) {
  const [target, setTarget] = useState('')
  const [scPct, setScPct] = useState(defaults?.scPct ?? 10)
  const [vatPct, setVatPct] = useState(defaults?.vatPct ?? 15)
  const [city, setCity] = useState(defaults?.city ?? 0)
  const [additional, setAdditional] = useState(defaults?.additional ?? 0)

  const targetNum = Number(target) || 0
  const rack = reverseRate(targetNum, {
    scPct: Number(scPct) || 0,
    vatPct: Number(vatPct) || 0,
    city: Number(city) || 0,
    additional: Number(additional) || 0,
  })

  const handleApply = () => {
    onApply(rack)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Reverse Rate Calculator</DialogTitle>
      <DialogContent dividers>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="col-span-2">
            <label className="block">Target Inclusive Total</label>
            <input
              type="number"
              min={0}
              className="w-full border rounded px-2 py-1"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div>
            <label className="block">SC %</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={scPct}
              onChange={(e) => setScPct(e.target.value)}
            />
          </div>
          <div>
            <label className="block">VAT %</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={vatPct}
              onChange={(e) => setVatPct(e.target.value)}
            />
          </div>
          <div>
            <label className="block">City</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div>
            <label className="block">Additional</label>
            <input
              type="number"
              className="w-full border rounded px-2 py-1"
              value={additional}
              onChange={(e) => setAdditional(e.target.value)}
            />
          </div>
          <div className="col-span-2 mt-2 p-2 bg-gray-50 rounded border">
            <span className="text-xs text-gray-600">Computed Rack Rate</span>
            <div className="text-lg font-semibold">{rack.toFixed(2)}</div>
          </div>
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleApply} disabled={!targetNum}>
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  )
}
