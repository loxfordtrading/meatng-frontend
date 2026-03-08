# MeatNG System Audit: End-to-End Process Flow

## Document Purpose
This document describes the current end-to-end product flow for:
- Customer journey (from sign in/sign up through checkout and account management)
- Admin journey (from admin login through day-to-day operations)

It is intended to be shared with product, engineering, design, QA, and operations teams.

## Snapshot
- App type: React SPA with route-based customer/admin areas
- Main router file: `src/App.tsx`
- Customer auth/session state: `src/contexts/SubscriptionContext.tsx`
- Admin auth/session state: `src/contexts/AdminContext.tsx`
- Feature flags (runtime): `src/lib/features.ts`

## High-Level Architecture
- Public customer routes render with global `Header` and `Footer`.
- Admin routes render without customer header/footer and are wrapped by `AdminLayout`.
- Route guard for admin uses `AdminGuard` and redirects unauthenticated admins to `/admin/login`.
- Most app data is currently demo/mock and persisted in browser localStorage where applicable.

## Customer End-to-End Flow

### 1. Entry and Discovery
Users can enter from home (`/`) or any marketing page, then move to plans.

Primary route sequence:
1. `/plans`
2. `/plans/size`
3. `/plans/frequency` (subscription only)
4. `/build-box`
5. `/cart-review`
6. `/checkout`
7. `/confirmation`
8. `/dashboard`

### 2. Purchase Mode Selection
At Plans page, users can choose:
1. `Subscription`
2. `One-Time Box` (if feature is enabled)

Feature source:
- `src/lib/features.ts`
- Toggle surfaced in admin at `Admin Settings > Features`

Behavior:
- If `One-Time Box` is disabled, option is hidden.
- If disabled while a user is already in one-time mode, state safely falls back to subscription.

### 3. Plan and Size Selection
1. User selects a plan on `/plans`.
2. User selects size on `/plans/size`.
3. If purchase mode is `subscription`, user then selects frequency on `/plans/frequency`.
4. If purchase mode is `one-time`, user skips frequency and goes straight to `/build-box`.

### 4. Box Building
At `/build-box`:
1. User adds/removes eligible products.
2. System enforces max selections per plan+size pricing config.
3. User proceeds to `/cart-review`.

### 5. Cart Review and Add-ons
At `/cart-review`:
1. User reviews selected box contents.
2. User can add/remove optional add-ons.
3. User sees pricing summary:
   - Subscription mode: recurring box + current-cycle add-ons
   - One-time mode: one-time box + one-time add-ons
4. If box is complete, user continues to `/checkout`.

### 6. Authentication in Purchase Flow
Auth can occur in two ways:
1. User already signed in before checkout.
2. User completes account step inside checkout card (`Create Account` or `Sign In` simulation flow).

Important implementation detail:
- Dedicated signup page (`/auth/signup`) currently expects subscription-style readiness (`plan + size + frequency + boxItems`).
- One-time users typically authenticate inside checkout account block.

### 7. Checkout and Payment
At `/checkout`:
1. User completes account details (if not signed in).
2. User enters delivery information.
3. User selects payment method (`card` or `bank transfer`).
4. Order success modal appears (demo confirmation flow).
5. User can continue to `/confirmation` or `/dashboard`.

Schedule behavior:
- Subscription: shows billing date, cutoff, and delivery window.
- One-time: shows delivery summary and no recurring billing.

### 8. Confirmation
At `/confirmation`:
1. User sees success state (subscription activated vs one-time confirmed).
2. Summary shows plan/size, payment reference, and delivery info.
3. User can go to dashboard or continue browsing.

### 9. Customer Dashboard
At `/dashboard`:
1. Sidebar navigation between overview, subscription, orders, addresses, settings.
2. Referrals are currently disabled in navigation and main routing.
3. Sidebar includes desktop collapse/expand behavior.

## Admin End-to-End Flow

### 1. Admin Authentication
1. Admin opens `/admin/login`.
2. Credentials validated against demo users in `AdminContext`.
3. On success, redirect to `/admin`.
4. Session persists in localStorage key `meatng-admin`.

