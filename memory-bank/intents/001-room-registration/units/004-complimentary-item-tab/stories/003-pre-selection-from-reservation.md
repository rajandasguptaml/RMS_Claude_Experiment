---
id: 003-pre-selection-from-reservation
unit: 004-complimentary-item-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-complimentary-item-tab-1
implemented: false
---

# Story: 003-pre-selection-from-reservation

## User Story

**As a** Front Desk Agent
**I want** services tied to the reservation's rate code or package to be pre-checked on tab open
**So that** I don't re-check the standard bundle for each reservation-linked guest

## Acceptance Criteria

- [ ] **Given** a reservation-linked booking with a package, **When** the Complimentary tab opens, **Then** the items linked to that package/rate-code are pre-checked.
- [ ] **Given** a walk-in booking (no reservation), **When** the tab opens, **Then** no items are pre-checked.
- [ ] **Given** the wizard is in edit mode for an existing registration, **When** the tab loads, **Then** previously saved selections are pre-populated instead of package defaults.
- [ ] **Given** no items are selected at Check-in, **When** I proceed, **Then** no error is raised (BR-CI-001).

## Technical Notes

Maps to **FR-009** pre-selection. Depends on Open Question #3 — mandatory trigger: rate code? reservation? room type? Code against a backend-provided `suggested_item_ids[]` to defer the decision.

## Dependencies

### Requires
- 001-tile-grid-responsive-toggle
- Unit 002 story 002-reservation-link-pre-population

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Reservation package references inactive item | Skip (is_active=false); log warning |
| Edit mode with a since-removed item | Keep checked as historical selection; disable removal only per policy |
| Conflicting mandatory vs pre-selection | Mandatory always wins |

## Out of Scope

- Backend computation of suggested_item_ids (assumed).
