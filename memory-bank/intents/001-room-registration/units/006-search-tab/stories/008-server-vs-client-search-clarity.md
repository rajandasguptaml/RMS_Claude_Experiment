---
id: 008-server-vs-client-search-clarity
unit: 006-search-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-search-tab-1
implemented: false
---

# Story: 008-server-vs-client-search-clarity

## User Story

**As a** Front Desk user
**I want** clear labelling and behaviour distinguishing the server-side filter panel from the real-time current-page search box
**So that** I understand which records are actually being searched at any moment

## Acceptance Criteria

- [ ] **Given** the 11-filter panel, **When** rendered, **Then** it is labelled "Search (server)" or equivalent and uses the Search/Clear buttons to trigger backend requests.
- [ ] **Given** the DataTable real-time search box, **When** rendered, **Then** it is labelled "Filter current page" or equivalent and only narrows visible rows on the current page (BR-SR-004).
- [ ] **Given** Partial-input behaviour, **When** I type a partial name or reg no. in the server panel Guest Name / Reg. No. fields, **Then** results match via LIKE (NFR-U-012).

## Technical Notes

Maps to **FR-011** + Open Question #8. Until BA confirms definitive labels, ship with defensive dual labels to prevent user confusion.

## Dependencies

### Requires
- 001-eleven-filter-panel-search-clear
- 002-results-datatable-nine-cols

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User searches current-page box expecting global | Disambiguation tooltip shown |
| BA ultimately decides server-side for page box | Switch to DataTables server-side mode later |

## Out of Scope

- Rewrite of DataTable to full server-side integration (defer to post-clarification).
