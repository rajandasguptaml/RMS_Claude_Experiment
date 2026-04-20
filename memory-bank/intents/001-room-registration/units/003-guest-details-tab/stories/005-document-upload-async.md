---
id: 005-document-upload-async
unit: 003-guest-details-tab
intent: 001-room-registration
status: complete
priority: must
created: 2026-04-20T07:20:00.000Z
assigned_bolt: bolt-guest-details-tab-1
implemented: true
---

# Story: 005-document-upload-async

## User Story

**As a** Front Desk Agent
**I want** to upload a guest document (JPG/PNG/PDF) asynchronously with progress feedback
**So that** I can keep filling the rest of the form while the file uploads

## Acceptance Criteria

- [ ] **Given** the additional section, **When** rendered, **Then** a Guest Document uploader accepts JPG/PNG/PDF up to ~5MB (NFR-S-005).
- [ ] **Given** I pick a file, **When** upload starts, **Then** a progress indicator shows and the rest of the form remains interactive (NFR-P-004).
- [ ] **Given** the file fails malware scan or mime check, **When** backend returns failure, **Then** an inline error shows and registration proceeds without blocking (NFR-R-004).
- [ ] **Given** upload succeeds, **When** backend returns `file_id`, **Then** a thumbnail/filename chip appears with a Remove action.

## Technical Notes

Maps to **FR-008** additional. NFR-S-005 (malware scan), NFR-S-010 (secure storage), NFR-P-004 async. Use `XMLHttpRequest` or `fetch` with progress stream; abortable.

## Dependencies

### Requires
- 001-basic-info-and-full-name

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| File >5MB | Block client-side pre-upload |
| Network drop mid-upload | Auto-retry once; else error |
| Upload endpoint 503 | Error without blocking Check-in (doc optional) |

## Out of Scope

- Document preview beyond thumbnail.
