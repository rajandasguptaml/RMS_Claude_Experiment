---
id: 006-split-bill-preview-modal
unit: 006-search-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-search-tab-1
implemented: false
---

# Story: 006-split-bill-preview-modal

## User Story

**As a** Front Desk user
**I want** to click Split Bill Preview and see split-bill details in an overlay modal
**So that** I can review split amounts without leaving the Search tab

## Acceptance Criteria

- [ ] **Given** a row, **When** I click Split Bill Preview (cyan scissors icon), **Then** an overlay modal opens invoking `openSplitBillModal(registration_id)`.
- [ ] **Given** the modal opens, **When** data loads, **Then** split-bill breakdown is shown (per-guest / per-room / per-service as backend returns).
- [ ] **Given** the modal is open, **When** I press × or Close, **Then** it dismisses and Search tab state is retained.

## Technical Notes

Maps to **FR-011** Split Bill. Open Question #11 — confirm in-modal vs new-window rendering. Implement as modal per BRD.

## Dependencies

### Requires
- 002-results-datatable-nine-cols

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| No split configured | Show "No split applied" empty state |
| Backend error | Error state in modal with retry button |
| Modal open while navigating tabs | Modal dismisses; no orphan overlay |

## Out of Scope

- Split-bill creation / editing (downstream Bill Adjustment module).
