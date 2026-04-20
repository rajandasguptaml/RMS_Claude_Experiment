---
id: 007-additional-services-add-edit
unit: 002-registration-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-registration-tab-1
implemented: false
---

# Story: 007-additional-services-add-edit

## User Story

**As a** Front Desk Agent
**I want** to attach one or more billable services (e.g., Airport Drop, Extra Breakfast, Laundry, Spa) to a registration
**So that** known extras are billed transparently from the start of stay

## Acceptance Criteria

- [ ] **Given** the services form is empty, **When** I open Service Name, **Then** the dropdown lists 25 services from the service master.
- [ ] **Given** I pick a service, **When** selection fires, **Then** Service From/To Date default to Check-In Date; Total Service Amount auto-calculates by rate × duration.
- [ ] **Given** I click Add, **When** validation passes, **Then** a row appends to the Summary Table and the form resets.
- [ ] **Given** I am in edit mode for a service row, **When** Update is visible (not `d-none`), **Then** clicking Update saves the modified row without duplication.
- [ ] **Given** I click Cancel mid-entry, **When** confirmed, **Then** the form clears without touching the table.
- [ ] **Given** I click the service-level RRC, **When** the modal opens, **Then** reverse-calc from a target total produces the per-unit rate.

## Technical Notes

Maps to **FR-004**. Service/Charge Master via `/master/services` (NFR-M-003).

## Dependencies

### Requires
- 001-header-section-and-dates (for default dates)

### Enables
- 010-summary-table-crud

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Same service added twice | Allowed (different dates/quantity); rows tagged unique id |
| Service To-Date before From-Date | Block; inline error |
| Service spans beyond Departure Date | Warn but allow (staff override) |

## Out of Scope

- Complimentary items (unit 004).
