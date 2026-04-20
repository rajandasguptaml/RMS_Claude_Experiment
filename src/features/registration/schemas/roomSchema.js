import { z } from 'zod'

export const DISCOUNT_TYPES = ['Fixed', 'Percent']
export const STAY_TYPES = ['Standard', 'NoPost', 'Complimentary', 'HouseUse']

export const roomSchema = z
  .object({
    id: z.string().optional(), // filled on add
    roomTypeId: z.string().min(1, 'Room Type is required'),
    roomId: z.string().min(1, 'Room Number is required (use Room List)'),
    roomNumber: z.string().min(1, 'Room Number is required'),
    adults: z.number().int().min(1, 'At least 1 adult'),
    children: z.number().int().min(0).default(0),
    rackRate: z.number().min(0),
    negotiatedRate: z.number().min(0).nullable().optional(),
    discountType: z.enum(DISCOUNT_TYPES),
    discountValue: z.number().min(0).default(0),
    scPct: z.number().min(0).default(10),
    vatPct: z.number().min(0).default(15),
    city: z.number().min(0).default(0),
    additional: z.number().min(0).default(0),
    waiveSc: z.boolean().default(false),
    waiveVat: z.boolean().default(false),
    waiveCity: z.boolean().default(false),
    waiveAdditional: z.boolean().default(false),
    sameAsGlobalDate: z.boolean().default(true),
    checkInDate: z.string().optional().default(''),
    departureDate: z.string().optional().default(''),
    stayType: z.enum(STAY_TYPES).default('Standard'),
    lockToken: z.string().nullable().optional(),
    total: z.number().optional(),
  })
  .superRefine((val, ctx) => {
    // BR-REG-005: Fixed Discount cannot exceed Rack Rate
    if (val.discountType === 'Fixed' && val.discountValue > val.rackRate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: 'Fixed discount cannot exceed Rack Rate',
      })
    }
    if (val.discountType === 'Percent' && val.discountValue > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['discountValue'],
        message: 'Percent discount cannot exceed 100',
      })
    }
  })

/**
 * Pure totals calculator (<100ms per NFR-P-003).
 * @param {object} room
 * @returns {number}
 */
export function computeRoomTotal(room) {
  if (!room) return 0
  const base =
    room.negotiatedRate != null && room.negotiatedRate > 0
      ? room.negotiatedRate
      : room.rackRate || 0
  let discount = 0
  if (room.discountType === 'Fixed') discount = room.discountValue || 0
  if (room.discountType === 'Percent') discount = ((room.discountValue || 0) / 100) * base
  const sub = Math.max(0, base - discount)
  const sc = room.waiveSc ? 0 : (sub * (room.scPct || 0)) / 100
  const vat = room.waiveVat ? 0 : ((sub + sc) * (room.vatPct || 0)) / 100
  const city = room.waiveCity ? 0 : room.city || 0
  const add = room.waiveAdditional ? 0 : room.additional || 0
  return Math.round((sub + sc + vat + city + add + Number.EPSILON) * 100) / 100
}

/**
 * Reverse-calc Rack Rate from an inclusive target total.
 * Returns the rack-rate-before-tax that would yield the target.
 * Assumes no discount, not waived. Percent SC and VAT chained.
 * @param {number} target - desired inclusive total
 * @param {object} rates - { scPct, vatPct, city, additional }
 */
export function reverseRate(target, rates) {
  const sc = rates.scPct || 0
  const vat = rates.vatPct || 0
  const city = rates.city || 0
  const add = rates.additional || 0
  const t = target - city - add
  if (t <= 0) return 0
  const multiplier = (1 + sc / 100) * (1 + vat / 100)
  const rack = t / multiplier
  return Math.round((rack + Number.EPSILON) * 100) / 100
}
