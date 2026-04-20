---
stage: plan
bolt: bolt-others-information-tab-1
unit: 005-others-information-tab
intent: 001-room-registration
created: 2026-04-20T09:07:00Z
---

# Implementation Plan: Others Information Tab

## Objective

Deliver FR-010 — a 3-section tab capturing (A) classification flags + marketing-channel discovery, (B) departure logistics (Airport Drop + Airlines + Flight + ETD), and (C) credit-card guarantee data. Includes the PCI-DSS tokenization call-site contract that `bolt-shell-and-check-in-1` will invoke at Check-in.

**PCI-first approach**: raw PAN never leaves React component local state. It is never written to Zustand, sessionStorage, localStorage, React Query cache, logs, or error messages. Only the token + last-4 + expiry + card-holder + card-type + reference reach the registration payload.

## Deliverables

### Source code (under `src/features/registration/`)
- **Schemas**:
  - `schemas/othersInformationSchema.js` — splits into `classificationFlagsSchema`, `departureSchema`, `cardGuaranteeSchema` (tokenized shape only — the `panSchema` used by the card *form* lives in the component, not in the store shape).
- **Store slice** (extend [wizardDraft.js](src/features/registration/store/wizardDraft.js)):
  - `othersInformation: { sectionA, sectionB, cardGuarantee }` where `cardGuarantee` holds **only** `{ token, last4, expiryMonth, expiryYear, cardHolderName, cardType, cardReference }`.
  - Actions: `setOthersSectionA`, `setOthersSectionB`, `setCardGuaranteeTokenized`, `clearCardGuarantee`.
- **Tokenization adapter** (`src/features/registration/api/tokenization.js`):
  - Exposed as a single `tokenize({ pan, expiryMonth, expiryYear, cvv? })` function.
  - Implementation is mock: simulates an async call to a PCI-DSS compliant tokenization service. Returns `{ token, last4 }` — strips PAN.
  - Real adapter TODO: Open Q #10 (JS SDK / iframe / redirect) — abstraction keeps surface stable regardless of choice.
- **Airlines master hook** (extend `api/masters.js` + mocks): `useAirlineMaster()` backed by existing `fixtures/airlines.js`.
- **Components** (`tabs/others-information/`):
  - `OthersInformationTab.jsx` — orchestrator; renders the 3 sections.
  - `SectionAClassification.jsx` — Coming From / Next Destination / Visit Purpose / 3 mutually-exclusive flags (Complimentary Guest, House Use, Room Owner) / Previously Visited / VIP / Channel Discovery group.
  - `SectionBDeparture.jsx` — Airport Drop (NO/YES/TBA) + conditional Airlines (searchable Autocomplete from 65-item master) + Flight No. + ETD time picker.
  - `SectionCCardGuarantee.jsx` — Card Type / PAN (masked display) / Card Holder Name / Expiry MM/YY / Card Reference. PAN lives in component state only.
- **Dev route**: `/dev/others-information-tab` in `App.jsx` for isolation.

### Artifacts (memory-bank)
- [x] `implementation-plan.md` (this file)
- [ ] `implementation-walkthrough.md` ← Stage 2
- [ ] `test-walkthrough.md` ← Stage 3

## Dependencies

### Already installed
- React 19, Zustand, Zod, React Query, MUI (Autocomplete for the 65-airline search), Tailwind, lucide-react, clsx, date-fns.

