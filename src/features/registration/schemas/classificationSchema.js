import { z } from 'zod'

export const CHANNEL_OPTIONS = ['Facebook', 'Website', 'Google', 'Others']

export const classificationSchema = z.object({
  marketSegmentId: z.string().nullable().optional(),
  guestSourceId: z.string().nullable().optional(),
  mealPlanId: z.string().nullable().optional(),
  referenceId: z.string().nullable().optional(),
  hotelRemarks: z.string().optional().default(''),
  posRemarks: z.string().optional().default(''),
  channelDiscovery: z.array(z.enum(CHANNEL_OPTIONS)).default([]),
})

/**
 * Validate conditional requirement: Meal Plan & Reference are required when reservation-linked.
 * Returns an array of { path, message }; empty when valid.
 * @param {object} classification
 * @param {boolean} reservationEnabled
 */
export function validateConditionalClassification(classification, reservationEnabled) {
  const errors = []
  if (reservationEnabled) {
    if (!classification.mealPlanId) {
      errors.push({ path: 'mealPlanId', message: 'Meal Plan is required for reservation-linked' })
    }
    if (!classification.referenceId) {
      errors.push({ path: 'referenceId', message: 'Reference is required for reservation-linked' })
    }
  }
  return errors
}
