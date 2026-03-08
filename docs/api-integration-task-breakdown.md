# MeatNG API Integration Task Breakdown

## Purpose
Execution-ready integration plan for replacing mock/local data with backend APIs.

Use this with:
- `docs/system-audit-process-flow.md`

## Assumptions
1. Base API is available at `https://meatng-api.onrender.com`.
2. Swagger groups/endpoints observed in shared screenshots are accurate.
3. Frontend stack remains React + context state + route-based pages.

## Delivery Strategy
1. Integrate in vertical slices (customer and admin flows stay usable after each phase).
2. Keep UI stable; replace only data layer first.
3. Add feature flags/fallbacks where behavior is uncertain (especially one-time order/subscription boundaries).

## Phase 0: Foundation

### Tasks
1. Create API client layer:
   - `src/lib/api/client.ts`
   - `src/lib/api/types.ts`
   - `src/lib/api/errors.ts`
2. Add auth token storage helper:
   - `src/lib/auth/tokenStorage.ts`
3. Add environment config:
   - `.env` / `.env.example`
   - `VITE_API_BASE_URL`
4. Add request wrapper with:
   - base URL
   - auth header injection
   - standardized error parsing

### Acceptance Criteria
1. One shared HTTP client is used by all new API services.
2. Non-2xx responses show user-safe error messages.
3. API base URL is environment-driven.

## Phase 1: Authentication and Session

### Backend Endpoints
1. `POST /auth/signup`
2. `POST /auth/login`
3. `GET /users/get-user/{id}` (if required for profile refresh)

### Frontend Targets
1. `src/contexts/SubscriptionContext.tsx`
2. `src/contexts/AdminContext.tsx`
3. `src/pages/Auth.tsx`
4. `src/pages/AuthSignup.tsx`
5. `src/pages/admin/AdminLogin.tsx`

### Tasks
1. Replace simulated login/signup with real auth calls.
2. Persist tokens and user payload.
3. Add bootstrap profile fetch on app start if token exists.
4. Remove hardcoded demo credentials dependency for production mode.

### Acceptance Criteria
1. Customer sign in/up works against backend.
2. Admin login works against backend role checks.
3. Route guards continue to function after refresh.

## Phase 2: Product Catalog and Categories

### Backend Endpoints
1. `GET /products`
2. `GET /products/{id}`
3. `GET /products/by-category/{categoryId}`
4. `GET /product-categories`
5. `GET /product-categories/root`

### Frontend Targets
1. `src/pages/Products.tsx`
2. `src/pages/ProductDetail.tsx`
3. `src/pages/BuildBox.tsx`
4. `src/data/products.ts` (deprecate static reads progressively)

### Tasks
1. Create product/category service modules:
   - `src/lib/api/products.ts`
   - `src/lib/api/categories.ts`
2. Swap static data fetches to API fetches.
3. Keep current filtering/sorting UX with API-compatible query params.

### Acceptance Criteria
1. Product list/detail pages render from API.
2. Build Box product eligibility/categories render from API.
3. Empty/error/loading states are handled cleanly.

## Phase 3: Cart Integration

### Backend Endpoints
1. `GET /carts/my-cart`
2. `POST /carts/items`
3. `PATCH /carts/items/{productId}`
4. `DELETE /carts/items/{productId}`
5. `DELETE /carts`
6. `GET /carts/validate`

### Frontend Targets
1. `src/contexts/SubscriptionContext.tsx`
2. `src/contexts/CartContext.tsx`
3. `src/pages/BuildBox.tsx`
4. `src/pages/CartReview.tsx`
5. `src/components/cart/CartDrawer.tsx`

### Tasks
1. Define cart API mapping for:
   - box items
   - add-ons
   - validation before checkout
2. Refactor local state actions to sync with API.
3. Add optimistic updates where safe, rollback on failure.

### Acceptance Criteria
1. Cart state persists server-side and survives reload/device change.
2. Quantity updates and deletes stay consistent across pages.
3. Checkout block/enable uses `GET /carts/validate`.

## Phase 4: Orders and Checkout

### Backend Endpoints
1. `POST /orders`
2. `GET /orders`
3. `GET /orders/{id}`
4. `PATCH /orders/{id}` (status/update fields)

### Frontend Targets
1. `src/pages/Checkout.tsx`
2. `src/pages/Confirmation.tsx`
3. `src/pages/Dashboard.tsx` (order history area)

