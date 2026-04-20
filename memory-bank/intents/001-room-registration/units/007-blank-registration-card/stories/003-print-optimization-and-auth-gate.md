---
id: 003-print-optimization-and-auth-gate
unit: 007-blank-registration-card
intent: 001-room-registration
status: draft
priority: must
created: 2026-04-20T07:20:00Z
assigned_bolt: bolt-blank-registration-card-1
implemented: false
---

# Story: 003-print-optimization-and-auth-gate

## User Story

**As a** Front Desk Agent
**I want** the Blank Registration Card to print cleanly on a single A4 page and require a valid HMS session
**So that** I produce consistent print output while preventing anonymous access

## Acceptance Criteria

- [ ] **Given** a valid session, **When** I press Ctrl+P, **Then** the browser's native print dialog opens with A4 portrait preview showing borders and all content on one page.
- [ ] **Given** printing, **When** I inspect the preview, **Then** font size is ≥9pt (NFR-U-014) and no content is clipped.
- [ ] **Given** I am not authenticated, **When** I visit the card URL, **Then** I am redirected to /login (NFR-S-001).
- [ ] **Given** output is identical regardless of role, **When** different users load the page, **Then** the rendered content is identical (BR-BRC-002).

## Technical Notes

Maps to **FR-013** print + **BR-BRC-002** + **NFR-S-001** + **NFR-U-014**. Use `@media print` stylesheet: `@page { size: A4 portrait; margin: 10mm; }`; `page-break-inside: avoid` around signature block and final clauses.

## Dependencies

### Requires
- 002-policy-clauses-consent-signatures

### Enables
- None

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Content barely fits A4 | Tune margins/font-size; keep borders visible |
| Printer set to Letter | Still fits but with slight overflow; document as known issue |
| Session expires before print | Ctrl+P still available but refresh redirects |

## Out of Scope

- Server-side PDF generation (browser-native only).
