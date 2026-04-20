---
stage: plan
bolt: bolt-guest-details-tab-1
unit: 003-guest-details-tab
intent: 001-room-registration
created: 2026-04-20T09:27:00Z
---

# Implementation Plan: Guest Details Tab

## Objective

Deliver FR-008 — the Guest Details tab: per-guest demographic, contact, visa, passport, and additional information capture, with a searchable guest directory (11 filters), guest info + stay history modal, async document upload, blocked-guest warnings (RBAC-gated), and a guest list table with full CRUD. This is the largest bolt of Wave 2 (L complexity, 8 stories).

## Deliverables

### Source code (`src/features/registration/`)
- **Schema**: `schemas/guestSchema.js` — composed Zod schema with 5 section sub-schemas:
  - `guestBasicSchema` — Title / First Name / Last Name / Gender / Room No / Full Guest Name (auto) / DOB
  - `guestContactSchema` — Email (RFC 5321 subset) / Phone (intl) / Profession / Company / Address / City / Zip (numeric) / Country / Nationality / National ID / Driving License
  - `guestVisaSchema` — Number / Issue Date / Expiry Date (Expiry > Issue — BR-GD-004)
  - `guestPassportSchema` — Number / Issue Date / Expiry Date (same constraint)
  - `guestAdditionalSchema` — Guest Document metadata / Blocked / Is Contact Person
  - Composed `guestSchema` enforces `BR-GD-002` (Title + First Name + Country required for Add).

- **Store slice** (extend [wizardDraft.js](src/features/registration/store/wizardDraft.js)):
  - `guests: { list: GuestRecord[], draft: GuestDraft, mode: 'idle'|'editing', editingId: string|null, familyGroupCouple: boolean }`.
  - Actions: `setGuestDraft`, `setGuestDraftSection`, `addGuest`, `updateGuest`, `removeGuest`, `clearGuestDraft`, `loadGuestForEdit`, `setFamilyGroupCouple`, `setGuestBlocked`.
  - Selector: `getGuests`.

- **API layer** (`src/features/registration/api/guests.js` + mock):
  - `useGuestSearch({ filters })` — 11-filter multi-field search with LIKE matching on text fields, exact on Room No / DOB / dates. Returns `{ guests: [...], total }`.
  - `useGuestHistory(guestId)` — stay history (prior registrations: Reg. No., Arrival, Checkout, Room Info).
  - `useGuestDocumentUpload()` — returns `{ mutate, progress }`. XHR-based progress using `XMLHttpRequest` so we can stream upload-progress events. Abortable.
  - Mock fixture: 10 sample guests seeded; mock `searchGuests` filters by each of the 11 fields.

- **Components** (`src/features/registration/tabs/guest-details/`):
  - `GuestDetailsTab.jsx` — orchestrator: family/group toggle, 5 form sections, guest list table.
  - `GuestBasicSection.jsx` — Title / First / Last / Gender / Room No / Full Name (read-only auto) / DOB.
  - `GuestContactSection.jsx` — 10 contact fields.
  - `GuestVisaSection.jsx` — number / issue / expiry.
  - `GuestPassportSection.jsx` — number / issue / expiry.
  - `GuestAdditionalSection.jsx` — document upload / Blocked (RBAC-gated) / Is Contact Person.
  - `GuestListTable.jsx` — @tanstack/react-table with Edit / Delete actions.
  - `GuestSearchModal.jsx` — 11 filters + results table with "Select Guest" row action.
  - `GuestInfoModal.jsx` — profile read-only view + stay history subsection.
  - `BlockedGuestBanner.jsx` — inline warning when retrieved guest has `blocked=true`.
  - `DocumentUploadControl.jsx` — file input + progress bar + cancel.

- **Masters**: extend `api/masters.js` + mock with `useProfessionMaster` and `useCountryMaster` (backed by new fixtures). Small, reusable elsewhere.

- **Fixtures** (new):
  - `fixtures/guests.js` — 10 sample profiles (incl. one blocked guest for warning UX) with `stayHistory` arrays.
  - `fixtures/professions.js` — Dr, Engineer, Manager, Student, Other (small list).
  - `fixtures/countries.js` — 25 countries with Bangladesh first, commonly-seen countries in the BRD.

- **Dev route**: `/dev/guest-details-tab` in `App.jsx`.

### Artifacts
- [x] `implementation-plan.md` (this file)
- [ ] `implementation-walkthrough.md` ← Stage 2
- [ ] `test-walkthrough.md` ← Stage 3

