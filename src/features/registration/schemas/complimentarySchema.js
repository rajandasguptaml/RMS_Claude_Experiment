import { z } from 'zod'

// FR-009: complimentary items — selection is a plain list of string IDs.
// Zero selection is valid (BR-CI-001). Mandatory items (BR-CI-002) are stored
// alongside as `mandatoryIds` so validation can ensure all mandatory IDs
// remain in the selected array at submit time.

export const complimentarySchema = z
  .object({
    selected: z.array(z.string()).default([]),
    mandatoryIds: z.array(z.string()).default([]),
  })
  .superRefine((val, ctx) => {
    for (const mid of val.mandatoryIds) {
      if (!val.selected.includes(mid)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['selected'],
          message: `Mandatory complimentary item "${mid}" must remain selected`,
        })
      }
    }
  })
