---
id: 004-rr-number-generation-and-success-ui
unit: 001-shell-and-check-in
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-shell-and-check-in-1
implemented: false
---

# Story: 004-rr-number-generation-and-success-ui

## User Story

**As a** Front Desk Agent
**I want** to see the new RR######## immediately after a successful check-in
**So that** I can communicate the registration number to the guest and in downstream workflows

## Acceptance Criteria

- [ ] **Given** commit returns success, **When** the response lands, **Then** the UI renders a success dialog showing the RR######## (zero-padded 8-digit sequential, e.g., `RR00002293`).
- [ ] **Given** the success dialog is shown, **When** I copy the RR number, **Then** the value on clipboard matches the server-issued value exactly (immutable).
- [ ] **Given** I dismiss the success dialog, **When** it closes, **Then** the wizard state is cleared and I am routed back to the Registration tab fresh for next guest.
- [ ] **Given** the success dialog is visible, **When** I click "Print Registration Card", **Then** the pre-filled registration card route opens in a new browser tab.

## Technical Notes

Maps to **FR-007** success behaviour. RR number is backend-issued (zero-padded 8-digit sequential). UI MUST NOT synthesise its own. Print link routes to `/front_office/room-registration/pre-registration-card/{reg_no}`.

## Dependencies

### Requires
- 002-global-check-in-orchestration

### Enables
- Search tab edit-mode stories (006-search-tab) consume the same RR format

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Dialog dismissed via Esc | Same behaviour as Close — draft cleared |
| Slow backend response | Loading state on Check-in button; no timeout before 10s |
| RR number missing in response | Treat as failure; surface error (data contract violation) |

## Out of Scope

- The printable card markup itself (unit 007 + pre-registration-card route owned elsewhere).
