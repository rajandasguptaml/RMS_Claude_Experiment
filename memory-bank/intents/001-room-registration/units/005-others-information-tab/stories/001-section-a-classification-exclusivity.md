---
id: 001-section-a-classification-exclusivity
unit: 005-others-information-tab
intent: 001-room-registration
status: complete
priority: must
created: 2026-04-20T07:20:00.000Z
assigned_bolt: bolt-others-information-tab-1
implemented: true
---

# Story: 001-section-a-classification-exclusivity

## User Story

**As a** Front Desk Agent
**I want** Section A classification fields with Complimentary / House Use / Room Owner enforced as mutually exclusive
**So that** accounting reports stay consistent

## Acceptance Criteria

- [ ] **Given** Section A renders, **When** inspected, **Then** fields appear: Coming From (text), Next Destination (text), Visit Purpose (text), Complimentary Guest (NO/YES), House Use (YES/NO), Room Owner (NO/YES), Is Previously Visited (checkbox), Is VIP (checkbox), "How did you find out?" group (Facebook/Website/Google/Others).
- [ ] **Given** I set Complimentary Guest = YES, **When** the change commits, **Then** House Use and Room Owner auto-reset to NO and are disabled; a helper message explains exclusivity (BR-OI-001).
- [ ] **Given** I am not Supervisor+, **When** I try to tick Is VIP, **Then** the control is disabled (NFR-S-002/008).
- [ ] **Given** I tick multiple discovery channels, **When** saved, **Then** all selections persist (SET-type payload).

## Technical Notes

Maps to **FR-010** Section A + **BR-OI-001**. Exclusivity implemented via form watcher that resets the other two flags to NO whenever one flips to YES.

## Dependencies

### Requires
- Shell mounts tab.

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| All three set to NO | Valid state (default) |
| Role downgrade mid-session | VIP toggle disables on next re-render |
| Long free-text in Coming From | Truncate display at 100 chars; full persists |

## Out of Scope

- Departure info and card (stories 002, 003).
