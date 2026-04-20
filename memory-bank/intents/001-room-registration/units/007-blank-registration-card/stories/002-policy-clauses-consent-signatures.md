---
id: 002-policy-clauses-consent-signatures
unit: 007-blank-registration-card
intent: 001-room-registration
status: complete
priority: must
created: 2026-04-20T07:20:00.000Z
assigned_bolt: bolt-blank-registration-card-1
implemented: true
---

# Story: 002-policy-clauses-consent-signatures

## User Story

**As a** Property Manager
**I want** the Blank Registration Card to include all 14 policy clauses, a consent statement, and dual signature lines
**So that** guests agree to property terms at sign-in

## Acceptance Criteria

- [ ] **Given** the card renders, **When** inspected, **Then** all 14 policy clauses appear; clauses 1-13 normal weight, clause 14 bold (BR-BRC-003).
- [ ] **Given** specific policy requirements, **When** inspected, **Then** Clause 9 (lost key fee BDT 600), Clause 12 (check-in 14:00, check-out 12:00), and Clause 14 (no-smoking penalty BDT 2,500 Junior Suite / 2,000 Premier Room — bold) are present with their exact amounts.
- [ ] **Given** the consent section, **When** inspected, **Then** the statement "By signing this form, I consent..." is centred as H2 and is mandatory (BR-BRC-004).
- [ ] **Given** the signature section, **When** inspected, **Then** two lines appear at 50% width each — "Checked in By*" (left) and "Guest Signature*" (right) — both mandatory (BR-BRC-005).
- [ ] **Given** the time entry line, **When** rendered, **Then** "Check-In at ...HRS. Check-Out at ...HRS." is visible.
- [ ] **Given** the bottom of the card, **When** rendered, **Then** a bold Checkout Reminder appears (NFR-R-007).

## Technical Notes

Maps to **FR-013** clauses/consent/signatures + **BR-BRC-003..005**. Hard-coded clauses flagged as NFR-M-006 tech-debt — design as array of strings to make future migration trivial.

## Dependencies

### Requires
- 001-static-27-field-form-layout

### Enables
- 003-print-optimization-and-auth-gate

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Clause text wraps across pages | Avoid orphaned clause line via CSS `page-break-inside: avoid` |
| Missing signature line asset | CSS underline fallback |
| Screen-reader accessibility | Clauses as ordered list `<ol>` |

## Out of Scope

- Configurable per-property policy text (follow-up NFR-M-006).
