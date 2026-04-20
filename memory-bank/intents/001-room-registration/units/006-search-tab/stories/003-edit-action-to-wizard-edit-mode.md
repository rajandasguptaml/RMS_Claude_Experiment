---
id: 003-edit-action-to-wizard-edit-mode
unit: 006-search-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-search-tab-1
implemented: false
---

# Story: 003-edit-action-to-wizard-edit-mode

## User Story

**As a** Front Desk user with edit permission
**I want** to click Edit on a row and load the registration into the 4-tab wizard in edit mode
**So that** I can adjust details on both In-House and Checked-Out registrations

## Acceptance Criteria

- [ ] **Given** a row, **When** I click Edit (cyan pencil), **Then** the app calls `showFoRegGuestData(registration_id)` equivalent and loads the record into the wizard within 2s (NFR-P-010).
- [ ] **Given** the load completes, **When** the wizard appears, **Then** the Check-in button is replaced by Update Registration (yellow) — delivered by unit 001 story 006.
- [ ] **Given** the record is In-House or Checked-Out, **When** I click Edit, **Then** both statuses are allowed (BR-SR-005).
- [ ] **Given** an Update is saved, **When** response lands, **Then** the original check-in timestamp is unchanged (BR-SR-006).

## Technical Notes

Maps to **FR-011** Edit action. Depends on unit 001 edit-mode integration (story 006 of unit 001).

## Dependencies

### Requires
- 002-results-datatable-nine-cols
- Unit 001 story 006-edit-mode-toggle-update-registration

### Enables
- None (completes Edit path)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Load call fails | Error toast; stay on Search tab |
| User lacks edit permission | Edit button disabled; tooltip explains |
| Register already in another user's edit session | Warn; allow but flag optimistic conflict |

## Out of Scope

- Backend implementation of the load endpoint.
