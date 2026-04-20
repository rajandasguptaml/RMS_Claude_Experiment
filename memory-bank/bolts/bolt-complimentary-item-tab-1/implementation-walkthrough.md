---
stage: implement
bolt: bolt-complimentary-item-tab-1
created: 2026-04-20T08:58:00Z
---

## Implementation Walkthrough: Complimentary Item Tab

### Summary

Delivered FR-009 as a data-driven, responsive grid of complimentary service tiles. Added a `complimentary` slice to the shared `wizardDraft` store, a new `useComplimentaryMaster` React Query hook backed by the existing mock layer, reservation-driven pre-selection with an `initialized + sourceReservationId` guard, and belt-and-braces mandatory-item immutability (store-level rejection + HTML `disabled`). Three component files compose the tab; zero new runtime deps; lint + build + existing 140 tests remain green.

### Structure Overview

- New feature folder `src/features/registration/tabs/complimentary/` with three components: `ComplimentaryTab`, `ComplimentaryTile`, `SelectAllMasterCheckbox`.
- Schema co-located under `src/features/registration/schemas/complimentarySchema.js`.
- Store slice added to the existing wizard draft (no new Zustand store).
- Master data reached via the existing mocks pipeline — added `useComplimentaryMaster` hook and matching `fetchComplimentaryItems` mock.
- Reservation fixtures extended with `suggested_item_ids` and `mandatory_item_ids` (backend owns Open Question #3).
- Dev route `/dev/complimentary-tab` added for isolation testing.

### Completed Work

- [x] `src/features/registration/fixtures/complimentaryItems.js` — added `is_active` flag + `category` to all 29 items (NFR-M-004).
- [x] `src/features/registration/fixtures/reservations.js` — added `suggested_item_ids[]` and `mandatory_item_ids[]` on all 5 sample reservations.
- [x] `src/features/registration/api/__mocks__/masters.mock.js` — added `fetchComplimentaryItems` returning only `is_active=true` items.
- [x] `src/features/registration/api/masters.js` — added `useComplimentaryMaster` React Query hook.
- [x] `src/features/registration/store/wizardDraft.js` — added `complimentary` slice: `{ selected, mandatoryIds, initialized, sourceReservationId }` plus actions `toggleComplimentary`, `selectAllComplimentary`, `clearComplimentary`, `applyReservationComplimentary`, `resetComplimentaryForWalkIn`, and a `getComplimentary` selector.
- [x] `src/features/registration/schemas/complimentarySchema.js` — Zod schema with `.superRefine` ensuring mandatory IDs remain selected at submit.
- [x] `src/features/registration/tabs/complimentary/ComplimentaryTile.jsx` — single tile with selected / mandatory / inactive variants; keyboard-accessible `<input>` wrapped in a `<label>`.
- [x] `src/features/registration/tabs/complimentary/SelectAllMasterCheckbox.jsx` — master toggle with indeterminate state.
- [x] `src/features/registration/tabs/complimentary/ComplimentaryTab.jsx` — grid orchestrator + reservation-sync effects + walk-in reset.
- [x] `src/features/registration/index.js` — barrel exports for the three new components.
- [x] `src/App.jsx` — new dev route `/dev/complimentary-tab`.

### Key Decisions

- **Store-level + UI-level enforcement** of mandatory immutability. `toggleComplimentary` short-circuits on mandatory IDs; the tile also renders `disabled` on the underlying checkbox. Either mechanism alone would be sufficient; combining them makes the invariant cheap to prove.
- **`sourceReservationId` + `initialized` guard** on the complimentary slice. The pre-selection `useEffect` short-circuits when the current slice already matches the current reservation, so the user's subsequent deselections are never clobbered on remount.
- **Walk-in reset on mode flip**: if `reservationEnabled` becomes false while `sourceReservationId` is populated, the slice is wiped to defaults — avoids stale mandatory locks carrying over into a walk-in booking.
- **Active-only master filter at the fetch boundary** (`fetchComplimentaryItems` drops `is_active=false`). Historical selections that reference now-inactive items still render as read-only "(inactive)" tiles so saved registrations don't break (per NFR-M-004).
- **Select All indeterminate state** via `ref.current.indeterminate`. Mandatory items are never counted in "optional total" so the "(n/m optional)" label is accurate.
- **`role="group"` on the grid container** for assistive tech; each tile has an `aria-label` with the human-readable item name.
- **Backend owns Open Question #3** — suggested + mandatory IDs arrive on the reservation DTO. Frontend consumes opaquely. Documented on the reservation fixtures.

### Deviations from Plan

- No deviations of note. The `initialized` flag in the plan became `initialized + sourceReservationId` (two fields) so the guard keys off reservation identity rather than a single flag — strictly additive.
- Plan mentioned "Visual snapshot test" as a "consider" — Stage 3 tests will use focused behavioural assertions instead; easier to maintain when tile styling is tweaked.

### Dependencies Added

None. Built on `react`, `zustand`, `@tanstack/react-query`, `tailwindcss`, `lucide-react`, and `zod` — all already installed.

### Developer Notes

- `useComplimentaryMaster` uses the same `longStaleOpts` (30 min) as other masters; `refetchOnWindowFocus: false`.
- The tile's label wraps a hidden `<input>` with `className="sr-only"`. Clicking the label toggles the input (native behaviour). Tests that target `data-testid="comp-tile-checkbox-{id}"` talk to the input directly.
- `selectAllComplimentary` accepts the current list of active IDs rather than re-fetching them from the store. This keeps the action pure and deterministic; the component passes `activeIds` derived from the master query.
- Bundle size did not change materially — same size as prior build; no new deps linked.
- Smoke-test URL: `/dev/complimentary-tab` (walk-in mode; no pre-selection). To exercise reservation-driven pre-selection, wire a reservation on `/dev/registration-tab` first, then navigate — the wizard draft store is shared across routes.
