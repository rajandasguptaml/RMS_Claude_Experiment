import { z } from 'zod'
import { isAfterISO } from '../../../shared/lib/date.js'

/**
 * FR-008 guest schema. Flat draft shape (no sectional nesting in the store to
 * keep actions simple). Sub-schemas are exported so individual sections can
 * validate in isolation for inline error display.
 */

export const TITLE_OPTIONS = ['MR', 'MRS', 'MS', 'DR', 'OTHER']
export const GENDER_OPTIONS = ['', 'Male', 'Female', 'Other']

const emailField = z
  .string()
  .trim()
  .max(254, 'Email too long')
  .refine((v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Invalid email')
  .default('')

const phoneField = z
  .string()
  .trim()
  .refine(
    (v) => v === '' || /^[+]?[0-9 \-()]{6,}$/.test(v),
    'Phone must be 6+ digits; optional +, spaces, dashes, parentheses'
  )
  .default('')

const zipField = z
  .string()
  .trim()
  .refine((v) => v === '' || /^[0-9]{3,10}$/.test(v), 'Zip must be numeric (3-10 digits)')
  .default('')

export const guestBasicSchema = z.object({
  title: z.string().default(''),
  firstName: z.string().default(''),
  lastName: z.string().default(''),
  gender: z.string().default(''),
  roomNo: z.string().default(''),
  dateOfBirth: z.string().default(''),
})

export const guestContactSchema = z.object({
  email: emailField,
  phone: phoneField,
  profession: z.string().default(''),
  companyName: z.string().default(''),
  address: z.string().default(''),
  city: z.string().default(''),
  zipCode: zipField,
  country: z.string().default(''),
  nationality: z.string().default(''),
  nationalId: z.string().default(''),
  drivingLicense: z.string().default(''),
})

export const guestVisaSchema = z
  .object({
    visaNumber: z.string().default(''),
    visaIssueDate: z.string().default(''),
    visaExpiryDate: z.string().default(''),
  })
  .superRefine((val, ctx) => {
    // BR-GD-004: Expiry > Issue when both supplied.
    if (val.visaIssueDate && val.visaExpiryDate) {
      if (!isAfterISO(val.visaExpiryDate, val.visaIssueDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['visaExpiryDate'],
          message: 'Visa Expiry must be after Issue',
        })
      }
    }
  })

export const guestPassportSchema = z
  .object({
    passportNumber: z.string().default(''),
    passportIssueDate: z.string().default(''),
    passportExpiryDate: z.string().default(''),
  })
  .superRefine((val, ctx) => {
    if (val.passportIssueDate && val.passportExpiryDate) {
      if (!isAfterISO(val.passportExpiryDate, val.passportIssueDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['passportExpiryDate'],
          message: 'Passport Expiry must be after Issue',
        })
      }
    }
  })

export const guestAdditionalSchema = z.object({
  guestDocument: z
    .object({
      documentId: z.string(),
      filename: z.string(),
      mimeType: z.string(),
      sizeBytes: z.number(),
    })
    .nullable()
    .default(null),
  blocked: z.boolean().default(false),
  isContactPerson: z.boolean().default(false),
})

/**
 * Composed guest schema. Enforces BR-GD-002 (Title + First Name + Country
 * required) and BR-GD-004 (visa/passport expiry > issue). All other fields
 * are optional.
 */
export const guestSchema = z
  .object({
    id: z.string().optional(),
    ...guestBasicSchema.shape,
    ...guestContactSchema.shape,
    ...guestVisaSchema._def.schema.shape,
    ...guestPassportSchema._def.schema.shape,
    ...guestAdditionalSchema.shape,
  })
  .superRefine((val, ctx) => {
    if (!val.title || String(val.title).trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['title'],
        message: 'Title is required',
      })
    }
    if (!val.firstName || String(val.firstName).trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['firstName'],
        message: 'First Name is required',
      })
    }
    if (!val.country || String(val.country).trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['country'],
        message: 'Country is required',
      })
    }
    if (val.visaIssueDate && val.visaExpiryDate) {
      if (!isAfterISO(val.visaExpiryDate, val.visaIssueDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['visaExpiryDate'],
          message: 'Visa Expiry must be after Issue',
        })
      }
    }
    if (val.passportIssueDate && val.passportExpiryDate) {
      if (!isAfterISO(val.passportExpiryDate, val.passportIssueDate)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['passportExpiryDate'],
          message: 'Passport Expiry must be after Issue',
        })
      }
    }
  })

/**
 * Pure derived formatter for Full Guest Name. Trims + joins title/first/last
 * with single spaces, dropping blanks so partial values remain tidy.
 *
 * @param {{ title?: string, firstName?: string, lastName?: string }} parts
 * @returns {string}
 */
export function formatFullGuestName(parts = {}) {
  const { title = '', firstName = '', lastName = '' } = parts
  return [title, firstName, lastName]
    .map((p) => String(p || '').trim())
    .filter(Boolean)
    .join(' ')
}
