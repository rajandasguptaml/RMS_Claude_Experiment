import { z } from 'zod'
import { headerSchema } from './headerSchema.js'
import { roomSchema } from './roomSchema.js'
import { serviceSchema } from './serviceSchema.js'
import { classificationSchema } from './classificationSchema.js'

export const registrationTabSchema = z
  .object({
    header: headerSchema,
    rooms: z.array(roomSchema).min(1, 'Add at least one room'),
    services: z.array(serviceSchema).default([]),
    classification: classificationSchema,
  })
  .superRefine((val, ctx) => {
    if (val.header.reservationEnabled) {
      if (!val.classification.mealPlanId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['classification', 'mealPlanId'],
          message: 'Meal Plan is required for reservation-linked',
        })
      }
      if (!val.classification.referenceId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['classification', 'referenceId'],
          message: 'Reference is required for reservation-linked',
        })
      }
    }
  })
