---
id: 001-static-27-field-form-layout
unit: 007-blank-registration-card
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-blank-registration-card-1
implemented: false
---

# Story: 001-static-27-field-form-layout

## User Story

**As a** Front Desk Agent
**I want** a static Pre Registration Card with all 27 labelled blank fields and a visible Room No. field
**So that** I can hand a blank form to guests for manual completion

## Acceptance Criteria

- [ ] **Given** the route loads, **When** rendered, **Then** the header shows property logo, hotel name, address, hotlines, website, email; the card title is "Pre Registration Card" with a prominent Room No. field.
- [ ] **Given** the 27 fields, **When** inspected, **Then** all the following blank labelled fields appear: Room No, Guest 1..4 (Title*, First name*, Surname*), Reservation No., Reg. No., Arrival Date, Departure Date*, Room Type, Pax, Room Tariff, Advance, Payment Mode, Company Name, Country*, Passport/NID No*, Issue Date, Expiry Date, DOB*, Visa No., Visa Issue Date*, Visa Expiry Date*, Phone*, Email*, Home Address, Reference, Remarks.
- [ ] **Given** required fields, **When** inspected, **Then** 13 are marked with a red asterisk (*) — with WCAG-AA contrast.
- [ ] **Given** the page loads, **When** measured, **Then** no data fetch is made and load completes <1s (NFR-P-012).

## Technical Notes

Maps to **FR-013** layout + **BR-BRC-001**. Pure markup; consider using semantic HTML (`<fieldset>`/`<legend>`) for grouping.

## Dependencies

### Requires
- Shell or sibling route mount.

### Enables
- 002-policy-clauses-consent-signatures

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Window width < 1024px | Layout still prints A4; on-screen may scroll |
| Missing property logo asset | Fallback to hotel name in text |
| Unicode in hotel name | Renders correctly |

## Out of Scope

- Policy clauses and signatures (story 002).
- Print stylesheet (story 003).
