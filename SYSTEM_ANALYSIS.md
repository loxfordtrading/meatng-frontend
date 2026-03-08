# MeatNG Marketplace — System Analysis & MVP Checklist

> Last updated: 26 February 2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Tech Stack](#2-tech-stack)
3. [User Flows](#3-user-flows)
4. [Backend API Endpoints — Wired vs Remaining](#4-backend-api-endpoints--wired-vs-remaining)
5. [Admin Panel — Feature Status](#5-admin-panel--feature-status)
6. [Customer Side — Feature Status](#6-customer-side--feature-status)
7. [MVP Launch Checklist](#7-mvp-launch-checklist)

---

## 1. System Overview

MeatNG is a subscription-based meat delivery marketplace serving Nigerian customers. It has two modules:

- **Customer App** — browse products, build a subscription box, add extras, checkout, manage account
- **Admin Panel** — manage products, categories, orders, customers, deliveries, analytics

The frontend is a single React SPA. The backend is a REST API at `https://meatng-api.onrender.com` (Swagger docs at `/api#/`).

### Architecture at a Glance

```
┌──────────────────────────────────────────────────────┐
│                   React SPA (Vite)                   │
│                                                      │
│  ┌──────────────┐   ┌──────────────┐                 │
│  │  Customer     │   │  Admin        │                │
│  │  Pages        │   │  Pages        │                │
│  └──────┬───────┘   └──────┬───────┘                 │
│         │                  │                          │
│  ┌──────┴──────────────────┴───────┐                 │
│  │         Contexts Layer           │                 │
│  │  SubscriptionCtx · CartCtx       │                 │
│  │  AdminCtx · ProductCatalogCtx    │                 │
│  └──────────────┬──────────────────┘                 │
│                 │                                     │
│  ┌──────────────┴──────────────────┐                 │
│  │          API Layer               │                 │
│  │  client.ts → apiRequest()        │                 │
│  │  admin/ (products, orders, …)    │                 │
│  │  customer/ (auth, users, addr)   │                 │
│  └──────────────┬──────────────────┘                 │
│                 │                                     │
│  ┌──────────────┴──────────────────┐                 │
│  │        Mock Data Layer           │                 │
│  │  products.ts · plans.ts          │                 │
│  │  adminData.ts                    │                 │
│  │  (Always available as fallback)  │                 │
│  └─────────────────────────────────┘                 │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS
              ┌────────┴────────┐
              │  Backend API    │
              │  (Render)       │
              └─────────────────┘
```

### Data Flow Pattern

All pages that talk to the backend follow a resilient pattern:

```
useQuery → try API call → success? use real data
                        → failure? return null → fallback to mock data
```

When mock data is in use, a `(demo data)` indicator is shown in the admin panel subtitle.

**Customer-side product merging:** The `ProductCatalogContext` always includes the hardcoded mock products as a base (so pages are never blank). When the API responds, any new products (by ID) are appended alongside the mock products. Same for categories. This means admin-created products appear alongside the existing catalog without replacing it.

---

## 2. Tech Stack

| Layer              | Technology                                    |
|--------------------|-----------------------------------------------|
| Framework          | React 18 + TypeScript                         |
| Build tool         | Vite                                          |
| Styling            | TailwindCSS + shadcn/ui                       |
| Server state       | @tanstack/react-query                         |
| Routing            | React Router v6                               |
| Charts             | Recharts                                      |
| Icons              | Lucide React                                  |
| Backend            | REST API on Render                            |
| API format         | JSON:API (id + attributes) for some endpoints |
| Auth tokens        | localStorage (customer + admin separate keys) |

---

## 3. User Flows

### 3.1 Customer Flow

```
Landing Page (/)
    │
    ├─→ Browse Products (/products)
    │       └─→ Product Detail (/product/:id)
    │               └─→ Add to Cart → Cart (/cart) → Checkout
    │
    ├─→ Subscribe Flow:
    │       1. Choose Plan        (/plans)         — Value Pack / Signature / Premium
    │       2. Choose Size         (/plans/size)    — 3kg to 12kg
    │       3. Choose Frequency    (/plans/frequency) — Weekly / Bi-weekly / Monthly
    │       4. Build Your Box      (/build-box)     — Pick products to fill the box
    │       5. Review Cart         (/cart-review)   — Review box + add paid extras
    │       6. Checkout            (/checkout)      — Address, payment, delivery slot
    │       7. Confirmation        (/confirmation)  — Order confirmed
    │
    ├─→ Auth
    │       Sign In  (/auth/signin)  — Email/password login
    │       Sign Up  (/auth/signup)  — Name, email, password registration
    │       Admin redirect: @loxfordtrading.com emails → /admin
    │
    └─→ Account Dashboard (/dashboard)
            ├─ Active subscription overview
            ├─ Order history
            ├─ Saved addresses (CRUD)
            └─ Profile & password settings
```

### 3.2 Admin Flow

```
Admin Login (/admin/login)
    │   OR
Customer Login with @loxfordtrading.com email → auto-redirect
    │
    ├─→ Dashboard (/admin)
    │       KPIs, revenue chart, recent orders, plan distribution
    │
    ├─→ Orders (/admin/orders)
    │       View all orders, filter by status, update order status
    │
    ├─→ Products (/admin/products)
    │       Full CRUD: create, edit, delete, toggle active/inactive
    │       Manage stock quantities, SKU, category assignment
    │       Grid + list views, search & category filter
    │
    ├─→ Customers (/admin/customers)
    │       View registered users, subscription status, contact info
    │
    ├─→ Subscriptions (/admin/subscriptions)    — Mock only
    │       View active subscriptions, pause/cancel
    │
    ├─→ Deliveries (/admin/deliveries)          — Mock only
    │       Manage delivery zones and drivers
    │
    ├─→ Analytics (/admin/analytics)            — Mock only
    │       Revenue trends, retention, product popularity
    │
    └─→ Settings (/admin/settings)              — Mock only
            Business info, delivery config, notification prefs
```

### 3.3 Authentication Architecture

| Scenario | What Happens |
|----------|-------------|
| Customer signs in | POST `/auth/login` → token stored as `meatng-auth-token` → redirect to `/` |
| Customer signs up | POST `/auth/signup` → token stored → redirect to `/` |
| Admin signs in (admin login page) | Checks demo credentials OR POST `/auth/login` → token stored as `meatng-admin-auth-token` → redirect to `/admin` |
| Customer login with `@loxfordtrading.com` email | Same POST `/auth/login` → detects admin domain → calls `loginWithResult()` → redirect to `/admin` |
| Demo admin | `admin@meatng.com / admin123` or `manager@meatng.com / manager123` — works without backend |

---

## 4. Backend API Endpoints — Wired vs Remaining

### 4.1 API Functions That ARE Wired to Frontend

#### Admin Pages

| API Function | Endpoint | Method | Used In |
|---|---|---|---|
| `listProducts` | `/products` | GET | AdminProducts, ProductCatalogContext |
| `listProductCategories` | `/product-categories` | GET | AdminProducts, ProductCatalogContext |
| `createProduct` | `/products` | POST | AdminProducts (Add Product modal) |
| `updateProduct` | `/products/{id}` | PUT | AdminProducts (edit modal — name, category, price, stock, SKU, description, image) |
| `deleteProduct` | `/products/{id}` | DELETE | AdminProducts (delete action) |
| `createProductCategory` | `/product-categories` | POST | AdminProducts (Add Category modal) |
| `updateProductCategory` | `/product-categories/{id}` | PUT | AdminProducts (Edit Category modal) |
| `deleteProductCategory` | `/product-categories/{id}` | DELETE | AdminProducts (delete category action) |
| `listOrders` | `/orders` | GET | AdminOrders, AdminDashboard |
| `updateOrderStatus` | `/orders/{id}` | PATCH | AdminOrders (status dropdown) |
| `listAdminUsers` | `/users` | GET | AdminCustomers |

#### Customer Pages

| API Function | Endpoint | Method | Used In |
|---|---|---|---|
| `loginWithEmail` | `/auth/login` | POST | Auth.tsx (sign in) |
| `signupWithEmail` | `/auth/signup` | POST | AuthSignup.tsx (registration) |
| `changePassword` | `/auth/change-password` | PATCH | Dashboard (settings tab) |
| `getCurrentUser` | `/users/me` | GET | Dashboard (profile) |
| `updateCurrentUser` | `/users/me` | PATCH | Dashboard (profile edit) |
| `listAddresses` | `/addresses` | GET | Dashboard (addresses tab) |
| `createAddress` | `/addresses` | POST | Dashboard (add address) |
| `updateAddress` | `/addresses/{id}` | PATCH | Dashboard (edit address) |
| `deleteAddress` | `/addresses/{id}` | DELETE | Dashboard (remove address) |
| `setDefaultAddress` | `/addresses/{id}/set-default` | PATCH | Dashboard (set default) |

### 4.2 API Functions That Exist in Code But Are NOT Wired

| API Function | Endpoint | Method | Notes |
|---|---|---|---|
| `getProductById` | `/products/{id}` | GET | Not used (catalog context uses list) |
| `addCategoryToProduct` | `/products/{id}/categories/{catId}` | POST | Not wired to UI |
| `removeCategoryFromProduct` | `/products/{id}/categories/{catId}` | DELETE | Not wired to UI |
| `updateProductStock` | `/products/{id}/stock` | PUT | Not wired to UI |
| `getRootProductCategories` | `/product-categories/root` | GET | Not used |
| `getProductCategoryById` | `/product-categories/{id}` | GET | Not used |
| `listBoxes` | `/boxes` | GET | Not wired to any page |
| `listActiveBoxes` | `/boxes/active` | GET | Not wired |
| `getBoxById` | `/boxes/{id}` | GET | Not wired |
| `createBox` | `/boxes` | POST | Not wired |
| `updateBox` | `/boxes/{id}` | PUT | Not wired |
| `deleteBox` | `/boxes/{id}` | DELETE | Not wired |
| `getOrderById` | `/orders/{id}` | GET | Not wired (order detail view) |
| `createOrder` | `/orders` | POST | Checkout doesn't submit order to API |
| `deleteAdminUser` | `/users/delete-user/{id}` | DELETE | Not wired to AdminCustomers |
| `getUserById` | `/users/get-user/{id}` | GET | Not used |
| `updateUserById` | `/users/update-user/{id}` | PATCH | Not used in admin |

### 4.3 Backend Endpoints Likely Needed But NOT in Codebase

| Feature | Likely Endpoint | Status |
|---------|----------------|--------|
| Subscription CRUD | `/subscriptions`, `/subscriptions/{id}` | No API file exists |
| Payment / Paystack integration | `/payments/initialize`, `/payments/verify` | No API file exists |
| Delivery scheduling | `/deliveries`, `/delivery-zones` | No API file exists |
| Notifications / emails | `/notifications` | No API file exists |
| Dashboard KPIs (aggregate) | `/analytics/dashboard` | No API file exists |

---

## 5. Admin Panel — Feature Status

| Page | API Integrated | CRUD Operations | Status |
|------|:---:|---|---|
| **Dashboard** | Partial | Read orders (recent) — charts use mock | ⚠️ Partial |
| **Orders** | ✅ Yes | Read all, update status | ✅ Working |
| **Products** | ✅ Yes | Full CRUD: create, read, edit, delete, toggle active, stock management | ✅ Working |
| **Customers** | ✅ Yes | Read all | ⚠️ Missing: Delete, edit user |
| **Subscriptions** | ❌ No | All mock — no backend support | ❌ Not started |
| **Deliveries** | ❌ No | All mock — no backend support | ❌ Not started |
| **Analytics** | ❌ No | All mock data | ❌ Not started |
| **Settings** | ❌ No | Display only, no persistence | ❌ Not started |

---

## 6. Customer Side — Feature Status

| Feature | API Integrated | Status |
|---------|:---:|---|
| **Sign In** | ✅ Yes | ✅ Working |
| **Sign Up** | ✅ Yes | ✅ Working |
| **Admin domain redirect** | ✅ Yes | ✅ Working |
| **Browse Products** | ✅ Yes (via ProductCatalogContext) | ✅ Working — mock base + API merge |
| **Product Detail** | ✅ Yes (via ProductCatalogContext) | ✅ Working |
| **Subscription Plan Selection** | ❌ No | ⚠️ Uses static plan data, no backend |
| **Build Box** | ✅ Yes (via ProductCatalogContext) | ✅ Working — dynamic products |
| **Cart Review + Add-ons** | ✅ Yes (via ProductCatalogContext) | ✅ Working |
| **Checkout** | ❌ No | ⚠️ Mock payment (Paystack placeholder) |
| **Order submission to backend** | ❌ No | ❌ `createOrder` not called |
| **Customer Dashboard** | ✅ Yes | ✅ Working (profile, addresses) |
| **Order history (customer)** | ❌ No | ❌ No customer-facing order list |
| **Subscription management** | ❌ No | ❌ No backend subscription model |
| **Shopping Cart (one-time)** | ❌ No | ⚠️ Cart logic works, no checkout API |
| **Gift Boxes** | ❌ No | ⚠️ UI exists, not backed by API |

---

## 7. MVP Launch Checklist

### Auth & Accounts
- [x] Customer sign-in (email/password)
- [x] Customer sign-up (name, email, password)
- [x] Admin login (dedicated page + demo credentials)
- [x] Admin login via domain redirect (@loxfordtrading.com)
- [x] Token management (separate customer/admin tokens)
- [x] Password change (customer dashboard)
- [ ] Forgot password / password reset flow
- [ ] Email verification on signup
- [ ] Session expiry / token refresh handling

### Customer — Product Browsing
- [x] Product listing page with category filters
- [x] Product detail page
- [x] Dynamic product fetch from API with mock fallback
- [x] Dynamic category fetch from API with mock fallback
- [x] Search & sort on products page
- [ ] Product images served from backend/CDN (currently placeholders)

### Customer — Subscription Flow
- [x] Plan selection UI (Value Pack / Signature / Premium)
- [x] Size selection UI (3kg–12kg)
- [x] Frequency selection UI (weekly / bi-weekly / monthly)
- [x] Box builder with category filters and quantity controls
- [x] Cart review with add-on extras
- [x] Subscription state persisted in localStorage
- [ ] Subscription creation submitted to backend (`POST /subscriptions` or similar)
- [ ] Subscription management (pause, cancel, modify) via API
- [ ] Recurring billing integration

### Customer — Checkout & Payment
- [x] Checkout UI (address, payment method, delivery slot)
- [x] Address CRUD on dashboard (wired to API)
- [ ] Order submitted to backend on checkout (`POST /orders`)
- [ ] Paystack payment integration (currently mock)
- [ ] Payment verification callback
- [ ] Order confirmation with real order ID

### Customer — Dashboard
- [x] Profile view & edit (wired to API)
- [x] Address management (full CRUD, wired to API)
- [x] Password change (wired to API)
- [ ] Order history list (need customer-facing order endpoint)
- [ ] Active subscription display from backend
- [ ] Subscription modification (skip, pause, cancel)

### Admin — Dashboard
- [x] KPI cards (total revenue, orders, customers, subscriptions)
- [x] Recent orders from API
- [ ] KPI values from backend aggregate endpoint
- [ ] Revenue chart from real data
- [ ] Product popularity from real data
- [ ] Plan distribution from real data

### Admin — Order Management
- [x] List all orders from API
- [x] Filter orders by status
- [x] Update order status via API
- [ ] View order detail (items, customer info, delivery address)
- [ ] Order detail view using `getOrderById`
- [ ] Export orders

### Admin — Product Management
- [x] List all products from API
- [x] Edit product details via API (name, category, pack size, price, stock, SKU, description, image)
- [x] Delete product via API
- [x] Toggle product active/inactive
- [x] Create new product (Add Product modal → `POST /products`)
- [x] Manage product stock (stock field in Edit & Create modals, stock column in list view)
- [ ] Product image upload (currently URL-based — needs backend upload endpoint)
- [x] Category assignment via dropdown in Edit & Create modals

### Admin — Category Management
- [x] List categories in admin (Categories tab on Products page)
- [x] Create new category (Add Category modal → `POST /product-categories`)
- [x] Edit category (Edit modal → `PUT /product-categories/{id}`)
- [x] Delete category (Delete action → `DELETE /product-categories/{id}`)

### Admin — Customer Management
- [x] List all customers from API
- [ ] Delete customer (`deleteAdminUser` function exists, not wired)
- [ ] Edit customer details
- [ ] View customer order history

### Admin — Subscriptions
- [ ] Wire to backend subscription endpoints (endpoints not yet built?)
- [ ] List active subscriptions from API
- [ ] Pause / cancel subscription
- [ ] View subscription detail

### Admin — Deliveries
- [ ] Wire to backend delivery endpoints (endpoints not yet built?)
- [ ] Manage delivery zones
- [ ] Assign drivers to zones
- [ ] Track delivery status

### Admin — Analytics
- [ ] Wire to backend analytics/aggregate endpoints
- [ ] Revenue trends from real data
- [ ] Customer retention from real data
- [ ] Product performance from real data

### Admin — Settings
- [ ] Persist business settings to backend
- [ ] Manage admin users (invite, roles, deactivate)
- [ ] Delivery configuration persistence
- [ ] Notification preferences persistence

### Admin — Box Management
- [ ] Wire Box CRUD to admin UI (all 6 API functions exist, no UI page)
- [ ] Create/edit box templates
- [ ] Assign products to boxes

### Infrastructure & Polish
- [ ] Environment-based API URL configuration (production vs staging)
- [ ] Error boundary / global error handling
- [ ] Loading skeletons on all pages
- [ ] Mobile responsiveness audit
- [ ] SEO meta tags
- [ ] 404 page for unknown routes
- [ ] Rate limiting / request throttling awareness
- [ ] Logging / error reporting (Sentry or similar)

---

## Summary

| Area | Done | Remaining |
|------|:----:|:---------:|
| Auth & Accounts | 6 | 3 |
| Customer Browsing | 5 | 1 |
| Subscription Flow | 6 | 3 |
| Checkout & Payment | 2 | 4 |
| Customer Dashboard | 3 | 3 |
| Admin Dashboard | 2 | 4 |
| Admin Orders | 3 | 3 |
| Admin Products | 7 | 1 |
| Admin Categories | 4 | 0 |
| Admin Customers | 1 | 3 |
| Admin Subscriptions | 0 | 4 |
| Admin Deliveries | 0 | 4 |
| Admin Analytics | 0 | 3 |
| Admin Settings | 0 | 4 |
| Admin Boxes | 0 | 3 |
| Infrastructure | 0 | 8 |
| **Totals** | **39** | **51** |

**MVP readiness: ~43%** — Core browsing, auth, and admin product management are solid. Customer-facing pages dynamically merge API products with hardcoded catalog. The biggest gaps are checkout/payment integration, order submission, subscription backend, and admin pages still on mock data (subscriptions, deliveries, analytics, settings).