### External / backend
- Tokenization service (Open Q #10) — consumed via mock adapter. Real integration point clearly marked with a TODO and a failing test that the adapter is mock-only.

### New runtime deps
- **None**. Airlines fixture already staged during Wave 1.

## Technical Approach

### PCI discipline — layered controls
1. **PAN never in Zustand**: the store's `cardGuarantee` shape has no `pan` field at all — only `token + last4`. Impossible to accidentally persist PAN via `setCardGuaranteeTokenized`.
2. **PAN in component state only**: `SectionCCardGuarantee` uses `useState` for the PAN input. After tokenization, the state is cleared and only the masked `last4` is displayed.
3. **No autocomplete suggestion storage**: `autocomplete="off"` on all card inputs (NFR-S-009). The card holder name uses `autocomplete="cc-name"` (semantic, allowed).
4. **No logs**: every `catch` branch in the card section logs **only** error type/message codes — never form values. A small `scrub()` helper is available for any future error-path integration.
5. **Tokenize on submit, not on keystroke**: typing in the PAN field never calls the tokenize API — it would leak per-keypress. Tokenization fires exactly once when the user clicks `Tokenize` (or when the shell bolt later invokes it at Check-in).

### Tokenization adapter shape
```text
async function tokenize({ pan, expiryMonth, expiryYear })
  returns { token: string, last4: string }
  throws { code, message }  // safe to surface
```
Implementation for this bolt: a mock that validates Luhn + expiry-not-past + returns a fake token (UUID-shaped). Deliberately sleeps ~300ms to exercise loading state.

### Mutual exclusivity (BR-OI-001)
- `SectionAClassification` watches the 3 flags (`complimentaryGuest`, `houseUse`, `roomOwner`). When any flips to `'YES'`, the other two are reset to `''`. Implemented as a pure reducer in the store action so the invariant holds for any caller (tests, direct store writes, component).

### Conditional completion (BR-OI-004)
- `SectionBDeparture` marks Airlines / Flight / ETD as soft-required when `airportDrop ∈ {YES, TBA}`. Zod `.superRefine` raises a warning-level issue (non-blocking) — the shell bolt decides whether to hard-block at Check-in or just surface a warning.

### Card expiry validation (NFR-C-005)
- `cardGuaranteeSchema` asserts `(year, month)` is not in the past. Pure function; unit-testable.

### Airline dropdown (65 items)
- MUI `<Autocomplete>` with the 65-airline master data. Virtualisation not needed at this size; local filter is fast enough.

### File / folder layout
```
src/features/registration/
  api/
    tokenization.js
  fixtures/
    airlines.js           (already exists)
  schemas/
    othersInformationSchema.js
  tabs/
    others-information/
      OthersInformationTab.jsx
      SectionAClassification.jsx
      SectionBDeparture.jsx
      SectionCCardGuarantee.jsx
```

## Acceptance Criteria (bolt-level)

- [ ] Section A — Complimentary Guest / House Use / Room Owner mutually exclusive (BR-OI-001).
- [ ] Section A — VIP flag renders but is **disabled** for non-privileged roles (RBAC stub: treats current session as non-privileged; shell bolt will wire real claims).
- [ ] Section A — Channel Discovery group: Facebook / Website / Google / Others — persists as array.
- [ ] Section B — Airport Drop default NO; dropdown values NO/YES/TBA.
- [ ] Section B — Airport Drop = YES/TBA surfaces Airlines/Flight/ETD as required (soft-validation).
- [ ] Section B — Airlines dropdown searchable over the 65-item master.
- [ ] Section B — ETD uses HH:MM 24-hour time input.
- [ ] Section C — Card Type dropdown (Amex / MasterCard / Visa / Discover / Taka Pay).
- [ ] Section C — PAN input masked on-screen as `****-****-****-NNNN` when tokenized.
- [ ] Section C — `autocomplete="off"` on PAN + expiry + reference; `cc-name` on holder.
- [ ] Section C — Expiry not in past (NFR-C-005).
- [ ] Section C — `Tokenize` button triggers the tokenize adapter once; successful response clears PAN from component state and writes `{ token, last4 }` into the store.
- [ ] Tokenization failure surfaces an actionable error; PAN remains in the component input (not lost) so the user can retry.
- [ ] Store `othersInformation.cardGuarantee` never contains a `pan` field; snapshot test asserts this property-based.
- [ ] All 3 sections mount inside a dev route `/dev/others-information-tab`.

## Testing Scope (Stage 3)

- **Schema tests**: classification (mutual exclusivity via `superRefine`), departure (airport-drop conditional soft-require), card guarantee (expiry-not-past).
- **Pure expiry validator**: `isCardExpiryInPast(month, year, nowDate)` unit tests (edge cases: current month, prev month, next year).
- **Store tests**: `setOthersSectionA` resets the other flags when one goes YES; `setCardGuaranteeTokenized` accepts only tokenized shape; **no code path accepts a `pan` key**.
- **Tokenization mock tests**: Luhn validation; expiry-past rejection; 300ms latency; returns token + last4; never returns raw PAN.
- **Component tests**: mutual exclusivity via user clicks; Airport Drop conditional fields reveal; Autocomplete filters the airline list; card expiry in past shows error; Tokenize button flow (before = input shown, after = masked).
- **PCI property test**: render the full tab, fill in a PAN, tokenize, then serialize the entire Zustand state and assert the PAN string does **not** appear anywhere in the JSON.

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Open Q #10 (tokenization flow unknown) | Stable adapter interface `tokenize({pan,expiry}) → {token,last4}`; real SDK swap is a one-file change. |
| Open Q #4 (guarantee vs deposit semantics) | Card captured as **guarantee only** (BR-OI-005); no pre-auth amount field; documented in walkthrough. |
| Accidental PAN persistence | Store shape has no PAN field; component state only; PCI property test enforces. |
| RBAC stub too permissive | VIP flag renders disabled by default; explicit TODO pointing to shell bolt for session-claims wiring. |
| Airline Autocomplete perf | 65 items well within MUI Autocomplete default performance. |

## Out of Scope

- Real PCI tokenization integration (Open Q #10) — adapter is mock; interface is stable.
- RBAC claim parsing (shell bolt).
- Airport-drop hard-blocking at Check-in (shell bolt decides).
- Anti-fraud scoring, 3DS, card BIN lookup — not in BRD.

## Completion Criteria

- [x] Stories reviewed (4/4)
- [x] Deliverables defined
- [x] Dependencies identified (zero new)
- [x] PCI discipline documented
- [x] Acceptance criteria documented
- [ ] ⛔ **Human checkpoint — pending approval**
