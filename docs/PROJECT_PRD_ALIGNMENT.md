Product Requirements Document (PRD) – MEATNG
Version 1.0
Project Name: MeatNG Commerce Platform
 By: Ayomikun Oladipupo
Departmental Ownership: MeatNG Product Team
Written On: 2026
Last Update: Initial Draft
Revision ID: PRD-MNG-001
Validated By: Product Team
(All approvals are required. Records of each approver must be maintained)
Validation Authority

	Name	Signature	Date
CEO			
Head of Product			
Product Manager	Ayomikun Oladipupo		
Team Members Involved

Team Member	Role	Signature	Date
UI/UX Designer			
Backend Developer			
Frontend Developer			
Project Manager			
Summary of Change
The document author is authorized to make the following changes without re-approval:
●	Editorial updates

●	Formatting and spelling

●	Clarifications

To request changes to this document, contact the document author.

1. Product Summary
1.	MeatNG is a Nigeria-first premium meat subscription platform that enables households and small businesses to receive hygienically processed, portioned, and packaged meat on a recurring schedule.

2.	The platform operates on a subscription-equals-membership model where:

1.	Customers select a plan.

2.	Choose a size.

3.	Choose a delivery frequency.

4.	Build their box (products vary by plan).

5.	Optionally add paid add-ons.

6.	Pay via Nomba (card supported).

7.	Manage everything in a member dashboard (edit/skip/pause/cancel before cutoff).

3.	MeatNG owns and operates its own abattoir facility, enabling operational control from slaughtering through packaging and dispatch.


2. Purpose of This Document
1.	This PRD defines the complete subscription website experience and the admin operating system required to run it.

2.	It is written so that a designer or engineer can implement the full experience without needing to reference ButcherBox or rely on verbal explanations.


3. Intended Audience
1.	Product Managers

2.	UI/UX Designers

3.	Frontend Developers

4.	Backend Developers

5.	QA Engineers

6.	Operations & Fulfillment Team

7.	Finance & Reconciliation Team

8.	Customer Support Team

9.	Executive Stakeholders

4. Core Principles (Non-Negotiables)
1.	Subscription is the primary conversion.

2.	Subscription equals membership (no separate membership signup).

3.	Fixed pricing per plan + size (the box build does not change the base subscription price).

4.	Box customization happens within plan rules (eligibility and size allocation rules).

5.	Add-ons are optional and priced separately.

6.	Payment provider is Nomba only.

7.	No manual payment upload.

8.	Location-based delivery uses Nigeria geography: State + LGA.

9.	Dashboard is the retention center (subscription control lives there).

10.	The product experience must feel premium, clear, and operationally enforceable (cutoff, capacity, availability).


5. Product Scope
1.	Customer Website (Discovery → Subscribe → Dashboard)

2.	Subscription Plan Engine (Essentials, Signature, Premium)

3.	Size Tiers (Medium, Large, Extra Large)

4.	Plan Builder (eligibility-based product browsing + size allocation enforcement)

5.	Product Detail Pages (full description per product)

6.	Cart + Upsell (“You may also like”) module

7.	Add-on Engine (paid extras for the next delivery/cycle)

8.	Nomba Checkout Integration (card)

9.	Recurring Billing Logic (Nomba-based)

10.	Delivery Scheduling Engine (State + LGA rules, capacity, cutoff)

11.	Member Dashboard (edit/skip/pause/cancel/payment/address)

12.	Gifts Module (one-time purchase, dropdown navigation)

13.	Farm Locator (store/collection/coverage locator)

14.	Admin Portal (role-based, whitelisted access, full audit logging)

15.	Inventory, fulfillment, payments, support operations inside admin

16.	WhatsApp Community Integration (member join CTA that redirects to WhatsApp group link)


6. User Roles and Responsibilities
6.1 Customer (Subscriber)
1.	Create an account or sign in.

2.	Choose plan, size, and delivery frequency.

3.	Build a box from products allowed for that plan.

4.	View product details before adding (description, pack size, cooking use cases, storage).

5.	Add optional add-ons (paid).

6.	Pay via Nomba card checkout.

7.	View subscription status, next billing, next delivery window, and cutoff time.

8.	Edit upcoming box before cutoff.

9.	Skip, pause, cancel before cutoff.

10.	Update address and delivery note.

11.	Update payment method.

12.	View billing history and order history.

13.	Join WhatsApp community via dashboard CTA.

6.2 Gift Buyer (Non-Subscriber)
1.	Browse gift boxes and gift cards.

2.	View full gift details (contents, weight estimate, delivery expectations).

3.	Pay one-time via Nomba.

4.	Provide recipient details and optional message.

5.	Receive confirmation and tracking updates.

6.3 Admin Users (Internal)
All admin access is via admin.meatng.com, restricted by corporate email domain + allowlist.
1.	Super Admin

2.	Operations & Fulfillment Admin

3.	Catalog & Inventory Admin

4.	Finance Admin

5.	Customer Support Admin

6.	Marketing/Content Admin (optional role if needed)

(Full permissions and screens are defined in Section 13.)

7. Product Offering (Catalog) 
7.1 Product Data Requirements (for every product)
1.	Product name

2.	Category (Essentials / Assorted & Soup Cuts / Premium Cuts / Bones & Add-ons)

3.	Pack size (500g / 1kg / pieces)

4.	Product description (what it is, how it is cleaned/trimmed)

5.	Best for (e.g., stew, soup, pepper soup, grill)

6.	Storage guidance (fresh/frozen handling notes + freezer life guidance)

7.	Handling notes (where relevant)

8.	Images (minimum 1, ideally 3)

9.	Plan eligibility flags (Essentials / Signature / Premium)

10.	Add-on eligibility 

7.2PLAN STRUCTURE
Each plan defines:
• Total protein selections (X)
• Catalog access level
• Priority level
Users may select ANY combination from eligible catalog.
No category restriction.
Only total selection cap enforced.

