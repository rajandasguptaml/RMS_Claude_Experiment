---
id: 002-reservation-link-pre-population
unit: 002-registration-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-registration-tab-1
implemented: false
---

# Story: 002-reservation-link-pre-population

## User Story

**As a** Front Desk Agent
**I want** to link to an existing reservation and auto-populate booking details
**So that** reservation-linked check-ins require minimal re-entry

## Acceptance Criteria

- [ ] **Given** the Reservation checkbox is unchecked, **When** I inspect, **Then** the reservation dropdown is disabled.
- [ ] **Given** I tick the Reservation checkbox and select a reservation, **When** selection fires, **Then** Check-In Date, Departure Date, Total Nights, Room Type, Rack Rate, Currency populate.
- [ ] **Given** the booking is now reservation-linked, **When** I attempt Check-in, **Then** Meal Plan and Reference are mandatory (BR-REG-002) — handled by shell validator.
- [ ] **Given** I untick Reservation, **When** the dropdown disables, **Then** auto-populated fields remain but revert to editable; linked flag clears.

## Technical Notes

Maps to **FR-002** auto-population + **BR-REG-002**. Reservation master via `/master/reservations` with search-as-type. React Query with 30s staleTime.

## Dependencies

### Requires
- 001-header-section-and-dates

### Enables
- 008-supplemental-classification-conditional (conditional trigger)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Reservation already checked-in | Excluded from dropdown |
| Reservation dates in past | Warn but allow (staff may back-date intentionally) |
| Reservation cancelled | Excluded from dropdown |

## Out of Scope

- The reservations API implementation.
