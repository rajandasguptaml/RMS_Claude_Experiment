---
unit: 005-others-information-tab
intent: 001-room-registration
phase: inception
status: ready
created: 2026-04-20T07:15:00Z
updated: 2026-04-20T07:15:00Z
---

# Unit Brief: Others Information Tab

## Purpose

Capture three orthogonal concerns on a single tab: (A) travel context + guest classification (Complimentary / House Use / Room Owner, VIP, previous visit, discovery channel), (B) departure logistics (airport drop, airline, flight, ETD), and (C) PCI-compliant credit-card guarantee. Emits a PCI-DSS tokenization call at Check-in (orchestrated by unit 001).

## Scope

### In Scope
- Section A: Coming From, Next Destination, Visit Purpose, Complimentary/House Use/Room Owner dropdowns (mutually exclusive), Is Previously Visited, Is VIP (RBAC), "How did you find out?" checkbox group.
- Section B: Airport Drop (NO/YES/TBA), Airlines searchable dropdown (65), Flight Number, Departure Time — conditionally required when Airport Drop=YES/TBA.
- Section C: Card Type, Card Number (masked, `autocomplete="off"`), Card Holder Name, Expiry Date (MM/YY), Card Reference. Guarantee only — no transaction.
- Mutual-exclusivity validator for Complimentary/HouseUse/RoomOwner.
- Tokenization call integration contract (fire at Check-in only; card data does NOT persist locally).

### Out of Scope
- Actual tokenization service internals (external).
- Billing posting implications (backend / BR-OI-002, BR-OI-003).
- Check-in orchestration (unit 001).

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-010 | Others Information — Section A (classification), B (departure), C (card guarantee) | Must |

Referenced BRs: BR-OI-001 (mutual exclusivity), BR-OI-002 (complimentary suppresses charges), BR-OI-003 (house use excluded from night audit), BR-OI-004 (airport-drop conditionals), BR-OI-005 (card is guarantee), BR-OI-006 (PAN tokenized, never stored raw).

Referenced NFRs: NFR-S-002/008 (VIP RBAC), NFR-S-003 (PCI-DSS), NFR-S-009 (autocomplete="off"), NFR-C-005 (card expiry not past), NFR-M-007 (airline master), NFR-R-009 (tokenization outage).

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| Classification | Section A flags | coming_from, next_destination, purpose, complimentary, house_use, room_owner, prev_visited, is_vip, channels[] |
| Departure Info | Section B | airport_drop, airline_id, flight_no, etd |
| Card Guarantee | Section C (transient) | card_type, pan (transit only), holder, expiry, reference → tokenized to { token, last4, type, holder, expiry, reference } |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| validateMutualExclusivity() | Enforce BR-OI-001 | flags | valid/invalid |
| validateCardExpiry() | MM/YY ≥ current month | expiry | valid |
| tokenize(pan, holder, expiry) | Called by shell at Check-in | PAN + metadata | { token, last4 } |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 4 |
| Must Have | 4 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-section-a-classification-exclusivity | Section A classification + mutual exclusivity | Must | Planned |
| 002-section-b-departure-conditional | Section B departure conditional on Airport Drop | Must | Planned |
| 003-section-c-card-form-with-masking | Section C card form with masking + autocomplete-off | Must | Planned |
| 004-pci-tokenization-call-integration | PCI-DSS tokenization call at Check-in | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 002-registration-tab | Reads booking context |

### Depended By
| Unit | Reason |
|------|--------|
| 001-shell-and-check-in | Triggers tokenization + reads classification for payload |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| PCI-DSS Tokenization Service | Card token exchange | High — integration style TBD |
| Airline Master (65) | Dropdown | Low |
| Card Type Master | Dropdown | Low |
| RBAC Service | VIP flag gate | Medium |

---

## Technical Context

### Suggested Technology
- React 19 + Vite + React Hook Form + Zod.
- Zustand slice; **card-section state is ephemeral — raw PAN never enters the store**. Use a separate non-persisted React state, cleared after tokenize call.
- React Query for masters (airline, card type).
- MUI / Tailwind for inputs; `lucide-react` icons.
- Vitest + RTL.

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| Tokenization SDK or iframe | External (TBD) | TLS |
| GET /master/airlines | API | REST/JSON |
| GET /master/card-types | API | REST/JSON |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Section A + B state | Zustand + sessionStorage | small | session |
| Card PAN | in-memory only | ephemeral | cleared post-tokenize |
| Card token + last4 + expiry | Zustand (payload only, tokenized form) | small | session |

---

## Constraints

- NFR-S-003: Raw PAN MUST NOT persist anywhere; MUST NOT enter React Query cache or logs.
- NFR-S-009: `autocomplete="off"` and `autocomplete="cc-number"` on card fields (browsers honour the latter better for cards specifically).
- NFR-C-005: Card expiry cannot be in the past at Check-in.
- BR-OI-001: Complimentary / House Use / Room Owner cannot all be YES simultaneously; at most one YES.
- NFR-R-009: Tokenization outage blocks Check-in cleanly with actionable message.

---

## Success Criteria

### Functional
- [ ] Mutual exclusivity enforced (BR-OI-001).
- [ ] Section B fields required when Airport Drop=YES/TBA (BR-OI-004).
- [ ] Card form masks display; expiry validated (NFR-C-005).
- [ ] Tokenization called once at Check-in; token returned is persisted; raw PAN never stored.

### Non-Functional
- [ ] Card `autocomplete="off"` (NFR-S-009).
- [ ] Raw PAN scrubbed from any error logs (NFR-S-003).
- [ ] Tokenization outage surfaces retry UX (NFR-R-009).

### Quality
- [ ] Code coverage > 80%
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| bolt-others-information-tab-1 | simple-construction-bolt | 001..004 | Sections A/B/C + tokenization call site |

---

## Notes

- Open Questions: #4 (card semantics: pre-auth vs guarantee) and #10 (tokenization SDK vs iframe vs redirect) directly affect story 003/004.
- VIP flag gate is a shared RBAC concern with Unit 003; shell must pass roles.
