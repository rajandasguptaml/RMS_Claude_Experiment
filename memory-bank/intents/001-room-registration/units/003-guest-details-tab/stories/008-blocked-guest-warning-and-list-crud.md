---
id: 008-blocked-guest-warning-and-list-crud
unit: 003-guest-details-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-guest-details-tab-1
implemented: false
---

# Story: 008-blocked-guest-warning-and-list-crud

## User Story

**As a** Front Desk Agent
**I want** a clear blocked-guest warning and full CRUD over the Guest List Table
**So that** policy-flagged guests are identified and the guest roster stays correct

## Acceptance Criteria

- [ ] **Given** I SELECT GUEST from search and the record has `is_blocked=true`, **When** population begins, **Then** a visible warning displays before form populates (BR-GD-005).
- [ ] **Given** I am not Supervisor+, **When** I try to toggle Blocked Guest, **Then** the control is disabled (NFR-S-002, NFR-S-008).
- [ ] **Given** I click Add after valid basic info, **When** action fires, **Then** a row appears in the Guest List Table with columns: Guest Name, Email, Room Number, Is Contact Person, Action.
- [ ] **Given** I click Update on a row (edit mode), **When** save fires, **Then** the row updates without duplication.
- [ ] **Given** I click Delete on a row, **When** confirmed, **Then** the row removes.
- [ ] **Given** I click Clear, **When** action fires, **Then** the form resets without touching the table.
- [ ] **Given** declared Adults = N, **When** list size ≠ N at Check-in, **Then** shell raises validation (BR-REG-001 via unit 001).

## Technical Notes

Maps to **FR-008** CRUD + **BR-GD-001**, **BR-GD-005**, **BR-GD-006**. Table render must be lag-free up to 20 entries (NFR-P-005).

## Dependencies

### Requires
- 001-basic-info-and-full-name
- 006-guest-search-modal-eleven-filters

### Enables
- Unit 001 cross-tab validator

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Two contact persons ticked | Only one allowed per registration; UI enforces |
| Delete last guest | Warn: "At least one guest required for Check-in" (BR-GD-001) |
| Role downgrades mid-session | Blocked toggle hides on next re-render |

## Out of Scope

- Creating/editing the blocked-guest master list.
