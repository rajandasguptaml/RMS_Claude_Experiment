import { z } from 'zod'
import { isAfterISO } from '../../../shared/lib/date.js'

const paymentModes = ['Self', 'Company', 'Before C/O']
const payForOptions = ['Room Only', 'Room & Food', 'Room, Food & Laundry', 'Everything']

export const headerSchema = z
  .object({
    reservationEnabled: z.boolean().default(false),
    reservationId: z.string().nullable().optional(),
    checkInDate: z.string().min(1, 'Check-In Date is required'),
    checkInTime: z.string().min(1, 'Check-In Time is required'),
    departureDate: z.string().min(1, 'Departure Date is required'),
    checkoutTime: z.string().min(1, 'Checkout Time is required'),
    totalNights: z.number().int().min(1, 'Total Nights must be at least 1'),
    manualNights: z.boolean().default(false),
    listedCompany: z.boolean().default(false),
    companyId: z.string().nullable().optional(),
    contactPerson: z.string().optional().default(''),
    mobile: z.string().optional().default(''),
    paymentMode: z.string().optional().default(''),
    payFor: z.string().optional().default(''),
    currency: z.string().min(1, 'Currency is required'),
    conversionRate: z.number().positive('Conversion rate must be non-zero'),
  })
  .superRefine((val, ctx) => {
    // BR-REG-004: Departure > Check-In
    if (!isAfterISO(val.departureDate, val.checkInDate)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['departureDate'],
        message: 'Departure must be after Check-In',
      })
    }
    if (val.reservationEnabled && !val.reservationId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['reservationId'],
        message: 'Select a reservation',
      })
    }
    if (val.listedCompany) {
      if (!val.companyId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['companyId'],
          message: 'Company is required',
        })
      }
      if (val.paymentMode && !paymentModes.includes(val.paymentMode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['paymentMode'],
          message: 'Invalid payment mode',
        })
      }
      if (val.payFor && !payForOptions.includes(val.payFor)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['payFor'],
          message: 'Invalid pay-for selection',
        })
      }
    }
  })

export const paymentModeOptions = paymentModes
export const payForValues = payForOptions
