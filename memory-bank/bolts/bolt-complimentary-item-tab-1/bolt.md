---
id: bolt-complimentary-item-tab-1
unit: 004-complimentary-item-tab
intent: 001-room-registration
type: simple-construction-bolt
status: planned
stories:
  - 001-tile-grid-responsive-toggle
  - 002-select-all-and-mandatory-lock
  - 003-pre-selection-from-reservation
created: 2026-04-20T07:25:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts:
  - bolt-registration-tab-1
enables_bolts:
  - bolt-shell-and-check-in-1
requires_units: []
blocks: true

complexity:
  avg_complexity: 1
  avg_uncertainty: 2
  max_dependencies: 1
  testing_scope: 1
---

# Bolt: bolt-complimentary-item-tab-1

## Overview

Complimentary Item tab delivering a 4-column responsive grid of 29 tiles, Select All master behaviour, package-mandatory locking, and pre-selection from reservation package.

## Objective

Implement FR-009 end-to-end with strict adherence to BR-CI-001/002/003 and performance NFRs (<100ms tile toggle, <200ms Select All).

## Scope (Stories Included)

- **001-tile-grid-responsive-toggle** (Must)
- **002-select-all-and-mandatory-lock** (Must)
- **003-pre-selection-from-reservation** (Must)

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → `implementation-plan.md`
- [ ] **2. Implement**: Pending → source code + `implementation-walkthrough.md`
- [ ] **3. Test**: Pending → tests + `test-walkthrough.md`

## Acceptance Criteria (summarised from stories)

- [ ] All 29 items render from master (no hard-code) in a 4-col responsive grid.
- [ ] Tile toggle <100ms (NFR-P-013).
- [ ] Select All toggles non-mandatory only; <200ms (NFR-P-014); mandatory items remain checked.
- [ ] Mandatory items use HTML `disabled` (BR-CI-002).
- [ ] Reservation-linked bookings pre-check package-linked items.
- [ ] Zero selection valid (BR-CI-001).
- [ ] Selected tile style: dark navy bg + white text + checkmark; WCAG AA contrast (NFR-U-008).

## Technical Approach

- Tailwind grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
- Zustand slice storing `selected: string[]`.
- React Query for master (long staleTime, filter `is_active=true`).
- Pure client-side toggle — no network per click.
- Backend returns `suggested_item_ids[]` for pre-selection to abstract away Open Question #3.

## Dependencies

### Requires
- bolt-registration-tab-1 (reservation / package / rate-code context)

### Enables
- bolt-shell-and-check-in-1 (payload contributor)

## Risks

- Open Question #3 (mandatory trigger mechanism) — mitigated by backend-computed `suggested_item_ids[]`.
- Master dynamic (`is_active`) — handle history correctly for edit mode.

## Notes

- Lowest complexity unit; good candidate to parallelise with 003/005/007.
- Consider shipping visual snapshot test to lock down tile styling.
