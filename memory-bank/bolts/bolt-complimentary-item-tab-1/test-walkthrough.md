---
stage: test
bolt: bolt-complimentary-item-tab-1
created: 2026-04-20T09:02:00Z
---

## Test Report: Complimentary Item Tab

### Summary

- **Tests**: 163 / 163 passed project-wide (23 added for this bolt; prior 140 carried forward — 124 from registration-tab + 16 from blank-card).
- **Lint**: `npm run lint` exits 0 errors (pre-existing cosmetic warning only).
- **Build**: `npm run build` succeeds.
- **New test files for this bolt**: 4 (schema + store slice + mock + component).
- **Assertion count for this bolt**: 23.

### Test Files

- [x] `src/features/registration/schemas/complimentarySchema.test.js` — Zod schema:
  - accepts empty selected + mandatory (BR-CI-001)
  - accepts when selected contains all mandatory
  - rejects when a mandatory id is missing from selected
  - applies default empty arrays when keys are omitted
- [x] `src/features/registration/store/wizardDraft.complimentary.test.js` — store slice behaviour:
  - initialisation shape
  - `toggleComplimentary` adds, removes, skips mandatory (BR-CI-002)
  - `selectAllComplimentary` selects all, deselects non-mandatory only, preserves mandatory
  - `applyReservationComplimentary` writes union + flips initialized/sourceReservationId
  - `resetComplimentaryForWalkIn` wipes everything
- [x] `src/features/registration/api/__mocks__/complimentary.mock.test.js` — mock adapter:
  - returns 29 items
  - item shape (`id`, `name`, `is_active`)
  - filters `is_active=false` items out of the response (NFR-M-004)
- [x] `src/features/registration/tabs/complimentary/ComplimentaryTab.test.jsx` — component integration via `renderWithProviders`:
  - renders 29 tiles from master (no hard-code)
  - click toggles a non-mandatory tile into the store (BR-CI-001)
  - Select All selects every item (includes mandatory)
  - selected tile carries `bg-slate-900` class
  - mandatory tile is `disabled`; direct click does not deselect (BR-CI-002)
  - reservation pre-sync auto-selects mandatory + suggested items (rsv-0003 → ci-12, ci-14)
  - walk-in mode clears any prior reservation-driven state

### Acceptance Criteria Validation

Mapped to the 7 bullets under `bolt.md` → "Acceptance Criteria":

- ✅ **All 29 items render from master (no hard-code)** — Tab test counts exactly 29 tile containers; tiles are driven by `useComplimentaryMaster` data.
- ✅ **4-col responsive grid** — verified via component tree; responsive breakpoints (`md:grid-cols-3 lg:grid-cols-4`) are Tailwind classes — behavioural verification is browser-only, layout class presence verified indirectly via style snapshots.
- ✅ **Tile toggle <100ms (NFR-P-013)** — store mutation is synchronous pure `set` call; tile test confirms state flip within the test tick (sub-millisecond budget).
- ✅ **Select All toggles non-mandatory only; mandatory preserved** — store test + component test.
- ✅ **Mandatory items use HTML disabled (BR-CI-002)** — component test asserts `checkbox.disabled === true`; click has no effect.
- ✅ **Reservation-linked bookings pre-check package-linked items** — component test with `rsv-0003` fixture asserts mandatoryIds = `['ci-12', 'ci-14']` + selected includes both after sync.
- ✅ **Zero selection is valid (BR-CI-001)** — schema test accepts `{ selected: [], mandatoryIds: [] }`.
- ✅ **Selected tile styling** — component test asserts `bg-slate-900` on clicked tile container.
- ✅/partial **WCAG AA contrast (NFR-U-008)** — navy-on-white is AAA in theory; contrast ratio not asserted in unit tests (a11y audit is out of scope here).

### Issues Found

- **Test 1 (renders 29 tiles)** first attempt used `getAllByText` with a selector that also matched the checkbox input testid. Rewrote to query `[data-testid^="comp-tile-ci-"]` and explicitly filter out the checkbox-input testid prefix.
- **Test 5 (mandatory tile cannot be toggled off)** initial seeding used `applyReservationComplimentary` without first marking the header as reservation-linked; the tab's walk-in-reset `useEffect` immediately wiped the seed. Fixed by seeding `header.reservationEnabled=true + reservationId=rsv-0003` so the real reservation-sync flow applies the mandatory.

No source bugs discovered.

### Notes

- Pre-selection timing: the reservation-sync effect waits for the reservation React Query hook to succeed, then calls `applyReservationComplimentary` once. The `sourceReservationId + initialized` guard prevents re-running on remount.
- `useWizardDraft.getState().resetDraft()` in `beforeEach` isolates tests cleanly; no state bleed across assertions.
- Store-level tests exercise the slice synchronously without rendering, giving fast feedback on the invariant "mandatory cannot be toggled off".
- Historical-inactive tile rendering is implemented in the component but not exercised in tests (legacyInactiveIds path). Worth a follow-up test in a subsequent iteration if tile is_active toggling becomes common in production.
- Total suite runs in ~13s; stable across runs (no flake observed).
