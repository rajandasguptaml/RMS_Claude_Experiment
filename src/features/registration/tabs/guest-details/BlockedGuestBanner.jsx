import { Alert, AlertTitle, Button } from '@mui/material'

/**
 * BR-GD-005 — Prominent inline warning when a retrieved guest is flagged
 * `blocked=true`. The banner surfaces BEFORE the form is populated; the user
 * must confirm to continue or cancel to dismiss the selection.
 *
 * @param {object} props
 * @param {object} props.guest — the guest record with at least { fullName }.
 * @param {string} [props.confirmText]
 * @param {() => void} props.onConfirm
 * @param {() => void} props.onCancel
 */
export function BlockedGuestBanner({ guest, confirmText, onConfirm, onCancel }) {
  if (!guest) return null
  return (
    <Alert
      severity="warning"
      variant="outlined"
      data-testid="blocked-guest-banner"
      aria-label="Blocked guest warning"
      action={
        <div className="flex gap-2">
          <Button size="small" onClick={onCancel} data-testid="blocked-cancel">
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="warning"
            onClick={onConfirm}
            data-testid="blocked-confirm"
          >
            {confirmText || 'Continue anyway'}
          </Button>
        </div>
      }
    >
      <AlertTitle>Blocked Guest</AlertTitle>
      <span>
        <strong>{guest.fullName || 'This guest'}</strong> is flagged as blocked. Please confirm
        before using this profile.
      </span>
    </Alert>
  )
}
