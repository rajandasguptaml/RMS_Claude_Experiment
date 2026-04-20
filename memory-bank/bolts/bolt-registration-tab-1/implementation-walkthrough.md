---
stage: implement
bolt: bolt-registration-tab-1
created: 2026-04-20T07:50:00Z
---

## Implementation Walkthrough: Registration Tab

### Summary

Built the full Registration tab (FR-002..FR-006) as a feature-sliced React 19 + Vite module. The tab assembles five sections (header, room form with Room List & RRC modals, additional services, classification with channel discovery, and the tanstack-table summary) driven by a Zustand wizard-draft store, Zod schemas, and React Query hooks bound to mock adapters for every master-data endpoint. Global providers (React Query, MUI theme, BrowserRouter) were wired into `main.jsx`, and a dev route `/dev/registration-tab` was added for isolation testing.

### Structure Overview

- Feature-scoped folder under `src/features/registration/` with sub-folders for `api`, `fixtures`, `schemas`, `store`, `tabs/registration`.
- Shared primitives live under `src/shared/lib/` (money, date helpers, clsx wrapper).
- Mocks gated by `VITE_USE_MOCKS` (defaults to true when env is undefined) live under `api/__mocks__/`. Real-adapter stubs throw until backend contracts are published.
- Composition root wires QueryClientProvider + ThemeProvider + BrowserRouter once; `App.jsx` declares routes only.

### Completed Work

- [x] `src/main.jsx` - global providers (QueryClientProvider, ThemeProvider, CssBaseline, BrowserRouter).
- [x] `src/App.jsx` - Routes: home page preserved + `/dev/registration-tab`.
- [x] `src/App.test.jsx` - updated to wrap App with MemoryRouter so the existing smoke test still passes.
- [x] `vite.config.js` - added `/* global process */` for lint parity with the new flat config.
- [x] `src/shared/lib/money.js` - `formatMoney` + `round2` helpers.
- [x] `src/shared/lib/date.js` - `todayISO`, `tomorrowISO`, `diffNights`, `addDaysISO`, `isAfterISO` using date-fns.
- [x] `src/shared/lib/conditional.js` - thin clsx `cx` wrapper.
- [x] `src/features/registration/index.js` - barrel export.
- [x] `src/features/registration/store/wizardDraft.js` - Zustand store (header, rooms, services, classification, roomLocks in-memory).
- [x] `src/features/registration/schemas/headerSchema.js` - Zod + BR-REG-004 (Departure > Check-In) + conditional company fields.
- [x] `src/features/registration/schemas/roomSchema.js` - Zod + BR-REG-005 (Fixed <= Rack) + `computeRoomTotal` + `reverseRate`.
- [x] `src/features/registration/schemas/serviceSchema.js` - Zod + `computeServiceTotal`.
- [x] `src/features/registration/schemas/classificationSchema.js` - Zod + `CHANNEL_OPTIONS` + conditional validator.
- [x] `src/features/registration/schemas/registrationTabSchema.js` - composed schema with `.superRefine` for BR-REG-002.
- [x] `src/features/registration/api/client.js` - fetch wrapper + `useMocks()` env gate.
- [x] `src/features/registration/api/masters.js` - 8 React Query hooks for masters (long staleTime).
- [x] `src/features/registration/api/rooms.js` - `useAvailableRooms`, `useRoomLock`, `useRoomLockRelease`.
- [x] `src/features/registration/api/reservations.js` - `useReservationSearch`, `useReservation`.
- [x] `src/features/registration/api/__mocks__/masters.mock.js` - mock master-data async fetchers.
- [x] `src/features/registration/api/__mocks__/rooms.mock.js` - filtered rooms + lock acquisition (409 simulation for 'conflict' status).
- [x] `src/features/registration/api/__mocks__/reservations.mock.js` - reservation search + by-id.
- [x] `src/features/registration/fixtures/roomTypes.js` - 9 room types per FR-003.
- [x] `src/features/registration/fixtures/services.js` - 25 services per FR-004.
- [x] `src/features/registration/fixtures/companies.js` - 5 sample companies with default payment / pay-for.
- [x] `src/features/registration/fixtures/currencies.js` - BDT default + 5 alternates with conversion rates.
- [x] `src/features/registration/fixtures/references.js` - 30 reference options (>29 per FR-005).
- [x] `src/features/registration/fixtures/mealPlans.js` - 10 meal plans (>9 per FR-005).
- [x] `src/features/registration/fixtures/marketSegments.js` - Dhaka / Cox's offices.
- [x] `src/features/registration/fixtures/guestSources.js` - 4 guest sources per FR-005.
- [x] `src/features/registration/fixtures/airlines.js` - airline stub for downstream Others-Info bolt.
- [x] `src/features/registration/fixtures/complimentaryItems.js` - 29 items for downstream Complimentary bolt.
- [x] `src/features/registration/fixtures/rooms.js` - representative rooms including a 'conflict' sentinel for 409 testing.
- [x] `src/features/registration/fixtures/reservations.js` - 5 sample reservations seeded off today's date.
- [x] `src/features/registration/tabs/registration/RegistrationTab.jsx` - orchestrator composing all sub-sections.
- [x] `src/features/registration/tabs/registration/HeaderSection.jsx` - stories 001/002/003.
- [x] `src/features/registration/tabs/registration/RoomForm.jsx` - stories 004/005/006 with "Same as global date" toggle and waive checkboxes.
- [x] `src/features/registration/tabs/registration/RoomListModal.jsx` - MUI Dialog with availability list + lock acquisition; 409 surfaced.
- [x] `src/features/registration/tabs/registration/RrcModal.jsx` - reverse-rate calculator modal.
- [x] `src/features/registration/tabs/registration/ServiceForm.jsx` - story 007 add/update/cancel + multi-service.
- [x] `src/features/registration/tabs/registration/ClassificationSection.jsx` - stories 008 + 009 (conditional Meal Plan/Reference + channel discovery checkboxes).
- [x] `src/features/registration/tabs/registration/SummaryTable.jsx` - tanstack-table with 11 columns per FR-006 + row actions.

