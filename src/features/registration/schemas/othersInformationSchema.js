import { z } from 'zod'
import { isCardExpiryInPast } from '../api/tokenization.js'

// FR-010 — Section A: classification flags + marketing channel.
const CLASSIFICATION_FLAG = z.enum(['', 'YES', 'NO'])

export const CHANNEL_OPTIONS = ['Facebook', 'Website', 'Google', 'Others']

export const classificationFlagsSchema = z
  .object({
    comingFrom: z.string().default(''),
    nextDestination: z.string().default(''),
    visitPurpose: z.string().default(''),
    complimentaryGuest: CLASSIFICATION_FLAG.default(''),
    houseUse: CLASSIFICATION_FLAG.default(''),
    roomOwner: CLASSIFICATION_FLAG.default(''),
    isPreviouslyVisited: z.boolean().default(false),
    isVip: z.boolean().default(false),
    channelDiscovery: z.array(z.enum(CHANNEL_OPTIONS)).default([]),
  })
  .superRefine((val, ctx) => {
    // BR-OI-001: at most one of Complimentary Guest / House Use / Room Owner may be YES.
    const yesCount = [val.complimentaryGuest, val.houseUse, val.roomOwner].filter(
      (v) => v === 'YES'
    ).length
    if (yesCount > 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['complimentaryGuest'],
        message:
          'Only one of Complimentary Guest, House Use, or Room Owner may be YES at a time.',
      })
    }
  })

// FR-010 — Section B: departure.
export const AIRPORT_DROP_VALUES = ['', 'NO', 'YES', 'TBA']

export const departureSchema = z
  .object({
    airportDrop: z.enum(AIRPORT_DROP_VALUES).default(''),
    airlineId: z.string().default(''),
    flightNumber: z.string().default(''),
    etd: z.string().default(''),
  })
  .superRefine((val, ctx) => {
    // BR-OI-004: when Airport Drop is YES or TBA, Airlines / Flight / ETD should be populated.
    // This is soft-validation — issue is surfaced as a warning path for the shell bolt to decide.
    if (val.airportDrop === 'YES' || val.airportDrop === 'TBA') {
      if (!val.airlineId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['airlineId'],
          message: 'Airline recommended when Airport Drop is set.',
        })
      }
      if (!val.flightNumber) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['flightNumber'],
          message: 'Flight Number recommended when Airport Drop is set.',
        })
      }
      if (!val.etd) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['etd'],
          message: 'ETD recommended when Airport Drop is set.',
        })
      }
    }
  })

// FR-010 — Section C: card guarantee. Tokenized shape only — NO `pan` field on this schema
// or its store slot. Raw PAN lives in component local state and is never persisted.
export const CARD_TYPES = [
  'American Express',
  'Master Card',
  'Visa Card',
  'Discover Card',
  'Taka Pay',
]

export const cardGuaranteeSchema = z
  .object({
    cardType: z.enum(['', ...CARD_TYPES]).default(''),
    cardHolderName: z.string().default(''),
    expiryMonth: z.string().default(''),
    expiryYear: z.string().default(''),
    cardReference: z.string().default(''),
    token: z.string().default(''),
    last4: z.string().default(''),
  })
  .superRefine((val, ctx) => {
    // NFR-C-005: if expiry provided, it must not be in the past.
    if (val.expiryMonth && val.expiryYear) {
      if (isCardExpiryInPast(val.expiryMonth, val.expiryYear)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['expiryMonth'],
          message: 'Card expiry is in the past.',
        })
      }
    }
    // If we have a token, we must also have a last4.
    if (val.token && !val.last4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['last4'],
        message: 'Tokenized card is missing last4.',
      })
    }
  })

export const othersInformationSchema = z.object({
  sectionA: classificationFlagsSchema,
  sectionB: departureSchema,
  cardGuarantee: cardGuaranteeSchema,
})