## Dependencies

### Already installed
- React 19, Zustand, React Hook Form (optional for some sections), Zod, React Query, MUI (Dialog, Autocomplete, LinearProgress), Tailwind, lucide-react, date-fns, @tanstack/react-table.

### New runtime deps
- **None.** All file-upload plumbing uses the built-in `XMLHttpRequest` API for progress tracking. React Query handles invalidation of guest-history cache on upload.

### External
- **Backend-owned** (Open Q #2 / #12): returning-guest lookup keys (mobile? passport? national ID?). Our mock supports all 11 filters with AND logic; backend contract can tighten later.

## Technical Approach

### Schemas
- Composed schema via `z.object({...}).merge(...).superRefine(...)` so individual sections can be parsed in isolation for inline validation.
- `BR-GD-004` (Visa / Passport Expiry > Issue): `.superRefine` on each section.
- `BR-GD-002` (Add requires Title + First + Country): enforced in `addGuest` action + UI button disablement.
- `BR-GD-003` (Full Guest Name auto-compose): derived on every render; store doesn't persist it — it's computed. Keeps the write path clean.
- Email: RFC 5321 practical regex (we do not use the formal ABNF — Zod's built-in email + a `.max(254)` is sufficient).

### Store
- `draft` holds the currently-edited guest (not yet added to `list`). `mode === 'editing'` when `editingId` is set.
- `addGuest` → validates with `guestSchema`, assigns id, pushes to `list`, clears draft.
- `updateGuest` → patches `list[editingId]`, clears draft.
- `removeGuest` → filters out by id.
- `loadGuestForEdit(id)` → copies list entry to draft, sets editingId.

### Guest Search modal
- 11 filters in a grid. Text filters (Name, Company, Email, Mobile, Passport No., Reg. No.) use LIKE. Room No. and DOB use exact match.
- Mock back-end filters by each field with AND logic (same as BRD BR-SR-001).
- Result rows expose a **Select Guest** button which:
  - If the guest is `blocked: true`, surface the `BlockedGuestBanner` warning first (requires user confirm) before populating the form (BR-GD-005).
  - Otherwise, copy the fetched profile into `draft` and close the modal.
- Result UX: top 50 shown, with total count and a "narrow your search" hint past that.

### Guest Info modal
- Read-only view of the full profile + stay history table (Reg. No., Arrival, Checkout, Room Info).
- Opened via row-click on the Guest List Table.

### Family/Group/Couple mode
- A single checkbox at the top of the tab. When ON, newly-added guests default to the same Room No. as the previous guest (pre-fills the Basic Info room-no). When OFF, Room No. is empty by default.

### Blocked flag RBAC gate
- Stub RBAC: `canSetBlockedFlag = false` for now; shell bolt will replace with real claim. When `false`, the checkbox is `disabled` with tooltip "Supervisor role required". When a saved guest has `blocked=true`, the banner shows regardless of role.

### Document upload
- `DocumentUploadControl`:
  - Accepts `.jpg,.jpeg,.png,.pdf` (NFR-S-005 — malware scan is backend; we at least enforce MIME + extension).
  - Client-side size cap 5 MB.
  - Progress via `xhr.upload.onprogress`.
  - Cancel button aborts in-flight upload.
  - Successful upload stores `{ documentId, filename, mimeType, sizeBytes }` on the draft. No base64 blob in Zustand (would bloat storage).

### Full Guest Name auto-compose
- Pure derived function `formatFullGuestName({ title, firstName, lastName })`.
- Computed in `GuestBasicSection` via `useMemo`. `<100ms` budget met trivially.
- Never a store field — prevents divergence.

### Performance
- Guest Search: React Query caches by filter key; `staleTime: 30s`; `keepPreviousData`.
- Guest list table: typically <20 rows per registration, so no virtualisation needed.
- MUI Autocomplete for Country / Nationality (25 items, no virtualisation).

### File / folder layout
```
src/features/registration/
  api/
    guests.js
    __mocks__/
      guests.mock.js
  fixtures/
    guests.js
    professions.js
    countries.js
  schemas/
    guestSchema.js
  tabs/
    guest-details/
      GuestDetailsTab.jsx
      GuestBasicSection.jsx
      GuestContactSection.jsx
      GuestVisaSection.jsx
      GuestPassportSection.jsx
      GuestAdditionalSection.jsx
      GuestListTable.jsx
      GuestSearchModal.jsx
      GuestInfoModal.jsx
      BlockedGuestBanner.jsx
      DocumentUploadControl.jsx
```

Plus edits: `store/wizardDraft.js`, `api/masters.js` + mock (professions + countries), `App.jsx`, `index.js` barrel.

## Acceptance Criteria (bolt-level)

- [ ] Basic info enforces BR-GD-002 at Add; Title + First Name + Country required.
- [ ] Full Guest Name auto-composes live from Title + First + Last; read-only.
- [ ] Email validates (RFC 5321 subset via Zod `.email()`).
- [ ] Phone accepts international format (e.g., `+880 1XXX-XXXXXXX`).
- [ ] Zip validates as numeric-only.
- [ ] Visa / Passport: Expiry > Issue (BR-GD-004); empty either field is allowed.
- [ ] Document upload accepts JPG/PNG/PDF up to 5 MB; shows progress; cancellable.
- [ ] Guest Search modal exposes 11 filters with AND logic.
- [ ] Guest retrieved with `blocked=true` shows the banner + confirm dialog before form pre-fill.
- [ ] Blocked toggle disabled for non-privileged roles (RBAC stub).
- [ ] Guest Info modal shows profile + stay history.
- [ ] Guest List Table supports Add / Update / Delete / Clear.
- [ ] Family/Group/Couple toggle pre-fills Room No. on new guest.
- [ ] Tab works independently at `/dev/guest-details-tab`.

## Testing Scope (Stage 3)

- **Pure function tests** (Vitest, no DOM):
  - `formatFullGuestName` — Title/First/Last combinations, empties.
  - Zip validator (numeric), Phone validator (international prefix), Email RFC subset.
  - Visa/Passport expiry-after-issue validator.
- **Schema tests**: each section's Zod schema; composed `guestSchema` rejects missing Title/First/Country.
- **Store tests**: `addGuest` rejects invalid, accepts valid; `updateGuest` patches; `removeGuest` filters; `loadGuestForEdit` mirrors list entry into draft.
- **Mock adapter tests**: `searchGuests` filters by each of the 11 fields with AND logic; `fetchGuestHistory` returns prior stays; `uploadGuestDocument` mock simulates progress.
- **Component tests (renderWithProviders)**:
  - GuestBasicSection: Full Name auto-compose renders correctly on each input change; read-only attribute.
  - GuestContactSection: email shows error on invalid; zip shows error on non-numeric.
  - GuestVisaSection / PassportSection: expiry < issue shows error.
  - GuestSearchModal: 11 filter inputs present; clicking a result invokes handler.
  - BlockedGuestBanner: renders when `blocked=true`; confirm callback invoked.
  - GuestListTable: Add appends; Delete removes; Edit loads into draft.
  - DocumentUploadControl: size > 5 MB rejected; non-JPG/PNG/PDF rejected; progress state rendered.
- **PII property test**: serialise the full Zustand state after entering a passport number and assert the raw passport is **still there** (it's not PCI; but national ID should be readable to the user). This test exists as documentation — we are NOT trying to hide PII client-side; it's encrypted at-rest on the backend (NFR-S-004). The test simply codifies that expectation so no one accidentally adds client-side scrubbing that breaks UX.

Coverage target: ≥80% of files in the unit directly tested; remaining coverage via component tests.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Open Q #2 (Passport Issue Place in form?) | Ship the form **without** Issue Place (matches form spec); the info modal shows a "—" placeholder. Documented. |
| Open Q #12 (returning-guest lookup keys) | Mock supports all 11 filters; backend decides later. |
| Document upload backend contract TBD | XHR mock with progress; real POST endpoint TBD but the client-side interface is stable. |
| File-size attack (client-side only enforcement) | Cap 5 MB client-side; backend must also enforce (NFR-S-005). |
| PII encryption-at-rest | Backend concern; UI just masks national ID / passport in non-privileged views per NFR-S-004 (deferred to a later a11y/privacy pass). |

## Out of Scope

- Real returning-guest backend contract (Open Q #12)
- Cross-tab validation at Check-in (shell bolt)
- Adult/guest-count reconciliation with Registration tab (shell bolt — BR-REG-001)
- Base64 document storage in Zustand (deliberately avoided)
- UI masking of PII for non-privileged roles (a11y/privacy bolt)
- Real backend document upload endpoint

## Completion Criteria

- [x] Stories reviewed (8/8)
- [x] Deliverables defined
- [x] Dependencies identified (zero new)
- [x] Acceptance criteria documented
- [x] Technical approach noted
- [ ] ⛔ **Human checkpoint — pending approval**
