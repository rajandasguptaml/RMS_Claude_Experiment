---
id: 003-conditional-company-fields
unit: 002-registration-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-registration-tab-1
implemented: false
---

# Story: 003-conditional-company-fields

## User Story

**As a** Front Desk Agent
**I want** to optionally attach a billing company with its contact and payment details
**So that** I can split/forward the bill to a company account when applicable

## Acceptance Criteria

- [ ] **Given** the Listed Company checkbox is unchecked, **When** I inspect, **Then** the company dropdown and 4 conditional fields (Contact Person, Mobile, Payment Mode, Pay For) are hidden.
- [ ] **Given** I tick Listed Company, **When** the checkbox activates, **Then** the company dropdown and 4 fields appear and are focusable.
- [ ] **Given** I select a company from the dropdown, **When** selection fires, **Then** Contact Person, Mobile, Payment Mode, Pay For pre-fill from the company master where defined.
- [ ] **Given** I untick Listed Company, **When** the group hides, **Then** the 4 field values clear in state.

## Technical Notes

Maps to **FR-002** company section. Company master via `/master/companies`. Open Question #7 — confirm "Before C/O" payment mode semantics.

## Dependencies

### Requires
- 001-header-section-and-dates

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Company master returns >100 records | Select2-style async search (NFR-M-003) |
| Company has no contact person on file | Fields blank for manual entry |
| Tick then untick mid-entry | Fields clear; no "sticky" stale values |

## Out of Scope

- Invoice generation to company (downstream billing module).