### Tasks
1. Replace simulated payment success flow with order create flow.
2. Pass backend order reference to confirmation page.
3. Render dashboard order history from `GET /orders` (customer scope).
4. Confirm one-time vs subscription order payload requirements.

### Acceptance Criteria
1. Successful checkout creates real order.
2. Confirmation shows backend-issued order/reference data.
3. Customer dashboard order history matches backend.

## Phase 5: Subscriptions

### Backend Endpoints
1. `POST /subscriptions`
2. `GET /subscriptions`
3. `GET /subscriptions/active`
4. Any additional status mutation endpoints (to be confirmed)

### Frontend Targets
1. `src/pages/CartReview.tsx`
2. `src/pages/Checkout.tsx`
3. `src/pages/Dashboard.tsx`
4. `src/pages/admin/AdminSubscriptions.tsx`

### Tasks
1. Define subscription creation trigger:
   - after order creation
   - direct create endpoint
2. Wire customer dashboard subscription state from API.
3. Replace admin subscription mock data with API.
4. Implement pause/resume/cancel if API supports it.

### Acceptance Criteria
1. Subscription lifecycle is backend-driven.
2. Customer and admin subscription views are consistent.
3. One-time purchase path does not accidentally create recurring subscription.

## Phase 6: Addresses and Profile

### Backend Endpoints
1. `POST /addresses`
2. `GET /addresses`
3. Any update/delete endpoints (if available; confirm)

### Frontend Targets
1. `src/pages/Checkout.tsx`
2. `src/pages/Dashboard.tsx` (addresses/settings sections)

### Tasks
1. Save delivery address via API during checkout.
2. Load and render saved addresses in dashboard.
3. Support default address behavior (if API supports it).

### Acceptance Criteria
1. Address data is backend-backed and reusable in repeat checkouts.
2. Dashboard address management reflects server state.

## Phase 7: Admin Modules (Live Data Cutover)

### Backend Endpoints
1. Users CRUD
2. Products/categories CRUD
3. Orders list/detail/update
4. Plans/boxes CRUD
5. Subscriptions list/active
6. Audit endpoints

### Frontend Targets
1. `src/pages/admin/AdminDashboard.tsx`
2. `src/pages/admin/AdminOrders.tsx`
3. `src/pages/admin/AdminCustomers.tsx`
4. `src/pages/admin/AdminProducts.tsx`
5. `src/pages/admin/AdminSubscriptions.tsx`
6. `src/pages/admin/AdminDeliveries.tsx`
7. `src/pages/admin/AdminAnalytics.tsx`

### Tasks
1. Replace `mock*` data sources with API-backed queries.
2. Keep current UI interactions (filters, status toggles, modals).
3. Introduce role-aware access guards by endpoint capability.

### Acceptance Criteria
1. Admin panels show live backend data.
2. Admin actions mutate backend state successfully.
3. Error and empty states are explicit and recoverable.

## Phase 8: Upload and Media

### Backend Endpoints
1. `POST /upload`
2. `POST /upload/confirm`
3. `GET /upload/{tempId}`
4. `DELETE /upload/{tempId}`

### Frontend Targets
1. `src/pages/admin/AdminProducts.tsx`
2. Any product image forms/components

### Tasks
1. Implement upload flow:
   - temp upload
   - confirm/link to product/category entity
2. Add cleanup behavior for abandoned uploads.

### Acceptance Criteria
1. Product image upload works end-to-end.
2. Upload progress and failure states are visible to admin users.

## Cross-Cutting Engineering Tasks
1. Add API service folder structure:
   - `src/lib/api/auth.ts`
   - `src/lib/api/users.ts`
   - `src/lib/api/products.ts`
   - `src/lib/api/categories.ts`
   - `src/lib/api/carts.ts`
   - `src/lib/api/orders.ts`
   - `src/lib/api/subscriptions.ts`
   - `src/lib/api/addresses.ts`
   - `src/lib/api/admin.ts`
2. Add request/response schema typing and shared DTO mapping.
3. Add retry policy for transient failures.
4. Add centralized toast/error strategy.
5. Add request logging in dev mode.

## QA Checklist (Per Phase)
1. Happy path (primary conversion flow)
2. Validation errors
3. Unauthorized/expired token behavior
4. Network failure recovery
5. Data consistency across page refresh
6. Mobile vs desktop parity
7. Role-based route/feature access

## Open Questions for Backend
1. Auth token model: access token only vs access+refresh
2. Role claims format and admin authorization boundaries
3. Pagination contract standard for list endpoints
4. Canonical order payload for:
   - subscription checkout
   - one-time checkout
