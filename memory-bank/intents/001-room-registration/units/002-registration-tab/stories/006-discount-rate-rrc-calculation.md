---
id: 006-discount-rate-rrc-calculation
unit: 002-registration-tab
intent: 001-room-registration
status: complete
priority: must
created: 2026-04-20T07:20:00.000Z
assigned_bolt: bolt-registration-tab-1
implemented: true
---

# Story: 006-discount-rate-rrc-calculation

## User Story

**As a** Front Desk Agent
**I want** to apply fixed/percent discounts, override with a negotiated rate, or reverse-calculate from an inclusive target
**So that** I can match any pricing deal quickly and transparently

## Acceptance Criteria

- [ ] **Given** Discount Type = Fixed (default), **When** I enter a Fixed Discount, **Then** validation blocks any value > Rack Rate (BR-REG-005).
- [ ] **Given** Discount Type = Percent, **When** I enter a percent value, **Then** the effective discount amount is displayed and capped at 100%.
- [ ] **Given** I enter a Negotiated Rate, **When** the field is non-empty, **Then** the Rack Rate is superseded for total calculation; clearing the field restores rack-rate-based calc.
- [ ] **Given** I toggle any waive checkbox (SC / VAT / City / Additional), **When** waived, **Then** that component is excluded from the total.
- [ ] **Given** I click the RRC button, **When** the modal opens, **Then** I can input a target inclusive total and the modal reverse-calculates Rack Rate before tax/surcharges.
- [ ] **Given** any calc input changes, **When** value commits, **Then** Total Room Rent updates < 100ms (NFR-P-003 analogue).

## Technical Notes

Maps to **FR-003** calc + **BR-REG-005**. Formula: `Total = (Negotiated || Rack) − Discount + (SC if !waive) + (VAT if !waive) + (City if !waive) + (Additional if !waive)`. Per-room "Same as global date" checkbox default checked.

## Dependencies

### Requires
- 004-room-type-and-auto-fill-rates

### Enables
- 010-summary-table-crud (row totals flow into table)

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Negative total after discount | Block; inline error |
| Fixed Discount = Rack Rate exactly | Allowed; total = SC+VAT+City+Additional only |
| Stay-type flag = Complimentary | Totals still compute; BR-CI-003 prevents folio charge at commit |

## Out of Scope

- Folio/charge posting (backend + unit 001 commit).
