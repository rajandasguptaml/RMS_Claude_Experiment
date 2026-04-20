---
unit: 001-shell-and-check-in
intent: 001-room-registration
phase: inception
status: ready
created: 2026-04-20T07:15:00Z
updated: 2026-04-20T07:15:00Z
---

# Unit Brief: Shell and Check-in

## Purpose

Provide the 6-tab wizard shell (tab strip, free navigation, sessionStorage persistence) and orchestrate the atomic Check-in commit across all tabs: cross-tab validation, optimistic-lock handling, PCI-DSS tokenization call-site, RR########-number generation/surfacing, edit-mode toggle (Update Registration), and audit log write. Terminal integration point for the whole module.

## Scope

### In Scope
- Wizard shell component, tab strip, and free-click navigation (FR-001).
- Global Check-in button (id=`check-in`) and Update Registration button in edit mode.
- Cross-tab validation orchestration (Registration, Guest Details conditionals — see BR-REG-001..005, BR-GD-001..006).
- Atomic Check-in submission: RR######## generation, room status transition to Occupied, folio open, initial room charge post.
- Optimistic-lock token acquisition/release and 409 conflict UX (BR-REG-003, NFR-R-008).
- PCI-DSS tokenization call-site at Check-in (NFR-S-003, NFR-R-009).
- sessionStorage persistence of wizard state across tab switches (NFR-R-001, NFR-R-002).
- Success confirmation surface with RR number; inline error routing to offending field/tab (FR-007).

### Out of Scope
- Tab-specific forms and their validations (owned by units 002-005).
- Search DataTable / Re-activate action (unit 006).
- Blank Registration Card page (unit 007).
- Backend API implementation or tokenization SDK internals (assumed existing).

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-001 | Tab navigation and wizard flow (6-tab strip, free click, Check-in always visible) | Must |
| FR-007 | Global Check-in action: atomic commit, RR-number generation, optimistic-lock, tokenization, audit log | Must |

Referenced BRs: BR-REG-001 (adult/guest count), BR-REG-002 (meal plan/reference conditional), BR-REG-003 (optimistic lock), BR-REG-004 (date ordering), BR-OI-006 (PAN tokenization).

