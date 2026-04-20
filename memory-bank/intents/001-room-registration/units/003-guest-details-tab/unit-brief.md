---
unit: 003-guest-details-tab
intent: 001-room-registration
phase: inception
status: complete
created: 2026-04-20T07:15:00.000Z
updated: 2026-04-20T07:15:00.000Z
---

# Unit Brief: Guest Details Tab

## Purpose

Capture per-guest demographic, contact, visa, passport, and document data for every adult and child declared on the Registration tab. Provide Guest Search (pre-populate from existing profiles) and Guest Info (profile + stay history) modals. Support individual and group/family registrations. Enforce guest-count reconciliation with declared Adults (BR-REG-001 via shell).

## Scope

### In Scope
- Guest form: basic info, contact, visa, passport, additional flags.
- Full Guest Name auto-compose (Title + First + Last), read-only (BR-GD-003).
- Guest Search modal with 11 filters (BR-GD-005 blocked-guest warning).
- Guest Info modal showing full profile + stay history.
- Guest List Table CRUD (Add, Update, Delete, Clear).
- Document upload (JPG/PNG/PDF, ~5MB, malware scan, async with progress).
- Blocked Guest toggle (RBAC gated — Supervisor+).
- Family/Group/Couple mode toggle.

### Out of Scope
- Cross-tab adult-count enforcement (unit 001 validator).
- Card / payment info (unit 005).
- Room / rates (unit 002).

---

## Assigned Requirements

| FR | Requirement | Priority |
|----|-------------|----------|
| FR-008 | Guest Details tab — full profile capture, search & info modals, guest list CRUD | Must |

Referenced BRs: BR-GD-001 (≥1 adult), BR-GD-002 (Title/First/Country required), BR-GD-003 (full name auto), BR-GD-004 (visa/passport expiry > issue), BR-GD-005 (blocked warning), BR-GD-006 (count reconciliation soft/hard).

Referenced NFRs: NFR-P-002 (search <3s for 500 records), NFR-P-003 (name auto <100ms), NFR-P-004 (upload async), NFR-P-005 (list render), NFR-S-002/008 (RBAC Blocked), NFR-S-004 (PII encryption), NFR-S-005 (upload validation), NFR-C-001 (email), NFR-C-006 (phone), NFR-C-008 (visa/passport dates), NFR-U-005 (≤3 min).

---

## Domain Concepts

### Key Entities
| Entity | Description | Attributes |
|--------|-------------|------------|
| Guest | Individual guest attached to registration | title, first_name, last_name, gender, full_guest_name, dob, email, phone, profession, company, address, city, zip, country, nationality, national_id, driving_license |
| Visa | Guest visa document | number, issue_date, expiry_date |
| Passport | Guest passport document | number, issue_date, expiry_date |
| Guest Document | Uploaded file | file_id, mime, size, scan_status |
| Guest Flags | Classification | is_blocked (RBAC), is_contact_person, is_family_group |

### Key Operations
| Operation | Description | Inputs | Outputs |
|-----------|-------------|--------|---------|
| composeFullName() | Title + First + Last → read-only full name | title, first, last | full_name |
| searchGuests(filters) | 11-filter search | filter object | guest list |
| selectGuestFromSearch() | Populate form + show blocked warning if flagged | guest_id | form populated |
| uploadDocument() | Async with progress; malware scanned | file | file_id |
| addGuestToTable() | Validate min fields then append | form | table row |

---

## Story Summary

| Metric | Count |
|--------|-------|
| Total Stories | 8 |
| Must Have | 8 |
| Should Have | 0 |
| Could Have | 0 |

### Stories

