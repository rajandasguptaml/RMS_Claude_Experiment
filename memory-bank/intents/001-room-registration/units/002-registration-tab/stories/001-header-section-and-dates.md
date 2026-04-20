---
id: 001-header-section-and-dates
unit: 002-registration-tab
intent: 001-room-registration
status: complete
priority: must
created: 2026-04-20T07:20:00.000Z
assigned_bolt: bolt-registration-tab-1
implemented: true
---

# Story: 001-header-section-and-dates

## User Story

**As a** Front Desk Agent
**I want** the Registration header to auto-default dates/times and validate their order
**So that** I can capture the basic booking context quickly and correctly

## Acceptance Criteria

- [ ] **Given** the tab loads, **When** rendered, **Then** Check-In Date = application date, Check-In Time = 14:00, Departure = Check-In + 1 day, Checkout Time = 12:00, Total Nights auto-calculated.
- [ ] **Given** I change Departure Date, **When** Departure ≤ Check-In, **Then** inline validation error surfaces and Save/Add is blocked (BR-REG-004).
- [ ] **Given** Total Nights is auto-calculated, **When** I tick "manual override", **Then** the field becomes editable; server treats manual value as authoritative.
- [ ] **Given** Checkout Time defaults, **When** I inspect, **Then** the field is read-only.

## Technical Notes

Maps to **FR-002**. BR-REG-004. Open Question #1 (Check-In Date editability) — default to read-only pending resolution; mark as TODO in UI comment.

## Dependencies

### Requires
- Shell mounts this tab (story 001-shell `001-tab-navigation-and-free-routing`).

### Enables
- 002-reservation-link-pre-population
- 003-conditional-company-fields

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Check-In Date in past | Warning pending Open Question #5 |
| Same-day check-in and checkout | Block with "Departure must be after Check-In" |
| Cross-month Departure | Total Nights computed by date-diff, not calendar days |

## Out of Scope

- Reservation auto-fill (story 002).
- Company fields (story 003).