### 2. Route Guard and Layout
1. All admin routes are wrapped in `AdminGuard`.
2. If unauthenticated, user is redirected to `/admin/login`.
3. Authenticated pages render inside `AdminLayout`.
4. Sidebar supports desktop collapse/expand and mobile drawer.

### 3. Admin Functional Areas

#### Dashboard (`/admin`)
- KPI cards (revenue, subscriptions, orders, new customers)
- Revenue trend chart
- Plan distribution chart
- Recent orders preview
- Top products preview

#### Orders (`/admin/orders`)
- Search and status filtering
- Status transition actions (Processing, In Transit, Delivered, Cancelled)
- Order detail modal

#### Customers (`/admin/customers`)
- Search by name/email
- Metrics summary cards
- Customer detail modal

#### Products (`/admin/products`)
- Search and view-mode switch
- In-stock toggle
- Edit modal (demo interactions)

#### Subscriptions (`/admin/subscriptions`)
- Search and status filter
- Status actions: pause, resume, cancel
- KPI summary cards

#### Deliveries (`/admin/deliveries`)
- Zone list and availability toggle
- Delivery-related summary cards

#### Analytics (`/admin/analytics`)
- Date-range filters
- Revenue/order charts
- Plan distribution and retention views

#### Settings (`/admin/settings`)
- Business info tab
- Delivery settings tab
- Notification preferences tab
- Features tab:
  - `One-Time Box Purchase` runtime toggle
- Admin users tab

## State, Persistence, and Keys
- Customer subscription/order builder state:
  - localStorage key: `meatng-subscription`
  - source: `src/contexts/SubscriptionContext.tsx`
- Cart state:
  - localStorage key: `meatng-cart`
  - source: `src/contexts/CartContext.tsx`
- Admin auth state:
  - localStorage key: `meatng-admin`
  - source: `src/contexts/AdminContext.tsx`
- Feature flags:
  - localStorage key: `meatng-feature-flags`
  - source: `src/lib/features.ts`

## Current Audit Notes (Important)

### 1. One-Time flow and `/auth/signup`
- Current `/auth/signup` guard expects `frequency` to be present.
- This naturally fits subscription flow but not one-time flow.
- Impact: one-time users should use checkout account section (works), but direct `/auth/signup` may redirect unexpectedly.

### 2. Demo/Data realism
- Admin and some operational flows are currently mock-driven.
- Payment confirmation and auth logic are simulated.
- Team should align this document with backend/API integration plan before production rollout.

### 3. Feature flags are client-side
- Non-dev toggle is available and useful for operations.
- Current flag scope is browser-local, not centralized across all admins/devices.
- For true operations control, move flags to backend or admin API.

## Recommended Next Steps
1. Decide canonical auth path for one-time users (`/auth/signup` support vs checkout-only auth).
2. Add centralized server-side feature flags for consistent admin control.
3. Add QA checklist per route with expected redirects and edge-case behavior.
4. Add analytics events at each funnel step (plan select, size select, checkout start, payment success).

## Backend API Audit (from Swagger Screenshots)

### Observed Endpoint Groups
From the screenshots of `https://meatng-api.onrender.com/api`, the following groups are available:
1. `Auth`
2. `Users`
3. `Product Categories`
4. `Products`
5. `Boxes`
6. `Orders`
7. `Plans`
8. `Carts`
9. `Subscriptions`
10. `Audit`
11. `Upload`
12. `Addresses`

### Observed Endpoints (Visible in screenshots)

#### Auth
1. `POST /auth/signup`
2. `POST /auth/login`

#### Users
1. `GET /users/all`
2. `GET /users/get-user/{id}`
3. `PATCH /users/update-user/{id}`
4. `DELETE /users/delete-user/{id}`

#### Product Categories
1. `POST /product-categories`
2. `GET /product-categories`
3. `GET /product-categories/root`
4. `GET /product-categories/{id}`
5. `PUT /product-categories/{id}`
6. `DELETE /product-categories/{id}`
7. `GET /product-categories/{id}/subcategories`
8. `GET /product-categories/{id}/path`