7.3 Essentials Plan
User receives:
• 6 selections per cycle
• Standard catalog access
Eligible Products:
Chicken:
●	Whole Chicken

●	Chicken Thighs

●	Chicken Wings

Beef:
●	Beef Deboned

●	Beef Bone-In

●	Cow Leg

●	Liver

●	Shaki

●	Ponmo

Ram:
●	Ram Bone-In

●	Ram Assorted

Goat:
●	Goat Bone-In

●	Goat Assorted

Sausage:
●	Beef Sausage

●	Chicken Sausage

Bones:
●	Soft Bones

User may:
• Pick all X from chicken
• Mix across categories
• Repeat same item multiple times

7.3 Signature Plan
Includes everything in Essentials PLUS:
Beef:
●	Cow Tail

●	Roundabout

●	Kidney

●	Heart

●	Steak

●	Ribs

Ram:
●	Ram Deboned

Goat:
●	Goat Deboned

Bones:
●	Hard Bones

●	Fat Trimmings

User receives:
• X selections
• Expanded catalog

7.3 Premium Plan
Includes everything in Signature PLUS:
●	Prime Steak Cuts

Premium Benefits:
• Inventory priority
• Priority fulfillment
• Access to limited inventory first
No category cap applies

7.4 Protein Picks Allowance (X/Y/Z)
●	Each plan size has a protein allowance:

1.	Medium = X proteins

2.	Large = Y proteins

3.	Extra Large = Z proteins

●	Each selection consumes pick by default (unless defined otherwise in admin).

●	The box builder must show:

1.	Picks used / total picks

2.	“Complete your box” state when picks are remaining

3.	“Box complete” state when picks are fully selected

7.5 Add-Ons (You may also like)
Add-ons must:
1.	Be optional

2.	Be priced individually

3.	Appear only in Cart / Upsell

4.	Not change base plan price

Add-ons can be ANY extra pack from catalog.
Instead of inventing special products, we do this:
Add-On Rule:
Any eligible product can be offered as an “Extra Pack Add-On”.
Example Add-Ons shown in “You May Also Like”:
1.	Chicken Wings Pack – ₦X

2.	 Goat Assorted Pack – ₦X

3.	 Liver Pack – ₦X

4.	 Soft Bones Pack – ₦X

5.	 Steak Pack – ₦X

Add-ons:
1.	Show full price

2.	Increase current cycle charge only

3.	Do not change recurring plan price

4.	Are removed automatically after that cycle (unless user re-adds)

8. Plans, Sizes, and Fixed Pricing Rules
8.1 Plan Types
1.	Essentials Plan

2.	Signature Plan

3.	Premium Plan

8.2 Size Tiers (applies to every plan)
1.	Medium

2.	Large

3.	Extra Large

Each size has:
1.	Estimated household fit guidance (e.g., 1–2, 3–4, 5+ people)

2.	Estimated total weight range (admin-defined)

3.	Fixed recurring price (admin-defined)

8.3 Allocation Rules Inside the Box Builder
1.	The system must enforce “how full the box is” based on the selected size (weight-based or item-based depending on your final ops rule).

2.	Users must not proceed if the box is under the minimum fill rule for that size.

3.	The base plan price does not change based on the mix of items chosen, as long as the box respects the plan’s allocation rule.


9. UX Flow (Screen-by-Screen)  Full User Journey From Typing www.meatng.com
9.1 Screen 1: Entry Landing Page (Root Domain)
1.	Trigger: user types www.meatng.com

2.	Purpose: first impression + single primary action (“Get Started”)

3.	Header Navigation (always visible on top):

1.	How It Works

2.	Plans

3.	Gifts (dropdown)

4.	Sourcing

5.	Farm Locator

6.	FAQs

7.	Sign In

8.	Primary CTA Button: Get Started

4.	Hero Section:

1.	Headline: Premium Nigerian meat, cleaned and delivered on subscription

2.	Subtext: Flexible schedules, hygienic processing, dashboard control

3.	CTA: Get Started (primary)

4.	Secondary CTA: How It Works

5.	Social Proof Strip (admin-editable):

1.	Rating summary

2.	Testimonials

3.	Customer count (if available)

6.	Benefits Blocks:

1.	Hygiene and quality (owned processing)

2.	Flexible delivery schedules (Daily/Weekly/Bi-weekly/Monthly)

3.	Subscription control (edit/skip/pause/cancel before cutoff)

4.	Cold-chain and packaging standard

7.	Comparison Layer (Open Market vs MeatNG) — Table (required; appears on landing page)


Attribute	Open Market / Roadside	Supermarket	MeatNG Subscription
Hygiene consistency	Varies widely	Moderate	Standardized processing at MeatNG facility
Cleaning & portioning	Manual / inconsistent	Limited	Cleaned + portioned + packaged
Time spent sourcing	High	Medium	Low (recurring delivery)
Price clarity	Bargaining	Fixed but varies	Fixed plan price + optional add-ons
Reliability	Unpredictable	Medium	Scheduled deliveries + cutoff rules
Control	None	Limited	Edit/skip/pause/cancel before cutoff
8.	Footer:

1.	Terms

2.	Privacy

3.	Support

4.	FAQs

5.	Social links

9.	Action: user clicks Get Started → goes to Screen 2 (Plan Selection)


9.2 Screen 2: Plan Selection (Choose Your Plan)
1.	Trigger: user clicks Get Started or Plans navigation

2.	Title: Choose Your Plan

3.	Plan cards (3 cards):

1.	Essentials Plan

2.	Signature Plan

3.	Premium Plan

4.	Each card must show:

1.	Short description (who it’s for)

2.	What you can choose from (high level)

3.	Membership note: “Subscription includes membership and dashboard control.”

4.	CTA: Select Plan

5.	Supporting module: Compare Plans (opens a plan-to-plan comparison table)


9.3 Screen 3: Select Size (Medium / Large / Extra Large)
1.	Trigger: user selects a plan

2.	Size cards:

1.	Medium

2.	Large

3.	Extra Large

3.	Each card shows:

1.	Household fit guidance

2.	Estimated weight range (admin-defined)

3.	Fixed recurring plan price (based on plan + size)

4.	CTA: Continue → Screen 4


9.4 Screen 4: Select Delivery Frequency
1.	Frequencies:

1.	Daily

2.	Weekly

3.	Bi-weekly

4.	Monthly

2.	For each frequency, display:

1.	“You are billed on your schedule.”

2.	Next billing date preview (calculated)

3.	Estimated delivery window preview (based on State + LGA rules)

4.	Edit cutoff explanation preview (example: “Edit closes 11:59pm the day before billing”)

3.	CTA: Build Your Box → Screen 5


9.5 Screen 5: Build Your Box (Plan Builder)
1.	Layout:

1.	Left: category tabs

2.	Middle: product grid (eligible items only)

3.	Right: box summary panel

2.	Box summary panel shows:

1.	Plan + size

2.	Frequency

3.	Fixed recurring plan price

4.	Fill progress (allocation rule progress bar)

5.	Next billing date

6.	Edit cutoff date/time

3.	Product grid rules:

1.	Essentials plan only shows Essentials items

2.	Signature shows Essentials + Signature items

3.	Premium shows everything Signature shows + Premium-only drops (when available)

4.	Each product card shows:

1.	Product name

2.	Product image

3.	Pack size indicator

4.	Badge if Premium-only drop

5.	Add button

5.	Clicking any product opens Screen 6 (Product Detail)

6.	Primary CTA: Review Cart → Screen 7


9.6 Screen 6: Product Detail Page (Required)
1.	Trigger: user clicks any product from builder or store

2.	Page includes:

1.	Product name

2.	Image gallery

3.	Full description (what it is + cleaning/trim standards)

4.	Pack size

5.	Best for (Nigerian cooking context)

6.	Storage guidance

7.	Handling notes (if needed)

8.	Eligibility note (e.g., “Included in Signature and Premium plans”)

9.	Add/Remove controls

3.	CTA: Back to Build Your Box


9.7 Screen 7: Cart + Upsell (“You may also like”)
1.	Trigger: user clicks Review Cart / cart icon

2.	Cart shows:

1.	Selected plan (type + size)

2.	Delivery frequency

3.	Box contents summary (not priced line-by-line)

4.	Fixed recurring plan price (visible)

3.	“You may also like” module (required)

1.	This module shows paid add-ons with price visible

2.	Add-ons are meat-related extras (examples that fit MeatNG):

1.	Extra Chicken Wings Pack

2.	Extra Sausage Pack (Beef or Chicken)

3.	Bones Pack (Soft or Hard)

4.	Offal Mix Add-on (Liver/Heart/Kidney mix, if available)

5.	Fat Trimmings Pack

3.	Add-ons must clearly display:

1.	Price

2.	Pack size

3.	“This is optional” label

4.	Order summary shows:

1.	Plan price (recurring)

2.	Add-ons total (one-time for next delivery/cycle)

3.	Total due today/this cycle (depending on your billing rule)

5.	CTA: Continue to Checkout → Screen 8


9.8 Screen 8: Checkout 
Checkout is split into clearly labeled sections, with required vs optional explicitly marked.
9.8.1 Section A: Account (Required)
1.	If user is signed out:

1.	Email (required)

2.	Password (required)

3.	Confirm password (required)

4.	“Already have an account? Sign in” link

2.	If user is signed in:

1.	Email is displayed (read-only)

2.	Continue to Delivery Info

9.8.2 Section B: Delivery Information
Required fields:
1.	First name

2.	Last name

3.	Phone number

4.	Address line 1

5.	State

6.	LGA

Optional fields:
7. Address line 2 (optional)
8. Landmark (optional)
Serviceability validation (required logic):
1.	System validates State + LGA is serviceable

2.	If not serviceable, user cannot pay and sees “We do not deliver to this location yet.”

9.8.3 Section C: Delivery Note (Expandable)
1.	Label: Delivery Note (Optional)

2.	Behavior:

1.	Tapping expands a text area

2.	Max 300 characters

3.	Purpose: allow gate code, call instructions, preferred drop-off notes

9.8.4 Section D: Delivery Schedule Summary (Read-only)
Displays:
1.	Frequency

2.	Next billing date

3.	Estimated delivery window

4.	Edit cutoff date/time


9.8.5 Section E:

Section E: Payment Method Selection
User chooses:
( ) Pay with Card
( ) Pay with Bank Transfer
Default: Card.

Option 1Card (Instant Activation)
●	Visa

●	Mastercard

●	Verve

Fields:
1.	Card Number

2.	Expiry Date

3.	CVV

4.	Cardholder Name

Processing:
●	Payment processed inline (user does not leave site)

●	Backend verifies transaction

●	On success → Subscription activated immediately


Option 2 — Bank Transfer (Static Account)
Transfer Details
Bank Name: [Your Company Bank Name]
Account Name: MeatNG Foods Ltd
Account Number: 0123456789
Amount to Transfer: ₦XX,XXX
Reference to Use: MN-[UniqueCode]
This reference is critical.

How This Works Properly
When user selects Bank Transfer:
1.	System generates a unique reference code (example: MN-483920)

2.	User sees instruction:

“Use MN-483920 as your transfer narration.”
3.	User transfers exact amount to static company account

4.	System listens to:

○	Bank webhook (if API integrated)

○	Or payment processor settlement feed

5.	Backend matches:

○	Amount

○	Narration/reference

○	Timestamp window

6.	If match found → Activate subscription


UX State Flow
After user clicks “I Have Made Transfer”:
System shows:
Status: Awaiting Payment Confirmation
Options:
●	Refresh status

●	Switch to card payment

Subscription state:
Pending Payment

Important Rules
1.	Amount must match exactly

2.	Reference must match exactly

3.	Payment must be within allowed time window (e.g., 30 minutes)

