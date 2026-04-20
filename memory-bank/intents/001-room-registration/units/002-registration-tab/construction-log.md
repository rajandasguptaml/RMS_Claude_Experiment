---
unit: 002-registration-tab
intent: 001-room-registration
created: 2026-04-20T07:35:00Z
---

# Construction Log: 002-registration-tab

## Entries

### 2026-04-20T07:35:00Z — Bolt started
- **Bolt**: `bolt-registration-tab-1`
- **Type**: simple-construction-bolt
- **Stage**: Plan (entering)
- **Status**: planned → in-progress
- **Note**: Foundation bolt for the intent (Wave 1). Standards files absent (project-init skipped); will infer stack from `package.json` + `vite.config.js` + `eslint.config.js` and record decisions in this log.

## Decisions

### D-001 (2026-04-20): State store = Zustand
- **Rationale**: Zustand already installed; lighter than Redux Toolkit (also installed but heavier); simpler than Jotai for this use case. Will hold cross-tab draft keyed by wizard session.
- **Alternatives considered**: Redux Toolkit, Jotai, React Context + useReducer.
- **Approved by**: inferred — no tech-stack.md; to be confirmed at Stage 1 checkpoint.

### D-002 (2026-04-20): Forms = React Hook Form + Zod
- **Rationale**: Both installed; RHF is performant for large forms; Zod gives runtime validation + TS types in one schema.
- **Per-section schemas**: `headerSchema`, `roomSchema`, `serviceSchema`, `classificationSchema`. Composed at Check-in time.

### D-003 (2026-04-20): Server state = React Query (`@tanstack/react-query`)
- **Rationale**: Installed. Long staleTime for masters (Company/Currency/Reference/Room/Rate/Meal Plan/Services — change infrequently). Short staleTime (or `refetchOnWindowFocus`) for room availability.

### D-004 (2026-04-20): UI primitives = MUI + Tailwind utilities
- **Rationale**: MUI installed (`@mui/material`, `@emotion/*`); Tailwind v4 already wired. Use MUI for Dialog/Select/Autocomplete/DatePicker/TimePicker; Tailwind for layout + spacing; `lucide-react` for icons (already installed).
- **Ant Design** installed but not chosen — will not add components from it; consider uninstalling post-Stage-2.

### D-005 (2026-04-20): Table = `@tanstack/react-table`
- **Rationale**: Installed; headless, composable with MUI cells.

### D-006 (2026-04-20): File layout (frontend)
- **Convention**: `src/features/registration/tabs/registration/` for this tab's components; `src/features/registration/store/` for the Zustand store; `src/features/registration/api/` for query hooks; `src/features/registration/schemas/` for Zod schemas; shared primitives in `src/shared/`.
- **Reason**: Feature-based decomposition aligns with frontend-app preset (`decomposition: feature-based` in `catalog.yaml`).