Referenced NFRs: NFR-P-015 (Check-in < 3s), NFR-R-001/002 (session persistence), NFR-R-008 (lock conflict UX), NFR-R-009 (tokenization outage), NFR-S-001 (auth), NFR-S-003 (PCI-DSS), NFR-C-004 (audit).

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| Registration Draft | In-progress wizard state held in sessionStorage | registrationTab, guestList, complimentaryIds, othersInfo, tokenizedCard, roomLockToken |
| Registration Record | Immutable committed registration | reg_no (RR########), status, check_in_timestamp, folio_id |
| Room Lock | Optimistic concurrency token for a selected room | room_id, concurrency_token(UUID), acquired_at, released_at |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| navigateTab(tabId) | Free-click tab switch preserving state | tabId | active tab updated, state persisted |
| validateAll() | Runs all tab validators and consolidates errors | full draft | `{ valid, errorsByTab }` |
| checkIn() | Atomic commit orchestration | draft + session user | `{ reg_no, folio_id }` or structured error |
| acquireRoomLock() / releaseRoomLock() | Concurrency gate | room_id | token / void |
| tokenizeCard() | PCI-DSS tokenize call at commit | PAN, expiry, holder | `{ token, last4 }` |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 6 |
| Must Have | 6 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-tab-navigation-and-free-routing | Tab strip with free-click routing and sessionStorage persistence | Must | Planned |
| 002-global-check-in-orchestration | Global Check-in button atomic-commit orchestration | Must | Planned |
| 003-cross-tab-validation-engine | Cross-tab validation engine surfacing errors per offending tab | Must | Planned |
| 004-rr-number-generation-and-success-ui | RR######## generation and success confirmation UI | Must | Planned |
| 005-optimistic-lock-conflict-ux | Optimistic-lock 409 conflict UX and retry prompt | Must | Planned |
| 006-edit-mode-toggle-update-registration | Edit-mode toggle swapping Check-in for Update Registration | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 002-registration-tab | Reads room assignment, dates, reservation context for validation |
| 003-guest-details-tab | Reads guest list for adult-count reconciliation |
| 004-complimentary-item-tab | Reads selected complimentary ids for payload |
| 005-others-information-tab | Reads classification flags + card token for payload |

### Depended By
| Unit | Reason |
|------|--------|
| 006-search-tab | Needs shell to enter wizard in edit mode (Edit action loads registration into all 4 tabs) |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Cubix HMS REST API (/front_office/*) | Registration commit, room-status, folio, audit | Medium — no published OpenAPI |
| PCI-DSS Tokenization Service | Card tokenization at Check-in | High — integration style TBD |
| Cubix SSO / Session | Auth + user/role for audit | Low — assumed existing |
| Optimistic-Lock Service | Room concurrency tokens | Medium — 409 contract TBD |

---

## Technical Context

### Suggested Technology
- React 19, Vite, React Router (wizard routes under `/front_office/new-room-registration/*`).
- Zustand for cross-tab registration-draft store (single source of truth shared across 4 tabs).
- React Hook Form + Zod for the shell-level composite validator (each tab exposes a Zod schema; shell merges).
- React Query mutation for Check-in submission (with retry disabled; errors structured).
- MUI Dialog + Tailwind utilities for confirmation and error modals; `lucide-react` icons.
- Vitest + RTL for unit/integration tests of orchestration logic.

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| POST /front_office/room-registration | API (commit) | REST/JSON |
| POST /front_office/rooms/:id/lock | API (acquire lock) | REST/JSON |
| DELETE /front_office/rooms/:id/lock | API (release lock) | REST/JSON |
| Tokenization Service | SDK/iframe (TBD) | TLS |
| Audit Log | API (write on commit) | REST/JSON |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Registration draft | sessionStorage | ~1 per user | tab close / timeout / commit |
| Room lock token | in-memory + API | ephemeral | until commit/abandon |

---

## Constraints

- Raw PAN MUST never enter React state, Zustand, sessionStorage, React Query cache, or logs. Only tokenize-and-forget at commit.
- Check-in submission must complete < 3s under normal load (NFR-P-015).
- Session data survives network blips (NFR-R-002); lost on tab close / timeout / Cancel / successful commit.
- RBAC (Re-activate / Blocked / VIP) is out of scope here but the shell must propagate session role claims to child tabs.

---

## Success Criteria

### Functional
- [ ] 6 tabs render; Registration is active on load; free click navigation preserves in-progress state.
- [ ] Global Check-in button visible below all tabs; Update Registration replaces it in edit mode.
- [ ] Cross-tab validation blocks commit and highlights offending field; auto-focuses offending tab.
- [ ] Successful commit yields `RR########` displayed in confirmation surface; room → Occupied; folio opened.
- [ ] 409 lock conflict surfaces actionable error; user can pick alternate room without losing other state.

### Non-Functional
- [ ] Check-in round-trip < 3s (NFR-P-015).
- [ ] Tokenization outage shows retry/contact message and blocks commit (NFR-R-009).
- [ ] Zero raw PAN in any persisted artifact (NFR-S-003).
- [ ] Session state recoverable after 10s network drop (NFR-R-002).

### Quality
- [ ] Code coverage > 80%
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved

---

## Bolt Suggestions

Based on stories and complexity:

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| bolt-shell-and-check-in-1 | simple-construction-bolt | 001..006 | Shell + Check-in orchestration + edit-mode + RR surfacing |

One bolt initially (integration-critical unit). May be split at Construction time if Plan stage identifies independent slicing.

---

## Notes

- Open questions that affect this unit: (1) Check-In Date editability, (5) past-date validation, (9) OpenAPI contract, (10) tokenization flow.
- Re-activate flow (FR-012) enters the shell in edit mode — coordinate edit-mode contract with unit 006.
- Cross-tab validation MUST auto-route the user to the first offending tab to minimise click-count (NFR-U target).
