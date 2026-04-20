import { z } from 'zod'
import { diffNights } from '../../../shared/lib/date.js'

export const serviceSchema = z
  .object({
    id: z.string().optional(),
    serviceId: z.string().min(1, 'Service Name is required'),
    serviceName: z.string().min(1),
    fromDate: z.string().min(1, 'From Date is required'),
    toDate: z.string().min(1, 'To Date is required'),
    unitRate: z.number().min(0),
    quantity: z.number().int().min(1).default(1),
    total: z.number().min(0),
  })
  .superRefine((val, ctx) => {
    if (val.toDate < val.fromDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['toDate'],
        message: 'To Date cannot be before From Date',
      })
    }
  })

/**
 * Service total = unit rate * duration (in days; min 1).
 * @param {{ unitRate:number, fromDate:string, toDate:string, quantity?:number }} svc
 * @returns {number}
 */
export function computeServiceTotal(svc) {
  if (!svc) return 0
  const days = Math.max(1, diffNights(svc.fromDate, svc.toDate) || 1)
  const qty = svc.quantity || 1
  const rate = svc.unitRate || 0
  return Math.round((rate * days * qty + Number.EPSILON) * 100) / 100
}
