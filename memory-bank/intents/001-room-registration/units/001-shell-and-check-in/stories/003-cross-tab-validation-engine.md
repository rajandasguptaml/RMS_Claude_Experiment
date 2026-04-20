---
id: 003-cross-tab-validation-engine
unit: 001-shell-and-check-in
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-shell-and-check-in-1
implemented: false
---

# Story: 003-cross-tab-validation-engine

## User Story

**As a** Front Desk Agent
**I want** Check-in to validate every tab and route me to the first offending field
**So that** I can correct errors quickly without hunting across tabs

## Acceptance Criteria

- [ ] **Given** a reservation-linked booking is missing Meal Plan, **When** I click Check-in, **Then** validation fails with an inline error on Meal Plan and the Registration tab auto-activates (BR-REG-002).
- [ ] **Given** declared Adults=2 but guest list has 1 entry, **When** I click Check-in, **Then** commit is blocked with "Guest count must equal declared adults" and the Guest Details tab activates (BR-REG-001).
- [ ] **Given** Departure Date ≤ Check-In Date, **When** I click Check-in, **Then** commit is blocked with field-level error (BR-REG-004).
- [ ] **Given** Fixed Discount > Rack Rate, **When** I click Check-in, **Then** commit is blocked (BR-REG-005).
- [ ] **Given** all mandatory fields pass, **When** I click Check-in, **Then** orchestration proceeds to lock/tokenize/commit.

## Technical Notes

Maps to **FR-007** cross-tab validation section. Each tab unit exposes its Zod schema + an optional conditional-rule evaluator; shell merges and runs once per Check-in. Errors keyed by `{tab, field, message}` for auto-routing.

## Dependencies

### Requires
- 001-tab-navigation-and-free-routing

### Enables
- 002-global-check-in-orchestration

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Multiple tabs have errors | Focus first tab in tab order; show inline errors on all |
| Reservation linked but walk-in fields also filled | Reservation rules take precedence (BR-REG-002) |
| Zero guests | Block with "At least one guest required" (BR-GD-001) |
| Past check-in date selected | Warning or block pending Open Question #5 resolution |

## Out of Scope

- Tab-specific field-level validators (owned by tab units).
