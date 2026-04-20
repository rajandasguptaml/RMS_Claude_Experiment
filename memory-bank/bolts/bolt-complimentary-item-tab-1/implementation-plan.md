---
stage: plan
bolt: bolt-complimentary-item-tab-1
unit: 004-complimentary-item-tab
intent: 001-room-registration
created: 2026-04-20T08:52:00Z
---

# Implementation Plan: Complimentary Item Tab

## Objective

Deliver FR-009 — the Complimentary Item tab: a 4-column responsive grid of 29 service tiles, with Select All behaviour, package-mandatory immutable locks, and pre-selection from reservation packages. All items sourced from the existing Complimentary Items master (fixtures already staged under `src/features/registration/fixtures/complimentaryItems.js` during Wave 1).

## Deliverables

### Source code (under `src/features/registration/`)
- **Schema**: `schemas/complimentarySchema.js` — Zod schema for the comp-item selection state (`{ selected: string[] }` plus `mandatoryIds: string[]` passed in by reservation context).
- **Store slice**: extend [wizardDraft.js](src/features/registration/store/wizardDraft.js) to expose `complimentary` state: `{ selected: string[], mandatoryIds: string[], initialized: boolean }` and actions `{ setComplimentarySelection, toggleComplimentary, selectAllComplimentary, clearComplimentary, applyReservationComplimentary }`.
- **API layer**:
  - Extend `api/masters.js` with `useComplimentaryMaster()` → React Query hook returning only `is_active=true` items (long staleTime).
  - Extend `api/__mocks__/masters.mock.js` with a mirror mock for comp items (uses existing 29-item fixture).
  - Extend `api/reservations.js` + its mock to return `suggested_item_ids: string[]` per reservation (abstracts Open Question #3 — backend decides which package drives mandatories; frontend just consumes the list).
- **Components**: `tabs/complimentary/`
  - `ComplimentaryTab.jsx` — grid container + Select All + reservation-sync side-effect
  - `ComplimentaryTile.jsx` — single tile (checkbox + label; selected = navy bg/white text/check; mandatory = HTML `disabled`)
  - `SelectAllMasterCheckbox.jsx` — master toggle; affects non-mandatory only
- **Index barrel**: export `ComplimentaryTab` from `features/registration/index.js`.
- **Dev route**: add `/dev/complimentary-tab` to App.jsx for isolation testing.

### Artifacts
- [x] `implementation-plan.md` (this file)
- [ ] `implementation-walkthrough.md` (Stage 2)
- [ ] `test-walkthrough.md` (Stage 3)

## Dependencies

### Already installed
- `react`, `zustand`, `@tanstack/react-query`, `@mui/material` (checkbox/typography), `tailwindcss`, `lucide-react` (Check icon), `clsx`.

### Fixtures / masters already staged
- `src/features/registration/fixtures/complimentaryItems.js` — 29 items seeded during Wave 1 (subagent staged for downstream bolts).
- Need to add an `is_active` flag and a `suggested_item_ids` mapping on the reservations fixtures. Additive — no breaking change.

### New runtime deps
- **None.**

## Technical Approach

### Data shape
- **Item**: `{ id: string, label: string, is_active: boolean, category?: string }`.
- **Store**: single array of selected `id` strings + separate array of `mandatoryIds`. Derived "is-this-selected" is `selected.includes(id)`; derived "is-this-mandatory" is `mandatoryIds.includes(id)`.
- **Mandatory enforcement**: both at the store level (`toggleComplimentary` rejects toggles on mandatory IDs) and at the UI level (`disabled` attribute on the tile's checkbox) — belt-and-braces.

### Pre-selection flow
- When the user links a reservation in the Registration tab (Wave 1), that tab writes the reservation object into `wizardDraft.header.reservationId` + caches the fetched reservation.
- `ComplimentaryTab` reads the `reservationId`, fetches the reservation via `useReservation(reservationId)`, and on `success` calls `applyReservationComplimentary({ suggestedIds, mandatoryIds })` once (tracked by the `initialized` flag to avoid re-applying on remount or when the user deselects items).
- Walk-in bookings (no reservation) leave `mandatoryIds` empty — all tiles selectable.

### Performance
- Tile toggle: pure store mutation (Zustand `set`) — O(n) for `selected.filter()` / `selected.concat()`. n=29, sub-100µs. NFR-P-013 (<100ms) easily met.
- Select All: single store set passing the non-mandatory IDs. NFR-P-014 (<200ms) easily met.
- No server round-trips per toggle.

### Styling
- **Grid**: `grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3`.
- **Selected**: `bg-slate-900 text-white border-slate-900` + visible `Check` icon.
- **Unselected**: `bg-white text-slate-900 border-slate-300`.
- **Mandatory**: `opacity-90 cursor-not-allowed` + small "Required" badge.
- **WCAG AA contrast** — navy background `#0f172a` (slate-900) against white passes AAA.

### Edge cases
- **Inactive item in saved selection** (is_active=false after being linked historically): keep rendering as a "read-only-selected" tile with an "(inactive)" badge; Select All won't toggle it off. Documented in walkthrough.
- **Remount preservation**: because selection lives in Zustand (global), remounting `ComplimentaryTab` keeps state.
- **Reservation change mid-session**: when `reservationId` changes, reset `initialized` and re-apply `applyReservationComplimentary`.

### File / folder additions
```
src/features/registration/
  tabs/
    complimentary/
      ComplimentaryTab.jsx
      ComplimentaryTile.jsx
      SelectAllMasterCheckbox.jsx
  schemas/
    complimentarySchema.js
```

Plus small edits: `store/wizardDraft.js`, `api/masters.js`, `api/__mocks__/masters.mock.js`, `api/reservations.js`, `api/__mocks__/reservations.mock.js`, `App.jsx` (new dev route), `index.js` (barrel).

## Acceptance Criteria (bolt-level)

- [ ] All 29 items render from master (no hard-code in component).
- [ ] Grid is responsive: 2 cols mobile, 3 tablet, 4 desktop.
- [ ] Tile toggle flips selected/unselected within 100ms.
- [ ] Select All selects all non-mandatory items; clicking again deselects only non-mandatory; mandatory items stay checked.
- [ ] Mandatory items render `disabled` attribute and a "Required" badge.
- [ ] Selecting a reservation auto-pre-selects `suggested_item_ids` exactly once per reservation change.
- [ ] Walk-in bookings leave all items selectable and unselected by default.
- [ ] Zero selection is valid (does not block navigation or Check-in).
- [ ] Selected tile styling: dark navy bg, white text, check icon visible; WCAG AA contrast.
- [ ] Inactive items (is_active=false) not shown in master list, but historically-saved selections render as "(inactive)" read-only.

## Testing Scope (Stage 3)

- **Schema tests**: `complimentarySchema` accepts empty array, accepts valid IDs, rejects non-string entries.
- **Store tests**: `toggleComplimentary` skips mandatory IDs; `selectAllComplimentary` toggles only non-mandatory; `applyReservationComplimentary` sets both `selected` and `mandatoryIds` and flips `initialized`.
- **Mock-adapter tests**: `useComplimentaryMaster` mock returns 29 items; all `is_active: true`.
- **Component tests (via renderWithProviders)**:
  - renders 29 tiles with labels from the master
  - clicking a non-mandatory tile toggles it on/off in the store
  - clicking a mandatory tile has no effect (disabled)
  - Select All toggles non-mandatory only
  - selected tile carries the navy-bg class
  - reservation-change triggers `applyReservationComplimentary` once

Coverage target: ≥80% lines for this unit (file-ratio — no coverage tooling per existing constraint).

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Open Q #3 (mandatory trigger unclear) | Backend owns this via `suggested_item_ids` + `mandatory_item_ids` on the reservation DTO. Frontend consumes opaquely. Documented in walkthrough. |
| Reservation change mid-session | `initialized` reset on `reservationId` change; re-apply pre-selection. |
| Large master (100+ items in future) | Grid scales; MUI autocomplete NOT needed; Tailwind grid handles wrap. |
| Historically-saved inactive item | Render read-only with badge; do not toggle; do not include in Select All. |

## Out of Scope

- Check-in submission wiring (shell bolt)
- Billing-engine suppression rules for complimentary flag (backend)
- Master-data admin UI (not requested)
- Package trigger mechanism on the backend (Open Q #3 — owned by backend)

## Completion Criteria

- [x] Stories reviewed (3/3)
- [x] Deliverables defined
- [x] Dependencies identified (zero new)
- [x] Acceptance criteria documented
- [x] Technical approach noted
- [ ] ⛔ **Human checkpoint — pending approval**
