---
id: bolt-search-tab-1
unit: 006-search-tab
intent: 001-room-registration
type: simple-construction-bolt
status: planned
stories:
  - 001-eleven-filter-panel-search-clear
  - 002-results-datatable-nine-cols
  - 003-edit-action-to-wizard-edit-mode
  - 004-reactivate-registration-rbac
  - 005-bill-preview-new-tab
  - 006-split-bill-preview-modal
  - 007-registration-card-print-link
  - 008-server-vs-client-search-clarity
created: 2026-04-20T07:25:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts:
  - bolt-shell-and-check-in-1
enables_bolts: []
requires_units: []
blocks: true

complexity:
  avg_complexity: 2
  avg_uncertainty: 2
  max_dependencies: 3
  testing_scope: 2
---

# Bolt: bolt-search-tab-1

## Overview

Search tab — multi-filter query + DataTable + 5 per-row actions. Includes Re-activate with RBAC and room-overlap revalidation (FR-012). Independent of wizard in-progress state, but relies on shell edit-mode entry for the Edit action.

## Objective

Implement FR-011 and FR-012 end-to-end: 11 server-side filters, 9-col DataTable with pagination/sort/real-time page search, 5 per-row actions, and a policy-correct Re-activate flow (Manager/Supervisor only, with room overlap revalidation and audit).

## Scope (Stories Included)

- **001-eleven-filter-panel-search-clear** (Must)
- **002-results-datatable-nine-cols** (Must)
- **003-edit-action-to-wizard-edit-mode** (Must)
- **004-reactivate-registration-rbac** (Must)
- **005-bill-preview-new-tab** (Must)
- **006-split-bill-preview-modal** (Must)
- **007-registration-card-print-link** (Must)
- **008-server-vs-client-search-clarity** (Must)

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → `implementation-plan.md`
- [ ] **2. Implement**: Pending → source code + `implementation-walkthrough.md`
- [ ] **3. Test**: Pending → tests + `test-walkthrough.md`

## Acceptance Criteria (summarised from stories)

- [ ] 11 filters combined with AND; text=LIKE; dropdowns=exact (BR-SR-001..003).
- [ ] Results DataTable with 9 columns, default sort Reg. No. ASC, pagination, page-size, "Showing X to Y of Z".
- [ ] Real-time search box filters current page only <100ms (BR-SR-004, NFR-P-008).
- [ ] Edit action enters wizard edit mode within 2s (NFR-P-010); original timestamp preserved (BR-SR-006).
- [ ] Re-activate: RBAC-restricted to Manager/Supervisor (BR-SR-007); confirmation dialog (BR-SR-008); room overlap revalidation (BR-SR-009); audit log (NFR-C-004).
- [ ] Bill Preview opens new tab; Split Bill Preview opens modal; Registration Card opens new tab.
- [ ] All 5 action buttons have tooltips (NFR-U-010); dual labels for server vs client search (NFR-U-012).

## Technical Approach

- React Router for new-tab links (Bill Preview, Registration Card).
- tanstack-table or MUI DataGrid with pagination/sort.
- React Query for search + per-row-action mutations.
- MUI Dialog for Split Bill modal and Re-activate confirmation.
- RBAC: fetch role claims from shell context; disable Re-activate button with tooltip explaining denial.
- Server-side filter state serialised to URL params for shareable links.

## Dependencies

### Requires
- bolt-shell-and-check-in-1 (edit-mode entry contract)
- (indirectly) bolt-registration-tab-1 / -guest-details / -complimentary / -others (must be present for Edit load)

### Enables
- None (terminal user-facing unit)

## Risks

- Open Question #8 (server-side vs client-side page search labelling).
- Open Question #11 (Split Bill rendering: modal vs window) — BRD says modal; ship that.
- Index readiness on reg_no, check_in_date, room_number, guest_name, phone (NFR-M-001) is a backend assumption.
- Re-activate: approval-code / credential prompt policy is TBD.

## Notes

- Wave 4 in execution plan — runs after shell bolt is ready.
- Default load: all records sorted Reg. No. ASC; no filters (per BRD).
