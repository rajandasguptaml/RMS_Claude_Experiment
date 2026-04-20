---
id: 007-registration-card-print-link
unit: 006-search-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-search-tab-1
implemented: false
---

# Story: 007-registration-card-print-link

## User Story

**As a** Front Desk user
**I want** to open a printable Registration Card for a given registration in a new tab
**So that** I can print and file a guest's record easily

## Acceptance Criteria

- [ ] **Given** a row, **When** I click Registration Card (grey receipt icon), **Then** a new tab opens at `/front_office/room-registration/pre-registration-card/{id}`.
- [ ] **Given** the card route renders, **When** Ctrl+P is pressed, **Then** the browser native print dialog is triggered.
- [ ] **Given** the card renders, **When** printed, **Then** the output fits a single A4 portrait page within 3s generation (NFR-P-011).

## Technical Notes

Maps to **FR-011** Registration Card link. Route lives outside this unit; the link is the Search tab responsibility.

## Dependencies

### Requires
- 002-results-datatable-nine-cols

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Popup blocker active | Anchor element handles |
| Card generation fails | Error page in new tab |
| Multi-room overflow to 2 pages | Print stylesheet handles pagination |

## Out of Scope

- Pre-filled card markup/content.