#### Products
1. `POST /products`
2. `GET /products`
3. `GET /products/by-category/{categoryId}`
4. `GET /products/{id}`
5. `PUT /products/{id}`
6. `DELETE /products/{id}`
7. `POST /products/{id}/categories/{categoryId}`
8. `DELETE /products/{id}/categories/{categoryId}`
9. `PUT /products/{id}/stock`

#### Boxes
1. `POST /boxes`
2. `GET /boxes`
3. `GET /boxes/active`
4. `GET /boxes/{id}`
5. `PUT /boxes/{id}`
6. `DELETE /boxes/{id}`

#### Orders
1. `POST /orders`
2. `GET /orders`
3. `GET /orders/{id}`
4. `PATCH /orders/{id}`
5. `DELETE /orders/{id}`

#### Plans
1. `POST /plans`
2. `GET /plans`
3. `GET /plans/active`
4. `GET /plans/by-box/{boxId}`
5. `GET /plans/{id}`
6. `PUT /plans/{id}`
7. `DELETE /plans/{id}`

#### Carts
1. `GET /carts/my-cart`
2. `POST /carts/items`
3. `PATCH /carts/items/{productId}`
4. `DELETE /carts/items/{productId}`
5. `DELETE /carts`
6. `GET /carts/validate`

#### Subscriptions
1. `POST /subscriptions`
2. `GET /subscriptions`
3. `GET /subscriptions/active`

#### Audit
1. `GET /audit`
2. `GET /audit/resource-timeline`

#### Upload
1. `POST /upload`
2. `POST /upload/confirm`
3. `GET /upload/{tempId}`
4. `DELETE /upload/{tempId}`

#### Addresses
1. `POST /addresses`
2. `GET /addresses`

### Fit Against Current Frontend

#### Good Alignment (high confidence)
1. Auth flow can move from simulated login to real `POST /auth/signup` and `POST /auth/login`.
2. Products/categories pages can move to `GET /products`, `GET /products/by-category/{categoryId}`, and category endpoints.
3. Builder/cart flow can map to `GET /carts/my-cart`, `POST/PATCH/DELETE /carts/items...`, `GET /carts/validate`.
4. Checkout order creation can map to `POST /orders`.
5. Dashboard addresses can map to `POST /addresses` and `GET /addresses`.
6. Admin product/category CRUD aligns with existing admin UI screens.
7. Admin order management aligns with `GET/PATCH /orders`.

#### Partial Alignment (needs schema confirmation)
1. Subscriptions frontend expects pause/resume/cancel style actions; screenshot only confirms `POST /subscriptions` and list endpoints.
2. Plans in frontend currently include size/frequency pricing logic from local data; backend `plans`/`boxes` model relationship needs response schema check.
3. One-time purchase feature needs explicit backend treatment:
   - Either via order payload field (e.g., `orderType: one_time`)
   - Or via not creating a subscription after order.

#### Likely Gaps to Confirm
1. Token auth format and refresh strategy are not visible in screenshots.
2. Role-based access (admin vs customer) not visible from screenshots.
3. Pagination/filters/sort query conventions not visible.
4. Order status enum values and transition rules not visible.
5. Upload entity-link contract (what resources can receive upload) not visible.

### Recommended Integration Order
1. Auth + session
2. Products + categories (customer browsing + admin catalog)
3. Cart endpoints in builder/review flow
4. Checkout with `POST /orders`
5. Addresses + customer profile data
6. Subscriptions lifecycle (create/list/controls)
7. Admin dashboards migrated from mock data to live API
8. Upload integration for product media
9. Audit endpoints for admin reporting

### Pre-Integration Clarifications Needed from Backend
1. Auth response shape (access token, refresh token, user payload)
2. Required headers for protected routes
3. Role model and authorization matrix
4. Canonical entities for plan/box/subscription/order relation
5. Exact request body for `POST /orders` and whether it supports one-time order
6. Subscriptions status mutation endpoints (pause/resume/cancel) if available
7. Error format standard (message, code, field errors)
