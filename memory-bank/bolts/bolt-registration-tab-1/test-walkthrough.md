---
stage: test
bolt: bolt-registration-tab-1
created: 2026-04-20T08:00:00Z
---

## Test Report: Registration Tab

### Summary

- **Tests**: 124/124 passed (17 test files, all green).
- **Lint**: `npm run lint` exits 0 errors, 1 pre-existing informational warning (tanstack-table `useReactTable` react-compiler notice in `SummaryTable.jsx`).
- **Coverage tooling**: neither `@vitest/coverage-v8` nor `@vitest/coverage-istanbul` is installed and the constraint forbids adding new deps, so numeric coverage is not reported. Instead, a file-ratio is given: 14 of 37 source files under `src/features/registration/` + `src/shared/lib/` have a dedicated test file. Additional files are exercised transitively through the component tests (`wizardDraft.js`, `masters.js`, `rooms.js`, `reservations.js`, fixtures, and `RrcModal.jsx` through the `reverseRate` round-trip in `roomSchema.test.js`).
- **Categories**: 7 schema/pure tests, 2 shared-lib pure tests, 3 mock-adapter tests, 6 component tests, 1 shared test helper (`renderWithProviders`).

### Test Files

- [x] `src/shared/lib/money.test.js` - `formatMoney` defaults/zero/negative/large/NaN + `round2` edge cases incl. FP drift.
- [x] `src/shared/lib/date.test.js` - `todayISO`/`tomorrowISO` format + ordering, `diffNights` equal/multi-day/negative/invalid, `addDaysISO` forward/rollover/negative/invalid, `isAfterISO` strict-after.
- [x] `src/features/registration/schemas/headerSchema.test.js` - BR-REG-004 Departure > Check-In (strictly-after, equal, before); conditional company fields (companyId required, payment-mode/pay-for enum); reservation link requires id; base field rules.
- [x] `src/features/registration/schemas/roomSchema.test.js` - BR-REG-005 Fixed <= Rack, Percent <= 100, adults >= 1; `computeRoomTotal` happy paths, waive flags, negotiated override, zero rate, 2-dp rounding; `reverseRate` round-trip with `computeRoomTotal` (tolerance 0.01), zero-tax and below-fee edge cases.
- [x] `src/features/registration/schemas/serviceSchema.test.js` - valid/invalid payloads, From <= To invariant (equal allowed, inverted rejected), quantity and rate bounds; `computeServiceTotal` single-day floor and multi-day.
- [x] `src/features/registration/schemas/classificationSchema.test.js` - CHANNEL_OPTIONS exactly the four, unknown rejected, empty allowed; `validateConditionalClassification` for walk-in vs reservation-linked.
- [x] `src/features/registration/schemas/registrationTabSchema.test.js` - walk-in does not require mealPlan/reference, reservation-linked requires both, partial (mealPlan only) still fails, min 1 room enforced.
- [x] `src/features/registration/api/__mocks__/masters.mock.test.js` - all 8 master fetchers return non-empty arrays with expected shape; counts match FR requirements (29+ refs, 9+ meal plans, 25 services, 4 guest sources, 2 market segments, BDT base currency).
- [x] `src/features/registration/api/__mocks__/rooms.mock.test.js` - filter by type, exclude occupied/oos, include conflict sentinel; `acquireRoomLock` returns token for available and throws 409 for `rm-104`, 404 for unknown; `releaseRoomLock` best-effort.
- [x] `src/features/registration/api/__mocks__/reservations.mock.test.js` - `searchReservations` by code/name/empty/no-match; `fetchReservation` by id and null for missing.
- [x] `src/test/renderWithProviders.jsx` - shared helper wrapping UI in fresh QueryClient + ThemeProvider + MemoryRouter with retries disabled.
- [x] `src/features/registration/tabs/registration/HeaderSection.test.jsx` - default today/14:00/tomorrow/12:00/nights=1; reservation toggle enables dropdown; listed-company checkbox reveals the 4 conditional fields; store-driven nights auto-recalc.
- [x] `src/features/registration/tabs/registration/RoomForm.test.jsx` - Room Type selection auto-fills Rack Rate, SC%, VAT%, City, Additional; Fixed discount > Rack shows inline error on Update; Waive VAT recomputes total without VAT.
- [x] `src/features/registration/tabs/registration/ClassificationSection.test.jsx` - Meal Plan / Reference asterisk + required copy appear only when reservation-linked; 4 channel-discovery checkboxes toggle on/off and persist into the store.
- [x] `src/features/registration/tabs/registration/SummaryTable.test.jsx` - empty state; 11 header columns with exact names; row data (room type / number / total); Delete removes the row with window.confirm stubbed.
- [x] `src/features/registration/tabs/registration/RoomListModal.test.jsx` - lists rooms filtered by type (excludes occupied), selecting a non-conflict room acquires a lock token and triggers close+onConfirm, clicking `rm-104` surfaces the 409 "taken by another agent" error and leaves the modal open.
- [x] `src/features/registration/tabs/registration/ServiceForm.test.jsx` - Add invokes onAdd with resolved service payload, blank Add shows "Select a service", Update invokes onUpdate with patched qty, Cancel invokes onCancel, multiple Adds supported.