4.	If not matched → remains pending

No manual upload.
No screenshot.
No email proof.

What Happens If:
Reference Missing?
Payment goes into manual review queue (admin reconciliation required).
Amount Incorrect?
System flags mismatch.
10. Member Dashboard (Retention Center)
10.1 Dashboard Home
1.	Upcoming delivery card (date + timeline)

2.	Next billing date

3.	Cutoff date/time

4.	Current plan summary (plan/size/frequency)

5.	Quick actions:

1.	Edit Box

2.	Skip Next Delivery

3.	Pause Subscription

4.	Cancel Subscription

5.	Change Frequency

6.	Update Address

7.	Update Payment

6.	History modules:

1.	Billing History (Nomba references)

2.	Order History (delivery statuses)

7.	Community:

1.	Join WhatsApp Community button (always visible in dashboard)

10.2 Subscription Control Screens (Inside Dashboard)
1.	Edit Upcoming Box

1.	Same builder rules

2.	Locked after cutoff

2.	Skip Next Delivery

1.	Confirmation modal

2.	Clearly shows how next billing date shifts

3.	Pause Subscription

1.	Choose pause duration (2 weeks, 1 month, custom) or indefinite

4.	Cancel Subscription

1.	Reason capture

2.	Warning: must cancel before cutoff to avoid next charge

5.	Change Frequency

1.	Recalculate billing date, cutoff, delivery window

6.	Update Address + Delivery Note

1.	Only allowed before cutoff for the upcoming delivery

7.	Update Payment

1.	Replace card via Nomba flow

2.	Confirmation required


11. Navigation Pages (What happens when user clicks each top menu)
11.1 How It Works Page
1.	Hero section + CTA Get Started

2.	Step-by-step explanation:

1.	Choose plan (Essentials/Signature/Premium)

2.	Choose size

3.	Choose delivery frequency

4.	Build your box

5.	Add optional add-ons

6.	Pay via Nomba

7.	Manage in dashboard (edit/skip/pause/cancel before cutoff)

3.	Cutoff explanation block (must be explicit)

4.	Comparison table (Open market vs MeatNG)

5.	FAQ teaser + link to FAQs

6.	CTA Get Started

11.2 Sourcing Page
1.	“We own the process from start to finish” hero

2.	Facility ownership explanation (abattoir operations)

3.	Hygiene standards and sanitation protocols

4.	Portioning and packaging standards

5.	Cold-chain handling process

6.	Quality inspection checkpoints

7.	Supply sourcing (approved suppliers + trusted farms)

8.	CTA Get Started

11.3 Gifts (Dropdown Navigation)  Detailed
Dropdown items:
1.	Gift Boxes

2.	Gift Cards

3.	Corporate Gifting

11.3.1 Gift Boxes Store
1.	Grid listing shows:

1.	Gift box name

2.	Short description

3.	One-time price

4.	Estimated weight range

5.	View Details CTA

2.	Filters (optional but recommended):

1.	Occasion (Birthday, New Home, Family Support)

2.	Budget range

3.	Clicking a gift product opens Gift Detail

11.3.2 Gift Box Detail Page
1.	Shows:

1.	Gift box name

2.	Images

3.	Full contents list

4.	Estimated weight range

5.	Packaging description

6.	One-time price

2.	CTA: Add to Cart

11.3.3 Gift Cart
1.	Shows:

1.	Gift box summary

2.	One-time price

3.	Delivery fee (if applicable, based on location)

2.	CTA: Checkout

11.3.4 Gift Checkout 
Required fields:
1.	Recipient name

2.	Recipient phone

3.	Delivery address (State + LGA validation)

Optional fields:
4. Gift message
5. Delivery note
6. Preferred delivery date (only if ops supports scheduled gift dates)
Payment:
1.	Payment card checkout only

2.	Confirmation modal after payment success

Gift confirmation:
1.	Gift order summary

2.	Delivery window

3.	Recipient details

4.	CTA: “Start a Subscription” (upsell back to plans)

11.3.5 Gift Cards (If implemented)
1.	Choose amount

2.	Recipient email/phone

3.	Optional message

4.	Pay with Nomba

5.	System issues code and sends to recipient

11.3.6 Corporate Gifting
1.	Form fields:

1.	Company name

2.	Contact person

3.	Email

4.	Phone

5.	Estimated quantity

6.	Delivery locations (text area)

7.	Notes

2.	CTA: Submit inquiry

3.	Admin receives inquiry in Gifts module queue

11.4 Farm Locator
1.	Search by State / City / LGA

2.	Displays:

1.	Pickup hubs or service coverage points

2.	Service type (pickup point / delivery hub / coverage area)

3.	Hours

4.	Contact

3.	CTA: Get Started (if within coverage)

11.5 FAQs
1.	Search bar

2.	Categories:

1.	Plans

2.	Membership

3.	Billing

4.	Delivery

5.	Packaging

6.	Account

7.	Gifts

8.	Troubleshooting

3.	Accordion expansion per question

4.	Contact Support link

11.6 Sign In
1.	Email

2.	Password

3.	Show/hide password

4.	Forgot password (email reset link)

5.	Password rules:

1.	Minimum 8 characters

2.	At least one letter and one number

3.	Special character optional but recommended


12. Delivery Rules (Operational Requirements)
1.	Location structure: State + LGA

2.	Each LGA must store:

1.	Delivery days allowed

2.	Delivery windows

3.	Cutoff times

4.	Daily capacity

3.	Cutoff enforcement:

1.	Every subscription cycle has an edit cutoff time

2.	After cutoff, the box is locked and cannot be changed

4.	Delivery states:

1.	Scheduled

2.	Packed

3.	Dispatched

4.	Out for delivery

5.	Delivered

6.	Exception (failed attempt, reschedule required)


13. Admin Portal (Full Detail, Roles, Screens, Permissions)
13.1 Admin Access Rules (Security)
1.	Admin URL: admin.meatng.com