5. Subscription state transition endpoints and valid enums
6. Address update/delete endpoint availability
7. Whether plan/box pricing is resolved server-side or client-provided
8. Exact error response schema for field-level form errors

## Suggested Sprint Grouping
1. Sprint 1: Phases 0-1
2. Sprint 2: Phases 2-3
3. Sprint 3: Phases 4-5
4. Sprint 4: Phases 6-7
5. Sprint 5: Phase 8 + hardening + QA closure

## API Wiring Status Checklist

### Legend
- `[x]` wired in frontend
- `[ ]` not wired yet
- `[~]` partially wired (in use but needs contract hardening)

### Auth
- `[x]` `POST /auth/signup`
- `[x]` `POST /auth/login`

Frontend usage:
- `src/pages/Auth.tsx`
- `src/pages/AuthSignup.tsx`
- `src/pages/Checkout.tsx` (account section)
- `src/contexts/AdminContext.tsx` (admin login path)

Notes:
- `[~]` Parsing includes fallback patterns until backend response contract is finalized.
- `[~]` Admin currently has temporary demo fallback in case backend auth fails.

### Users
- `[ ]` `GET /users/all`
- `[ ]` `GET /users/get-user/{id}`
- `[ ]` `PATCH /users/update-user/{id}`
- `[ ]` `DELETE /users/delete-user/{id}`

### Product Categories
- `[ ]` `POST /product-categories`
- `[ ]` `GET /product-categories`
- `[ ]` `GET /product-categories/root`
- `[ ]` `GET /product-categories/{id}`
- `[ ]` `PUT /product-categories/{id}`
- `[ ]` `DELETE /product-categories/{id}`
- `[ ]` `GET /product-categories/{id}/subcategories`
- `[ ]` `GET /product-categories/{id}/path`

### Products
- `[ ]` `POST /products`
- `[ ]` `GET /products`
- `[ ]` `GET /products/by-category/{categoryId}`
- `[ ]` `GET /products/{id}`
- `[ ]` `PUT /products/{id}`
- `[ ]` `DELETE /products/{id}`
- `[ ]` `POST /products/{id}/categories/{categoryId}`
- `[ ]` `DELETE /products/{id}/categories/{categoryId}`
- `[ ]` `PUT /products/{id}/stock`

### Boxes
- `[ ]` `POST /boxes`
- `[ ]` `GET /boxes`
- `[ ]` `GET /boxes/active`
- `[ ]` `GET /boxes/{id}`
- `[ ]` `PUT /boxes/{id}`
- `[ ]` `DELETE /boxes/{id}`

### Orders
- `[ ]` `POST /orders`
- `[ ]` `GET /orders`
- `[ ]` `GET /orders/{id}`
- `[ ]` `PATCH /orders/{id}`
- `[ ]` `DELETE /orders/{id}`

### Plans
- `[ ]` `POST /plans`
- `[ ]` `GET /plans`
- `[ ]` `GET /plans/active`
- `[ ]` `GET /plans/by-box/{boxId}`
- `[ ]` `GET /plans/{id}`
- `[ ]` `PUT /plans/{id}`
- `[ ]` `DELETE /plans/{id}`

### Carts
- `[ ]` `GET /carts/my-cart`
- `[ ]` `POST /carts/items`
- `[ ]` `PATCH /carts/items/{productId}`
- `[ ]` `DELETE /carts/items/{productId}`
- `[ ]` `DELETE /carts`
- `[ ]` `GET /carts/validate`

### Subscriptions
- `[ ]` `POST /subscriptions`
- `[ ]` `GET /subscriptions`
- `[ ]` `GET /subscriptions/active`

### Addresses
- `[ ]` `POST /addresses`
- `[ ]` `GET /addresses`

### Upload
- `[ ]` `POST /upload`
- `[ ]` `POST /upload/confirm`
- `[ ]` `GET /upload/{tempId}`
- `[ ]` `DELETE /upload/{tempId}`

### Audit
- `[ ]` `GET /audit`
- `[ ]` `GET /audit/resource-timeline`

## Immediate Next Checklist (Execution Order)
- `[ ]` Wire Products + Product Categories read endpoints into customer pages.
- `[ ]` Wire Carts endpoints into builder/review flow.
- `[ ]` Wire Orders create/read into checkout, confirmation, and dashboards.
- `[ ]` Wire Addresses create/read into checkout + customer dashboard.
- `[ ]` Replace admin mock tables/charts with live Orders/Products/Subscriptions/Users.
