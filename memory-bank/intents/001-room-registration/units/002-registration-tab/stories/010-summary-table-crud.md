---
id: 010-summary-table-crud
unit: 002-registration-tab
intent: 001-room-registration
status: complete
priority: must
created: 2026-04-20T07:20:00.000Z
assigned_bolt: bolt-registration-tab-1
implemented: true
---

# Story: 010-summary-table-crud

## User Story

**As a** Front Desk Agent
**I want** a Summary Table showing every added room and service with Edit/Delete actions
**So that** I can review and adjust the full booking before Check-in

## Acceptance Criteria

- [ ] **Given** I add a room, **When** Add fires, **Then** a row appears in the Summary Table with columns: Room Type, Room Number, Adult, Child, Check-In Date, Checkout Date, No. Of Night, Room Rate, Additional Service, Status, Action.
- [ ] **Given** I click the cyan Edit button, **When** action fires, **Then** the row repopulates the form for edit.
- [ ] **Given** I click the warning Delete button, **When** confirmed, **Then** the row is removed and any associated room lock is released.
- [ ] **Given** Room Type or Room Number is missing, **When** I click Add, **Then** the Add is blocked with inline error.
- [ ] **Given** I click Cancel on the form, **When** action fires, **Then** unsaved in-progress config clears without touching the table.

## Technical Notes

Maps to **FR-006**. Table composed of rooms and service rows. Status column reflects row-level state (Draft / Committed).

## Dependencies

### Requires
- 006-discount-rate-rrc-calculation
- 007-additional-services-add-edit

### Enables
- Unit 001 orchestration (consumes rows for payload)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Empty table at Check-in | Block with "Add at least one room" |
| Edit row → Change Room Type → no compatible rates | Show inline error and hold edit |
| Delete last room row | Summary empty; warn before delete |

## Out of Scope

- Bulk edit / reorder rows.
