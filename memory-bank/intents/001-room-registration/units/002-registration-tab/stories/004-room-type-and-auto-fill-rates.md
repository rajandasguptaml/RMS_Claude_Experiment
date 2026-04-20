---
id: 004-room-type-and-auto-fill-rates
unit: 002-registration-tab
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-registration-tab-1
implemented: false
---

# Story: 004-room-type-and-auto-fill-rates

## User Story

**As a** Front Desk Agent
**I want** selecting a Room Type to auto-populate its rate, tax, and surcharge defaults
**So that** pricing is consistent with the property's rate card without manual entry

## Acceptance Criteria

- [ ] **Given** the Room form is empty, **When** I pick a Room Type (Signature Suite, Business Class Twin/King, Super Deluxe, Deluxe, Executive Suite, PM Room, etc.), **Then** Rack Rate, Service Charge (10% default disabled), VAT (15% default disabled), City Charge, Additional Charges auto-populate.
- [ ] **Given** a Room Type is selected, **When** I inspect Adult/Room and Child/Room, **Then** Adult defaults to 1 (min 1, required) and Child defaults to 0 (optional).
- [ ] **Given** I change Room Type mid-entry, **When** selection fires, **Then** rates re-populate, any manual discount resets, and the room_number selection clears (new availability scope).
- [ ] **Given** the master returns no rate record, **When** Room Type is picked, **Then** show inline error and prevent Add to summary.

## Technical Notes

Maps to **FR-003** auto-population. Masters: Room Type + Rate & Pricing Master (NFR-M-009). React Query long-staleTime.

## Dependencies

### Requires
- 001-header-section-and-dates

### Enables
- 005-room-list-modal-with-availability
- 006-discount-rate-rrc-calculation

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Rate differs per date (seasonal) | Backend returns effective rate for Check-In date |
| Multiple currencies configured | Use currently-selected currency + fx_rate |
| SC/VAT disabled globally for tax-exempt | Backend returns 0% and disabled flag |

## Out of Scope

- Discount / RRC behaviour (story 006).
