---
id: 001-tab-navigation-and-free-routing
unit: 001-shell-and-check-in
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-shell-and-check-in-1
implemented: false
---

# Story: 001-tab-navigation-and-free-routing

## User Story

**As a** Front Desk Agent
**I want** to click any of the 6 tabs at any time without being forced into a sequence
**So that** I can fill the registration wizard in the order most convenient for each check-in

## Acceptance Criteria

- [ ] **Given** I land on the Room Registration module, **When** the page renders, **Then** the Registration tab is active by default and the tab strip shows all 6 tabs.
- [ ] **Given** I am on any tab with data entered, **When** I click another tab, **Then** the target tab activates, my entered data persists in sessionStorage, and no re-render loses focus context.
- [ ] **Given** I am on any tab, **When** I click the Blank Registration Card tab, **Then** it opens in a new browser tab at `/front_office/room-registration/blank-registration-card`.
- [ ] **Given** the browser drops network for <10s, **When** connectivity returns, **Then** my wizard draft is intact (NFR-R-002).
- [ ] **Given** I close the tab, **When** I reopen the module, **Then** the draft is cleared (session-scoped persistence).

## Technical Notes

Maps to **FR-001**. Implement tab strip with React Router nested routes under `/front_office/new-room-registration/*`; draft state in Zustand persisted via sessionStorage middleware. Blank Card uses `<a target="_blank">` not an internal route. NFR-R-001/R-002.

## Dependencies

### Requires
- None (foundational)

### Enables
- 002-global-check-in-orchestration
- All tab-unit stories (rely on shell mounting their tab)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User navigates directly via URL to a tab | Matching tab activated; draft loaded if present |
| sessionStorage quota exceeded | Graceful fallback to in-memory state + toast warning |
| Session timeout mid-wizard | Re-auth prompt; draft preserved per NFR-R-006 |

## Out of Scope

- Validation logic (covered in story 003).
- Commit action (story 002).
