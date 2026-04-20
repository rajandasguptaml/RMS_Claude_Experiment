---
stage: plan
bolt: bolt-registration-tab-1
unit: 002-registration-tab
intent: 001-room-registration
created: 2026-04-20T07:40:00Z
---

# Implementation Plan: Registration Tab (`bolt-registration-tab-1`)

## Objective

Deliver the Registration tab — the highest-density data-entry surface in the Room Registration module. This is the **foundation bolt** (Wave 1): it establishes the registration-draft shape, the Zustand store contract, the Zod schema conventions, the API adapter layout, and the testing patterns that every subsequent bolt will follow.

Implements FR-002 through FR-006 end-to-end. Stops at the tab's output — cross-tab validation and global Check-in orchestration belong to `bolt-shell-and-check-in-1` (Wave 3).

---

## Deliverables

### Source code (under `src/features/registration/`)
- **Store**: `store/wizardDraft.ts` — Zustand slice holding the entire registration draft (header + rooms[] + services[] + classification + comp items + others info + guests + card). Exposes per-tab selectors.
- **Schemas**: `schemas/` — Zod schemas split by section:
  - `headerSchema.ts` — booking context + dates + company + currency
  - `roomSchema.ts` — room assignment + rates + discount
  - `serviceSchema.ts` — additional service entry
  - `classificationSchema.ts` — Meal Plan / Reference (conditional) + remarks + channel discovery
- **API layer**: `api/` — React Query hooks for master data + availability + lock:
  - `useReservationSearch`, `useReservation`
  - `useCompanyMaster`, `useCurrencyMaster`, `useReferenceMaster`, `useMealPlanMaster`, `useMarketSegmentMaster`, `useGuestSourceMaster`, `useServiceMaster`, `useRoomTypeMaster`
  - `useAvailableRooms({ type, from, to })` — short staleTime
  - `useRoomLock()` — POST `/rooms/:id/lock`, returns token; kept in in-memory store (never localStorage/sessionStorage)
- **Components**: `tabs/registration/`
  - `RegistrationTab.tsx` — orchestrates sections
  - `HeaderSection.tsx` — reservation toggle, dates/times, total-nights, listed-company + 4 conditional fields, currency
  - `RoomForm.tsx` — type, number (modal-only), adults/children, rate auto-fill, discount, waive checkboxes, per-room dates, stay-type flags
  - `RoomListModal.tsx` — available-room picker + lock acquisition
  - `RrcModal.tsx` — reverse rate calculator
  - `ServiceForm.tsx` — service add/update/cancel
  - `ClassificationSection.tsx` — Market Segment / Guest Source / Meal Plan / Reference / Remarks / Channel Discovery
  - `SummaryTable.tsx` — `@tanstack/react-table` table with row actions (Edit, Delete)
- **Shared primitives** (if needed): `src/shared/forms/*`, `src/shared/ui/*` — reusable inputs, modal shell, money formatter.

### Artifacts (memory-bank)
- [x] `implementation-plan.md` (this file) ← Stage 1 deliverable
- [ ] `implementation-walkthrough.md` ← produced by Stage 2
- [ ] `test-walkthrough.md` ← produced by Stage 3

### Routes
- Mount under an existing app route. Proposed: `/front-office/room-registration/registration` (scoped within the wizard shell to be delivered by `bolt-shell-and-check-in-1`). For this bolt, a standalone dev route `/dev/registration-tab` will be wired for isolation testing.

---

## Dependencies

