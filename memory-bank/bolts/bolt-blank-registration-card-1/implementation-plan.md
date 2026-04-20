---
stage: plan
bolt: bolt-blank-registration-card-1
unit: 007-blank-registration-card
intent: 001-room-registration
created: 2026-04-20T08:35:00Z
---

# Implementation Plan: Blank Registration Card

## Objective

Deliver FR-013 — a standalone, static, print-optimised pre-registration form at `/front-office/room-registration/blank-registration-card` (React Router route inside the SPA). No database, no interactivity, identical output for all authenticated users. Print targets single A4 portrait with browser-native `Ctrl+P`.

## Deliverables

### Source code
- **Route component**: `src/features/registration/pages/BlankRegistrationCard.jsx` — the entire card layout in one self-contained JSX component.
- **Data constants**: `src/features/registration/constants/blankCard.js` — array of the 14 policy clauses and the 27 field definitions (for future-proofing per NFR-M-006; currently hard-coded per Open Q #6 resolution).
- **Property branding constants**: `src/features/registration/constants/propertyBranding.js` — hotel name, address, hotlines, website, email, logo path. Single source of truth; easy to swap per deployment.
- **Print stylesheet**: `src/features/registration/pages/blankCard.print.css` (scoped) or `@media print` block inside the component — includes `@page { size: A4 portrait; margin: 10mm; }`, font sizes ≥9pt, `page-break-inside: avoid` around the signature block.
- **Auth gate**: thin wrapper `src/shared/auth/RequireAuth.jsx` that checks an inlined placeholder "session exists" predicate (accepts a prop or env flag). If absent, redirects to `/login` via `<Navigate>`. A `useSession` placeholder hook returns `{ authenticated: true }` until the real Cubix SSO hook is wired (future bolt).
- **Route registration** in `App.jsx`: add `/front-office/room-registration/blank-registration-card`, wrapped by `RequireAuth`.

### Artifacts (memory-bank)
- [x] `implementation-plan.md` (this file)
- [ ] `implementation-walkthrough.md` ← Stage 2
- [ ] `test-walkthrough.md` ← Stage 3

## Dependencies

### Already installed (no new deps needed)
- `react`, `react-router-dom` (for `<Navigate>`), `tailwindcss` (for layout + print utilities), `clsx` / `classnames` (for conditional classes if needed).

### External
- None. No backend calls, no master-data fetches.

## Technical Approach

### Layout
- Pure JSX with Tailwind utility classes. Split into clear sections (header → title row → data-entry grid → policy section → consent → signature block → checkout reminder).
- Data-entry grid: CSS grid with labelled cells that contain empty underlined boxes (borders) for handwritten fill-in. Match the 27-field map from FR-013.
- 13 fields marked with red `*` (per spec): Title, First name, Surname, Departure date, Country, Passport/NID No, DOB, Visa Issue Date, Visa Expiry Date, Phone, Email, Checked in By signature, Guest Signature.
- Full-width fields (100%): Company name, Home Address, Reference, Remarks.

### Print
- `@media print` rules hide any app chrome (header/nav/main container padding) and reveal only the card.
- `@page { size: A4 portrait; margin: 10mm; }` locks the page.
- Colours: borders print visibly (`border-color: black`); no background colours on fields (print uses transparent).
- Minimum body font 9pt; clause 14 bold per BR-BRC-003.
- `page-break-inside: avoid` on signature + policy blocks.

### Data-driven array (future-proofing)
- `POLICY_CLAUSES = [string, ...]` array of 14 items. Clause 14 tagged `{ text, bold: true }`.
- `FIELDS = [{ label, required, fullWidth? }, ...]` array — render loop in JSX.
- This keeps the door open for NFR-M-006 (DB-driven clauses) without refactoring the component shape.

### Auth gate
- `<RequireAuth>` wrapper:
  - Reads a session from a placeholder hook (`useSession()`), which currently returns `{ authenticated: true }`. Documented as a stub to be replaced by the real Cubix SSO session hook in the shell bolt.
  - If `!authenticated` → `<Navigate to="/login" replace />`.
- Kept simple; no JWT parsing, no role checks (not required for this route per FR-013).

### File / folder layout
```
src/
  features/
    registration/
      pages/
        BlankRegistrationCard.jsx
        blankCard.print.css        # optional; may inline via styled tag
      constants/
        blankCard.js               # POLICY_CLAUSES, FIELDS
        propertyBranding.js        # hotel name, logo, contact
  shared/
    auth/
      RequireAuth.jsx
      useSession.js                # stub hook (real impl in shell bolt)
```

## Acceptance Criteria (bolt-level)

- [ ] Route `/front-office/room-registration/blank-registration-card` renders the card.
- [ ] All 27 fields present with correct labels and 13 fields starred.
- [ ] Hotel header: logo (or text fallback), name, address, hotlines, website, email.
- [ ] 14 policy clauses render in order; clause 14 bold.
- [ ] Consent statement rendered as H2 centred, above signature lines.
- [ ] Dual signature section: "Checked in By*" and "Guest Signature*" each ~50% width.
- [ ] Time entry line: "Check-In at ...HRS. Check-Out at ...HRS."
- [ ] Checkout reminder "We respectfully remind you that check-out time at 12:00:00 HRS." in bold at the bottom.
- [ ] Auth gate redirects to `/login` when session absent.
- [ ] Page is identical across users (no personalisation anywhere).
- [ ] Always renders blank (no pre-fill).
- [ ] Browser `Ctrl+P` yields single A4 portrait output; layout doesn't break at page boundaries.
- [ ] No JavaScript runtime errors; component renders with zero network calls.

## Testing Scope (Stage 3)

- **Component tests**:
  - renders 27 labelled fields; 13 have `*`
  - renders 14 policy clauses; clause 14 bold
  - renders consent + dual signatures + checkout reminder
  - no network calls (mocked fetch spy == 0 calls)
  - renders identically across two users (same HTML snapshot)
- **RequireAuth tests**:
  - renders child when authenticated
  - redirects to `/login` when unauthenticated
- **Print CSS**: smoke-test that `@media print` rules are present in the document (JSDom can't verify layout, so this is a lightweight assertion).

No coverage for actual print rendering (browser-only); documented limitation.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Open Question #6 — hard-coded vs configurable | Array-driven constants so later swap to DB fetch is mechanical (no JSX restructure). Documented in walkthrough. |
| Cross-browser print consistency | Use broadly-supported CSS; avoid vendor-specific print rules. Visual regression must be done by humans on target browsers (Chrome / Edge). |
| Logo asset missing at first deploy | Text fallback on `<img onError>` hides the img and shows text-only header. |
| RequireAuth stub may mask real auth gaps | Clear comment + TODO linking to `bolt-shell-and-check-in-1` where the real session hook lives. |

## Out of Scope

- Real Cubix SSO integration (shell bolt)
- Print PDF server-side generation (not requested)
- Property-specific overrides beyond the single `propertyBranding.js` constants file
- Any dynamic data (always blank per BR-BRC-001)

## Completion Criteria

- [x] Stories reviewed (3/3)
- [x] Deliverables defined
- [x] Dependencies identified (zero new)
- [x] Acceptance criteria documented
- [x] Technical approach noted
- [ ] ⛔ **Human checkpoint — pending approval**
