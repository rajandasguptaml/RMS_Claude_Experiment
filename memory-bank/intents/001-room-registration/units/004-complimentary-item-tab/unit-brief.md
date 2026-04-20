---
unit: 004-complimentary-item-tab
intent: 001-room-registration
phase: inception
status: ready
created: 2026-04-20T07:15:00Z
updated: 2026-04-20T07:15:00Z
---

# Unit Brief: Complimentary Item Tab

## Purpose

Present a 29-tile responsive checklist of complimentary services attached to a registration. Package-mandatory items are pre-checked and locked; non-mandatory items toggle freely. Supports a Select All master, pre-selection from reservation package/rate-code linkage, and persists selection as part of the wizard draft.

## Scope

### In Scope
- 4-column responsive tile grid for 29 services (visual state per BRD).
- Instruction text "Select the services included with your reservation".
- Per-tile toggle with < 100ms feedback.
- Select All master that toggles non-mandatory items only.
- Package-mandatory locking via HTML `disabled`.
- Pre-selection based on reservation's rate code / package.
- Selection persistence into wizard state; zero selection valid.

### Out of Scope
- Billing / folio implications of flagged Complimentary (handled backend / BR-CI-003).
- Edit-mode loading of previous selections (delivered, but shell orchestrates the load).
- CRUD on complimentary master list.

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-009 | Complimentary Item tab — 29-tile grid, Select All, mandatory lock, pre-selection | Must |

Referenced BRs: BR-CI-001 (zero valid), BR-CI-002 (mandatory cannot deselect), BR-CI-003 (no chargeable folio if complimentary flag set elsewhere).

Referenced NFRs: NFR-P-013 (<100ms toggle), NFR-P-014 (<200ms Select All), NFR-U-008 (WCAG AA), NFR-U-009 (1024×768 readability), NFR-M-004 (dynamic master / is_active).

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| Complimentary Item | Master item | id, name, is_active, is_mandatory_for_package |
| Selection | Wizard-draft selection | item_ids: string[] |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| toggleItem(id) | Flip non-mandatory state | item_id | updated selection |
| selectAll(master) | Toggle all non-mandatory | master checkbox | selection |
| prePopulate() | Pre-check items from reservation package | reservation_id | selection |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 3 |
| Must Have | 3 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-tile-grid-responsive-toggle | 29-tile responsive grid with tap-to-toggle | Must | Planned |
| 002-select-all-and-mandatory-lock | Select All master and mandatory-item lock | Must | Planned |
| 003-pre-selection-from-reservation | Pre-selection from reservation rate code/package | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 002-registration-tab | Reads reservation / package / rate-code context for pre-selection |

### Depended By
| Unit | Reason |
|------|--------|
| 001-shell-and-check-in | Reads selected item_ids for Check-in payload |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Complimentary Items Master | 29 tiles with is_active + is_mandatory flags | Low |
| Reservation / Rate-Code service | Pre-selection trigger | Medium — Open Question #3 |

---

## Technical Context

### Suggested Technology
- React 19 + Vite; Tailwind grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
- Zustand slice storing selected ids.
- React Query for master fetch (long staleTime; `is_active` filter).
- `lucide-react` Check icon for tile state.
- Vitest + RTL for toggle / mandatory / Select All tests.

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| GET /master/complimentary-items | API | REST/JSON |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Selection | Zustand + sessionStorage | 1 array | session |

---

## Constraints

- Package-mandatory items must use HTML `disabled` attribute (BR-CI-002), not just styling.
- Tile toggle <100ms (NFR-P-013); Select All <200ms (NFR-P-014).
- WCAG AA contrast on selected/unselected tiles (NFR-U-008).

---

## Success Criteria

### Functional
- [ ] All 29 items render from master (no hard-code).
- [ ] Mandatory items pre-checked AND disabled.
- [ ] Select All toggles non-mandatory only.
- [ ] Zero selection is valid.

### Non-Functional
- [ ] Tile toggle <100ms (NFR-P-013).
- [ ] Select All <200ms (NFR-P-014).
- [ ] No truncation at 1024×768 (NFR-U-009).
- [ ] WCAG AA contrast (NFR-U-008).

### Quality
- [ ] Code coverage > 80%
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| bolt-complimentary-item-tab-1 | simple-construction-bolt | 001..003 | Full tile grid + Select All + pre-selection |

---

## Notes

- Open Question #3 (mandatory trigger mechanism — rate code? reservation? room type?) affects pre-selection logic — requires clarification before implementation.
- Master is dynamic (NFR-M-004); handle `is_active=false` gracefully (hide from new registrations but retain on existing records).
