---
id: bolt-registration-tab-1
unit: 002-registration-tab
intent: 001-room-registration
type: simple-construction-bolt
status: complete
stories:
  - 001-header-section-and-dates
  - 002-reservation-link-pre-population
  - 003-conditional-company-fields
  - 004-room-type-and-auto-fill-rates
  - 005-room-list-modal-with-availability
  - 006-discount-rate-rrc-calculation
  - 007-additional-services-add-edit
  - 008-supplemental-classification-conditional
  - 009-channel-discovery-group
  - 010-summary-table-crud
created: 2026-04-20T07:25:00.000Z
started: 2026-04-20T07:35:00.000Z
completed: "2026-04-20T08:31:15Z"
current_stage: null
stages_completed:
  - name: plan
    completed: 2026-04-20T07:45:00.000Z
    artifact: implementation-plan.md
  - name: implement
    completed: 2026-04-20T07:55:00.000Z
    artifact: implementation-walkthrough.md
requires_bolts: []
enables_bolts:
  - bolt-guest-details-tab-1
  - bolt-complimentary-item-tab-1
  - bolt-others-information-tab-1
  - bolt-shell-and-check-in-1
requires_units: []
blocks: false
complexity:
  avg_complexity: 3
  avg_uncertainty: 2
  max_dependencies: 2
  testing_scope: 2
---

# Bolt: bolt-registration-tab-1

## Overview

Foundation bolt delivering the Registration tab — highest data-density unit in the module. Establishes the registration-draft shape every other tab consumes and the form/validation patterns for subsequent tabs.

## Objective

Implement FR-002..FR-006 end-to-end: header section, room detailed information, additional services, supplemental classification, Channel Discovery, and Summary Table CRUD — including Room List modal with optimistic-lock acquisition and RRC reverse-calculation modal.

## Scope (Stories Included)

- **001-header-section-and-dates** (Must)
- **002-reservation-link-pre-population** (Must)
- **003-conditional-company-fields** (Must)
- **004-room-type-and-auto-fill-rates** (Must)
- **005-room-list-modal-with-availability** (Must)
- **006-discount-rate-rrc-calculation** (Must)
- **007-additional-services-add-edit** (Must)
- **008-supplemental-classification-conditional** (Must)
- **009-channel-discovery-group** (Should)
- **010-summary-table-crud** (Must)

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → `implementation-plan.md`
- [ ] **2. Implement**: Pending → source code + `implementation-walkthrough.md`
- [ ] **3. Test**: Pending → tests + `test-walkthrough.md`

## Acceptance Criteria (summarised from stories)

- [ ] Header defaults correctly (Check-In Date, 14:00 / 12:00 times, +1 day Departure, Total Nights calc).
- [ ] Departure > Check-In enforced (BR-REG-004).
- [ ] Reservation checkbox enables dropdown and auto-populates booking fields.
- [ ] Listed Company checkbox reveals 4 conditional fields.
- [ ] Room Type auto-populates rate card; Room List modal shows available rooms + acquires lock.
- [ ] Discount cap (Fixed ≤ Rack Rate) + Negotiated Rate override + RRC reverse-calc work.
- [ ] Services form supports Add/Update/Cancel + multi-service support.
- [ ] Meal Plan & Reference required conditional on reservation link.
- [ ] Channel Discovery checkbox group persists as SET.
- [ ] Summary Table Add/Edit/Delete/Cancel works across rooms + services.

## Technical Approach

- React Hook Form + Zod (split per section: headerSchema, roomSchema, serviceSchema, classificationSchema).
- Zustand slice merging into wizard draft.
- React Query for master data (long staleTime for masters; short for availability).
- MUI Dialog for Room List + RRC modals.
- Selection event triggers POST /rooms/:id/lock; token stored in in-memory store (not sessionStorage).
- Total-calc formula: `Total = (Negotiated||Rack) − Discount + (SC if !waive) + (VAT if !waive) + (City if !waive) + (Additional if !waive)`.
- Summary Table via tanstack-table.

## Dependencies

### Requires
- None (foundation bolt).

### Enables
- bolt-guest-details-tab-1 (adult count context)
- bolt-complimentary-item-tab-1 (package/rate-code trigger)
- bolt-others-information-tab-1 (booking context)
- bolt-shell-and-check-in-1 (validation contract)

## Risks

- Open Question #1 (Check-In Date editability).
- Open Question #3 (package mandatory trigger — rate code? reservation? room type?).
- Open Question #7 (Payment Mode "Before C/O" semantics).
- High data-density: 40+ fields; risk of validation regression during later changes.
- Master-data contracts TBD (Reservation, Company, Rate, Room, Services, Meal Plan, Reference).

## Notes

- Largest bolt in the intent (XL complexity). Consider splitting at Plan stage if timeline demands.
- Channel Discovery is a NEW field vs. original BRD — confirm SET-type storage contract.
