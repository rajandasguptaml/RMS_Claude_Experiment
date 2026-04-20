---
id: bolt-others-information-tab-1
unit: 005-others-information-tab
intent: 001-room-registration
type: simple-construction-bolt
status: complete
stories:
  - 001-section-a-classification-exclusivity
  - 002-section-b-departure-conditional
  - 003-section-c-card-form-with-masking
  - 004-pci-tokenization-call-integration
created: 2026-04-20T07:25:00.000Z
started: 2026-04-20T09:05:00.000Z
completed: "2026-04-20T09:08:48Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-04-20T09:10:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-04-20T09:18:00.000Z
    artifact: implementation-walkthrough.md
requires_bolts:
  - bolt-registration-tab-1
enables_bolts:
  - bolt-shell-and-check-in-1
requires_units: []
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 3
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: bolt-others-information-tab-1

## Overview

Others Information tab — three sections (classification flags, departure logistics, credit-card guarantee) — plus the PCI-DSS tokenization call-site contract used by the shell at Check-in.

## Objective

Implement FR-010 end-to-end with strict PCI discipline: raw PAN never persists anywhere; only tokenized values enter the registration payload.

## Scope (Stories Included)

- **001-section-a-classification-exclusivity** (Must)
- **002-section-b-departure-conditional** (Must)
- **003-section-c-card-form-with-masking** (Must)
- **004-pci-tokenization-call-integration** (Must)

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → `implementation-plan.md`
- [ ] **2. Implement**: Pending → source code + `implementation-walkthrough.md`
- [ ] **3. Test**: Pending → tests + `test-walkthrough.md`

## Acceptance Criteria (summarised from stories)

- [ ] Complimentary Guest / House Use / Room Owner mutually exclusive (BR-OI-001).
- [ ] VIP toggle RBAC-gated (NFR-S-002/008).
- [ ] Airport Drop = YES/TBA requires Airlines / Flight No. / ETD (BR-OI-004).
- [ ] Airline dropdown async-searchable over 65 items from master (NFR-M-007).
- [ ] Card Number masked display `XXXX-XXXX-XXXX-NNNN`; `autocomplete="off"` (NFR-S-009).
- [ ] Card Expiry validated not in past (NFR-C-005).
- [ ] Tokenization invoked only at Check-in; raw PAN never stored (BR-OI-006, NFR-S-003).
- [ ] Tokenization outage blocks Check-in with actionable message (NFR-R-009).

## Technical Approach

- React Hook Form + Zod split per section (classification, departure, card).
- Zustand slice for Sections A + B; **card-section state is ephemeral React local state only** — wiped after tokenize.
- Tokenization adapter behind a single `tokenize()` fn — abstracts SDK/iframe/redirect (Open Question #10).
- Mutual-exclusivity implemented via form watcher that resets other flags when one flips to YES.
- PAN scrubbing: any error message / log that might reference form state must run through a sanitizer.

## Dependencies

### Requires
- bolt-registration-tab-1 (booking context)

### Enables
- bolt-shell-and-check-in-1 (tokenization call + classification payload)

## Risks

- Open Question #4 (security deposit vs guarantee semantics).
- Open Question #10 (tokenization SDK vs iframe vs redirect) — architecturally significant for the adapter design.
- PCI compliance — any state leak is a security incident.
- Airline master of 65 — confirm dropdown UX (virtualised or plain).

## Notes

- Strongly recommend a PCI-scope test suite: property-based tests asserting PAN never present in Zustand snapshots, sessionStorage keys, or error messages.
