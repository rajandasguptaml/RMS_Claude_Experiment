---
unit: 006-search-tab
intent: 001-room-registration
phase: inception
status: ready
created: 2026-04-20T07:15:00Z
updated: 2026-04-20T07:15:00Z
---

# Unit Brief: Search Tab

## Purpose

Provide multi-field search and management of all registration records — filter (11 fields), sort, paginate, and execute 5 per-row actions (Edit, Re-activate, Bill Preview, Split Bill Preview, Registration Card). Independent of the wizard's in-progress state; reads the registrations list from backend. Implements Re-activate flow with RBAC (Manager/Supervisor only).

## Scope

### In Scope
- 11-filter panel + Search/Clear buttons (AND logic; text=LIKE; dropdown=exact).
- Results DataTable with 9 columns, default sort by Reg. No. ASC.
- DataTable controls: Show Entries (10/25/50/100), real-time current-page search, pagination Prev/Next + numbered, "Showing X to Y of Z".
- Per-row actions: Edit, Re-activate, Bill Preview (new tab), Split Bill Preview (modal), Registration Card (new tab).
- Re-activate confirmation dialog + RBAC + room-overlap revalidation (FR-012).
- Edit action entering wizard in edit mode (via unit 001).

### Out of Scope
- Wizard form rendering (units 002-005).
- Bill Preview page markup (separate route).
- Registration Card pre-fill rendering (separate route; but print stylesheet may coincide with unit 007 design).

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-011 | Search Tab — 11 filters, DataTable, per-row actions | Must |
| FR-012 | Re-activate Registration — RBAC + room revalidation + audit | Must |

Referenced BRs: BR-SR-001..009 (filter logic, LIKE/exact, real-time page-scoped search, Edit status rule, timestamp preservation, Re-activate RBAC + confirmation + revalidation).

Referenced NFRs: NFR-P-006 (<2s load), NFR-P-007 (<3s server-side search over 10k+), NFR-P-008 (<100ms real-time), NFR-P-009 (<1s page size change), NFR-P-010 (<2s Edit load), NFR-P-011 (<3s Bill / Card generation), NFR-S-002/008 (RBAC Re-activate), NFR-U-010 (tooltips), NFR-U-011 (pagination visible), NFR-U-012 (partial input), NFR-M-001 (index), NFR-M-002 (pagination scalability), NFR-C-004 (audit).

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| Registration Row | One result row | reg_no, guest_name, mobile, company, room_info, check_in, check_out, status (In-House / Checked Out), checked_by, action_buttons |
| Filter Query | Server-side filter bundle | 11 fields combined AND |
| DataTable State | Sorting / paging / current-page search | page_size, page, sort, pageSearchTerm |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| searchRegistrations(filters) | Server-side search with AND logic | 11 filters | list + total |
| reactivate(reg_no) | RBAC + confirmation + overlap check → reopen registration | reg_no + creds | success / error |
| openBillPreview(reg_no) | Navigate new tab | reg_no | new tab URL |
| openSplitBillModal(reg_no) | Overlay modal | reg_no | modal |
| enterEditMode(reg_no) | Load registration into wizard | reg_no | wizard state |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 8 |
| Must Have | 8 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-eleven-filter-panel-search-clear | 11-filter panel with Search and Clear buttons | Must | Planned |
| 002-results-datatable-nine-cols | Results DataTable with 9 columns, pagination, sort | Must | Planned |
| 003-edit-action-to-wizard-edit-mode | Edit action loads registration into wizard edit mode | Must | Planned |
| 004-reactivate-registration-rbac | Re-activate action with RBAC, confirmation, revalidation | Must | Planned |
| 005-bill-preview-new-tab | Bill Preview link opens new tab | Must | Planned |
| 006-split-bill-preview-modal | Split Bill Preview modal overlay | Must | Planned |
| 007-registration-card-print-link | Registration Card print link opens new tab | Must | Planned |
| 008-server-vs-client-search-clarity | Clarify server-side filtered search vs client-side page search | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 001-shell-and-check-in | Edit action enters shell in edit mode |
| 002..005 | Populating wizard on Edit requires those forms |

### Depended By
| Unit | Reason |
|------|--------|
| None | Terminal user-facing unit |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Registrations API (search + re-activate) | Data + actions | Medium — contract TBD |
| RBAC Service | Re-activate gate | Medium |
| Audit Log | Record Re-activate | Low |
| Bill Preview & Registration Card routes | New-tab links | Low — existing |

---

## Technical Context

### Suggested Technology
- React 19 + Vite + React Router for sibling routes (Bill Preview, Registration Card).
- MUI DataGrid or tanstack-table (existing) for the results table with built-in pagination + sort.
- React Query for search + per-row-action mutations.
- React Hook Form + Zod for filter panel.
- MUI Dialog for Split Bill Preview modal and Re-activate confirmation.
- `lucide-react` icons (pencil / reload / file / scissors / receipt).
- Vitest + RTL for search & action wiring.

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| GET /registrations?{filters} | API | REST/JSON |
| POST /registrations/:reg_no/reactivate | API | REST/JSON |
| GET /registrations/:reg_no/split-bill | API | REST/JSON |
| Bill Preview route | new-tab URL | HTTP |
| Registration Card route | new-tab URL | HTTP |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Search results | React Query cache | up to 10k+ | short stale |
| Filter state | URL params / React state | small | session |

---

## Constraints

- Real-time page-scoped search filters current page only (BR-SR-004).
- Server-side search must handle 10k+ records under NFR-P-007 (indices on reg_no, check_in_date, room_number, guest_name, phone — NFR-M-001).
- Re-activate restricted to Manager/Supervisor (BR-SR-007, NFR-S-002).
- Edit available for both In-House and Checked-Out (BR-SR-005); original check-in timestamp preserved (BR-SR-006).

---

## Success Criteria

### Functional
- [ ] All 11 filters work with AND logic; LIKE on text; exact on dropdowns.
- [ ] Results render with 9 columns + 5 action buttons + tooltips.
- [ ] Re-activate blocked for Front Desk / Cashier; succeeds for Supervisor/Manager with room revalidation.
- [ ] Edit returns the user to the wizard in edit mode with pre-populated data.

### Non-Functional
- [ ] Initial load <2s (NFR-P-006); server-side search <3s (NFR-P-007); real-time page search <100ms (NFR-P-008).
- [ ] Audit log entry on Re-activate (NFR-C-004).
- [ ] Tooltips on all 5 action buttons (NFR-U-010).

### Quality
- [ ] Code coverage > 80%
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| bolt-search-tab-1 | simple-construction-bolt | 001..008 | Filters + DataTable + 5 actions + Re-activate flow |

---

## Notes

- Open Question #8 (real-time vs server-side search labeling) and #11 (Split Bill rendered in-modal vs new window) affect stories 006 and 008.
- Coordinate with unit 001 on the exact edit-mode entry payload shape.
