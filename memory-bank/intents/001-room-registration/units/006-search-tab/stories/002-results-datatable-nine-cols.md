---
id: 002-results-datatable-nine-cols
unit: 006-search-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-search-tab-1
implemented: false
---

# Story: 002-results-datatable-nine-cols

## User Story

**As a** Front Desk user
**I want** results rendered in a 9-column DataTable with pagination, sort, and page-size control
**So that** I can navigate large result sets efficiently

## Acceptance Criteria

- [ ] **Given** results return, **When** rendered, **Then** columns appear in order: Reg. No. (sortable ASC default), Guest Name, Mobile, Company, Room Info (composite), Check-In (YYYY-MM-DD), Check-Out, Status (colour badge: In-House=blue, Checked Out=red + Checked In/Out By), Action.
- [ ] **Given** the Show Entries control, **When** I pick 10/25/50/100, **Then** page size changes in <1s (NFR-P-009).
- [ ] **Given** I type in the real-time search box, **When** typing, **Then** results on the current page filter within 100ms (BR-SR-004, NFR-P-008).
- [ ] **Given** many pages, **When** I navigate, **Then** Prev/Next and numbered pagination are visible without scrolling (NFR-U-011) and show "Showing X to Y of Z".
- [ ] **Given** 10k+ records, **When** server-side search runs, **Then** response arrives within 3s (NFR-P-007, NFR-M-001).

## Technical Notes

Maps to **FR-011** + **BR-SR-004**. Use existing tanstack-table or MUI DataGrid. Pagination scalability supports 10k pages with ellipsis (NFR-M-002).

## Dependencies

### Requires
- 001-eleven-filter-panel-search-clear

### Enables
- 003-edit-action-to-wizard-edit-mode
- 004-reactivate-registration-rbac
- 005, 006, 007

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Zero results | Empty state "No registrations found" |
| Status value unknown | Default grey badge |
| Very long guest name | Truncate with ellipsis + tooltip |

## Out of Scope

- Per-row actions (stories 003-007).
