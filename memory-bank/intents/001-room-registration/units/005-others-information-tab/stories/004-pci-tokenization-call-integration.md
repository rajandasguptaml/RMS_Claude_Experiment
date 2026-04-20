---
id: 004-pci-tokenization-call-integration
unit: 005-others-information-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-others-information-tab-1
implemented: false
---

# Story: 004-pci-tokenization-call-integration

## User Story

**As a** Front Desk Agent
**I want** card data tokenized at Check-in via the PCI-DSS service and only the token persisted
**So that** PCI compliance is preserved end-to-end

## Acceptance Criteria

- [ ] **Given** card fields are populated, **When** Check-in is triggered, **Then** the shell calls tokenize(pan, holder, expiry) via the PCI-DSS service over TLS (NFR-S-003).
- [ ] **Given** tokenization returns `{ token, last4 }`, **When** response lands, **Then** the registration payload includes token + type + holder + expiry + last4 + reference — but never the PAN (BR-OI-006).
- [ ] **Given** tokenization fails or service is down, **When** commit runs, **Then** Check-in is blocked with "Tokenization service unavailable — retry or contact IT" (NFR-R-009).
- [ ] **Given** no card data entered, **When** Check-in fires, **Then** tokenize is skipped and commit proceeds (BR-OI-005 guarantee-only).

## Technical Notes

Maps to **FR-010** + **BR-OI-005/006** + **NFR-S-003/R-009**. Open Question #10 — SDK vs iframe vs redirect flow. Implement behind a thin adapter interface so flow type can change without rippling into the shell.

## Dependencies

### Requires
- 003-section-c-card-form-with-masking
- Unit 001 story 002-global-check-in-orchestration

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Tokenize returns token but no last4 | Use PAN[-4:] captured locally before wipe |
| Browser loses network post-tokenize pre-commit | Retry commit with existing token (no re-tokenize) |
| Response contains raw PAN (should not) | Scrub defensively before logging |

## Out of Scope

- Backend PCI implementation details.
