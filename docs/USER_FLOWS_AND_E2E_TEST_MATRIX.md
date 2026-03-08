# User Flows and E2E Test Matrix

This document highlights all user-facing flows in the system and maps them to automated end-to-end style frontend tests.

## Customer Flows

1. Discover and browse
- Landing page (`/`)
- Product listing (`/products`)
- Product detail (`/product/:id`)
- Informational pages (`/how-it-works`, `/sourcing`, `/faqs`, `/reviews`, `/about`, `/contact`)

2. Subscription flow
- Choose plan (`/plans`)
- Choose size (`/plans/size`)
- Choose frequency (`/plans/frequency`)
- Build box (`/build-box`)
- Review cart (`/cart-review`)
- Checkout (`/checkout`)
- Confirmation (`/confirmation`)

3. One-time and gifts flow
- One-time cart (`/cart`)
- Gifts page and gift-box add-to-cart (`/gifts`)
- One-time checkout (`/checkout`)
- Confirmation (`/confirmation`)

4. Authentication and account
- Sign in (`/auth/signin`, `/login`)
- Sign up (`/auth/signup`)
- Verify email (`/verify-email`)
- Reset password (`/reset-password`)
- Accept invitation (`/accept-invitation`)
- Dashboard (`/dashboard`)

## Admin Flows

1. Authentication
- Admin login (`/admin/login`)
- Staff redirect from customer sign-in for admin users (`/auth/signin` -> `/admin`)

2. Protected admin routes
- Dashboard (`/admin`)
- Orders (`/admin/orders`)
- Customers (`/admin/customers`)
- Products (`/admin/products`)
- Subscriptions (`/admin/subscriptions`)
- Deliveries (`/admin/deliveries`)
- Analytics (`/admin/analytics`)
- Settings (`/admin/settings`)

## Automated E2E-Style Coverage

Implemented in `src/test/userFlows.e2e.test.tsx`:

1. Admin guard redirects unauthenticated users from all protected admin routes to `/admin/login`.
2. Admin login succeeds with demo credentials and lands on `/admin`.
3. Customer sign-in redirects staff accounts to `/admin`.
4. Checkout requires authentication for one-time orders and redirects to `/auth/signin` when missing.
5. Checkout (gift-box one-time) expands gift contents into backend cart line items and redirects to gateway URL.
6. Confirmation page handles missing payment reference with a clear recovery state.
7. Confirmation page verifies successful payment references and shows confirmed state.

## Remaining Gaps (Manual / Full Browser E2E)

These are not fully covered by jsdom integration tests and should be validated in full browser E2E (Playwright/Cypress):

1. External payment provider round-trip callback behavior in real browser.
2. Visual interactions and responsive behavior across breakpoints.
3. Full subscription customization path including all UI controls across multiple pages.
4. File/image upload and CDN-backed media flows when enabled.
