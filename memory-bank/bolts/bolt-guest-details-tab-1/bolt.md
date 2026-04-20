---
id: bolt-guest-details-tab-1
unit: 003-guest-details-tab
intent: 001-room-registration
type: simple-construction-bolt
status: complete
stories:
  - 001-basic-info-and-full-name
  - 002-contact-info-and-validation
  - 003-visa-info-and-date-validation
  - 004-passport-info-and-date-validation
  - 005-document-upload-async
  - 006-guest-search-modal-eleven-filters
  - 007-guest-info-modal-with-history
  - 008-blocked-guest-warning-and-list-crud
created: 2026-04-20T07:25:00.000Z
started: 2026-04-20T09:25:00.000Z
completed: "2026-04-20T09:58:47Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-04-20T09:30:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-04-20T09:40:00.000Z
    artifact: implementation-walkthrough.md
requires_bolts:
  - bolt-registration-tab-1
enables_bolts:
  - bolt-shell-and-check-in-1
requires_units: []
blocks: true
complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: bolt-guest-details-tab-1

## Overview

Guest Details tab delivering per-guest profile capture with search, info, and history modals, guest list CRUD, blocked-guest warning (RBAC-gated), and async document upload.

## Objective

Implement FR-008 end-to-end: Basic / Contact / Visa / Passport / Additional sections, Full Guest Name auto-compose, 11-filter Guest Search modal, Guest Info modal with history, Guest List Table CRUD, document upload, and compliance with PII handling NFRs.

## Scope (Stories Included)

- **001-basic-info-and-full-name** (Must)
- **002-contact-info-and-validation** (Must)
- **003-visa-info-and-date-validation** (Must)
- **004-passport-info-and-date-validation** (Must)
- **005-document-upload-async** (Must)
- **006-guest-search-modal-eleven-filters** (Must)
- **007-guest-info-modal-with-history** (Must)
- **008-blocked-guest-warning-and-list-crud** (Must)

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → `implementation-plan.md`
- [ ] **2. Implement**: Pending → source code + `implementation-walkthrough.md`
- [ ] **3. Test**: Pending → tests + `test-walkthrough.md`

## Acceptance Criteria (summarised from stories)

- [ ] Basic info validates BR-GD-002 (Title + First + Country) before Add.
- [ ] Full Guest Name auto-updates <100ms (BR-GD-003, NFR-P-003).
- [ ] Email RFC 5321, Phone international, Zip numeric validators in place.
- [ ] Visa / Passport Expiry > Issue (BR-GD-004).
- [ ] Document upload JPG/PNG/PDF ~5MB with progress; does not block UI (NFR-P-004, NFR-S-005).
- [ ] Guest Search modal with 11 filters; <3s for up to 500 matches (NFR-P-002).
- [ ] Blocked guest retrieval surfaces warning (BR-GD-005).
- [ ] Blocked toggle gated by Supervisor+ role (NFR-S-002/008).
- [ ] Guest List Table supports Add / Update / Delete / Clear.

## Technical Approach

- Per-section schemas merged into one guest form schema.
- Zustand slice for guest list + current editing guest.
- React Query for search + history (+ master data).
- MUI Dialog for Search and Info modals; LinearProgress for upload.
- XMLHttpRequest/fetch with progress for upload; abortable.

## Dependencies

### Requires
- bolt-registration-tab-1 (declared Adult count context)

### Enables
- bolt-shell-and-check-in-1 (adult/guest reconciliation validation)

## Risks

- Open Question #2 (Passport Issue Place field in form vs modal only).
- Open Question #12 (returning-guest lookup keys).
- PII handling — encryption-at-rest is backend concern but masking in UI must be correct (NFR-S-004).
- Guest Search 11-filter UX complexity; default behaviour with empty filters needs decision.

## Notes

- Family/Group/Couple mode toggle behaviour may need BA clarification — ship a sensible default (share Room No.).
