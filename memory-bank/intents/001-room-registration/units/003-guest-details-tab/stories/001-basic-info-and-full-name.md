---
id: 001-basic-info-and-full-name
unit: 003-guest-details-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-guest-details-tab-1
implemented: false
---

# Story: 001-basic-info-and-full-name

## User Story

**As a** Front Desk Agent
**I want** to capture each guest's basic identity and see their Full Guest Name auto-compose
**So that** guest records are consistent and the full name is always correct

## Acceptance Criteria

- [ ] **Given** the form is empty, **When** rendered, **Then** fields appear: Title* (MR/MRS/MS/DR/etc.), First Name*, Last Name, Gender, Room No., Full Guest Name (read-only), DOB.
- [ ] **Given** I change Title, First Name, or Last Name, **When** the value commits, **Then** Full Guest Name recomposes within 100ms as `{Title} {First} {Last}` (BR-GD-003, NFR-P-003).
- [ ] **Given** I click Add without Title or First Name, **When** validation runs, **Then** Add is blocked with inline errors (BR-GD-002).
- [ ] **Given** Family/Group/Couple checkbox is active, **When** I add guests, **Then** they share the same Room No. by default.

## Technical Notes

Maps to **FR-008** basic info + **BR-GD-002**, **BR-GD-003**. Title master fixed list. Gender optional with accepted codes.

## Dependencies

### Requires
- Shell mounts tab.
- Unit 002 story 001 (provides adult/child count context).

### Enables
- 008-blocked-guest-warning-and-list-crud

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Title changed after add | Existing row unchanged; only the form draft updates |
| Unicode first/last name | Allowed; name composed as-is |
| DOB >130 years ago | Warn but allow |

## Out of Scope

- Contact, visa, passport, documents (other stories).