2.	Access is restricted to:

1.	Corporate domain emails (example: @loxfordtrading.com)

2.	Additional allowlisted emails/domains if approved by Super Admin

3.	Login requirements:

1.	Email

2.	Password

3.	Optional 2FA (recommended for Super Admin + Finance Admin)

4.	Session timeout:

1.	15 minutes inactivity

5.	Audit logging:

1.	All admin actions must be recorded with who/what/when/before/after

13.2 Admin Roles
13.2.1 Super Admin (Full Control)
1.	Can access every module

2.	Can create/edit admin users and roles

3.	Can change pricing, plan rules, and delivery rule configuration

4.	Can override operations in emergencies (with mandatory reason logging)

13.2.2 Operations & Fulfillment Admin
1.	Manages:

1.	Orders

2.	Packing status

3.	Dispatch manifests

4.	Delivery status updates

5.	Exceptions and reschedules

2.	Cannot:

1.	Change plan prices

2.	Change payment settings

3.	Create/delete admin roles

13.2.3 Catalog & Inventory Admin
1.	Manages:

1.	Product creation/editing (name, category, images, descriptions, eligibility flags)

2.	Stock levels and availability

3.	Substitution mapping

4.	Add-on pricing

2.	Cannot:

1.	Issue refunds

2.	Change delivery zones

13.2.4 Finance Admin
1.	Manages:

1.	Payment transaction monitoring (Nomba)

2.	Failed payment queue

3.	Reconciliation exports

4.	Refund approvals (if refunds are supported operationally)

2.	Cannot:

1.	Edit product catalog details

2.	Edit delivery zones

13.2.5 Customer Support Admin
1.	Manages:

1.	Customer profiles

2.	Subscription assistance (pause/cancel/reactivate, within policy)

3.	Tickets and complaints

4.	Delivery issue tagging

2.	Cannot:

1.	Change pricing

2.	Issue refunds (unless given explicit permission)

13.2.6 Marketing/Content Admin (Optional)
1.	Manages:

1.	Landing page content blocks

2.	Testimonials

3.	FAQ content

4.	Gift box merchandising

2.	Cannot:

1.	Change plans, prices, payments

13.3 Admin Modules and Screen Requirements
13.3.1 Admin Dashboard (Overview)
1.	KPI cards:

1.	Active subscriptions

2.	Upcoming deliveries (today, next 7 days)

3.	Orders to pack today

4.	Failed payments

5.	Low stock alerts

6.	Delivery exceptions

2.	Quick actions:

1.	Export packing list

2.	Export dispatch list

3.	View failed payments queue

4.	View today’s delivery schedule

13.3.2 Plans Management
1.	Manage plans:

1.	Essentials

2.	Signature

3.	Premium

2.	Manage sizes:

1.	Medium

2.	Large

3.	Extra Large

3.	Configure fixed recurring prices per plan + size

4.	Configure eligibility rules per plan (which products appear)

5.	Configure benefit flags:

1.	Premium priority fulfillment

2.	Premium-only drops visibility

6.	Configure allowed delivery frequencies per plan (enable/disable Daily if needed)

13.3.3 Product Catalog Management
1.	Create/edit product fields:

1.	Name

2.	Category

3.	Pack size

4.	Description

5.	Best for

6.	Storage guidance

7.	Images

8.	Plan eligibility toggles

9.	Add-on eligibility toggle

2.	Catalog list view shows:

1.	Availability (enabled/disabled)

2.	Stock level

3.	Eligible plans

3.	Add-on price configuration (only used for upsell module and gift store if applicable)

13.3.4 Inventory and Stock Control
1.	Stock entry per product

2.	Daily cap rules per product (optional)

3.	Substitution mapping (what replaces what when out of stock)

4.	Auto-disable at zero stock

5.	Low stock alerts threshold settings

13.3.5 Orders Management
1.	Order list filters:

1.	Delivery date

2.	Status

3.	State/LGA

4.	Plan type

2.	Order detail view:

1.	Customer info

2.	Address + delivery note

3.	Box contents

4.	Add-ons

5.	Payment status (Nomba reference)

6.	Cutoff timestamp

3.	Status updates:

1.	Scheduled → Packed → Dispatched → Out for delivery → Delivered → Exception

4.	Export tools:

1.	Packing list

2.	Dispatch manifest by State/LGA

13.3.6 Subscriptions Management
1.	Search subscription by:

1.	Email

2.	Phone

3.	Subscription ID

2.	Subscription detail view:

1.	Plan/size/frequency

2.	Next billing date

3.	Cutoff date/time

4.	Upcoming box

5.	Payment status

3.	Admin actions (permissioned):

1.	Pause subscription

2.	Cancel subscription

3.	Reactivate subscription

4.	Force skip next cycle

5.	Update billing date within allowed policy

4.	Mandatory audit log reason for any action that changes billing/delivery

13.3.7 Payments and Reconciliation (Nomba)
1.	Transactions list:

1.	Successful

2.	Pending

3.	Failed

2.	Transaction detail view:

1.	Nomba reference

2.	Customer

3.	Amount

4.	Linked order/subscription

5.	Timestamp

3.	Failed payment queue:

1.	Retry rules (configurable)

2.	Notification log

3.	Subscription state transitions (payment failed → paused until resolved)

4.	Reconciliation exports:

1.	CSV export by date range

2.	Summary totals

13.3.8 Delivery Locations (State + LGA) and Scheduling
1.	Manage serviceable states

2.	Manage LGAs under each state

3.	Define delivery windows per LGA

4.	Define cutoff rules per LGA/frequency

5.	Define daily capacity per LGA

6.	Define blackout dates (no delivery days)

13.3.9 Gifts Admin
1.	Gift boxes catalog management

2.	Gift orders list

3.	Corporate gifting inquiry queue

4.	Gift card issuance log (if implemented)

13.3.10 Customer Support Admin
1.	Customer list

2.	Customer profile view:

1.	Subscription status

2.	Order history