| Story ID | Title | Priority | Status |
|----------|-------|----------|--------|
| 001-basic-info-and-full-name | Basic info form with Full Guest Name auto-compose | Must | Planned |
| 002-contact-info-and-validation | Contact info with RFC 5321 email + international phone | Must | Planned |
| 003-visa-info-and-date-validation | Visa fields with Expiry > Issue validation | Must | Planned |
| 004-passport-info-and-date-validation | Passport fields with Expiry > Issue validation | Must | Planned |
| 005-document-upload-async | Document upload async with progress and malware scan | Must | Planned |
| 006-guest-search-modal-eleven-filters | Guest Search modal with 11 filters | Must | Planned |
| 007-guest-info-modal-with-history | Guest Info modal with profile + stay history | Must | Planned |
| 008-blocked-guest-warning-and-list-crud | Blocked-guest warning and Guest List CRUD | Must | Planned |

---

## Dependencies

### Depends On
| Unit | Reason |
|------|--------|
| 002-registration-tab | Reads declared Adult / Child counts |

### Depended By
| Unit | Reason |
|------|--------|
| 001-shell-and-check-in | Validates guest count = declared adults (BR-REG-001) |

### External Dependencies
| System | Purpose | Risk |
|--------|---------|------|
| Guest Profile Store | Search + pre-fill | Medium — contract TBD |
| Country / Profession / Nationality masters | Dropdowns | Low |
| Document storage / malware scan service | Uploads | Medium — NFR-S-005/S-010 |
| RBAC Service | Blocked toggle gating | Medium |

---

## Technical Context

### Suggested Technology
- React 19 + Vite + React Hook Form + Zod (per-section schemas).
- Zustand slice for guest list + current editing guest.
- React Query for guest search + masters (staleTime differs).
- MUI Dialog for Search and Info modals; MUI LinearProgress for upload.
- Tailwind utilities for layout; `lucide-react` icons.
- Vitest + RTL for form validation + compose-name tests.

### Integration Points
| Integration | Type | Protocol |
|-------------|------|----------|
| GET /guests/search?{11 filters} | API | REST/JSON |
| GET /guests/:id/history | API | REST/JSON |
| POST /guests/:id/documents (multipart) | API | REST/JSON + multipart |
| GET /master/{countries,professions} | API | REST/JSON |

### Data Storage
| Data | Type | Volume | Retention |
|------|------|--------|-----------|
| Guest list in wizard | Zustand + sessionStorage | 1-4 typical | session |
| Search results | React Query | up to 500 | 30s stale |

---

## Constraints

- PII encrypted in transit (TLS) and masked in non-privileged views (NFR-S-004).
- Upload max ~5MB, JPG/PNG/PDF only (NFR-S-005).
- Full Guest Name read-only, recomputed on-input <100ms (NFR-P-003).
- Blocked toggle requires Supervisor+ role (NFR-S-002, NFR-S-008).

---

## Success Criteria

### Functional
- [ ] Form validates BR-GD-002 before Add (Title + First + Country required).
- [ ] Full Guest Name auto-composes correctly.
- [ ] Search modal returns ≤500 records <3s and populates form on SELECT GUEST.
- [ ] Blocked guest shows visible warning before form population.
- [ ] Guest List Table supports Add/Update/Delete/Clear correctly.

### Non-Functional
- [ ] Name auto-update <100ms (NFR-P-003).
- [ ] Upload does not block UI (NFR-P-004).
- [ ] Blocked toggle gated by RBAC (NFR-S-002).
- [ ] Guest Details completion ≤3 min for basic staff (NFR-U-005).

### Quality
- [ ] Code coverage > 80%
- [ ] All acceptance criteria met
- [ ] Code reviewed and approved

---

## Bolt Suggestions

| Bolt | Type | Stories | Objective |
|------|------|---------|-----------|
| bolt-guest-details-tab-1 | simple-construction-bolt | 001..008 | Guest form + search/info modals + list CRUD + upload |

---

## Notes

- Open Question #2 (Passport Issue Place field) and #12 (returning-guest lookup API contract) affect search modal.
- Group/family mode toggle behaviour — clarify with BA whether it forces any different field set.