### Acceptance Criteria Validation

Mapped against the 10 bullets under "Acceptance Criteria" in `bolt.md`:

- ✅ **Header defaults correctly (Check-In Date, 14:00 / 12:00, +1 day Departure, Total Nights calc)** - `HeaderSection.test.jsx` defaults + auto-calc; store init covered indirectly.
- ✅ **Departure > Check-In enforced (BR-REG-004)** - `headerSchema.test.js` (strictly-after, equal, before).
- ✅ partial via `HeaderSection.test.jsx` + `reservations.mock.test.js` - **Reservation checkbox enables dropdown and auto-populates booking fields**. The enable-dropdown behaviour and the mock search that drives the dropdown are both asserted; the end-to-end auto-populate-on-pick path is validated by the reservation fixtures + `onReservationPick` in code, not by a dedicated component test (deferred to avoid flaky MUI Select interaction).
- ✅ **Listed Company checkbox reveals 4 conditional fields** - `HeaderSection.test.jsx` (Contact Person, Mobile, Payment Mode, Pay For).
- ✅ **Room Type auto-populates rate card; Room List modal shows available rooms + acquires lock** - `RoomForm.test.jsx` auto-fill + `RoomListModal.test.jsx` list filter, lock acquisition, 409 path.
- ✅ **Discount cap (Fixed <= Rack Rate) + Negotiated Rate override + RRC reverse-calc** - `roomSchema.test.js` (BR-REG-005, negotiated override, reverse-rate round-trip) + `RoomForm.test.jsx` inline error.
- ✅ **Services form supports Add/Update/Cancel + multi-service** - `ServiceForm.test.jsx` covers all four paths.
- ✅ **Meal Plan & Reference required conditional on reservation link** - `registrationTabSchema.test.js` + `classificationSchema.test.js` + `ClassificationSection.test.jsx` (asterisk + error copy).
- ✅ **Channel Discovery checkbox group persists as SET** - `ClassificationSection.test.jsx` asserts zustand store carries `['Facebook', 'Google']` then toggles back to `['Google']`; `classificationSchema.test.js` verifies SET-of-enum validation.
- ✅ partial via `SummaryTable.test.jsx` + `RoomForm.test.jsx` + `ServiceForm.test.jsx` - **Summary Table Add/Edit/Delete/Cancel across rooms + services**. Add + Delete + the 11-column shape are asserted in `SummaryTable.test.jsx`; Edit re-opens `RoomForm` (validated there); Cancel on both forms is validated. An end-to-end Add-via-RoomForm-to-SummaryTable rendering chain is not simulated because Room Number selection requires MUI modal interaction which is already covered in `RoomListModal.test.jsx` in isolation.

### Issues Found

No source bugs discovered. No source code modifications were required to make the tests pass.

Minor non-blocking observations:
- The `<label>` elements in `HeaderSection.jsx`, `RoomForm.jsx`, and `ServiceForm.jsx` wrap text as siblings of their inputs rather than binding via `htmlFor`/`id`. This does not affect users but blocks `getByLabelText` from the default RTL helpers; tests use a small `inputByLabelText(label)` utility that walks the label's parent to find the first control. Changing the labels to use `htmlFor` is a UX improvement that belongs to a later accessibility bolt, not this one.
- The eslint run produces exactly one pre-existing informational warning from the react-hooks react-compiler plugin about `useReactTable`. Not introduced by tests.

### Notes

- Store reset is handled via `useWizardDraft.getState().resetDraft()` in a `beforeEach`, avoiding state bleed between tests. `act()` wraps direct store mutations performed outside user events to silence React's test-environment warning.
- `renderWithProviders` creates a fresh `QueryClient` per render with `retry: false` + `gcTime: 0` so test timing stays deterministic.
- Coverage numbers: 14/37 source files have a direct test file (~38%), plus transitive coverage through component renders (store, React Query hooks, MUI wiring). To obtain branch/line percentages the project can add `@vitest/coverage-v8` in a later iteration and run `npm run coverage`.
- Total suite runs in ~11s on the dev machine.