3.	Delivery exceptions

4.	Payment issues

3.	Ticketing module:

1.	Ticket list

2.	Status: New → In progress → Awaiting customer → Resolved → Closed

3.	SLA timer

4.	Notes + resolution logging

13.3.11 Reports and Analytics
1.	Subscription growth

2.	Churn and pause rate

3.	Skip rate

4.	Delivery success rate

5.	Most selected products in boxes (demand signal)

6.	Add-on performance

7.	Revenue summary by plan and LGA

8.	Failed payment rate

13.3.12 Roles, Permissions, Audit Logs
1.	Role creation and assignment

2.	Permission toggles per module

3.	Audit log:

1.	Who changed what

2.	Timestamp

3.	Before/after

4.	Reason (required for sensitive actions)


14. Membership Model (How We Lock In Customers)
1.	Subscription equals membership automatically.

2.	Membership benefits:

1.	Full dashboard control

2.	Flexible scheduling

3.	Edit before cutoff

4.	Priority fulfillment (Premium highest)

5.	WhatsApp community access

3.	No separate onboarding:

1.	Subscription activates membership

2.	Dashboard becomes available immediately after payment confirmation


15. Functional Requirements
1.	Fixed plan pricing per plan + size

2.	Eligibility-based product visibility per plan

3.	Product detail pages (full description, storage, use cases)

4.	Allocation rule enforcement inside box builder

5.	Add-on pricing logic (visible in upsell only)

6.	Cart + upsell module (“You may also like”)

7.	Nomba payment integration (card)

8.	Webhook + transaction requery confirmation before activation

9.	Cutoff enforcement (locks edits)

10.	Location validation (State + LGA)

11.	Delivery scheduling and capacity per LGA

12.	Admin portal with role-based access and audit logs

13.	WhatsApp community deep link from dashboard


16. Non-Functional Requirements
1.	99.5% uptime

2.	Page load under 3 seconds on average Nigerian mobile networks

3.	Encrypted data at rest and in transit

4.	Role-based access control

5.	Secure session handling + timeout

6.	Webhook redundancy (idempotency + retry)


17. Risks and Mitigation
1.	Inventory fluctuation → Stock caps + substitution mapping + auto-disable at zero stock

2.	Payment failures → Retry rules + user notifications + payment-failed subscription state

3.	Delivery overload → LGA capacity limits + blackout dates + controlled frequency enabling

4.	Admin misuse → allowlisted emails + role permissions + mandatory audit reasons

1.	stem initiates Nomba checkout and collects:

1.	Card number

2.	Expiry date

3.	CVV

4.	Cardholder name

2.	Payment confirmation rules:

1.	System must confirm payment via webhook and transaction requery

2.	No manual upload allowed

9.8.6 Payment Confirmation Modal (Required)
After confirmed success:
1.	Full screen overlay displays:

1.	Payment Successful

2.	Subscription Activated (Membership Active)

3.	Plan summary (plan/size/frequency)

4.	Next billing date

5.	Estimated delivery window

6.	Cutoff reminder

2.	Buttons:

1.	Go to My Account

2.	Continue Browsing (optional)

________________________________________
9.9 Screen 9: Confirmation Page (Post-Payment)
1.	Shows:

1.	Subscription activated confirmation

2.	Membership activated notice

3.	Order/box summary

4.	Next billing date

5.	Delivery window

6.	Cutoff reminder

7.	Payment reference (Nomba reference)

2.	WhatsApp Community button:

1.	Label: Join WhatsApp Community

2.	Behavior: opens WhatsApp group invite URL in browser/WhatsApp

3.	Primary CTA: Go to My Account

________________________________________
10. Member Dashboard (Retention Center)
10.1 Dashboard Home
1.	Upcoming delivery card (date + timeline)

2.	Next billing date

3.	Cutoff date/time

4.	Current plan summary (plan/size/frequency)

5.	Quick actions:

1.	Edit Box

2.	Skip Next Delivery

3.	Pause Subscription

4.	Cancel Subscription

5.	Change Frequency

6.	Update Address

7.	Update Payment

6.	History modules:

1.	Billing History (Nomba references)

2.	Order History (delivery statuses)

7.	Community:

1.	Join WhatsApp Community button (always visible in dashboard)

10.2 Subscription Control Screens (Inside Dashboard)
1.	Edit Upcoming Box

1.	Same builder rules

2.	Locked after cutoff

2.	Skip Next Delivery

1.	Confirmation modal

2.	Clearly shows how next billing date shifts

3.	Pause Subscription

1.	Choose pause duration (2 weeks, 1 month, custom) or indefinite

4.	Cancel Subscription

1.	Reason capture

2.	Warning: must cancel before cutoff to avoid next charge

5.	Change Frequency

1.	Recalculate billing date, cutoff, delivery window

6.	Update Address + Delivery Note

1.	Only allowed before cutoff for the upcoming delivery

7.	Update Payment

1.	Replace card via Nomba flow

2.	Confirmation required

________________________________________
11. Navigation Pages (What happens when user clicks each top menu)
11.1 How It Works Page
1.	Hero section + CTA Get Started

2.	Step-by-step explanation:

1.	Choose plan (Essentials/Signature/Premium)

2.	Choose size

3.	Choose delivery frequency

4.	Build your box

5.	Add optional add-ons

6.	Pay via Nomba

7.	Manage in dashboard (edit/skip/pause/cancel before cutoff)

3.	Cutoff explanation block (must be explicit)

4.	Comparison table (Open market vs MeatNG)

5.	FAQ teaser + link to FAQs

6.	CTA Get Started

11.2 Sourcing Page
1.	“We own the process from start to finish” hero

2.	Facility ownership explanation (abattoir operations)

3.	Hygiene standards and sanitation protocols

4.	Portioning and packaging standards

5.	Cold-chain handling process

6.	Quality inspection checkpoints

7.	Supply sourcing (approved suppliers + trusted farms)

8.	CTA Get Started

