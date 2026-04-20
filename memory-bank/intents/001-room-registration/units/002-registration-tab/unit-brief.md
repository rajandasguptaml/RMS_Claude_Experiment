---
unit: 002-registration-tab
intent: 001-room-registration
phase: inception
status: ready
created: 2026-04-20T07:15:00Z
updated: 2026-04-20T07:15:00Z
---

# Unit Brief: Registration Tab

## Purpose

Capture all booking-context fields for a registration: optional reservation linkage, stay dates/times, listed-company billing, currency, per-room assignment (rate, discount, occupancy, charges), additional services, supplemental classification (Market Segment, Guest Source, Meal Plan, Reference, Channel Discovery, Remarks), and the editable Summary Table aggregating rooms + services. Highest data density of the 7 units.

## Scope

### In Scope
- Header section (reservation toggle, dates/times, total nights, listed-company fields, currency).
- Room Detailed Information form including Room List modal, RRC modal, rate/discount/charge calculator.
- Additional Services form with 25-service dropdown and Add/Update/Cancel actions.
- Supplemental classification fields — Market Segment, Guest Source, Meal Plan (conditional), Reference (conditional), Remarks (Hotel & POS), Channel Discovery group.
- Summary Table CRUD (Edit, Delete, Add, Cancel) with column set defined in FR-006.

### Out of Scope
- Cross-tab Check-in orchestration (unit 001).
- Guest entries (unit 003).
- Complimentary-item selection (unit 004).
- Others Information classification (unit 005).

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-002 | Header section (reservation, dates, listed company, currency) | Must |
| FR-003 | Room detailed info (type, number, rates, discount, charges, RRC) | Must |
| FR-004 | Additional services (25 services, RRC, add/update/cancel) | Must |
| FR-005 | Supplemental classification (Market Segment, Guest Source, Meal Plan, Reference, Channel Discovery, Remarks) | Must |
| FR-006 | Summary table CRUD with 11 columns | Must |

Referenced BRs: BR-REG-002 (Meal Plan/Reference conditional), BR-REG-003 (optimistic lock), BR-REG-004 (date ordering), BR-REG-005 (discount cap).

Referenced NFRs: NFR-U-006 (completion ≤ 2 min), NFR-P-001 (load < 2s), NFR-P-003 (auto-update < 100ms), NFR-M-003..M-009 (dynamic masters).

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| Booking Context | Header-level dates, reservation, company, currency | reservation_id?, check_in_date, check_in_time, departure_date, checkout_time, total_nights, company_id?, currency, fx_rate |
| Room Assignment | Per-room rate + occupancy config | room_type, room_number, concurrency_token, adults, children, rack_rate, discount, sc, vat, city, additional, negotiated_rate, waive_flags, stay_type_flags |
| Additional Service | Service attached to registration | service_id, from_date, to_date, rate, total |
| Classification | Supplemental fields | market_segment, guest_source, meal_plan, reference, channel_discovery[], hotel_remarks, pos_remarks |
| Summary Row | Aggregated row in table | one per room or service |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| loadReservation(reservation_id) | Auto-populate from reservation record | id | populated header fields |
| selectRoom() | Open Room List modal; acquire concurrency token on selection | room_type | room_number + token |
| computeRoomTotal() | Rate − Discount + SC + VAT + City + Additional | room fields | total |
| addServiceRow() / addRoomRow() | Append to Summary Table | form | table updated |
| reverseCalc(rrcInputs) | Reverse calculate inclusive rate | target total | rack rate |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 10 |
| Must Have | 9 |
| Should Have | 1 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-header-section-and-dates | Header section with date/time defaults and validation | Must | Planned |
| 002-reservation-link-pre-population | Reservation dropdown with auto-populate from record | Must | Planned |
| 003-conditional-company-fields | Listed Company checkbox with 4 conditional fields | Must | Planned |
| 004-room-type-and-auto-fill-rates | Room Type dropdown + auto-fill rate/SC/VAT/City/Additional | Must | Planned |
| 005-room-list-modal-with-availability | Room List modal filtered by availability + concurrency lock | Must | Planned |
| 006-discount-rate-rrc-calculation | Discount type, negotiated rate, totals, RRC modal | Must | Planned |
| 007-additional-services-add-edit | Additional Services form with add/update/cancel | Must | Planned |
| 008-supplemental-classification-conditional | Classification fields with Meal Plan & Reference conditional | Must | Planned |
| 009-channel-discovery-group | Channel Discovery checkbox group (new field) | Should | Planned |
| 010-summary-table-crud | Summary table with Edit/Delete/Add/Cancel actions | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| None | Foundation unit — produces the booking context every other tab reads |

