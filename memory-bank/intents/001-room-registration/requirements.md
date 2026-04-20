---
intent: 001-room-registration
phase: inception
status: inception-complete
created: 2026-04-20T06:45:00Z
updated: 2026-04-20T07:30:00Z
---

# Requirements: Room Registration

## Intent Overview

Deliver the Room Registration module — a 6-tab wizard within Cubix HMS Front Office that enables front desk agents to check in walk-in and reservation-linked guests. The module produces a unique Room Registration record (RR########), transitions guest status to "In-House", opens the guest folio, posts initial room charges, and updates room inventory.

**Source BRDs (staged in `brd-extracted/`):**
- `BRD_Master_Cubix_HMS.txt` — master BRD v2.0 FINAL (34 pages)
- `BRD_Registration_Tab_CubixHMS.txt`
- `BRD_Guest_Details_Tab_CubixHMS__1_.txt`
- `BRD_Complimentary_Item_Module_CubixHMS.txt`
- `BRD_Others_Information_Tab_CubixHMS__3_.txt`
- `BRD_Search_Tab_CubixHMS__2_.txt`
- `BRD_Blank_Registration_Card_KaziResort.txt`

## Business Goals

| Goal | Success Metric | Priority |
|------|----------------|----------|
| Enable front desk agents to check in walk-in & reservation-linked guests in a single integrated screen | Time-to-check-in reduced vs. legacy flow; zero data re-entry across tabs | Must |
| Guarantee adult-count vs. guest-record count consistency at check-in | 100% of check-ins pass adult/guest reconciliation validation | Must |
| PCI-DSS compliant card-guarantee handling | No raw PAN persisted; tokenization service used for all card operations | Must |
| Prevent double-bookings under concurrent room assignment | Optimistic-lock conflicts surface as actionable errors; zero double-assignments in prod | Must |
| Provide searchable history + per-record actions (Edit, Re-activate, Bill Preview, Split Bill, Print) across all registrations | All FR-### from BRD "Search Tab" implemented with RBAC | Must |
| Ship as a React 19 SPA consuming existing Cubix HMS backend APIs | Module deployable independently; backend contracts unchanged | Must |

---

## Functional Requirements

### FR-001: Tab Navigation and Wizard Flow
- **Tab/Module**: Global
- **Actor**: Front Desk Agent, Reservation Officer, Duty Manager
- **Description**: Room Registration is a 6-element tab wizard (Registration, Guest Details, Complimentary Item, Others Information, Search, Blank Registration Card). Navigation is free and non-sequential. A global Check-in button is always visible.
- **Acceptance Criteria**:
  - System renders Registration tab active by default
  - User may click any tab at any time without sequential enforcement
  - Blank Registration Card opens in new browser tab (`/front_office/room-registration/blank-registration-card`)
  - Check-in button (`id="check-in"`) remains visible below all tab content
  - Clicking Check-in triggers cross-tab validation regardless of active tab
- **Priority**: Must
- **Source**: BRD_Master p.3 FR-001; BRD_Registration_Tab §3.1

### FR-002: Registration Tab — Header Section
- **Tab/Module**: Registration
- **Actor**: Front Desk Agent
- **Description**: Captures booking context: optional reservation linkage, stay dates/times, company billing, currency settings.
- **Acceptance Criteria**:
  - Reservation checkbox toggles reservation dropdown (disabled by default)
  - Selecting reservation auto-populates Check-In Date, Departure Date, Total Nights, Room Type, Rack Rate, Currency
  - Check-In Date defaults to application date (read-only — see Conflict 1); Check-In Time defaults to 14:00
  - Departure Date defaults to Check-In Date + 1 day; must be strictly > Check-In Date
  - Checkout Time defaults to 12:00 PM (read-only)
  - Total Nights auto-calculated; manual override checkbox available
  - Listed Company checkbox toggles company dropdown + 4 conditional fields (Contact Person, Mobile, Payment Mode, Pay For)
  - Currency Name defaults to BDT; Conversion Rate auto-populated (read-only, non-zero)
- **Priority**: Must
- **Source**: BRD_Master p.3-6 FR-002, FR-003; BRD_Registration_Tab §3.2

### FR-003: Registration Tab — Room Detailed Information
- **Tab/Module**: Registration
- **Actor**: Front Desk Agent
- **Description**: Per-room assignment, rate structure, occupancy, charge configuration. Supports multiple rooms per registration.
- **Acceptance Criteria**:
  - Room Types dropdown populated from room master (8+ types incl. Signature Suite, Business Class Twin/King, Super Deluxe, Deluxe, Executive Suite, PM Room)
  - Selecting Room Type auto-populates Rack Rate, Service Charge (10% default, disabled), VAT (15% default, disabled), City Charge, Additional Charges
  - Adult/Room defaults to 1 (required, min 1); Child/Room defaults to 0 (optional)
  - Room List button opens modal with available rooms filtered by room type (columns: Select, Room Number)
  - Room Number read-only; populated only via modal selection
  - Discount Type: Fixed (default) or Percent; Fixed Discount cannot exceed Rack Rate (BR-REG-005)
  - Negotiated Rate optional; overrides Rack Rate when entered
  - Service Charge / VAT / City Charge / Additional Charges each have waive checkbox (default checked)
  - Total Room Rent = Rack Rate − Discount + SC + VAT + City + Additional
  - RRC (Room Rate Calculator) modal for reverse-calculation of inclusive rate
  - Per-room date fields with "Same as global date" checkbox (default checked)
  - Stay Type Flags: No Post / Complimentary / House Use (mutual exclusivity recommended)
- **Priority**: Must
- **Source**: BRD_Master p.4-7 FR-004; BRD_Registration_Tab §3.3

### FR-004: Registration Tab — Additional Services
- **Tab/Module**: Registration
- **Actor**: Front Desk Agent
- **Description**: Attaches one or more billable additional services (e.g., Airport Drop, Extra Breakfast, Laundry, Restaurant, Spa).
- **Acceptance Criteria**:
  - Service Name dropdown populated with 25 services from service master
  - Service From/To Date default to Check-In Date
  - Total Service Amount auto-calculated by rate × duration
  - RRC button available for service-level reverse calculation
  - Add button appends row to Summary Table
  - Update button visible in edit mode only (class `d-none`)
  - Cancel button clears service form without saving
  - Multiple services per registration supported
- **Priority**: Must
- **Source**: BRD_Master p.5 FR-005; BRD_Registration_Tab §3.4

### FR-005: Registration Tab — Supplemental Classification Fields
- **Tab/Module**: Registration
- **Actor**: Front Desk Agent
- **Description**: Market Segment, Guest Source, Meal Plan, Reference, Remarks, digital marketing channel discovery.
- **Acceptance Criteria**:
  - Market Segment dropdown (optional): Dhaka Office, Cox's Office
  - Guest Source dropdown (optional): Web Site, Marketing, Other Source, Broker
  - **Meal Plan dropdown (conditional — BR-REG-002)**: Required for reservation-linked; optional for walk-in. Options: BED ONLY, BED & BREAKFAST, HALF BOARD, FULL BOARD, etc. (9+)
  - **Reference dropdown (conditional — BR-REG-002)**: Required for reservation-linked; optional for walk-in. 29+ options
  - Hotel Remarks textarea (optional, staff-visible internal notes)
  - POS Remarks textarea (optional, passed to POS)
  - **Channel Discovery checkbox group (new)**: Facebook, Website, Google, Others — stored as SET type for marketing reporting
- **Priority**: Must
- **Source**: BRD_Master p.6 FR-006; BRD_Registration_Tab §3.5

### FR-006: Registration Tab — Summary Table & Actions
- **Tab/Module**: Registration
- **Actor**: Front Desk Agent
- **Description**: Editable grid displaying all added rooms and services.
- **Acceptance Criteria**:
  - Columns: Room Type, Room Number, Adult, Child, Check-In Date, Checkout Date, No. Of Night, Room Rate, Additional Service, Status, Action
  - Edit button (cyan) repopulates form with selected row
  - Delete button (warning) removes row
  - Add button appends row
  - Cancel button discards unsaved config
  - Add blocked if Room Type or Room Number missing
- **Priority**: Must
- **Source**: BRD_Master p.7 FR-007; BRD_Registration_Tab §3.5

### FR-007: Global Check-in Action
- **Tab/Module**: Global
- **Actor**: Front Desk Agent
- **Description**: Finalizes Room Registration, creates billing account, updates room inventory, generates immutable `RR########`.
- **Acceptance Criteria**:
  - Cross-tab validation on mandatory fields (Room, Guest, dates, conditionals per booking type)
  - Guest record count must equal declared adult count (BR-REG-001)
  - For reservation-linked: Meal Plan & Reference required (BR-REG-002)
  - Optimistic concurrency lock check on room (BR-REG-003)
  - PCI-DSS tokenization invoked for card data (if provided) — NFR-S-003
  - Registration No. generated: `RR` + 8-digit zero-padded sequential integer (e.g., `RR00002293`); immutable
  - Room status updated to Occupied; billing account opened; initial room charge posted
  - Audit log: user ID, username, timestamp, action=Check-in, Registration ID
  - Concurrency lock released
  - Success confirmation displayed with Registration No.
  - Failure: errors highlighted on specific fields; Check-in blocked
- **Priority**: Must
- **Source**: BRD_Master p.8-10 FR-013; per-tab BRDs

### FR-008: Guest Details Tab — Complete Profile Capture
- **Tab/Module**: Guest Details
- **Actor**: Front Desk Agent
- **Description**: Captures full demographic, contact, identity document, and file data for each guest. Supports individual and group/family registrations.
- **Acceptance Criteria**:
  - Tab position: 2nd (after Registration, before Complimentary Item)
  - Person (Adult) / Person (Child) read-only from Registration tab
  - Family/Group/Couple checkbox: toggles individual vs. group entry mode
  - **Basic Info**: Title* (MR/MRS/MS/DR/etc.), First Name*, Last Name, Gender, Room No., Full Guest Name (auto-composed read-only — BR-GD-003), DOB
  - **Contact**: Email (RFC 5321), Phone (international format), Profession, Company Name, Address, City, Zip Code, Country* (default Bangladesh), Nationality (default Bangladeshi), National ID, Driving License
  - **Visa**: Number, Issue Date, Expiry Date (Expiry > Issue if both entered — BR-GD-004)
  - **Passport**: Number, Issue Date, Expiry Date (Expiry > Issue if both entered)
  - **Additional**: Guest Document upload (JPG/PNG/PDF), Blocked Guest checkbox (Supervisor+ only — NFR-S-008), Is Contact Person checkbox
  - **Guest Search modal**: 11 filters (Name, Company, Email, Mobile, National ID, DOB, Passport No., Room No., Reg. No., From Date, To Date); SELECT GUEST pre-populates form; blocked-guest warning (BR-GD-005)
  - **Guest Info modal**: full profile + stay history (Reg. No., Arrival, Checkout, Room Info)
  - Add validates Title + First Name + Country minimum (BR-GD-002); appends to Guest List Table; clears form
  - Update visible in edit mode only; saves modifications
  - Delete removes guest with confirmation
  - Clear resets form without affecting table
  - Guest List Table columns: Guest Name, Email, Room Number, Is Contact Person, Action
  - Check-in validation: ≥1 guest with Title/First Name/Country; guest count = declared adults (BR-REG-001)
- **Priority**: Must
- **Source**: BRD_Master p.6-8 FR-008; BRD_Guest_Details_Tab

### FR-009: Complimentary Item Tab
- **Tab/Module**: Complimentary Item
- **Actor**: Front Desk Agent
- **Description**: Multi-select checklist of 29 complimentary services. Package-mandatory items pre-checked and disabled.
- **Acceptance Criteria**:
  - 29 service items in 4-column responsive grid
  - Instruction text: "Select the services included with your reservation"
  - All 29 items listed: Airport Pick-Up & Drop, Airport Drop, Welcome Fruit Basket, Buffet Breakfast/A la Carte, Afternoon High Tea, 2 Bottle Mineral Water, 1 Large Bottle Mineral Water, 2pcs Laundry Daily, Daily Newspaper, VVIP Fruit Basket, 4 Bottle Mineral Water, Personal Butler, Pool/Gym Access, Wi-Fi, 24hr Room Service, Airport Pickup, No-Mini Bar, Buffet Lunch, Buffet Dinner, Complimentary Breakfast & Dinner, Tit-Bits, Buffet Breakfast Patenga, Cookies Platter/Fruit Basket, Complimentary Breakfast, 2 Tea & 2 Coffee, Welcome Drinks, Health Club/Gym, Swimming Pool Access, Tea/Coffee making facilities
  - Package-mandatory items: pre-checked + HTML `disabled` — cannot deselect (BR-CI-002)
  - Select All master checkbox: toggles non-mandatory items (mandatory stay checked)
  - Selected tiles: dark navy bg, white text, checkmark
  - Unselected tiles: white bg, border, empty checkbox
  - Tile click toggles state < 100ms client-side (NFR-P-013)
  - Select All < 200ms client-side (NFR-P-014)
  - Pre-population from reservation: checks services linked to rate code/package
  - Zero items valid (BR-CI-001)
  - Data saved on Check-in or via Next button
  - Edit mode: previously saved selections pre-populated
  - Navigation: Previous → Guest Details; Next → Others Information
- **Priority**: Must
- **Source**: BRD_Master p.8 FR-009; BRD_Complimentary_Item_Module

### FR-010: Others Information Tab — Three Sections
- **Tab/Module**: Others Information
- **Actor**: Front Desk Agent
- **Description**: Travel context, guest classification flags, departure logistics, credit-card guarantee. Three sub-sections.
- **Acceptance Criteria**:
  - **Section A — Other Information**:
    - Coming From (text), Next Destination (text), Visit Purpose (text: Business/Leisure/Medical/etc.)
    - Complimentary Guest dropdown (NO/YES)
    - House Use dropdown (YES/NO)
    - Room Owner dropdown (NO/YES)
    - Is Previously Visited Guest? checkbox
    - Is Guest VIP? checkbox (Supervisor+ only — NFR-S-008)
    - "How did you find out about our hotel?" checkbox group: Facebook, Website, Google, Others
    - Mutual exclusivity among Complimentary Guest / House Use / Room Owner (BR-OI-001)
  - **Section B — Departure Information**:
    - Airport Drop dropdown (NO/YES/TBA)
    - Airlines Name searchable dropdown (65 airlines)
    - Flight Number text input
    - Departure Time (ETD) time picker HH:MM 24-hour
    - Conditional completion when Airport Drop=YES/TBA (BR-OI-004)
  - **Section C — Credit Card Information** (guarantee only — BR-OI-005):
    - Card Type dropdown: Amex, MasterCard, Visa, Discover, Taka Pay
    - Card Number masked `XXXX-XXXX-XXXX-NNNN`; tokenized on submission (BR-OI-006)
    - Card Holder Name text input
    - Expiry Date MM/YY (must not be in past — NFR-C-005)
    - Card Reference (terminal authorization code)
    - `autocomplete="off"` (NFR-S-009)
  - All fields optional; registrations proceed without card
  - Previous → Complimentary Item; no Next button
  - Check-in button persistent; replaced by Update Registration in edit mode
- **Priority**: Must
- **Source**: BRD_Master p.8-9 FR-010–FR-012; BRD_Others_Information_Tab

### FR-011: Search Tab — Multi-Field Query & Actions
- **Tab/Module**: Search
- **Actor**: Front Desk Agent, Manager, Supervisor, Cashier
- **Description**: Multi-criteria search and management interface for all registration records. Supports filter, sort, pagination, export, per-row actions.
- **Acceptance Criteria**:
  - **11 Search Filters**: Room Types, Room Number, Registration No. (LIKE), Reservation No. (LIKE), Check-In Date (exact), Company Name, Country, Guest Name (LIKE), Guest Phone (LIKE), Contact Person Phone (LIKE), Reference
  - Search & Clear buttons; AND logic (BR-SR-001); text=LIKE (BR-SR-002); dropdowns=exact (BR-SR-003)
  - **Results Table 9 columns**: Reg. No. (sortable default ASC), Guest Name, Mobile, Company, Room Info (composite), Check-In (YYYY-MM-DD), Check-Out, Status (Check-In/Out By + colour badge: In-House=blue, Checked Out=red), Action
  - **DataTable Controls**: Show Entries (10/25/50/100), real-time search box (client-side current page only — BR-SR-004), pagination (Prev/Next + numbered), "Showing X to Y of Z"
  - **Per-Row Actions**:
    1. Edit (pencil, cyan): loads full registration into wizard in edit mode (all 4 tabs) — `showFoRegGuestData(registration_id)`
    2. Re-activate (reload, orange): see FR-012
    3. Bill Preview (file, green link): `/front_office/room-registration/bill-preview/{id}` (new tab, read-only)
    4. Split Bill Preview (scissors, cyan): `openSplitBillModal(registration_id)` overlay
    5. Registration Card (receipt, grey link): `/front_office/room-registration/pre-registration-card/{id}` (printable)
  - Default load: all records sorted by Reg. No. ASC; no filters
  - No date-range filter; Check-In Date filter only
  - Previous navigates to Others Information tab
- **Priority**: Must
- **Source**: BRD_Master p.10-11 FR-014; BRD_Search_Tab

### FR-012: Re-activate Registration
- **Tab/Module**: Search
- **Actor**: Manager, Supervisor (NOT Front Desk Agents) — BR-SR-007
- **Description**: Reinstates Checked-Out registration to In-House status. Requires role approval, room revalidation, date validation.
- **Acceptance Criteria**:
  - Available only for Checked-Out status registrations
  - Confirmation dialog with Reg. No., Guest Name, Room Info, original dates (BR-SR-008)
  - Manager/Supervisor credential or approval code prompt
  - RBAC check (NFR-S-002)
  - Room availability revalidation: no overlap with active In-House registrations (BR-SR-009)
  - Stay dates within operationally permissible window
  - Room status → Occupied
  - Audit log: approving user, timestamp, action=Re-activate, Reg. ID
  - Failure states: role check, invalid credentials, room occupied, dates outside window
  - Success confirmation
- **Priority**: Must
- **Source**: BRD_Master p.11-12 FR-015; BRD_Search_Tab §3.8.2

### FR-013: Blank Registration Card — Static Printable Form
- **Tab/Module**: Blank Registration Card
- **Actor**: Front Desk Agent
- **Description**: Print-optimised blank pre-registration form for guest handwritten completion.
- **Acceptance Criteria**:
  - URL: `/front_office/room-registration/blank-registration-card` (new browser tab)
  - No interactive elements; pure static HTML; no DB queries; no JS runtime (BR-BRC-001, BR-BRC-002)
  - Header: property logo, hotel name, address, hotlines, website, email (property-specific)
  - Card Title: "Pre Registration Card" + Room No. field
  - **27 Data Entry Fields** (all blank on load): Room No, Guest 1-4 (Title*, First name*, Surname*), Reservation No., Reg. No., Arrival Date, Departure Date*, Room Type, Pax, Room Tariff, Advance, Payment Mode, Company Name, Country*, Passport/NID No*, Issue Date, Expiry Date, DOB*, Visa No., Visa Issue Date*, Visa Expiry Date*, Phone*, Email*, Home Address, Reference, Remarks
  - 13 fields marked required (*)
  - **14 Policy Clauses** (1-13 normal, 14 bold — BR-BRC-003): incl. Clause 9 (lost key fee BDT 600), Clause 12 (check-in 14:00, check-out 12:00), Clause 14 bold (no-smoking penalty BDT 2,500 Junior Suite / 2,000 Premier Room)
  - **Consent Statement**: "By signing this form, I consent..." H2 centred (BR-BRC-004)
  - **Dual Signature Section** (BR-BRC-005): "Checked in By*" (50%) and "Guest Signature*" (50%)
  - **Time Entry Line**: "Check-In at ...HRS. Check-Out at ...HRS."
  - **Checkout Reminder**: bold time at bottom
  - **Print**: browser native Ctrl+P; single A4 portrait; borders visible; 9pt min text
  - Requires valid HMS session (NFR-S-001)
- **Priority**: Must
- **Source**: BRD_Master p.12 FR-016; BRD_Blank_Registration_Card

---

## Business Rules

### Guest Details
- **BR-GD-001**: Minimum one adult guest must be added before Check-in
- **BR-GD-002**: Title + First Name + Country mandatory for any guest entry
- **BR-GD-003**: Full Guest Name system-generated (Title + First + Last); read-only
- **BR-GD-004**: Visa/Passport Expiry > Issue if both entered
- **BR-GD-005**: Blocked guest retrieval shows visible warning before form population
- **BR-GD-006**: Guest entries must reconcile with declared Adult+Child count (soft warning recommended)

### Complimentary Item
- **BR-CI-001**: Zero complimentary items is valid; no min/max
- **BR-CI-002**: Package-mandatory items cannot be deselected (`disabled` attribute)
- **BR-CI-003**: If Complimentary flag on Registration tab set, services must not generate chargeable folio posting

### Others Information
- **BR-OI-001**: Complimentary Guest / House Use / Room Owner mutually exclusive
- **BR-OI-002**: Complimentary Guest=YES suppresses standard charge postings
- **BR-OI-003**: House Use=YES excludes room from revenue statistics in night audit
- **BR-OI-004**: Airport Drop=YES or TBA should populate Airlines, Flight No., Departure Time
- **BR-OI-005**: Credit card is a guarantee only — no HMS-side financial transaction
- **BR-OI-006**: Card number must be encrypted/tokenized; raw PAN never stored; only last 4 + token persisted

### Search
- **BR-SR-001**: Multiple filters combine with AND logic
- **BR-SR-002**: Text filters use partial LIKE matching
- **BR-SR-003**: Dropdown filters require exact match
- **BR-SR-004**: Real-time search box is client-side current page only
- **BR-SR-005**: Edit available for all statuses (In-House and Checked Out)
- **BR-SR-006**: Edit/Update does not alter original check-in timestamp
- **BR-SR-007**: Re-activate restricted to Manager/Supervisor; Front Desk blocked
- **BR-SR-008**: Re-activate requires confirmation dialog
- **BR-SR-009**: Room must have no overlapping active In-House registration before re-activation

### Blank Registration Card
- **BR-BRC-001**: Card always renders completely empty; no pre-fill
- **BR-BRC-002**: Identical output for all authenticated users
- **BR-BRC-003**: All 14 policy clauses must be present on every card
- **BR-BRC-004**: Consent statement mandatory above signature lines
- **BR-BRC-005**: Both "Checked in By" and "Guest Signature" lines mandatory

### Registration (Global)
- **BR-REG-001**: Guest record count = declared Adult count; mismatch blocks Check-in
- **BR-REG-002**: Meal Plan & Reference required for reservation-linked; optional for walk-in
- **BR-REG-003**: Optimistic-lock concurrency token acquired on room selection; released on Check-in or abandonment
- **BR-REG-004**: Departure Date strictly > Check-In Date
- **BR-REG-005**: Fixed Discount Amount cannot exceed Rack Rate

---

## Non-Functional Requirements

### Performance
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-P-001 | Tab load time (Registration, Guest Details, Complimentary, Others) | < 2s on standard broadband |
| NFR-P-002 | Guest Search modal result | < 3s for up to 500 matching records |
| NFR-P-003 | Full Guest Name field auto-update (on-input) | < 100ms client-side |
| NFR-P-004 | Guest document upload (async) | no UI freeze; progress indicator |
| NFR-P-005 | Guest List Table render (up to 20 entries) | smooth, no lag |
| NFR-P-006 | Search tab initial load | < 2s |
| NFR-P-007 | Server-side filtered search | < 3s for 10,000+ records |
| NFR-P-008 | Real-time DataTable search (client-side) | < 100ms |
| NFR-P-009 | Page size change | < 1s re-render |
| NFR-P-010 | Edit action (load registration into wizard) | < 2s |
| NFR-P-011 | Bill Preview & Registration Card generation | < 3s for multi-room |
| NFR-P-012 | Blank Card page load | < 1s (no DB) |
| NFR-P-013 | Complimentary tile toggle | < 100ms |
| NFR-P-014 | Select All operation (29 checkboxes) | < 200ms |
| NFR-P-015 | Check-in submission | < 3s under normal load |
| NFR-P-016 | Concurrent users | 10+ without degradation |

### Security
| ID | Requirement | Notes |
|----|-------------|-------|
| NFR-S-001 | Authentication | HMS session middleware; unauthenticated → /login |
| NFR-S-002 | RBAC | Re-activate=Supervisor+; VIP flag=Supervisor+; Blocked=Supervisor+ |
| NFR-S-003 | Card data (PCI-DSS) | Raw PAN never stored; tokenization + TLS; last 4 + token only |
| NFR-S-004 | PII protection | Passport/visa/national ID/email encrypted at rest; masked for non-privileged |
| NFR-S-005 | Document upload validation | Malware scan; JPG/PNG/PDF; max ~5MB |
| NFR-S-006 | XSS / SQLi prevention | Output HTML-escaped; input sanitisation |
| NFR-S-007 | HTTPS | TLS mandatory; plain HTTP prohibited |
| NFR-S-008 | Sensitive field access | Blocked / VIP / Re-activate restricted |
| NFR-S-009 | Card autocomplete suppression | `autocomplete="off"` / `"cc-number"` |
| NFR-S-010 | Document secure storage | Restricted access; encryption |

### Usability
| ID | Requirement | Standard |
|----|-------------|----------|
| NFR-U-001 | Mandatory field indication | Red asterisk; WCAG contrast |
| NFR-U-002 | Date picker | Calendar popup consistent across date fields |
| NFR-U-003 | Guest Search modal | Resizable/scrollable; no cut-off |
| NFR-U-004 | Validation error display | Inline adjacent to failing field |
| NFR-U-005 | Guest Details completion time | ≤3 min for basic staff |
| NFR-U-006 | Registration Tab completion time | ≤2 min |
| NFR-U-007 | Keyboard navigation | Tab sequence left-right, top-bottom |
| NFR-U-008 | Complimentary tile distinction | WCAG AA contrast |
| NFR-U-009 | 29 service labels readability | no truncation at 1024×768+ |
| NFR-U-010 | Tooltips on Search row actions | all 5 buttons |
| NFR-U-011 | Pagination | visible without scrolling |
| NFR-U-012 | Partial-input search | find with partial name/reg no |
| NFR-U-013 | Responsive layout | tablet 768px+ |
| NFR-U-014 | Blank Card legibility | 9pt min; clauses readable |
| NFR-U-015 | Modals | title + content + × and Close |

### Reliability
| ID | Requirement | Target |
|----|-------------|--------|
| NFR-R-001 | Session data persistence | retained across tab navigation |
| NFR-R-002 | Network interruption recovery | sessionStorage survives brief drops |
| NFR-R-003 | Guest Search failure | friendly message; no form crash |
| NFR-R-004 | Document upload failure | error without blocking registration |
| NFR-R-005 | Peak hours | 14-18 & 22-23; 20+ concurrent users |
| NFR-R-006 | Session timeout | re-auth prompt; data preserved |
| NFR-R-007 | Blank Card checkout reminder | always present |
| NFR-R-008 | Optimistic-lock failure | informative; prompt for alternate room |
| NFR-R-009 | Tokenization service outage | Check-in blocked; retry/contact IT |

### Compliance & Data Quality
| ID | Requirement | Notes |
|----|-------------|-------|
| NFR-C-001 | Email validation | RFC 5321 |
| NFR-C-002 | Date validation | reject impossible dates |
| NFR-C-003 | Immigration data | per local reporting (e.g., C-Form) |
| NFR-C-004 | Post-check-in audit | log passport/visa/blocked/VIP/comp changes |
| NFR-C-005 | Card expiry | not in past at Check-in |
| NFR-C-006 | Phone format | international with country code |
| NFR-C-007 | Postal code | numeric only |
| NFR-C-008 | Visa/Passport dates | Expiry > Issue |

### Scalability & Maintainability
| ID | Requirement | Notes |
|----|-------------|-------|
| NFR-M-001 | Search indexing | on reg_no, check_in_date, room_number, guest_name, phone — supports 100K+ records |
| NFR-M-002 | Pagination scalability | ellipsis supports 10K pages |
| NFR-M-003 | Reference master | up to 100; select2 for larger |
| NFR-M-004 | Complimentary items master | dynamic; supports deactivation without breaking history |
| NFR-M-005 | Hotel contact info | from HMS property settings (not hard-coded) |
| NFR-M-006 | Policy clauses | database-configurable (gap — currently hard-coded) |
| NFR-M-007 | Airline master | dynamic; new airlines w/o deploy |
| NFR-M-008 | Currency master | exchange rates daily; recalc on change |
| NFR-M-009 | Room type master | extensible w/o code change |

---

## Cross-Cutting / Global Features

### Global Check-in Button
Green button fixed at bottom, always visible. Submits all 4 wizard tabs as single atomic transaction. Cross-tab validation. Success → Registration No. + room Occupied + folio opened. Failure → field-level errors + possible auto-redirect to offending tab. Edit mode: replaced by "Update Registration" (yellow).

### Cross-Tab Validation on Check-in
- **Registration**: Room Type, Room Number, Check-In Date (≥ today), Departure Date (> Check-In), Meal Plan & Reference (if reservation-linked)
- **Guest Details**: ≥1 guest with Title/First Name/Country; guest count = declared adults
- **Complimentary**: none (zero items OK)
- **Others Information**: none (all fields optional)

### Tab Navigation Rules
Free click navigation; data retained in session across tab switches. Data lost only on tab close, session expiry, Cancel/Clear, or successful Check-in.

### Adult/Guest Reconciliation
Person (Adult) count on Tab 1 must equal Guest List entries on Tab 2. Current spec: soft warning non-blocking — **recommend hard blocking** per BR-REG-001.

### Optimistic Locking on Room Selection
UUID concurrency_token acquired on room select via modal. Released post-Check-in or abandonment. Failure → room removed from modal + error on conflict.

### PCI-DSS Tokenization Workflow
Raw card number never stored/logged; TLS-only transit. Tokenization service at Check-in. Persisted: token, type, holder, expiry (MM/YY), last 4, reference. Display mask: `XXXX-XXXX-XXXX-NNNN`.

### RBAC Gates
| Action | Allowed | Blocked |
|--------|---------|---------|
| View all tabs | FO Agent, Reservation Officer, Supervisor, Manager, Duty Manager | Unauth |
| Modify Blocked Guest | Supervisor, Manager | FO Agent |
| Set VIP flag | Supervisor, Manager | FO Agent |
| Re-activate | Manager, Supervisor | FO Agent, Cashier |
| Edit post-check-in sensitive fields | Supervisor, Manager (logged) | FO Agent (limited/read-only) |
| Access Search tab | All authenticated FO roles | Unauth |

### Session Data Persistence
Browser sessionStorage across all 4 wizard tabs. Lost on tab close, timeout, explicit Cancel, or successful Check-in.

---

## Data Dependencies (Master Data)

| Master | Populates | Tabs |
|--------|-----------|------|
| Company Master | Listed Company + 4 conditional fields | Registration, Guest Details |
| Currency Master | Currency dropdown (default BDT); Conversion Rate | Registration |
| Reference Master | Reference dropdown (29+); marketing channel group | Registration, Search |
| Room Type Master | Room Types dropdown (8+) | Registration |
| Room Inventory | Room List modal + status | Registration |
| Rate & Pricing Master | Rack Rate, SC%, VAT%, City Charge, Additional | Registration |
| Guest Profile Store | Guest search results + pre-fill | Guest Details, Search |
| Profession Master | Profession dropdown | Guest Details |
| Country Master | Country dropdown (default Bangladesh); Nationality | Guest Details, Search |
| Complimentary Items Master | 29 tiles + mandatory flags + is_active | Complimentary |
| Airline Master | Airlines dropdown (65) | Others Information |
| Card Type Master | Card Type dropdown | Others Information |
| Market Segment Master | Market Segment dropdown | Registration |
| Guest Source Master | Guest Source dropdown | Registration |
| Meal Plan Master | Meal Plan dropdown (9+) | Registration |
| Service/Charge Master | Additional Service Name (25) | Registration |
| Reservation Records | Reservation dropdown pre-fills | Registration |
| User/Staff Master | Audit trail IDs + RBAC | Global |
| Application Date | default dates + validation | Global |

---

## Constraints

### Technical Constraints
Frontend-only React 19 + Vite SPA. Integrates with existing Cubix HMS backend APIs (base `/front_office/*`). Consumes existing master-data endpoints. Card tokenization uses existing PCI-DSS service. Browser print subsystem for cards. New-tab flow for Blank Registration Card.

### Business Constraints
BRD v2.0 is **Ready for Development & QA** — no further churn expected. Conditional mandatory logic (BR-REG-002) for Meal Plan & Reference. Hotel branding property-specific (contact info, policy clauses).

---

## Assumptions

| Assumption | Risk if Invalid | Mitigation |
|------------|-----------------|------------|
| Cubix HMS backend APIs for all master data are implemented and available | Frontend cannot function; must build mock layer | Begin with mock adapters; formalize API contracts in system-context phase |
| PCI-DSS tokenization service exposes a documented client SDK/endpoint | Card-guarantee feature blocked | Spike + escalate to backend/security team |
| Optimistic-lock mechanism returns structured conflict responses (409) | Race conditions surface as generic 500s | Coordinate contract with backend |
| RBAC claims available in session/JWT | Re-activate action unguarded | Surface requirements to auth team |
| Print-card markup provided by backend OR defined locally | Inconsistent print output | Define template in ux-guide standard |
| Sensitive flags (Blocked / VIP) gated by RBAC on backend | UI RBAC insufficient — bypass possible | Backend must enforce regardless of UI state |

---

## Open Questions / Conflicts

### Clarifications Needed from Product / BA
1. **Check-In Date editability** (Master BRD says editable; Registration Tab BRD says read-only) → which is authoritative?
2. **Passport Issue Place field** appears in Guest Info modal but no input field exists in main form → add or remove?
3. **Package-mandatory item trigger** — by rate code? reservation? room type? mechanism not documented.
4. **Credit card semantics** — "security deposit" (pre-auth hold) or "guarantee" (reference only)? BRD uses both terms.
5. **Check-In Date past-date validation** — should it block manual selection of past dates?
6. **Blank Registration Card content** — hard-coded vs. configurable per property (hotel contact, 14 policy clauses)?
7. **Payment Mode "Before C/O"** — stands for "Before Check-Out"? Meaning: company/host settles post-checkout?
8. **Real-time vs. server-side search** — relabel "Filter current page" or implement server-side DataTables integration?

### Clarifications Needed from Backend / Security
9. Are backend API contracts published (OpenAPI/Swagger)?
10. Tokenization SDK — JS SDK, iframe, or redirect flow?
11. Split Bill Preview — rendered in-tab modal or in new window?
12. Returning-guest lookup API — by mobile, passport, or both?

---

## Summary

| Metric | Count |
|--------|-------|
| Functional Requirements | 13 (FR-001..FR-013) |
| Business Rules | 36 |
| Non-Functional Requirements | 80+ (across Performance, Security, Usability, Reliability, Compliance, Scalability) |
| Master Data Dependencies | 19 |
| Data Fields (all tabs) | ~70+ |
| Open Questions | 12 |
| Critical Path | FR-001 → FR-002..006 → FR-008 → FR-009 → FR-010 → FR-007 → FR-011/012 + FR-013 |
