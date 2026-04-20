---
id: 004-passport-info-and-date-validation
unit: 003-guest-details-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-guest-details-tab-1
implemented: false
---

# Story: 004-passport-info-and-date-validation

## User Story

**As a** Front Desk Agent
**I want** to capture passport number, issue date, and expiry date with date-order validation
**So that** the guest's identity doc is recorded for local compliance

## Acceptance Criteria

- [ ] **Given** the passport sub-section, **When** rendered, **Then** fields appear: Passport Number, Issue Date, Expiry Date.
- [ ] **Given** both Issue Date and Expiry Date are entered, **When** Expiry ≤ Issue, **Then** inline error displays (BR-GD-004, NFR-C-008).
- [ ] **Given** only one date is entered, **When** I add the guest, **Then** no date-order error is raised.

## Technical Notes

Maps to **FR-008** passport. BR-GD-004, NFR-C-008. Open Question #2 — Passport Issue Place may need an additional input field (currently in Guest Info modal only).

## Dependencies

### Requires
- 001-basic-info-and-full-name

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Passport expired | Warn but allow |
| National ID used instead of passport | Passport fields empty allowed; National ID from story 002 |
| Special characters in passport no. | Allowed; server-side normalises |

## Out of Scope

- Immigration XML export.
