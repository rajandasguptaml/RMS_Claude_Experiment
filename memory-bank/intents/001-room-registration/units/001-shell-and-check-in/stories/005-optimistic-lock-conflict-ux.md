---
id: 005-optimistic-lock-conflict-ux
unit: 001-shell-and-check-in
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-shell-and-check-in-1
implemented: false
---

# Story: 005-optimistic-lock-conflict-ux

## User Story

**As a** Front Desk Agent
**I want** a clear, actionable error when another agent concurrently takes the same room
**So that** I can pick an alternate room without losing the rest of my wizard data

## Acceptance Criteria

- [ ] **Given** I select a room, **When** the Room List modal closes, **Then** a concurrency token (UUID) is acquired from the backend and held against that room.
- [ ] **Given** another agent commits first, **When** I click Check-in, **Then** the server returns 409 and the UI shows "Room already assigned — choose another room" with a link to reopen the Room List modal.
- [ ] **Given** I abandon the registration (Cancel or tab close), **When** the draft is discarded, **Then** the room lock is released via DELETE.
- [ ] **Given** lock acquisition fails at selection time, **When** the modal closes, **Then** the room is removed from selectable list and an inline message appears.

## Technical Notes

Maps to **FR-007** + **BR-REG-003**. NFR-R-008. Use AbortController to cancel pending requests on abandonment. Lock token stored in Zustand store only (not sessionStorage — tokens expire).

## Dependencies

### Requires
- 002-global-check-in-orchestration
- Unit 002 Room List modal (selection event triggers lock acquire)

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Network blip between acquire and commit | Backend renews or re-acquires; UX transparent if renewal succeeds |
| Lock TTL expires before commit | 409 at commit; same UX path as concurrency conflict |
| Multiple rooms locked (multi-room registration) | Any single conflict blocks commit; all locks release on failure |

## Out of Scope

- Backend lock implementation — contract assumed.
