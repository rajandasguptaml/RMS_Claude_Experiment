---
id: 002-global-check-in-orchestration
unit: 001-shell-and-check-in
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-shell-and-check-in-1
implemented: false
---

# Story: 002-global-check-in-orchestration

## User Story

**As a** Front Desk Agent
**I want** a single Check-in button that atomically commits all 4 wizard tabs
**So that** the guest is checked in as one transactional operation without partial state

## Acceptance Criteria

- [ ] **Given** I am on any tab, **When** I look below the tab content, **Then** the Check-in button (id=`check-in`) is visible and reachable.
- [ ] **Given** all validations pass, **When** I click Check-in, **Then** the shell acquires a room lock, tokenizes the card (if any), submits the registration payload, opens folio, posts initial room charge, and writes audit log — all in a single orchestrated sequence.
- [ ] **Given** tokenization fails (NFR-R-009), **When** commit runs, **Then** Check-in is blocked with "Tokenization service unavailable — retry or contact IT" and no partial record is created.
- [ ] **Given** commit succeeds, **When** the backend responds, **Then** the room status is Occupied, lock is released, folio is open, and success UI renders with the new RR########.

## Technical Notes

Maps to **FR-007**. Uses React Query mutation with structured error surface. Orchestration order: validate → acquire lock → tokenize → POST registration → release lock → surface RR. BRs: BR-REG-001, BR-REG-002, BR-REG-003. NFRs: NFR-P-015, NFR-S-003, NFR-C-004.

## Dependencies

### Requires
- 001-tab-navigation-and-free-routing
- 003-cross-tab-validation-engine

### Enables
- 004-rr-number-generation-and-success-ui
- 005-optimistic-lock-conflict-ux

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Double-click Check-in | Second click ignored until first settles (button disabled) |
| Backend 500 after tokenization | Card token retained in submission retry; no re-tokenize |
| Partial success (folio opens, charge post fails) | Surface warning with folio id; log for reconciliation |

## Out of Scope

- UI of RR success screen (story 004).
- Edit-mode Update Registration (story 006).
