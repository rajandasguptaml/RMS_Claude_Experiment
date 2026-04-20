---
id: 001-tile-grid-responsive-toggle
unit: 004-complimentary-item-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-complimentary-item-tab-1
implemented: false
---

# Story: 001-tile-grid-responsive-toggle

## User Story

**As a** Front Desk Agent
**I want** a responsive 29-tile grid of complimentary services with snappy click toggles
**So that** I can quickly indicate which services are included with this stay

## Acceptance Criteria

- [ ] **Given** the tab loads, **When** rendered, **Then** 29 tiles display in a 4-column responsive grid (2 col on mobile, 4 col on desktop).
- [ ] **Given** an unselected tile, **When** I click, **Then** it flips to selected (dark navy bg, white text, check icon) within 100ms (NFR-P-013).
- [ ] **Given** a selected tile, **When** I click, **Then** it flips back to unselected (white bg, border, empty checkbox).
- [ ] **Given** the instruction text, **When** rendered, **Then** it reads "Select the services included with your reservation".
- [ ] **Given** a screen width ≥ 1024px, **When** rendered, **Then** no label truncation occurs (NFR-U-009).

## Technical Notes

Maps to **FR-009** tile grid. Use Tailwind; virtualisation not needed at 29 items. Local state updates synchronously (no network on toggle).

## Dependencies

### Requires
- Shell mounts tab.

### Enables
- 002-select-all-and-mandatory-lock
- 003-pre-selection-from-reservation

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Master returns <29 items (is_active filter) | Grid renders with returned count; no placeholder |
| Rapid double-click | Debounced via React state; no double-toggle |
| Very long label | Wrap to 2 lines within tile; no overflow |

## Out of Scope

- Select All and mandatory lock (story 002).