### Key Decisions

- **JSX only, no TypeScript**: honoured the harness rule and used JSDoc comments for typing hints where useful. No `tsconfig.json`, no `@types/*`.
- **Native date/time inputs instead of MUI X pickers**: the project does not have `@mui/x-date-pickers` installed and the rule bans adding it. Native `<input type="date">` / `<input type="time">` styled with Tailwind keeps the scope lean and lint-clean.
- **Mock-first, env-gated adapters**: `useMocks()` treats undefined `VITE_USE_MOCKS` as true for dev convenience. Real adapters throw `not implemented` until backend contracts land, preserving the adapter boundary.
- **In-memory room-lock token map on the Zustand store**: never persisted to sessionStorage/localStorage per the PCI / concurrency-hygiene note in the plan.
- **Component-level remount via `key` instead of `useEffect(() => setState)`**: eslint flags `react-hooks/set-state-in-effect` as an error. Passing a dynamic `key` to `RoomForm` / `ServiceForm` remounts the component with a fresh `useState` initializer when the editing target changes — zero effects.
- **Check-In Date read-only**: followed the plan's resolution of Open Q #1 (read-only pending BA confirmation). A TODO-style comment documents the decision in `HeaderSection.jsx`.
- **409 conflict path realised via a sentinel fixture status**: one room (`rm-104`) is tagged `status: 'conflict'` so the UX path can be exercised without flakiness in tests.
- **Schema formula for total**: `(negotiated || rack) - discount, then * (1+sc%), then * (1+vat%), then + city + additional` (waive flags zero their component). VAT chained on (sub + sc) matches typical HMS stacking; RRC reverse-calc inverts the same chain.
- **BrowserRouter added in `main.jsx`, routes declared in `App.jsx`**: the existing counter demo is preserved at `/` and the dev tab sits at `/dev/registration-tab`. `App.test.jsx` updated with `MemoryRouter` to keep the smoke test passing.
- **SummaryTable tanstack-table warning accepted**: the `react-hooks/incompatible-library` warning for `useReactTable` is an informational plugin notice (not an error); lint exits 0.
- **Shared `src/shared/lib/` folder (no `src/shared/ui/` or `src/shared/forms/`)**: the plan listed those sub-folders as "if needed"; only `lib` was needed for this bolt. No speculative empty directories.

### Deviations from Plan

- Plan mentions `store/types.ts`; JSDoc-only convention means no separate types file — shape is documented in `wizardDraft.js`.
- `RegistrationTab` does not use RHF for the header/classification sections because those sections write directly to the Zustand store on every change (single-source-of-truth; each input is effectively a controlled field wired to the store). RHF is used in spirit (single-responsibility forms per section) but not via its library API for these. RoomForm and ServiceForm use local component state instead of RHF for simplicity; RHF integration can be layered on later without changing the schema contract.
- Added `src/features/registration/fixtures/airlines.js` and `complimentaryItems.js` ahead of their owning bolts so the masters layer is cohesive now and downstream bolts don't have to relocate fixtures.
- `react-router-dom` was introduced in `App.jsx`/`main.jsx`; the existing `App.test.jsx` was wrapped with `MemoryRouter` to remain green. This is the only test touched.

### Dependencies Added

None. Zero new runtime deps. All functionality built on the already-installed set.

### Developer Notes

- Mocks default ON when `VITE_USE_MOCKS` is unset — this matches the bolt brief. Set `VITE_USE_MOCKS=false` to exercise the real adapter stubs (they will throw `not implemented`).
- Room 104 is seeded as a 409-conflict sentinel in `fixtures/rooms.js`. Selecting it from the Room List modal will surface the "just taken by another agent" inline error.
- `computeRoomTotal` and `reverseRate` in `roomSchema.js` are pure and exported; they're ready for Stage 3 unit tests without any React Query / Zustand setup.
- Summary Table currently offers an Edit action only for room rows (service-row edit is a future story; the story focuses on Add/Delete parity). Service rows can still be deleted via the same action.
- Build emits a chunk-size advisory >500 kB (MUI + React Query + tanstack-table). Code-splitting can be addressed at shell-bolt time when route lazy-loading is introduced.
- No emojis in any source file, per harness rules.