### Already installed (verified in package.json)
- `react@19`, `react-dom@19`, `vite@8`, `@vitejs/plugin-react`
- `zustand` — state
- `react-hook-form`, `@hookform/resolvers`, `zod` — forms + validation
- `@tanstack/react-query` — server state
- `@tanstack/react-table` — summary table
- `@mui/material`, `@emotion/react`, `@emotion/styled` — dialogs, selects, pickers
- `tailwindcss@4`, `@tailwindcss/vite` — styling (already wired in `vite.config.js`)
- `lucide-react` — icons
- `date-fns` — date math
- `clsx` — conditional classes
- Test: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`

### Not adding
- No new runtime deps anticipated. Existing set is sufficient.

### External (backend — assumed)
- REST API at `/front_office/*` with endpoints listed in the API layer above. **Open**: OpenAPI/Swagger not published (Open Q #9). Will build against mock adapters in `api/__mocks__/` gated by `import.meta.env.VITE_USE_MOCKS`.

### Standards gap (non-blocking)
`standards/tech-stack.md` and `standards/coding-standards.md` absent. Decisions recorded in [construction-log.md](../../intents/001-room-registration/units/002-registration-tab/construction-log.md) (D-001 … D-006). Will surface to user for approval before Stage 2.

---

## Technical Approach

### State & forms
- **Single wizard draft** in Zustand store, namespace `registration`. RHF controls the section-level forms and writes committed values into the store on valid-submit or on-blur (debounced). This keeps RHF's re-render scope small while the store is the source of truth for cross-tab reads.
- **Schemas** composable: a top-level `registrationTabSchema` is `headerSchema.merge(...).refine(conditionalMealPlanRef, ...)`. Conditional rules implemented as Zod `.superRefine`.

### Derived computations
- Total Nights: `differenceInCalendarDays(departureDate, checkInDate)`; invariant: must be ≥ 1.
- Room total: `(negotiatedRate ?? rackRate) − discount + (waiveSC ? 0 : sc) + (waiveVAT ? 0 : vat) + (waiveCity ? 0 : city) + (waiveAdd ? 0 : additional)`. Memoized with `useMemo`; recomputes on any input change (<100 ms per NFR-P-003).
- RRC reverse calc: given target inclusive total and tax/charge rates, solve for rack rate.

### Optimistic lock
- On Room List modal row-select: `POST /rooms/:id/lock` → returns `{ token, expiresAt }`. Token stored **only in a React Context / in-memory** map (never in Storage — PCI + concurrency hygiene).
- On abandon / tab close: `DELETE /rooms/:id/lock/:token` (best effort, `navigator.sendBeacon`).
- On Check-in (other bolt): lock token passed in request; backend revalidates.
- On 409 Conflict: show inline error + re-fetch availability, instruct agent to pick alternate room (NFR-R-008).

### Conditional logic
- `BR-REG-002`: Meal Plan & Reference required **only** when `reservationEnabled === true`. Enforced in Zod `.superRefine` and in UI (`*` marker + error copy).
- `BR-REG-004`: Departure strictly > Check-In. Enforced in Zod.
- `BR-REG-005`: Fixed discount ≤ Rack Rate. Enforced in Zod.
- Listed Company checkbox: toggles 4 conditional fields (Contact Person / Mobile / Payment Mode / Pay For) via conditional render + schema branch.
- "Same as global date" per-room: when checked, room inherits header dates; otherwise per-room pickers.

### Summary table
- `@tanstack/react-table` headless core + MUI-styled cells. 11 columns per FR-006. Edit button repopulates the form (set form state via RHF `reset({...})`); Delete removes row from store after confirm. Validation blocks Add when Room Type or Room Number missing.

### Masters loading
- `useQuery` with staleTime 30 min + `refetchOnWindowFocus: false` for slowly-changing masters (currency, reference, meal plan, services, market segment, guest source, company).
- `useQuery` with staleTime 30 s + `refetchOnWindowFocus: true` for room availability.

### Mocks (until backend ready)
- Mock adapters in `api/__mocks__/*.ts` return representative fixtures. A single env flag `VITE_USE_MOCKS=1` swaps real vs mock adapters at import time. Fixtures live in `src/features/registration/fixtures/`.

### File / folder layout
```
src/
  features/
    registration/
      api/
        client.ts
        masters.ts         # useCompanyMaster, useCurrencyMaster, ...
        rooms.ts           # useAvailableRooms, useRoomLock
        reservations.ts
        __mocks__/
      schemas/
        headerSchema.ts
        roomSchema.ts
        serviceSchema.ts
        classificationSchema.ts
        registrationTabSchema.ts
      store/
        wizardDraft.ts     # Zustand
        types.ts
      tabs/
        registration/
          RegistrationTab.tsx
          HeaderSection.tsx
          RoomForm.tsx
          RoomListModal.tsx
          RrcModal.tsx
          ServiceForm.tsx
          ClassificationSection.tsx
          SummaryTable.tsx
      fixtures/
      index.ts             # barrel
  shared/
    ui/                    # Modal, FormField, MoneyInput, ...
    lib/                   # money.ts, date.ts, conditional.ts
  routes/
    devRegistrationTab.tsx # dev-only route for isolation testing
```

---

## Acceptance Criteria (bolt-level — summarised from stories)

- [ ] **Header defaults**: Check-In Date = today (read-only or editable — Open Q #1), Check-In Time = 14:00, Departure = today+1, Checkout Time = 12:00, Total Nights auto-calculated.
- [ ] **Date invariant**: Departure > Check-In (BR-REG-004) — blocks Add and Check-in.
- [ ] **Reservation link**: selecting reservation auto-populates dates, room type, rate, currency, complimentary pre-selection. Walk-in mode keeps fields blank.
- [ ] **Listed Company**: checkbox reveals Contact Person + Mobile + Payment Mode + Pay For.
- [ ] **Currency**: defaults BDT; Conversion Rate read-only and non-zero.
- [ ] **Room Type**: selection auto-populates Rack Rate + SC 10% + VAT 15% + City + Additional from rate master.
- [ ] **Room List modal**: filtered by availability; selection acquires lock token.
- [ ] **Discount**: Fixed ≤ Rack Rate (BR-REG-005); Percent allowed.
- [ ] **Negotiated Rate**: overrides Rack when entered.
- [ ] **Waive checkboxes**: remove their respective component from total.
- [ ] **RRC**: reverse calc from target inclusive total.
- [ ] **Additional Services**: Add / Update / Cancel works; multiple services per registration.
- [ ] **Classification**: Meal Plan & Reference required only when reservation-linked (BR-REG-002).
- [ ] **Channel Discovery**: multi-select, SET-typed payload (to be confirmed — Open Q note).
- [ ] **Summary Table**: Add / Edit / Delete / Cancel across rooms + services.
- [ ] **Per-room dates**: "Same as global date" checkbox links to header; unchecked enables per-room pickers.
- [ ] **Stay type flags**: No Post / Complimentary / House Use with mutual exclusivity (recommended).
- [ ] **Performance**: totals recompute < 100 ms (NFR-P-003); tab loads < 2 s (NFR-P-001).
- [ ] **All masters sourced from backend** (no hard-coded lists except option labels not stored in masters).

---

## Testing Scope (will execute in Stage 3)

- **Unit (Vitest)**: Zod schemas — valid/invalid for each section; date invariants; discount cap; conditional Meal Plan/Reference.
- **Unit (Vitest)**: total-calc pure function; RRC reverse-calc pure function; "same as global date" derivation.
- **Component (RTL)**: HeaderSection renders defaults; Departure < Check-In triggers error; Listed Company toggles conditional fields.
- **Component (RTL)**: RoomForm — Room Type selection auto-fills rates; Discount Fixed > Rack Rate surfaces error.
- **Component (RTL)**: SummaryTable — Add/Edit/Delete; Add blocked without Room Type.
- **Component (RTL)**: Classification — Meal Plan/Reference required only when reservation-linked.
- **Integration (RTL + MSW-style mock via our `__mocks__`)**: Room List modal lists available rooms; selection fires lock; 409 shows error.
- **Coverage target**: ≥ 80% lines for this unit (per NFR-quality gate).

Out of scope for this bolt: cross-tab validation (shell), Check-in atomic commit (shell), tokenization (others-info bolt).

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Open Q #1 (Check-In Date editable vs read-only) | Implement as **read-only by default** with a comment + small refactor hook; escalate question to BA before Stage 2 user checkpoint. |
| Open Q #3 (package-mandatory trigger mechanism) | Out of scope for this bolt (belongs to comp-item bolt); ensure the Registration store exposes `packageId` / `rateCode` so downstream can trigger. |
| Open Q #7 (Payment Mode "Before C/O") | Include the option verbatim as a string literal; document ambiguity in UI help text. |
| Backend contracts unpublished | Build against mocks under `api/__mocks__/`; flag via env var; keep adapter boundary clean. |
| 40+ fields — validation regression risk | Zod single source of truth; RHF devtools only in dev; snapshot-tested error copy. |
| Master-data pagination for large references (NFR-M-003) | Use MUI Autocomplete with virtualization for >50 options; React Query caches per-query-key. |

---

## Out of Scope (explicit)

- Cross-tab Check-in orchestration → `bolt-shell-and-check-in-1`
- Guest records → `bolt-guest-details-tab-1`
- Complimentary item selection / package triggers → `bolt-complimentary-item-tab-1`
- Card tokenization → `bolt-others-information-tab-1`
- Search / Re-activate → `bolt-search-tab-1`
- Blank Card → `bolt-blank-registration-card-1`

---

## Stage Checkpoint — what I'm asking you to confirm

1. **Stack decisions** (D-001..D-006 in construction-log.md): Zustand + RHF/Zod + React Query + MUI+Tailwind + tanstack-table + feature-based layout.
2. **Folder layout** under `src/features/registration/`.
3. **Mock-first approach** until backend contracts are published (env-gated adapters).
4. **Open Questions #1 / #3 / #7** — acknowledged and deferred; #1 will ship as read-only by default.
5. **Acceptance-criteria set** above.
6. **Scope boundary** — 10 stories in this bolt; cross-tab + Check-in deferred to the shell bolt.

---

## Completion Criteria (Stage 1 — Plan)

- [x] Stories reviewed (10/10)
- [x] Deliverables clearly defined
- [x] Dependencies identified (runtime + external + standards gap flagged)
- [x] Acceptance criteria documented
- [x] Technical approach noted
- [ ] ⛔ **Human checkpoint — pending user approval**
