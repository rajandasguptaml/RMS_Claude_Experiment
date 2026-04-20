---
id: 003-section-c-card-form-with-masking
unit: 005-others-information-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-others-information-tab-1
implemented: false
---

# Story: 003-section-c-card-form-with-masking

## User Story

**As a** Front Desk Agent
**I want** Section C card-guarantee fields with display masking, autocomplete disabled, and expiry validation
**So that** card data is captured safely and can be tokenized at Check-in

## Acceptance Criteria

- [ ] **Given** Section C renders, **When** inspected, **Then** fields appear: Card Type (Amex/MasterCard/Visa/Discover/Taka Pay), Card Number (masked `XXXX-XXXX-XXXX-NNNN`), Card Holder Name, Expiry Date (MM/YY), Card Reference.
- [ ] **Given** Card Number is entered, **When** I tab out, **Then** display shows masked form; raw value is held only in component state (never React Query cache, never Zustand, never sessionStorage).
- [ ] **Given** Expiry Date is in the past (MM/YY < current month), **When** I Check-in, **Then** shell validation blocks commit (NFR-C-005).
- [ ] **Given** card fields, **When** inspected, **Then** `autocomplete="off"` (and/or `autocomplete="cc-number"`) is applied (NFR-S-009).
- [ ] **Given** Card Type = blank, **When** Check-in, **Then** commit proceeds (all card fields optional — BR-OI-005).

## Technical Notes

Maps to **FR-010** Section C + **BR-OI-005**, **NFR-S-003**, **NFR-S-009**, **NFR-C-005**. Implementation: card-section is a React local state scoped to the form; hand off to tokenize fn then clear.

## Dependencies

### Requires
- 001-section-a-classification-exclusivity

### Enables
- 004-pci-tokenization-call-integration

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Paste full card number | Accepts, masks, validates Luhn client-side optional |
| Expiry exactly this month | Valid |
| User abandons tab with PAN in state | Unmount clears state; no persistence |

## Out of Scope

- Actual tokenization call (story 004).