11.3 Gifts (Dropdown Navigation) — Detailed
Dropdown items:
1.	Gift Boxes

2.	Gift Cards

3.	Corporate Gifting

11.3.1 Gift Boxes Store
1.	Grid listing shows:

1.	Gift box name

2.	Short description

3.	One-time price

4.	Estimated weight range

5.	View Details CTA

2.	Filters (optional but recommended):

1.	Occasion (Birthday, New Home, Family Support)

2.	Budget range

3.	Clicking a gift product opens Gift Detail

11.3.2 Gift Box Detail Page
1.	Shows:

1.	Gift box name

2.	Images

3.	Full contents list

4.	Estimated weight range

5.	Packaging description

6.	One-time price

2.	CTA: Add to Cart

11.3.3 Gift Cart
1.	Shows:

1.	Gift box summary

2.	One-time price

3.	Delivery fee (if applicable, based on location)

2.	CTA: Checkout

11.3.4 Gift Checkout (Nomba)
Required fields:
1.	Recipient name

2.	Recipient phone

3.	Delivery address (State + LGA validation)

Optional fields:
4. Gift message
5. Delivery note
6. Preferred delivery date (only if ops supports scheduled gift dates)
Payment:
1.	Nomba card checkout only

2.	Confirmation modal after payment success

Gift confirmation:
1.	Gift order summary

2.	Delivery window

3.	Recipient details

4.	CTA: “Start a Subscription” (upsell back to plans)

11.3.5 Gift Cards (If implemented)
1.	Choose amount

2.	Recipient email/phone

3.	Optional message

4.	Pay with Nomba

5.	System issues code and sends to recipient

11.3.6 Corporate Gifting
1.	Form fields:

1.	Company name

2.	Contact person

3.	Email

4.	Phone

5.	Estimated quantity

6.	Delivery locations (text area)

7.	Notes

2.	CTA: Submit inquiry

3.	Admin receives inquiry in Gifts module queue

11.4 Farm Locator
1.	Search by State / City / LGA

2.	Displays:

1.	Pickup hubs or service coverage points

2.	Service type (pickup point / delivery hub / coverage area)

3.	Hours

4.	Contact

3.	CTA: Get Started (if within coverage)

11.5 FAQs
1.	Search bar

2.	Categories:

1.	Plans

2.	Membership

3.	Billing

4.	Delivery

5.	Packaging

6.	Account

7.	Gifts

8.	Troubleshooting

3.	Accordion expansion per question

4.	Contact Support link

11.6 Sign In
1.	Email

2.	Password

3.	Show/hide password

4.	Forgot password (email reset link)

5.	Password rules:

1.	Minimum 8 characters

2.	At least one letter and one number

3.	Special character optional but recommended

________________________________________
12. Delivery Rules (Operational Requirements)
1.	Location structure: State + LGA

2.	Each LGA must store:

1.	Delivery days allowed

2.	Delivery windows

3.	Cutoff times

4.	Daily capacity

3.	Cutoff enforcement:

1.	Every subscription cycle has an edit cutoff time

2.	After cutoff, the box is locked and cannot be changed

4.	Delivery states:

1.	Scheduled

2.	Packed

3.	Dispatched

4.	Out for delivery

5.	Delivered

6.	Exception (failed attempt, reschedule required)


13. Admin Portal (Full Detail, Roles, Screens, Permissions)
13.1 Admin Access Rules (Security)
1.	Admin URL: admin.meatng.com

2.	Access is restricted to:

1.	Corporate domain emails (example: @loxfordtrading.com)

2.	Additional allowlisted emails/domains if approved by Super Admin

3.	Login requirements:

1.	Email

2.	Password

3.	Optional 2FA (recommended for Super Admin + Finance Admin)

4.	Session timeout:

1.	15 minutes inactivity

5.	Audit logging:

1.	All admin actions must be recorded with who/what/when/before/after

13.2 Admin Roles
13.2.1 Super Admin (Full Control)
1.	Can access every module

2.	Can create/edit admin users and roles

3.	Can change pricing, plan rules, and delivery rule configuration

4.	Can override operations in emergencies (with mandatory reason logging)

13.2.2 Operations & Fulfillment Admin
1.	Manages:

1.	Orders

2.	Packing status

3.	Dispatch manifests

4.	Delivery status updates

5.	Exceptions and reschedules

2.	Cannot:

1.	Change plan prices

2.	Change payment settings

3.	Create/delete admin roles

13.2.3 Catalog & Inventory Admin
1.	Manages:

1.	Product creation/editing (name, category, images, descriptions, eligibility flags)

2.	Stock levels and availability

3.	Substitution mapping

4.	Add-on pricing

2.	Cannot:

1.	Issue refunds

2.	Change delivery zones

13.2.4 Finance Admin
1.	Manages:

1.	Payment transaction monitoring (Nomba)

2.	Failed payment queue

3.	Reconciliation exports

4.	Refund approvals (if refunds are supported operationally)

2.	Cannot:

1.	Edit product catalog details

2.	Edit delivery zones

13.2.5 Customer Support Admin
1.	Manages:

1.	Customer profiles

2.	Subscription assistance (pause/cancel/reactivate, within policy)

3.	Tickets and complaints

4.	Delivery issue tagging

2.	Cannot:

1.	Change pricing

2.	Issue refunds (unless given explicit permission)

13.2.6 Marketing/Content Admin (Optional)
1.	Manages:

1.	Landing page content blocks

2.	Testimonials

3.	FAQ content

4.	Gift box merchandising

2.	Cannot:

1.	Change plans, prices, payments

13.3 Admin Modules and Screen Requirements
13.3.1 Admin Dashboard (Overview)
1.	KPI cards:

1.	Active subscriptions

2.	Upcoming deliveries (today, next 7 days)

3.	Orders to pack today

4.	Failed payments

5.	Low stock alerts

6.	Delivery exceptions

2.	Quick actions:

1.	Export packing list

2.	Export dispatch list

