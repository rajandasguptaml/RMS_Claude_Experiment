---
id: 006-guest-search-modal-eleven-filters
unit: 003-guest-details-tab
intent: 001-room-registration
status: complete
priority: must
created: 2026-04-20T07:20:00.000Z
assigned_bolt: bolt-guest-details-tab-1
implemented: true
---

# Story: 006-guest-search-modal-eleven-filters

## User Story

**As a** Front Desk Agent
**I want** an advanced Guest Search modal with 11 filters
**So that** I can find a returning guest quickly and pre-fill the form

## Acceptance Criteria

- [ ] **Given** I click "Search Guest", **When** the modal opens, **Then** 11 filters appear: Name, Company, Email, Mobile, National ID, DOB, Passport No., Room No., Reg. No., From Date, To Date.
- [ ] **Given** I submit a search, **When** backend responds, **Then** up to 500 matching records display within 3s (NFR-P-002).
- [ ] **Given** I click "SELECT GUEST" on a row, **When** action fires, **Then** the main form pre-populates and the modal closes.
- [ ] **Given** no results match, **When** backend returns empty, **Then** modal shows "No matches found" empty state.
- [ ] **Given** backend search fails, **When** network error occurs, **Then** friendly message shows; the form does not crash (NFR-R-003).

## Technical Notes

Maps to **FR-008** Guest Search + **NFR-P-002**. Filters combined with AND (matching Search-tab style). Open Question #12 — returning-guest lookup keys.

## Dependencies

### Requires
- Shell mounts tab.

### Enables
- 008-blocked-guest-warning-and-list-crud (populated guest may be blocked)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Filters all empty | Show validation: "At least one filter required" |
| Guest has blocked flag | Select still allowed, warning raised (story 008) |
| Search returns 1000+ (>500 cap) | Show cap banner + top 500 |

## Out of Scope

- Server-side pagination inside the modal (not in BRD).
