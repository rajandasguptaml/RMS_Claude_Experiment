---
id: 002-contact-info-and-validation
unit: 003-guest-details-tab
intent: 001-room-registration
status: complete
priority: must
created: 2026-04-20T07:20:00.000Z
assigned_bolt: bolt-guest-details-tab-1
implemented: true
---

# Story: 002-contact-info-and-validation

## User Story

**As a** Front Desk Agent
**I want** to capture and validate contact details — email, phone, address, nationality, national id
**So that** the hotel can reach the guest and meet compliance reporting

## Acceptance Criteria

- [ ] **Given** the contact section, **When** I inspect, **Then** fields appear: Email, Phone, Profession, Company Name, Address, City, Zip Code, Country* (default Bangladesh), Nationality (default Bangladeshi), National ID, Driving License.
- [ ] **Given** I enter Email, **When** it does not match RFC 5321, **Then** inline error displays (NFR-C-001).
- [ ] **Given** I enter Phone, **When** it is not international-format (with country code), **Then** inline error displays (NFR-C-006).
- [ ] **Given** I enter Zip Code, **When** non-numeric, **Then** inline error displays (NFR-C-007).
- [ ] **Given** Country defaults to Bangladesh, **When** I change it, **Then** Nationality updates default on first change only.

## Technical Notes

Maps to **FR-008** contact. Country master (NFR-M-005); Profession master. PII encrypted in transit / masked for non-privileged (NFR-S-004).

## Dependencies

### Requires
- 001-basic-info-and-full-name

### Enables
- None directly

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| +8801… without explicit + sign | Normalise client-side on blur |
| Email with subdomain / plus alias | Allowed (RFC 5321) |
| National ID with letters in some countries | Allowed; country-specific format |

## Out of Scope

- Sending email / SMS to guest.
