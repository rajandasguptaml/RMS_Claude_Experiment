---
id: bolt-blank-registration-card-1
unit: 007-blank-registration-card
intent: 001-room-registration
type: simple-construction-bolt
status: planned
stories:
  - 001-static-27-field-form-layout
  - 002-policy-clauses-consent-signatures
  - 003-print-optimization-and-auth-gate
created: 2026-04-20T07:25:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts: []
enables_bolts: []
requires_units: []
blocks: false

complexity:
  avg_complexity: 1
  avg_uncertainty: 1
  max_dependencies: 0
  testing_scope: 1
---

# Bolt: bolt-blank-registration-card-1

## Overview

Standalone static Blank Registration Card at `/front_office/room-registration/blank-registration-card`. No DB, no JS runtime, identical output for all authenticated users. Print-optimised for A4 portrait.

## Objective

Deliver FR-013 end-to-end: 27 labelled blank fields, 14 policy clauses, consent, dual signatures, checkout reminder, browser-native print stylesheet, and auth gate.

## Scope (Stories Included)

- **001-static-27-field-form-layout** (Must)
- **002-policy-clauses-consent-signatures** (Must)
- **003-print-optimization-and-auth-gate** (Must)

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → `implementation-plan.md`
- [ ] **2. Implement**: Pending → source code + `implementation-walkthrough.md`
- [ ] **3. Test**: Pending → tests + `test-walkthrough.md`

## Acceptance Criteria (summarised from stories)

- [ ] Static markup renders with 27 labelled fields (13 marked required).
- [ ] Hotel header shows logo, name, address, hotlines, website, email.
- [ ] 14 policy clauses render (1-13 normal, 14 bold) (BR-BRC-003).
- [ ] Consent statement mandatory, H2 centred (BR-BRC-004).
- [ ] Dual signature section: "Checked in By*" + "Guest Signature*" 50% each (BR-BRC-005).
- [ ] Check-In / Check-Out time entry line present.
- [ ] Checkout reminder bold at bottom (NFR-R-007).
- [ ] Identical output for all authenticated users (BR-BRC-002).
- [ ] Always blank — no pre-fill (BR-BRC-001).
- [ ] Load <1s; no DB (NFR-P-012); 9pt min text (NFR-U-014).
- [ ] Auth required; unauth → /login (NFR-S-001).

## Technical Approach

- Minimal React component tree; no state, no queries.
- Tailwind + `@media print { @page { size: A4 portrait; margin: 10mm; } }`.
- `page-break-inside: avoid` around signature block.
- Array-based clause rendering (enables future NFR-M-006 migration).
- Property branding passed as constants or from property-settings hook (fallback hard-coded).

## Dependencies

### Requires
- None (standalone — can ship day 1).

### Enables
- None.

## Risks

- Open Question #6 (hard-coded vs configurable per property). Deferred; deliver hard-coded v1 with a data-driven interface.
- Cross-browser print consistency (Chrome/Edge/Safari).
- Property-specific logos may be missing at first deploy — fallback to text.

## Notes

- Snapshot tests + a visual regression check recommended to lock layout.
- Standalone bolt — can run in parallel with Wave 1 (dev onboarding friendly).
