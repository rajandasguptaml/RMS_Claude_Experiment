---
id: 009-channel-discovery-group
unit: 002-registration-tab
intent: 001-room-registration
status: draft
priority: should
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-registration-tab-1
implemented: false
---

# Story: 009-channel-discovery-group

## User Story

**As a** Marketing Manager
**I want** front-desk staff to capture how the guest discovered the hotel (Facebook, Website, Google, Others)
**So that** I can report on digital-marketing channel effectiveness

## Acceptance Criteria

- [ ] **Given** the classification section renders, **When** I scroll, **Then** a "How did you find out?" checkbox group appears with 4 options: Facebook, Website, Google, Others.
- [ ] **Given** the field, **When** I tick multiple options, **Then** all selections persist as a multi-value (stored as SET type in the payload).
- [ ] **Given** no selection, **When** I Check-in, **Then** the field submits as empty/null without blocking commit.

## Technical Notes

Maps to **FR-005** new-field requirement. Payload shape: `channel_discovery: string[]` (SET). Optional.

## Dependencies

### Requires
- 008-supplemental-classification-conditional

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Backend doesn't accept SET yet | Confirm contract; fall back to comma-joined string if needed |
| Duplicate same as Others Information section group | Two independent captures (Registration vs Others); BA confirms if merged later |

## Out of Scope

- Reporting/analytics consumption.
