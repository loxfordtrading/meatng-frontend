
# MeatNG MVP - Subscription-First Platform

## Overview
MeatNG is a Nigeria-first premium meat **subscription platform** where customers select a plan, choose a size, pick a delivery frequency, and build their box from eligible products. Subscription equals membership—no separate signup required.

---

## Core Principles (Non-Negotiables)

1. **Subscription is the primary conversion** - not one-time e-commerce
2. **Subscription equals membership** - dashboard access comes with subscription
3. **Fixed pricing per plan + size** - box contents don't change base price
4. **Plan-based product eligibility** - products are gated by plan tier
5. **Add-ons are optional extras** - priced separately, don't affect base price
6. **Location-based delivery** - State + LGA with capacity and cutoff rules
7. **Currency**: Nigerian Naira (₦), Phone: +234 format

---

## Phase 1: Foundation & Landing

### 1. Landing Page (www.meatng.com)
**Header Navigation**:
- How It Works | Plans | Gifts (dropdown) | Sourcing | Farm Locator | FAQs | Sign In | **Get Started** (primary CTA)

**Hero Section**:
- Headline: "Premium Nigerian meat, cleaned and delivered on subscription"
- Subtext: Flexible schedules, hygienic processing, dashboard control
- Primary CTA: "Get Started" → Plans page
- Secondary CTA: "How It Works"

**Content Blocks**:
- Social proof strip (ratings, testimonials)
- Benefits blocks (Hygiene, Flexible delivery, Dashboard control, Cold-chain)
- Comparison table: Open Market vs MeatNG
- Footer: Terms, Privacy, Support, FAQs, Social links

---

## Phase 2: Subscription Flow (Core Journey)

### 2. Plan Selection (/plans)
**Plan Cards** (3 options):
- **Essentials Plan**: 6 selections, standard catalog (Chicken, Beef basics)
- **Signature Plan**: Everything in Essentials + Cow Tail, Ram, Goat, Sausages, Soft Bones
- **Premium Plan**: Everything in Signature + Prime Steak Cuts, Priority fulfillment

Each card shows:
- What you can choose from
- Membership note: "Subscription includes membership and dashboard control"
- CTA: "Select Plan"
- Compare Plans link

### 3. Size Selection (/plans/size)
**Size Cards** (3 tiers):
- **Medium**: 1-2 people, X selections, ₦XX,XXX/cycle
- **Large**: 3-4 people, Y selections, ₦XX,XXX/cycle
- **Extra Large**: 5+ people, Z selections, ₦XX,XXX/cycle

Each shows: Household fit, estimated weight, fixed recurring price

### 4. Frequency Selection (/plans/frequency)
**Options**:
- Daily | Weekly | Bi-weekly | Monthly

Display for each:
- "You are billed on your schedule"
- Next billing date preview
- Estimated delivery window
- Edit cutoff explanation

CTA: "Build Your Box"

### 5. Build Your Box (/build-box)
**Layout**:
- Left: Category tabs (filtered by plan eligibility)
- Middle: Product grid (eligible items only)
- Right: Box summary panel

**Box Summary Panel**:
- Plan + Size + Frequency
- Fixed recurring price
- Fill progress bar (allocation rule)
- Next billing date
- Edit cutoff date/time
- Items added

**Product Cards**:
- Name, image, pack size
- Premium-only badge (if applicable)
- Add/Remove controls
- Click → Product Detail Page

### 6. Product Detail Page (/product/:id)
- Product name + image gallery
- Full description + cleaning/trim standards
- Pack size + best for (Nigerian cooking context)
- Storage guidance + handling notes
- Plan eligibility note
- Add/Remove controls
- Back to Build Your Box

---

## Phase 3: Cart & Checkout

### 7. Cart + Upsell (/cart)
**Cart Shows**:
- Plan (type + size)
- Delivery frequency
- Box contents summary (not priced line-by-line)
- Fixed recurring plan price

**"You may also like" Module** (Add-ons):
- Extra packs with individual prices
- "This is optional" label
- Add-ons priced separately

**Order Summary**:
- Plan price (recurring)
- Add-ons total (one-time for cycle)
- Total due today

CTA: "Continue to Checkout"

### 8. Checkout (/checkout)
**Section A - Account** (Required):
- Email, Password, Confirm password (if new)
- "Already have an account? Sign in"

**Section B - Delivery Information** (Required):
- First name, Last name, Phone (+234)
- Address line 1, Address line 2 (optional)
- State (dropdown), LGA (dropdown)
- Landmark (optional)
- Serviceability validation

