---
id: 004-reactivate-registration-rbac
unit: 006-search-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-search-tab-1
implemented: false
---

# Story: 004-reactivate-registration-rbac

## User Story

**As a** Manager or Supervisor
**I want** to re-activate a Checked-Out registration with RBAC, confirmation, and room-overlap revalidation
**So that** accidentally-checked-out guests can be restored safely

## Acceptance Criteria

- [ ] **Given** a Checked-Out row, **When** I click Re-activate (orange reload icon), **Then** a confirmation dialog appears showing Reg. No., Guest Name, Room Info, original dates (BR-SR-008).
- [ ] **Given** I am a Front Desk Agent or Cashier, **When** I try Re-activate, **Then** the action is blocked by RBAC with a clear message (BR-SR-007, NFR-S-002/008).
- [ ] **Given** I confirm as Manager/Supervisor, **When** the request runs, **Then** backend revalidates room availability (no overlap with active In-House registrations — BR-SR-009) and stay dates within operationally permissible window.
- [ ] **Given** revalidation passes, **When** the commit lands, **Then** room status → Occupied, audit log written (user, timestamp, action=Re-activate — NFR-C-004), success confirmation displayed.
- [ ] **Given** revalidation fails (role / credentials / room occupied / dates outside window), **When** response arrives, **Then** specific failure is shown with actionable guidance.

## Technical Notes

Maps to **FR-012** + **BR-SR-007..009**. May require additional credential prompt (approval code) depending on RBAC policy.

## Dependencies

### Requires
- 002-results-datatable-nine-cols

### Enables
- Unit 001 edit-mode (Re-activate may re-enter wizard)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Row is In-House (not eligible) | Re-activate button disabled or absent |
| Dates outside permissible window | Specific error "Stay dates outside operational window" |
| Concurrent Re-activate | Second attempt 409; UX same as lock conflict |

## Out of Scope

- Backend window-policy definition (property config).
