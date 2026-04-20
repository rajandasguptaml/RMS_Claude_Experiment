---
id: 006-edit-mode-toggle-update-registration
unit: 001-shell-and-check-in
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-shell-and-check-in-1
implemented: false
---

# Story: 006-edit-mode-toggle-update-registration

## User Story

**As a** Front Desk Agent / Supervisor
**I want** the wizard to enter "edit mode" when I load an existing registration and swap Check-in for Update Registration
**So that** modifications to an existing record are explicit and distinct from new check-ins

## Acceptance Criteria

- [ ] **Given** I navigate to the wizard with an existing `reg_no`, **When** the shell loads the record, **Then** all 4 tabs pre-populate and the Check-in button is replaced by a yellow "Update Registration" button.
- [ ] **Given** I am in edit mode, **When** I click Update Registration, **Then** the shell submits the diff using the same validation engine (BR-SR-006 — original check-in timestamp preserved).
- [ ] **Given** edit mode is active, **When** I view the Services or Guest List, **Then** their Update and Delete actions are visible (normally hidden with `d-none` in create mode).
- [ ] **Given** update succeeds, **When** response lands, **Then** a success toast confirms update; draft is refreshed from the response; the user stays in edit mode.

## Technical Notes

Maps to **FR-007** + **BR-SR-005**, **BR-SR-006**. Mode is a store flag `{mode: 'create' | 'edit', regNo}`. Update endpoint is distinct (PUT/PATCH) and backend handles audit (NFR-C-004).

## Dependencies

### Requires
- 002-global-check-in-orchestration
- Unit 006 Edit action (entry point)

### Enables
- FR-012 Re-activate flow (which also enters edit mode)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Edit a Checked-Out registration | Allowed per BR-SR-005; some fields read-only pending RBAC |
| Concurrent edit by two users | Last-write via optimistic token; conflict shows 409 UX |
| Role lacks edit permission | Update button disabled; banner "Read-only for your role" |

## Out of Scope

- Search tab Edit button wiring (owned by unit 006).
