import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material'
import { useState } from 'react'
import { useAvailableRooms, useRoomLock } from '../../api/rooms.js'

/**
 * RoomListModal - shows available rooms for a type + date range.
 * On select: acquires optimistic lock. On 409 conflict: surfaces error (NFR-R-008).
 *
 * Story 005.
 */
export function RoomListModal({ open, onClose, typeId, from, to, onConfirm }) {
  const [selectedRoomId, setSelectedRoomId] = useState('')
  const [error, setError] = useState('')

  const { data: rooms = [], isLoading } = useAvailableRooms({
    typeId,
    from,
    to,
    enabled: open,
  })

  const lock = useRoomLock()

  const handleConfirm = async () => {
    setError('')
    if (!selectedRoomId) return
    try {
      const result = await lock.mutateAsync(selectedRoomId)
      const room = rooms.find((r) => r.id === selectedRoomId)
      onConfirm({
        roomId: room.id,
        roomNumber: room.number,
        lockToken: result.token,
      })
      setSelectedRoomId('')
      onClose()
    } catch (err) {
      if (err.status === 409) {
        setError('This room was just taken by another agent. Please pick another.')
      } else {
        setError(err.message || 'Failed to acquire room lock')
      }
    }
  }

  const handleClose = () => {
    setSelectedRoomId('')
    setError('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>Room List</DialogTitle>
      <DialogContent dividers>
        {isLoading && <p className="text-sm text-gray-500">Loading...</p>}
        {!isLoading && rooms.length === 0 && (
          <p className="text-sm text-gray-500">No rooms available for this type/date.</p>
        )}
        {!isLoading && rooms.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 w-16">Select</th>
                <th className="py-2">Room Number</th>
                <th className="py-2">Floor</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((r) => (
                <tr key={r.id} className="border-b last:border-0">
                  <td className="py-2">
                    <input
                      type="radio"
                      name="room-pick"
                      value={r.id}
                      checked={selectedRoomId === r.id}
                      onChange={() => setSelectedRoomId(r.id)}
                    />
                  </td>
                  <td className="py-2">{r.number}</td>
                  <td className="py-2">{r.floor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Close</Button>
        <Button
          variant="contained"
          disabled={!selectedRoomId || lock.isPending}
          onClick={handleConfirm}
        >
          {lock.isPending ? 'Locking...' : 'Select'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
