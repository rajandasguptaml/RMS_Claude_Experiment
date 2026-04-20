---
id: 002-section-b-departure-conditional
unit: 005-others-information-tab
intent: 001-room-registration
status: complete
priority: must
created: 2026-04-20T07:20:00.000Z
assigned_bolt: bolt-others-information-tab-1
implemented: true
---

# Story: 002-section-b-departure-conditional

## User Story

**As a** Front Desk Agent
**I want** Section B departure details — airline, flight number, ETD — required only when Airport Drop is YES or TBA
**So that** I don't hassle walk-in guests who don't need airport service

## Acceptance Criteria

- [ ] **Given** Section B renders, **When** inspected, **Then** fields appear: Airport Drop (NO/YES/TBA), Airlines searchable dropdown (65 items from master), Flight Number (text), Departure Time ETD (HH:MM 24h).
- [ ] **Given** Airport Drop = YES or TBA, **When** I try to Check-in with Airlines / Flight No. / ETD empty, **Then** shell validation blocks commit with field-level errors (BR-OI-004).
- [ ] **Given** Airport Drop = NO, **When** I Check-in with departure fields blank, **Then** no validation error is raised.
- [ ] **Given** Airlines dropdown, **When** I type, **Then** async / local search narrows to matching entries (NFR-M-007).

## Technical Notes

Maps to **FR-010** Section B + **BR-OI-004**. Airline Master is dynamic (NFR-M-007) — supports new airlines without deploy.

## Dependencies

### Requires
- 001-section-a-classification-exclusivity

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Airport Drop changed YES→NO mid-entry | Fields retain values but clear validation errors |
| ETD entered outside 00:00-23:59 | Block with inline error |
| Flight No. with leading/trailing whitespace | Trim on blur |

## Out of Scope

- Airport-pickup flow (inbound — not explicitly in scope of this tab).
