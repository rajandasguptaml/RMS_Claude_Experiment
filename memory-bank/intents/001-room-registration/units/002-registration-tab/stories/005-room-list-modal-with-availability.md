---
id: 005-room-list-modal-with-availability
unit: 002-registration-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-registration-tab-1
implemented: false
---

# Story: 005-room-list-modal-with-availability

## User Story

**As a** Front Desk Agent
**I want** to open a Room List modal that shows only available rooms for the selected type and date range
**So that** I never assign a room that is already occupied or out of service

## Acceptance Criteria

- [ ] **Given** Room Type is selected, **When** I click the Room List button, **Then** a modal opens with columns (Select, Room Number) listing only rooms available for the Check-In → Departure window.
- [ ] **Given** I pick a room in the modal, **When** I confirm, **Then** the Room Number field populates (read-only) and the backend acquires an optimistic-lock token against that room (BR-REG-003).
- [ ] **Given** another agent concurrently takes the same room, **When** I next open the modal, **Then** that room is absent or marked unavailable (NFR-R-008).
- [ ] **Given** lock acquisition fails, **When** the modal closes, **Then** Room Number is NOT set and an inline error appears.

## Technical Notes

Maps to **FR-003** Room List modal + **BR-REG-003**. The lock token is propagated to unit 001's orchestrator for release at commit/abandon.

## Dependencies

### Requires
- 004-room-type-and-auto-fill-rates

### Enables
- 006-discount-rate-rrc-calculation
- Unit 001 story 005-optimistic-lock-conflict-ux

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Zero available rooms | Empty state: "No rooms available for this type/date" |
| User closes modal without selecting | No lock acquired; Room Number stays empty |
| Multi-room registration | Each Add creates a new lock; all released on abandon |

## Out of Scope

- Commit-time lock validation (unit 001 handles).
