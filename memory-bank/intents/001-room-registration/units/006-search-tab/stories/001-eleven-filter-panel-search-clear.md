---
id: 001-eleven-filter-panel-search-clear
unit: 006-search-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-search-tab-1
implemented: false
---

# Story: 001-eleven-filter-panel-search-clear

## User Story

**As a** Front Desk Agent or Manager
**I want** an 11-field filter panel with Search and Clear buttons
**So that** I can narrow the registration list by any combination of criteria

## Acceptance Criteria

- [ ] **Given** the Search tab loads, **When** rendered, **Then** 11 filters appear: Room Types, Room Number, Reg. No., Reservation No., Check-In Date, Company Name, Country, Guest Name, Guest Phone, Contact Person Phone, Reference.
- [ ] **Given** I populate any combination of filters, **When** I click Search, **Then** an API call fires with AND combination; text fields use LIKE, dropdowns exact (BR-SR-001..003).
- [ ] **Given** I click Clear, **When** action fires, **Then** all filters reset and the default list (all records sorted by Reg. No. ASC) reloads.
- [ ] **Given** no date-range filter is required, **When** inspecting, **Then** only Check-In Date (single date, exact) is present — no From/To date range.

## Technical Notes

Maps to **FR-011** + **BR-SR-001..003**. Check-In Date filter only (exact). Server-side filtering (NFR-P-007).

## Dependencies

### Requires
- Shell mounts Search tab.

### Enables
- 002-results-datatable-nine-cols

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| All filters empty → Search | Equivalent to default list |
| Invalid date format in Check-In Date | Inline error on filter; Search disabled |
| Backend 500 on search | Friendly error banner; list state preserved |

## Out of Scope

- Result rendering (story 002).
