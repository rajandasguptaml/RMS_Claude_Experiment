---
unit: 007-blank-registration-card
intent: 001-room-registration
phase: inception
status: ready
created: 2026-04-20T07:15:00Z
updated: 2026-04-20T07:15:00Z
---

# Unit Brief: Blank Registration Card

## Purpose

Render a print-optimised, static, always-empty pre-registration form at `/front_office/room-registration/blank-registration-card` (new browser tab). Zero JS runtime, zero DB queries. Contains hotel header, 27 labelled data-entry fields, 14 policy clauses, consent statement, dual signature section, and a checkout-time reminder. Intended for guest handwritten completion and later digital entry by staff.

## Scope

### In Scope
- Static component at the new-tab route.
- Hotel header block (logo, name, address, hotlines, website, email — property-specific).
- 27 blank field labels (13 required marked with *).
- Card title "Pre Registration Card" + visible Room No. field.
- 14 policy clauses (1-13 normal, 14 bold).
- Consent statement ("By signing this form, I consent…") centred H2.
- Dual signature section ("Checked in By*" 50% + "Guest Signature*" 50%).
- Time entry line ("Check-In at ...HRS. Check-Out at ...HRS.").
- Checkout reminder bold at bottom.
- Print stylesheet: single A4 portrait, borders visible, 9pt min font (NFR-U-014).
- Auth gate: valid HMS session required (NFR-S-001).

### Out of Scope
- Any dynamic/pre-filled data (BR-BRC-001).
- Database queries / API calls.
- JavaScript beyond framework bootstrap.
- Pre-filled Registration Card (separate route owned elsewhere).

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-013 | Blank Registration Card — static printable form | Must |

Referenced BRs: BR-BRC-001 (always empty), BR-BRC-002 (identical for all users), BR-BRC-003 (14 clauses always present), BR-BRC-004 (consent statement mandatory), BR-BRC-005 (dual signature lines mandatory).

Referenced NFRs: NFR-P-012 (<1s load, no DB), NFR-U-014 (9pt min, clauses readable), NFR-R-007 (checkout reminder always present), NFR-S-001 (auth required), NFR-M-005 (hotel contact from property settings), NFR-M-006 (policy clauses configurable — gap: currently hard-coded).

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| Card Template | Static markup + CSS | hotelHeader, fields[], clauses[], consent, signatures, reminder |
| Property Branding | Hotel-specific (from settings if available) | name, address, logoUrl, hotlines, website, email |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| renderCard() | Render blank card, no pre-fill | property settings | static markup |
| print() | Browser native Ctrl+P | user gesture | A4 portrait output |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 3 |
| Must Have | 3 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-static-27-field-form-layout | Static 27-field form layout | Must | Planned |
| 002-policy-clauses-consent-signatures | 14 policy clauses + consent + dual signatures | Must | Planned |
| 003-print-optimization-and-auth-gate | Browser-native print optimization for A4 + auth gate | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| None | Standalone — can ship day 1 |

### Depended By
| Unit | Reason |
|------|--------|
| None | Terminal user-facing unit |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Cubix SSO / Session | Auth gate (NFR-S-001) | Low |
| Property Settings (optional) | Hotel contact info (NFR-M-005) | Low — falls back to hard-coded if unavailable |

---

## Technical Context

### Suggested Technology
- React 19 + Vite — minimal component tree; effectively SSR-friendly static.
- Tailwind CSS for print utilities + `@media print` stylesheet for A4 portrait, borders, page-break control.
- NO runtime JS beyond framework — no state, no queries.
- Vitest + RTL snapshot for layout verification; visual regression recommended.

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| Session middleware | Auth check | HTTP |
| Browser Print Subsystem | Native print | Ctrl+P |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| None | - | - | - |

---

## Constraints

- BR-BRC-001: Card ALWAYS renders empty. No pre-fill, no URL-based personalisation.
- BR-BRC-003: All 14 clauses must be present on every render.
- NFR-M-006: Policy clauses currently hard-coded — tech-debt; flagged as follow-up.
- NFR-P-012: <1s load (no DB).
- NFR-U-014: 9pt minimum; clauses readable printed.

---

## Success Criteria

### Functional
- [ ] Renders empty for all authenticated users (BR-BRC-001, BR-BRC-002).
- [ ] Contains all 27 labelled fields, 14 clauses (1-13 normal + 14 bold), consent, dual signatures, checkout reminder.
- [ ] Browser print produces clean single-A4 output.

### Non-Functional
- [ ] Load <1s (NFR-P-012).
- [ ] 9pt min text (NFR-U-014).
- [ ] Auth required (NFR-S-001).
- [ ] Checkout reminder always present (NFR-R-007).

### Quality
- [ ] Code coverage > 80%
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| bolt-blank-registration-card-1 | simple-construction-bolt | 001..003 | Static markup + clauses/consent + print + auth |

---

## Notes

- Open Question #6 (hard-coded vs configurable per property). Deliver hard-coded v1 with a data-driven interface (props) so future configurability is trivial.
- Consider extracting property-branding props into a small constants file for future NFR-M-005 migration.
