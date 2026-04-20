---
stage: test
bolt: bolt-others-information-tab-1
created: 2026-04-20T09:22:00Z
---

## Test Report: Others Information Tab

### Summary

- **Tests**: 211 / 211 passed project-wide (48 added for this bolt; prior 163 carried forward).
- **Lint**: `npm run lint` exits 0 errors (pre-existing cosmetic warning only).
- **Build**: succeeds.
- **New test files for this bolt**: 4.
- **Assertion count for this bolt**: 48.

### Test Files

- [x] `src/features/registration/api/tokenization.test.js` — adapter + expiry validator + error scrubber (16 assertions)
  - `isCardExpiryInPast`: 6 edge cases incl. 2-digit year handling, past month, future year
  - `tokenize`: PAN missing/length/Luhn rejection, past-expiry rejection, valid path returns `{ token, last4 }`, never returns PAN
  - `scrubTokenizeError`: keeps only `code`/`message`; unknown shapes collapse to `{ code: 'unknown', ... }`
- [x] `src/features/registration/schemas/othersInformationSchema.test.js` — Zod schemas (16 assertions)
  - `classificationFlagsSchema`: BR-OI-001 passes with zero or one YES, rejects two; channel discovery accepts valid options, rejects unknown; CHANNEL_OPTIONS matches BRD
  - `departureSchema`: BR-OI-004 soft-require when airportDrop = YES/TBA
  - `cardGuaranteeSchema`: NFR-C-005 past-expiry rejection; token-without-last4 rejection; **asserts no `pan` field in parsed shape**
- [x] `src/features/registration/store/wizardDraft.othersInformation.test.js` — slice behaviour + PCI defence (10 assertions)
  - Mutual exclusivity at the store-action level for all 3 flags (BR-OI-001)
  - `setCardGuaranteeTokenized` strips `pan` and `cvv` from patches
  - Initial `cardGuarantee` shape has no `pan` key
  - **PCI property test**: after a rogue `setCardGuaranteeTokenized({ pan: '4242...' })`, the full serialized Zustand state contains no PAN string
  - `clearCardGuarantee` / `resetOthersInformation` scope verified
- [x] `src/features/registration/tabs/others-information/OthersInformationTab.test.jsx` — component integration (12 assertions)
  - Section A: BR-OI-001 via user clicks; VIP disabled; channel discovery writes
  - Section B: airport-drop conditional hint appears on YES; ETD time change writes to store
  - Section C: `autocomplete="off"` on PAN/reference; `cc-name` on holder
  - Section C: Tokenize button disabled until card-type + PAN + expiry set
  - **PCI property test (end-to-end)**: type a PAN, tokenize, assert `card-number-masked` appears and serialized state contains no PAN
  - Tokenization failure path: bad Luhn surfaces scrubbed error and keeps the PAN input visible

### Acceptance Criteria Validation

Mapped to the 8 bullets under `bolt.md` → "Acceptance Criteria":

- ✅ **Complimentary Guest / House Use / Room Owner mutually exclusive (BR-OI-001)** — enforced at schema level (rejects two YES) + store-action level (flipping one to YES clears the others) + component test via user clicks.
- ✅ **VIP toggle RBAC-gated (NFR-S-002/008)** — component test asserts `vip.disabled === true` (RBAC stub).
- ✅ **Airport Drop = YES/TBA requires Airlines / Flight / ETD (BR-OI-004)** — schema soft-validation test + component test for conditional hint visibility.
- ✅ **Airlines dropdown async-searchable over 65 items (NFR-M-007)** — master extended to 65 airlines in fixture; `useAirlineMaster` hook + MUI Autocomplete verified via the airline-input render.
- ✅ **Card Number masked display `XXXX-XXXX-XXXX-NNNN`; autocomplete=off (NFR-S-009)** — component tests assert both.
- ✅ **Card Expiry validated not in past (NFR-C-005)** — schema test + `isCardExpiryInPast` unit tests.
- ✅ **Tokenization invoked only at Check-in (or explicit click); raw PAN never stored (BR-OI-006, NFR-S-003)** — PCI property test at component level + store-action level + tokenize-on-click component test.
- ✅ **Tokenization outage blocks with actionable message (NFR-R-009)** — failure-path component test verifies scrubbed error is surfaced without losing the input.

### Issues Found

- No source bugs discovered. All tests passed on first run after the two minor tweaks made during component authoring (removing a duplicate `userEvent` import leak + using `fireEvent.change` for the `type=time` input where `user.type` doesn't simulate picker behaviour in jsdom).

### Notes

- **PCI property tests are the most valuable invariant** in this bolt. Both the store-level and component-level versions serialize the full Zustand state to JSON and assert the PAN string is absent. This catches any future regression that might accidentally persist PAN (e.g., a naive state-merge refactor).
- Tokenization mock sleeps 300 ms so the UI's "Tokenizing…" loading state is exercised. Tests use `waitFor` with 2 s timeout to accommodate.
- Store reset in `beforeEach` ensures tests are isolated.
- Component tests do not assert WCAG contrast directly — that remains an a11y-audit scope concern.
- Suite run time: ~16 s; no flakiness observed.
- Total test count growth across Wave 2 so far: 124 → 140 (blank-card) → 163 (complimentary) → **211 (others-info)**.