**Section C - Delivery Note** (Optional):
- Expandable text area, max 300 chars

**Section D - Delivery Schedule Summary** (Read-only):
- Frequency, Next billing, Delivery window, Cutoff

**Section E - Payment**:
- Card (Visa, Mastercard, Verve) - inline processing
- Bank Transfer (static account + reference code)

### 9. Confirmation (/confirmation)
- Subscription activated confirmation
- Membership activated notice
- Order summary + next billing + delivery window
- Cutoff reminder
- WhatsApp Community button
- CTA: "Go to My Account"

---

## Phase 4: Member Dashboard

### 10. Dashboard Home (/dashboard)
- Upcoming delivery card (date + timeline)
- Next billing date + cutoff date/time
- Current plan summary

**Quick Actions**:
- Edit Box | Skip Next Delivery | Pause Subscription
- Cancel Subscription | Change Frequency
- Update Address | Update Payment

**History**:
- Billing History | Order History

**Community**:
- Join WhatsApp Community button

### 11. Subscription Control Screens
- Edit Upcoming Box (locked after cutoff)
- Skip Next Delivery (shows billing shift)
- Pause Subscription (2 weeks, 1 month, indefinite)
- Cancel Subscription (reason capture + cutoff warning)
- Change Frequency (recalculates dates)
- Update Address (before cutoff only)
- Update Payment (replace card)

---

## Phase 5: Static Pages

### 12. How It Works (/how-it-works)
- Hero + Get Started CTA
- Step-by-step: Plan → Size → Frequency → Build → Add-ons → Pay → Dashboard
- Cutoff explanation block
- Comparison table
- FAQ teaser

### 13. Sourcing (/sourcing)
- Facility ownership (abattoir)
- Hygiene + portioning standards
- Cold-chain handling
- Quality checkpoints

### 14. Gifts (Dropdown: /gifts, /gift-cards, /corporate-gifting)
- Gift Boxes store (one-time purchase)
- Gift Cards (amount + recipient)
- Corporate Gifting (inquiry form)

### 15. Farm Locator (/farm-locator)
- Search by State/City/LGA
- Pickup hubs + coverage points

### 16. FAQs (/faqs)
- Categories: Plans, Membership, Billing, Delivery, Packaging, Account, Gifts
- Accordion expansion
- Contact Support link

### 17. Sign In (/auth)
- Email + Password
- Forgot password (email reset)
- Password rules: min 8 chars, 1 letter, 1 number

---

## Data Models

### Plans
```typescript
type PlanTier = 'essentials' | 'signature' | 'premium';
type BoxSize = 'medium' | 'large' | 'extra-large';
type Frequency = 'daily' | 'weekly' | 'bi-weekly' | 'monthly';

interface Plan {
  id: PlanTier;
  name: string;
  description: string;
  selections: number; // per cycle
  eligibleCategories: ProductCategory[];
  benefits: string[];
}

interface PlanPricing {
  planId: PlanTier;
  sizeId: BoxSize;
  price: number; // Fixed recurring price
  householdFit: string;
  estimatedWeight: string;
}
```

### Products
```typescript
interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  packSize: string;
  description: string;
  bestFor: string[]; // Nigerian cooking contexts
  storageGuidance: string;
  handlingNotes?: string;
  images: string[];
  eligiblePlans: PlanTier[]; // Which plans can select this
  addOnPrice?: number; // Price when purchased as add-on
  isPremiumDrop?: boolean;
}
```

### Subscription State
```typescript
interface SubscriptionState {
  plan: PlanTier;
  size: BoxSize;
  frequency: Frequency;
  boxItems: { productId: string; quantity: number }[];
  addOns: { productId: string; quantity: number }[];
  nextBillingDate: Date;
  nextDeliveryWindow: string;
  editCutoff: Date;
}
```

---

## Design System (Retained)

### Colors
- **Primary**: Deep Blue (#2680EB) - trust
- **Secondary**: Dark Navy - depth
- **Accent**: Vibrant Orange - CTAs
- **Background**: Pure White

### Typography
- **Headings**: Playfair Display (serif)
- **Body**: Inter (sans-serif)
- **Prices**: ₦ Nigerian Naira

---

## What's Deferred (Future)
- Real Nomba payment integration
- Admin portal
- Recurring billing webhooks
- Inventory management
- Delivery capacity/cutoff enforcement
- WhatsApp community integration
