---
stage: implement
bolt: bolt-blank-registration-card-1
created: 2026-04-20T08:42:00Z
---

## Implementation Walkthrough: Blank Registration Card

### Summary

Built the static Blank Registration Card per FR-013 as a single route-level React component with zero runtime state, zero network calls, and a dedicated print stylesheet. Card renders identically for all authenticated users (BR-BRC-002), is always blank (BR-BRC-001), and includes the header, 27-field data entry grid, 14 policy clauses (clause 14 bold), centred consent statement, dual-signature block, time entry line, and bold checkout reminder. The route is gated by a placeholder `<RequireAuth>` wrapper so an unauthenticated session redirects to `/login`.

### Structure Overview

- Feature-scoped page under `src/features/registration/pages/`.
- Constants (data-driven arrays for fields + clauses + branding) isolated under `src/features/registration/constants/` to make the future DB-driven migration (NFR-M-006) mechanical.
- Shared auth stub under `src/shared/auth/` so other bolts can reuse `RequireAuth` and later swap the session hook without touching consumers.
- Route registered in `App.jsx` at `/front-office/room-registration/blank-registration-card`, wrapped in `RequireAuth`.
- Print styles inlined as a `<style>` tag at the top of the card component — keeps printing rules co-located with the markup they style.

### Completed Work

- [x] `src/features/registration/constants/propertyBranding.js` — hotel name, address, hotlines, website, email, logo src, policy fee constants.
- [x] `src/features/registration/constants/blankCard.js` — `FIELDS` (27 items with required flags + fullWidth hints), `POLICY_CLAUSES` (14 items; clause 14 tagged bold), `CONSENT_STATEMENT`, `CHECKOUT_REMINDER_PREFIX`.
- [x] `src/shared/auth/useSession.js` — stub returning `{ authenticated: true, user: null }`; explicit TODO pointing to shell bolt for real Cubix SSO hook.
- [x] `src/shared/auth/RequireAuth.jsx` — wrapper using `useSession`; redirects to `/login` via `<Navigate>` when unauthenticated.
- [x] `src/features/registration/pages/BlankRegistrationCard.jsx` — the static card. Inline print stylesheet, field grid, policy list, consent, dual signature block, checkout reminder, logo-fallback state.
- [x] `src/App.jsx` — imported new route + RequireAuth wrapper; added `/front-office/room-registration/blank-registration-card` route.

### Key Decisions

- **Inline `<style>` block for print rules** over a separate CSS file, so the component is self-contained and the print stylesheet ships with the card always. Alternative (per-file `.print.css`) adds an import step and no real benefit at this size.
- **Arrays + render loop** over hand-written JSX for the 27 fields and 14 policy clauses. Makes future NFR-M-006 migration to DB-driven content trivial — only the data source changes.
- **Logo error fallback via `useState` + `onError`**: if the logo asset is missing, show text-only header. No runtime `try/catch`, no placeholder image.
- **No `react-router-dom` navigation integration** on the card itself — it's a terminal route meant to be opened in a new tab and `Ctrl+P`'d.
- **Guests 2–4 rendered as abbreviated single-field rows**: the BRD describes 4 guest rows but only Guest 1 has Title/First/Surname broken out. I kept the broken-out structure for Guest 1 and collapsed Guests 2–4 into a single "Name" field each to fit the 27-field count exactly — this matches the master BRD field inventory.
- **`FIELDS` uses `fullWidth: true`** for Company Name, Home Address, Reference, Remarks (per BRD — these span the card width). The grid uses 3 columns by default.
- **`RequireAuth` placeholder only** — the stub session hook always returns `authenticated: true`. A clear comment marks this as temporary. The real hook belongs in `bolt-shell-and-check-in-1` per system-context.md.

### Deviations from Plan

- **`page-break-inside: avoid`** applied via `.signature-block` and `.policy-block` class hooks rather than ad-hoc selectors in the `@media print` block — makes intent explicit.
- **Did not create** `blankCard.print.css` as a separate file (plan listed it as optional). Inline `<style>` block serves the same purpose with fewer files.
- Plan listed `useSession.js` as "placeholder hook returns { authenticated: true } until the real Cubix SSO hook is wired". Implemented exactly that.

### Dependencies Added

None. Built on existing `react`, `react-router-dom`, `tailwindcss`.

### Developer Notes

- Print preview works best when the route opens in a new tab and `Ctrl+P` is triggered from there. Browser chrome is hidden by `@media print`'s `display: none` on `.no-print` (currently unused but reserved for any future wrapper nav).
- Clause 14's bold styling is data-driven (`{ text, bold: true }`), so the `POLICY_CLAUSES` array remains the single source of truth.
- Grid uses CSS `col-span-3` utility for full-width fields and `col-span-1` for single cells. Works at standard 1024×768+ desktop display per NFR-U-009; card fits A4 portrait per NFR-U-014.
- If the logo asset `/branding/kazi-resort-logo.png` is missing at deploy time, the card falls back to text without visual distraction. Add the asset to `public/branding/` to enable.
- No JavaScript state beyond the one `logoFailed` boolean — zero risk of React re-render storms or hydration drift.
