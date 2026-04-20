import { PROPERTY_BRANDING } from './propertyBranding.js'

// FR-013: 27 labelled fields. 13 marked required (marked with `*` in UI).
// `fullWidth: true` means the field should span the full card width.
export const FIELDS = [
  { label: 'Room No', required: false },

  // Guest 1 row
  { label: 'Guest 1 — Title', required: true },
  { label: 'Guest 1 — First name', required: true },
  { label: 'Guest 1 — Surname', required: true },

  // Optional Guests 2–4 abbreviated
  { label: 'Guest 2 — Name', required: false },
  { label: 'Guest 3 — Name', required: false },
  { label: 'Guest 4 — Name', required: false },

  { label: 'Reservation No.', required: false },
  { label: 'Registration No.', required: false },
  { label: 'Arrival Date', required: false },
  { label: 'Departure date', required: true },
  { label: 'Room type', required: false },
  { label: 'Pax', required: false },
  { label: 'Room tariff', required: false },
  { label: 'Advance', required: false },
  { label: 'Payment mode', required: false },
  { label: 'Company name', required: false, fullWidth: true },
  { label: 'Country', required: true },
  { label: 'Passport / NID No', required: true },
  { label: 'Issue Date', required: false },
  { label: 'Expiry Date', required: false },
  { label: 'Date of Birth', required: true },
  { label: 'Visa No.', required: false },
  { label: 'Visa Issue Date', required: true },
  { label: 'Visa Expiry Date', required: true },
  { label: 'Phone', required: true },
  { label: 'E-mail', required: true },
  { label: 'Home Address', required: false, fullWidth: true },
  { label: 'Reference', required: false, fullWidth: true },
  { label: 'Remarks', required: false, fullWidth: true },
]

// FR-013 / BR-BRC-003: 14 policy clauses. 1–13 normal weight, clause 14 bold.
export const POLICY_CLAUSES = [
  'Payment for all services is due at check-out unless prior credit arrangements have been made.',
  'Guests are requested to kindly settle any outstanding charges before departure.',
  'All charges are subject to applicable taxes and service charges as per local law.',
  'Valuables should be deposited at the front desk; the hotel is not responsible for items left unattended in rooms.',
  'Damage to hotel property will be charged to the guest account at replacement cost.',
  'Pets are not permitted unless prior written approval has been obtained from management.',
  'The hotel reserves the right to inspect rooms at any reasonable time for safety and maintenance.',
  'Visitors may enter guest rooms only with the registered guest present and by prior arrangement with reception.',
  `Loss of room key will incur a replacement fee of BDT ${PROPERTY_BRANDING.lostKeyFeeBDT.toLocaleString('en-IN')}.`,
  'Guests are requested to observe quiet hours between 22:00 and 07:00 out of courtesy to other guests.',
  'Early departure after check-in may not be refundable; please confirm terms at the time of reservation.',
  `Standard check-in time is 14:00 hrs and check-out time is ${PROPERTY_BRANDING.checkOutTimeLabel} hrs. Late check-out is subject to availability and may incur charges.`,
  'The hotel reserves the right to refuse service in the event of breach of these terms.',
  {
    text: `The hotel is strictly non-smoking. A penalty of BDT ${PROPERTY_BRANDING.nonSmokingPenaltyJuniorSuiteBDT.toLocaleString('en-IN')} (Junior Suite) / BDT ${PROPERTY_BRANDING.nonSmokingPenaltyPremierRoomBDT.toLocaleString('en-IN')} (Premier Room) applies for smoking in non-smoking rooms.`,
    bold: true,
  },
]

export const CONSENT_STATEMENT =
  'By signing this form, I consent to the use of my personal information for hotel registration, billing, immigration reporting, and related hospitality services in accordance with applicable data-protection laws.'

export const CHECKOUT_REMINDER_PREFIX = 'We respectfully remind you that check-out time at'
