---
id: 005-bill-preview-new-tab
unit: 006-search-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-search-tab-1
implemented: false
---

# Story: 005-bill-preview-new-tab

## User Story

**As a** Front Desk user
**I want** to click Bill Preview and see the read-only bill in a new tab
**So that** I can review or print charges without losing my current Search tab state

## Acceptance Criteria

- [ ] **Given** a row, **When** I click Bill Preview (green file icon), **Then** a new browser tab opens at `/front_office/room-registration/bill-preview/{id}`.
- [ ] **Given** the preview is read-only, **When** it renders, **Then** no edit controls are present.
- [ ] **Given** the page generates, **When** rendered, **Then** it appears within 3s even for multi-room bills (NFR-P-011).

## Technical Notes

Maps to **FR-011** Bill Preview. `<a href target="_blank" rel="noopener">` — not router navigation.

## Dependencies

### Requires
- 002-results-datatable-nine-cols

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Popup blocker active | Use anchor element; browser handles |
| Registration without any charges | Show "No charges posted" state |
| User not authenticated in new tab | Redirects to /login |

## Out of Scope

- Bill Preview page content (separate route's responsibility).