3.	View failed payments queue

4.	View today’s delivery schedule

13.3.2 Plans Management
1.	Manage plans:

1.	Essentials

2.	Signature

3.	Premium

2.	Manage sizes:

1.	Medium

2.	Large

3.	Extra Large

3.	Configure fixed recurring prices per plan + size

4.	Configure eligibility rules per plan (which products appear)

5.	Configure benefit flags:

1.	Premium priority fulfillment

2.	Premium-only drops visibility

6.	Configure allowed delivery frequencies per plan (enable/disable Daily if needed)

13.3.3 Product Catalog Management
1.	Create/edit product fields:

1.	Name

2.	Category

3.	Pack size

4.	Description

5.	Best for

6.	Storage guidance

7.	Images

8.	Plan eligibility toggles

9.	Add-on eligibility toggle

2.	Catalog list view shows:

1.	Availability (enabled/disabled)

2.	Stock level

3.	Eligible plans

3.	Add-on price configuration (only used for upsell module and gift store if applicable)

13.3.4 Inventory and Stock Control
1.	Stock entry per product

2.	Daily cap rules per product (optional)

3.	Substitution mapping (what replaces what when out of stock)

4.	Auto-disable at zero stock

5.	Low stock alerts threshold settings

13.3.5 Orders Management
1.	Order list filters:

1.	Delivery date

2.	Status

3.	State/LGA

4.	Plan type

2.	Order detail view:

1.	Customer info

2.	Address + delivery note

3.	Box contents

4.	Add-ons

5.	Payment status (Nomba reference)

6.	Cutoff timestamp

3.	Status updates:

1.	Scheduled → Packed → Dispatched → Out for delivery → Delivered → Exception

4.	Export tools:

1.	Packing list

2.	Dispatch manifest by State/LGA

13.3.6 Subscriptions Management
1.	Search subscription by:

1.	Email

2.	Phone

3.	Subscription ID

2.	Subscription detail view:

1.	Plan/size/frequency

2.	Next billing date

3.	Cutoff date/time

4.	Upcoming box

5.	Payment status

3.	Admin actions (permissioned):

1.	Pause subscription

2.	Cancel subscription

3.	Reactivate subscription

4.	Force skip next cycle

5.	Update billing date within allowed policy

4.	Mandatory audit log reason for any action that changes billing/delivery

13.3.7 Payments and Reconciliation (Nomba)
1.	Transactions list:

1.	Successful

2.	Pending

3.	Failed

2.	Transaction detail view:

1.	Nomba reference

2.	Customer

3.	Amount

4.	Linked order/subscription

5.	Timestamp

3.	Failed payment queue:

1.	Retry rules (configurable)

2.	Notification log

3.	Subscription state transitions (payment failed → paused until resolved)

4.	Reconciliation exports:

1.	CSV export by date range

2.	Summary totals

13.3.8 Delivery Locations (State + LGA) and Scheduling
1.	Manage serviceable states

2.	Manage LGAs under each state

3.	Define delivery windows per LGA

4.	Define cutoff rules per LGA/frequency

5.	Define daily capacity per LGA

6.	Define blackout dates (no delivery days)

13.3.9 Gifts Admin
1.	Gift boxes catalog management

2.	Gift orders list

3.	Corporate gifting inquiry queue

4.	Gift card issuance log (if implemented)

13.3.10 Customer Support Admin
1.	Customer list

2.	Customer profile view:

1.	Subscription status

2.	Order history

3.	Delivery exceptions

4.	Payment issues

3.	Ticketing module:

1.	Ticket list

2.	Status: New → In progress → Awaiting customer → Resolved → Closed

3.	SLA timer

4.	Notes + resolution logging

13.3.11 Reports and Analytics
1.	Subscription growth

2.	Churn and pause rate

3.	Skip rate

4.	Delivery success rate

5.	Most selected products in boxes (demand signal)

6.	Add-on performance

7.	Revenue summary by plan and LGA

8.	Failed payment rate

13.3.12 Roles, Permissions, Audit Logs
1.	Role creation and assignment

2.	Permission toggles per module

3.	Audit log:

1.	Who changed what

2.	Timestamp

3.	Before/after

4.	Reason (required for sensitive actions)

________________________________________
14. Membership Model (How We Lock In Customers)
1.	Subscription equals membership automatically.

2.	Membership benefits:

1.	Full dashboard control

2.	Flexible scheduling

3.	Edit before cutoff

4.	Priority fulfillment (Premium highest)

5.	WhatsApp community access

3.	No separate onboarding:

1.	Subscription activates membership

2.	Dashboard becomes available immediately after payment confirmation

________________________________________
15. Functional Requirements
1.	Fixed plan pricing per plan + size

2.	Eligibility-based product visibility per plan

3.	Product detail pages (full description, storage, use cases)

4.	Allocation rule enforcement inside box builder

5.	Add-on pricing logic (visible in upsell only)

6.	Cart + upsell module (“You may also like”)

7.	Nomba payment integration (card)

8.	Webhook + transaction requery confirmation before activation

9.	Cutoff enforcement (locks edits)

10.	Location validation (State + LGA)

11.	Delivery scheduling and capacity per LGA

12.	Admin portal with role-based access and audit logs

13.	WhatsApp community deep link from dashboard

________________________________________
16. Non-Functional Requirements
1.	99.5% uptime

2.	Page load under 3 seconds on average Nigerian mobile networks

3.	Encrypted data at rest and in transit

4.	Role-based access control

5.	Secure session handling + timeout

6.	Webhook redundancy (idempotency + retry)

________________________________________
17. Risks and Mitigation
1.	Inventory fluctuation → Stock caps + substitution mapping + auto-disable at zero stock

2.	Payment failures → Retry rules + user notifications + payment-failed subscription state

3.	Delivery overload → LGA capacity limits + blackout dates + controlled frequency enabling

4.	Admin misuse → allowlisted emails + role permissions + mandatory audit reasons




