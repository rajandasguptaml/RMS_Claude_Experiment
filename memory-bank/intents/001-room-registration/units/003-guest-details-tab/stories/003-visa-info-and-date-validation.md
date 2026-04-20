---
id: 003-visa-info-and-date-validation
unit: 003-guest-details-tab
intent: 001-room-registration
status: complete
priority: must
created: 2026-04-20T07:20:00.000Z
assigned_bolt: bolt-guest-details-tab-1
implemented: true
---

# Story: 003-visa-info-and-date-validation

## User Story

**As a** Front Desk Agent
**I want** to capture visa number, issue date, and expiry date with date-order validation
**So that** immigration reporting data is accurate

## Acceptance Criteria

- [ ] **Given** the visa sub-section, **When** rendered, **Then** fields appear: Visa Number, Issue Date, Expiry Date.
- [ ] **Given** both Issue Date and Expiry Date are entered, **When** Expiry ≤ Issue, **Then** inline error displays (BR-GD-004, NFR-C-008).
- [ ] **Given** only one date is entered, **When** I add the guest, **Then** no date-order error (validation requires both).

## Technical Notes

Maps to **FR-008** visa. BR-GD-004, NFR-C-008. NFR-U-002 consistent date picker.

## Dependencies

### Requires
- 001-basic-info-and-full-name

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Expired visa at Check-In date | Warn but allow (subject to local policy) |
| Visa Issue Date in future | Warn but allow |
| Non-Bangladeshi national with no visa | Fields left blank; not required |

## Out of Scope

- C-Form / immigration submission (downstream).
