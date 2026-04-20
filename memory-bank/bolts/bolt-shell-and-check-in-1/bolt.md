---
id: bolt-shell-and-check-in-1
unit: 001-shell-and-check-in
intent: 001-room-registration
type: simple-construction-bolt
status: planned
stories:
  - 001-tab-navigation-and-free-routing
  - 002-global-check-in-orchestration
  - 003-cross-tab-validation-engine
  - 004-rr-number-generation-and-success-ui
  - 005-optimistic-lock-conflict-ux
  - 006-edit-mode-toggle-update-registration
created: 2026-04-20T07:25:00Z
started: null
completed: null
current_stage: null
stages_completed: []

requires_bolts:
  - bolt-registration-tab-1
  - bolt-guest-details-tab-1
  - bolt-complimentary-item-tab-1
  - bolt-others-information-tab-1
enables_bolts:
  - bolt-search-tab-1
requires_units: []
blocks: true

complexity:
  avg_complexity: 3
  avg_uncertainty: 3
  max_dependencies: 3
  testing_scope: 3
---

# Bolt: bolt-shell-and-check-in-1

## Overview

Integration bolt that assembles the 6-tab wizard shell and orchestrates the atomic Check-in commit across all contributing tab units. Terminal integration point: consumes state exposed by units 002-005 and produces the immutable RR########.

## Objective

Deliver a production-ready wizard shell with free-click tab navigation, cross-tab validation, optimistic-lock handling, PCI-DSS tokenization call-site, RR-number success UI, and edit-mode toggle — satisfying FR-001 and FR-007 end-to-end.

## Scope (Stories Included)

- **001-tab-navigation-and-free-routing**: Tab strip + sessionStorage persistence (Must)
- **002-global-check-in-orchestration**: Atomic commit orchestration (Must)
- **003-cross-tab-validation-engine**: Merged Zod validator routing to offending tab (Must)
- **004-rr-number-generation-and-success-ui**: RR######## confirmation surface (Must)
- **005-optimistic-lock-conflict-ux**: 409 conflict UX + room lock lifecycle (Must)
- **006-edit-mode-toggle-update-registration**: Edit mode + Update Registration button (Must)

## Bolt Type

**Type**: simple-construction-bolt
**Definition**: `.specsmd/aidlc/templates/construction/bolt-types/simple-construction-bolt.md`

## Stages

- [ ] **1. Plan**: Pending → `implementation-plan.md`
- [ ] **2. Implement**: Pending → source code + `implementation-walkthrough.md`
- [ ] **3. Test**: Pending → tests + `test-walkthrough.md`

## Acceptance Criteria (summarised from stories)

- [ ] 6 tabs render, Registration active by default, free click navigation with sessionStorage preservation.
- [ ] Check-in button visible below all tabs; replaced by Update Registration in edit mode.
- [ ] Cross-tab validation blocks commit, highlights offending field, activates offending tab.
- [ ] Successful commit returns RR########; success dialog shows it and offers Print link.
- [ ] Tokenization service failure blocks Check-in with retry/contact-IT message.
- [ ] 409 optimistic-lock conflict surfaces actionable UX with room-re-selection link.
- [ ] Audit log written on commit (user, timestamp, action).

## Technical Approach

- Zustand registration-draft store with sessionStorage middleware.
- React Router nested routes under `/front_office/new-room-registration/*`.
- Each tab unit exposes a Zod schema + conditional evaluator; shell merges and runs once at Check-in.
- React Query mutation for commit with structured error surface; no client retry.
- AbortController for lock-release on abandonment.
- Tokenization adapter interface (SDK/iframe/redirect — behind a single `tokenize()` fn).
- Error routing: `{ tab, field, message }[]` → auto-activate first offending tab.

## Dependencies

### Requires
- bolt-registration-tab-1 (header + room + services + classification + summary)
- bolt-guest-details-tab-1 (guest list + count)
- bolt-complimentary-item-tab-1 (selected items)
- bolt-others-information-tab-1 (classification + tokenized card)

### Enables
- bolt-search-tab-1 (Edit action enters wizard in edit mode)

## Risks

- Open Question #1 (Check-In Date editability): affects default state at commit.
- Open Question #9 (OpenAPI contract): validation contract unknown; may require mock.
- Open Question #10 (tokenization SDK/iframe/redirect): flow impacts UX and may require iframe-bridge messaging.
- PCI compliance: strict discipline needed — raw PAN must not leak into any persisted artifact.
- Integration sequencing: must wait for Wave 2 tab bolts.

## Notes

- Per simple-construction-bolt type: 3 stages (Plan, Implement, Test) with human checkpoints at each.
- Consider splitting Implement stage into sub-activities (shell-scaffold vs check-in orchestrator) during Plan if time permits.