### Depended By
| Unit | Reason |
|------|--------|
| 001-shell-and-check-in | Reads room, dates, reservation context for validation |
| 003-guest-details-tab | Reads declared Adult count |
| 004-complimentary-item-tab | Reads package/reservation for mandatory triggers |
| 005-others-information-tab | Reads reservation/context |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Company / Currency / Reference / Room Type / Rate / Market Segment / Guest Source / Meal Plan / Service / Reservation masters | Dropdown data | Medium — dynamic masters, select2 style for large lists (NFR-M-003) |
| Optimistic-Lock service | Room concurrency | Medium |

---

## Technical Context

### Suggested Technology
- React 19 + Vite, React Hook Form + Zod for the tab's composite form (split into sub-schemas: header, roomAssignment, service, classification).
- Zustand store slice for this tab's state (merges into wizard draft).
- React Query for master-data reads (long staleTime) + room availability (short staleTime).
- MUI DataGrid or simple table for Summary Table; MUI Dialog for Room List and RRC modals.
- Tailwind utility classes for layout; `lucide-react` icons.
- Vitest + RTL for validation and calculation unit tests.

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| GET /reservations?q=... | API | REST/JSON |
| GET /rooms?type=&available=true | API | REST/JSON |
| POST /rooms/:id/lock | API | REST/JSON |
| GET /master/{companies,currencies,reference,roomTypes,rates,services,marketSegment,guestSource,mealPlan} | API | REST/JSON |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Tab draft | Zustand + sessionStorage | 1 per user | session-scoped |
| Room master | React Query cache | ~10 records | long staleTime |

---

## Constraints

- Meal Plan & Reference conditional on reservation-linked mode (BR-REG-002).
- Fixed Discount ≤ Rack Rate (BR-REG-005).
- Departure > Check-In (BR-REG-004).
- Currency defaults BDT; Conversion Rate non-zero, read-only, auto-populated.
- Full guest-name auto-update (NFR-P-003 < 100ms) — note: this is in Guest Details but dates auto-calc here must also be < 100ms.

---

## Success Criteria

### Functional
- [ ] Header fields populate defaults and validate correctly.
- [ ] Room List modal surfaces only available rooms; selection acquires lock.
- [ ] Totals recompute on every input change (<100ms).
- [ ] Summary table supports Add/Edit/Delete/Cancel correctly.
- [ ] Meal Plan & Reference required only when reservation-linked.

### Non-Functional
- [ ] Tab loads < 2s (NFR-P-001).
- [ ] All dropdowns sourced from backend master (NFR-M-003..M-009).
- [ ] Completion ≤ 2 min for trained agent (NFR-U-006).

### Quality
- [ ] Code coverage > 80%
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| bolt-registration-tab-1 | simple-construction-bolt | 001..010 | Full Registration tab with header, room form, services, classification, summary |

Bolt may be split (e.g., header+room vs services+summary) during Construction Plan stage if timeline warrants.

---

## Notes

- Affected by Open Questions #1 (Check-In Date editability), #3 (package-mandatory trigger), #7 (Payment Mode "Before C/O" semantics).
- Channel Discovery is a NEW field vs. original BRD — confirm SET-type storage contract with backend.
