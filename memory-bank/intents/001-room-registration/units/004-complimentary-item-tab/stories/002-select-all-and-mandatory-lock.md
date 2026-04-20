---
id: 002-select-all-and-mandatory-lock
unit: 004-complimentary-item-tab
intent: 001-room-registration
status: complete
priority: must
created: 2026-04-20T07:20:00.000Z
assigned_bolt: bolt-complimentary-item-tab-1
implemented: true
---

# Story: 002-select-all-and-mandatory-lock

## User Story

**As a** Front Desk Agent
**I want** a Select All master checkbox and mandatory items locked in the checked state
**So that** package-required services are always included and I can bulk-toggle the rest

## Acceptance Criteria

- [ ] **Given** a mandatory item (`is_mandatory_for_package=true`), **When** rendered, **Then** it is pre-checked and has HTML `disabled` attribute; clicks have no effect (BR-CI-002).
- [ ] **Given** Select All is unchecked, **When** I tick it, **Then** every non-mandatory tile becomes selected within 200ms (NFR-P-014); mandatory stay checked.
- [ ] **Given** Select All is checked, **When** I untick it, **Then** every non-mandatory tile becomes unselected; mandatory remain checked.
- [ ] **Given** I manually untick one non-mandatory, **When** state updates, **Then** Select All indeterminate state is reflected (unchecked or indeterminate).

## Technical Notes

Maps to **FR-009** + **BR-CI-002**. Use `disabled` on `<input type="checkbox">` for mandatory tiles — cursor: not-allowed + aria-disabled.

## Dependencies

### Requires
- 001-tile-grid-responsive-toggle

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| All items are mandatory | Select All effectively does nothing; disable the master |
| No items are mandatory | Select All behaves normally |
| Keyboard space on disabled tile | No change; focus keeps |

## Out of Scope

- Pre-selection from reservation (story 003).
