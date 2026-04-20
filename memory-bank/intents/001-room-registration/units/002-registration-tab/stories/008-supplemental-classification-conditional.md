---
id: 008-supplemental-classification-conditional
unit: 002-registration-tab
intent: 001-room-registration
status: complete
priority: must
created: 2026-04-20T07:20:00.000Z
assigned_bolt: bolt-registration-tab-1
implemented: true
---

# Story: 008-supplemental-classification-conditional

## User Story

**As a** Front Desk Agent
**I want** to classify the booking with Market Segment, Guest Source, Meal Plan, Reference, and Remarks — with Meal Plan and Reference required only when reservation-linked
**So that** reporting is accurate without over-burdening walk-in registrations

## Acceptance Criteria

- [ ] **Given** the booking is walk-in (no reservation link), **When** I inspect Meal Plan and Reference, **Then** both are optional and nullable.
- [ ] **Given** the booking is reservation-linked, **When** I attempt Check-in without Meal Plan or Reference, **Then** validation blocks commit with field-level error (BR-REG-002).
- [ ] **Given** Market Segment and Guest Source, **When** I pick values, **Then** dropdowns show (Dhaka Office / Cox's Office) and (Web Site / Marketing / Other Source / Broker) respectively; both optional.
- [ ] **Given** Meal Plan dropdown, **When** opened, **Then** it shows BED ONLY, BED & BREAKFAST, HALF BOARD, FULL BOARD, and 5+ others from the Meal Plan master.
- [ ] **Given** Reference dropdown, **When** opened, **Then** 29+ options from the Reference master load; searchable for >20 items.
- [ ] **Given** Hotel Remarks and POS Remarks, **When** I type, **Then** both are free-text and optional.

## Technical Notes

Maps to **FR-005** + **BR-REG-002**. Masters: Market Segment, Guest Source, Meal Plan (9+), Reference (29+). NFR-M-003 select2 for large lists.

## Dependencies

### Requires
- 002-reservation-link-pre-population (provides reservation-linked flag)

### Enables
- Unit 001 story 003-cross-tab-validation-engine (consumes conditional)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Reservation linked then unlinked | Required flag drops; inline error clears |
| Reference master returns 100+ items | Async/virtualised select (NFR-M-003) |
| Remarks with special chars | Output-escaped on render (NFR-S-006) |

## Out of Scope

- Channel Discovery group (story 009).
