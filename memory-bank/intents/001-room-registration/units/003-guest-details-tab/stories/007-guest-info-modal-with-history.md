---
id: 007-guest-info-modal-with-history
unit: 003-guest-details-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-guest-details-tab-1
implemented: false
---

# Story: 007-guest-info-modal-with-history

## User Story

**As a** Front Desk Agent
**I want** a Guest Info modal showing full profile and past stay history
**So that** I can personalise service and spot repeat / VIP guests

## Acceptance Criteria

- [ ] **Given** a selected guest, **When** I click "Guest Info", **Then** a modal opens with the full profile (basic, contact, visa, passport) and a stay history section.
- [ ] **Given** the stay history loads, **When** rendered, **Then** columns appear: Reg. No., Arrival, Checkout, Room Info.
- [ ] **Given** the modal is open, **When** I press × or Close, **Then** it dismisses without side effects (NFR-U-015).

## Technical Notes

Maps to **FR-008** Guest Info. Backend `/guests/:id/history`.

## Dependencies

### Requires
- 006-guest-search-modal-eleven-filters

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Guest has no history | Show empty-state "First-time guest" |
| History call fails | Modal still shows profile; history section shows error |
| Very long history (100+ stays) | Paginate client-side or virtualise |

## Out of Scope

- Editing profile from this modal.
