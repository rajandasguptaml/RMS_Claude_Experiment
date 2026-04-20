---
stage: implement
bolt: bolt-others-information-tab-1
created: 2026-04-20T09:15:00Z
---

## Implementation Walkthrough: Others Information Tab

### Summary

Delivered FR-010 — a 3-section tab (classification flags + channel discovery, departure logistics, PCI-DSS-compliant credit-card guarantee) plus a stable tokenization adapter. The `cardGuarantee` store shape contains **no `pan` field** by design; the raw PAN lives in component local state and is cleared immediately after a successful tokenize call. Belt-and-braces: even if a bad caller passes `{ pan: ... }` into the store action, the action strips `pan` and `cvv` before merging. Extended the airlines master to the full 65 airlines per BRD. Zero new runtime deps.

### Structure Overview

- New feature folder `src/features/registration/tabs/others-information/` with 4 components (orchestrator + 3 sections).
- New tokenization adapter `src/features/registration/api/tokenization.js` — mock for now; stable interface for real SDK swap (Open Q #10).
- New composed schema `src/features/registration/schemas/othersInformationSchema.js` — classification + departure + card (tokenized shape).
- Store extended with `othersInformation` slice (sectionA, sectionB, cardGuarantee) plus 5 actions.
- Airlines master extended to 65 items; `useAirlineMaster` hook added.
- Dev route `/dev/others-information-tab` for isolation testing.

### Completed Work

- [x] `src/features/registration/fixtures/airlines.js` — extended from 10 to 65 airlines per FR-010.
- [x] `src/features/registration/api/__mocks__/masters.mock.js` — added `fetchAirlines`.
- [x] `src/features/registration/api/masters.js` — added `useAirlineMaster` React Query hook.
- [x] `src/features/registration/api/tokenization.js` — mock PCI-DSS tokenization adapter with stable interface. Exports `tokenize`, `isCardExpiryInPast`, `scrubTokenizeError`. Includes Luhn validation, expiry-not-past check, 300 ms mock latency, never returns raw PAN.
- [x] `src/features/registration/schemas/othersInformationSchema.js` — Zod schemas. `cardGuaranteeSchema` has no `pan` field. `departureSchema` soft-requires airline/flight/ETD when Airport Drop is YES/TBA. `classificationFlagsSchema` enforces BR-OI-001 mutual exclusivity.
- [x] `src/features/registration/store/wizardDraft.js` — added `othersInformation` slice with separate initialisers for each section. Actions: `setOthersSectionA` (enforces mutual exclusivity), `setOthersSectionB`, `setCardGuaranteeTokenized` (strips `pan` + `cvv` defensively), `clearCardGuarantee`, `resetOthersInformation`. New selector `getOthersInformation`.
- [x] `src/features/registration/tabs/others-information/SectionAClassification.jsx` — classification form. VIP checkbox disabled until RBAC claims wired.
- [x] `src/features/registration/tabs/others-information/SectionBDeparture.jsx` — Airport Drop + MUI Autocomplete for 65 airlines + Flight No + ETD time picker. Conditional-required markers on YES/TBA.
- [x] `src/features/registration/tabs/others-information/SectionCCardGuarantee.jsx` — card guarantee form with masked display, `autocomplete="off"` on PAN/reference, `cc-name` on holder, explicit Tokenize button, PAN cleared from local state on success.
- [x] `src/features/registration/tabs/others-information/OthersInformationTab.jsx` — orchestrator.
- [x] `src/features/registration/index.js` — barrel exports for all new public components.
- [x] `src/App.jsx` — dev route `/dev/others-information-tab`.

### Key Decisions

- **PCI store shape**: `cardGuarantee` slot has no `pan` field. Field-level defence against accidental persistence.
- **PCI store action guard**: `setCardGuaranteeTokenized` strips `pan` and `cvv` keys from any incoming patch. Component-level defence against a bad caller.
- **PCI component boundary**: raw PAN is a `useState` in `SectionCCardGuarantee`. It never propagates up. On successful tokenize, state is cleared via `setPan('')` and only `{ token, last4 }` flows to the store.
- **Tokenize on explicit click only**: the component never tokenizes on keystroke. Typing in the PAN input is purely local React state.
- **Stable adapter interface**: `tokenize({ pan, expiryMonth, expiryYear }) → { token, last4 }` or `throw { code, message }`. Real SDK implementation (Open Q #10 — JS SDK / iframe / redirect) is a one-file swap.
- **Mutual exclusivity at the store action** (not just UI) so the invariant BR-OI-001 holds for programmatic callers, tests, and direct store writes.
- **Airport Drop soft-validation**: schema surfaces issues as custom messages; the shell bolt decides whether Check-in hard-blocks or soft-warns. Component also renders `*` markers + hint text when Airport Drop = YES/TBA.
- **Airlines**: extended the stub fixture (10 → 65 airlines) so the master hook matches the BRD.
- **MUI Autocomplete** for the airline dropdown — size 65 is well within its default perf envelope; no virtualization needed.
- **VIP checkbox disabled by default**: the RBAC stub (`canTouchVip = false`) blocks all users; shell bolt will replace with session-claims check. UI shows a tooltip explaining the requirement.
- **Error scrubbing**: `scrubTokenizeError` accepts only `{ code, message }`; any unknown error shape collapses to `{ code: 'unknown', message: 'Tokenization failed.' }`. Guarantees no PAN or unrelated state accidentally reaches the UI.

### Deviations from Plan

- No functional deviations. Implementation matches plan exactly.
- Minor: airlines fixture grew from 10 → 65 items; this was flagged in the plan as a necessary correction (BRD requires 65).
- `setCardGuaranteeTokenized` uses `delete` on the patch after spread to strip `pan`/`cvv` — slightly cleaner than a destructure-rename pattern and avoids lint warnings about unused bindings.

### Dependencies Added

None. Built on `react`, `zustand`, `@tanstack/react-query`, `zod`, `@mui/material` (Autocomplete + TextField), `tailwindcss` — all installed.

### Developer Notes

- Smoke-test URL: `/dev/others-information-tab`.
- Mock tokenization: enter any Luhn-valid card number (e.g., `4242 4242 4242 4242`), pick an expiry in the future, click **Tokenize Card**. The input flips to a masked display with a **Remove** button. Check DevTools → Application tab → Storage — there's no `pan` anywhere, only `{ token, last4, ... }` under the Zustand store.
- To exercise error paths: use an invalid Luhn PAN or a past expiry; the component surfaces a scrubbed error message.
- The 300 ms mock latency is real-world-ish; during that window the Tokenize button disables and reads "Tokenizing…" so the UX exercises loading state.
- The bolt does **not** wire Check-in; that's the shell bolt. The shell will read `cardGuarantee.token` from the store, combine with the rest of the payload, and POST to the registration endpoint.
- Bundle size advisory unchanged; MUI Autocomplete is already in the bundle from the Registration tab.
