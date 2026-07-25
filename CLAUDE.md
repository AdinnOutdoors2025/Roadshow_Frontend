# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Scope note:** This repository (`Roadshow_Frontend/`) contains **only the frontend**. There is no backend source code, database schema, or server project anywhere on this machine's `d:\Road_show_new` tree — the backend is a separate service reachable over HTTP (production: `https://roadshow-backend.onrender.com`, local dev: `http://localhost:3001`). Sections 5–7 below (Backend Architecture, Database Design, API Documentation) are **reverse-engineered from how the frontend calls the API** — they describe the contract as this codebase depends on it, not the backend's actual implementation. Verify against the real backend repo before treating them as ground truth, and update this file if the contract has drifted.

---

## 1. Project Overview

**Adinn Roadshow** is an operations and sales platform for a mobile/outdoor advertising business that rents out **branded vehicles (LED vans, flex-wrapped vehicles, promotional vans)** for advertising campaigns ("roadshows"), along with optional promoters and drivers.

- **Business domain:** Out-of-home (OOH) mobile advertising rental — vehicle branding campaigns, LED-van advertising, promoter-led brand activations, election/campaign vehicle hire.
- **Main objectives:**
  - Give internal sales staff a pipeline (CRM-style kanban) to take a lead from enquiry to a signed, priced order (`sales-handling`).
  - Give operations staff a second pipeline to execute a won order: assign drivers/vehicles, track on-road status (with live GPS via a "vamosys" integration), record extra KM/hours, handle vehicle-unavailable incidents, and close out the campaign with client feedback (`operation-handling`).
  - Let admins directly create priced orders (`order-creation`), manage the vehicle fleet and rate cards (`package-management`, `Vehicles/*`), and manage staff, drivers and promoters as resources.
  - Present a public marketing/booking-preview site for prospective customers (`/`, `/roadshow/*`).
- **Target users:**
  - **Internal:** admins and staff-admins operating the `/admin/**` dashboard (sales reps, operations/fleet coordinators, super-admins).
  - **External (partially built):** prospective customers browsing vehicle offerings and a "my bookings" view on the public site — currently presentation-only, see [Current Project Status](#12-current-project-status).

## 2. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend framework | **Next.js 16** (App Router, React Server Components where not marked `"use client"`) | `next dev --webpack` is used for dev (Turbopack config also present but dev script forces webpack) |
| UI library | **React 19** | |
| Language | **TypeScript 5.9** (`strict: true`) | Many business-logic files opt out via `/* eslint-disable */` + `// @ts-nocheck` — see [Known Technical Debt](#13-known-technical-debt) |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`, `@tailwindcss/forms`), custom `@theme` tokens in `src/app/globals.css` | `prettier-plugin-tailwindcss` sorts classes |
| Backend | **External REST API**, not in this repo | Consumed via `fetch`/`axios`; see §5–7 |
| Database | **Not in this repo** | Document shapes below are inferred from `_id` fields and JSON responses the frontend expects (Mongo-style ObjectIds strongly suggest MongoDB) |
| State management | React local state + Context API (no Redux/Zustand/RTK) | `ThemeContext`, `SidebarContext`, `SearchContext`, `vehicletypecontext` |
| Charts | **ApexCharts** (`react-apexcharts`) | admin dashboard, ecommerce widgets |
| Calendar | **FullCalendar** (`@fullcalendar/*`), **flatpickr** | booking/date pickers |
| Maps | **@react-jvectormap** | `CountryMap` widget |
| Animation | **GSAP** + **Lenis** (`GlobalSmoothScroll`) | smooth-scroll wraps the whole public site (and, because of root layout, admin pages too) |
| PDF/export | **jsPDF**, **html2canvas** | `OrderReportPDF.tsx`, print views |
| Notifications | **react-hot-toast** (primary, most admin modules) and **react-toastify** (older/alternate, some files) — both are in use, not one-or-the-other | |
| HTTP client | Mixed **native `fetch`** and **axios** — no shared API client/interceptor; every call sets headers manually | |
| Auth token decode | Manual base64 `atob` JWT decode in `useAuthGuard.tsx`, despite `jwt-decode` being a listed dependency | inconsistency, see tech debt |
| Drag & drop | **react-dnd** + `react-dnd-html5-backend` | kanban pipelines in sales/operation handling |
| Icons | `lucide-react`, `react-icons`, Font Awesome (via CDN `<link>` in root layout + `@fortawesome/*` packages), plus a custom SVG set in `src/icons/` (SVGR-compiled) | |
| Build tools | Next.js CLI, ESLint 9 flat config (`eslint-config-next`), `patch-package`, PostCSS/autoprefixer | No test runner is configured |

## 3. Project Architecture

### 3.1 Overall architecture

A single Next.js App Router project renders **two independent experiences** from one codebase:

```
src/app/
├─ layout.tsx            ← ROOT layout: global Navbar + Footer + GlobalSmoothScroll (Lenis)
│                            wraps EVERY route, including /admin/**
├─ page.tsx               ← public marketing home page ("/")
├─ roadshow/               ← public: vehicle details, my-bookings (mostly static/demo, see §12)
├─ not-found.tsx
└─ admin/
   ├─ layout.tsx           ← delegates to admin_Layouts/AdminLayout.tsx
   ├─ admin_Layouts/       ← ThemeProvider→SidebarProvider→VehicleProvider→SearchProvider
   │                          + AppSidebar/AppHeader/Backdrop shell
   ├─ (auth)/signin, signup ← route group, own layout, no sidebar shell
   ├─ (full-width-pages)/   ← route group for e.g. error-404
   ├─ dashboard/            ← KPI/chart dashboard
   ├─ staff-admin/ driver/ promoter/ package-management/  ← simple CRUD modules
   ├─ order-creation/       ← multi-step order wizard + order list/detail/print
   ├─ sales-handling/       ← Sales pipeline kanban (CRM)
   ├─ operation-handling/   ← Operations pipeline kanban (fleet execution)
   └─ Vehicles/             ← Vehicle_Onboarding, Vehicle_Inventory
```

### 3.2 Request flow

1. Browser hits a route → `src/middleware.tsx` runs at the edge for every `/admin*` path, reading the `adminToken` cookie to redirect unauthenticated users to `/admin/signin` (and authenticated users away from the auth pages).
2. The matched `page.tsx` (always `"use client"` for anything data-driven) mounts, and `useAuthGuard()` (where used) decodes the JWT client-side to pre-emptively log out on expiry.
3. The component calls the external API directly with `fetch`/`axios`, attaching `Authorization: Bearer <token>` from `getToken()` per call (no shared client/interceptor).
4. Responses follow a `{ success: boolean, message?: string, data: ... }` envelope almost everywhere; components branch on `res.ok`/`data.success` and surface `data.message` via `toast`/`alert` on failure.
5. Some list endpoints double-wrap the payload (`data.data.data`, e.g. promoters) — check the exact call site before assuming a shape.

### 3.3 Module responsibilities

| Module (`src/app/admin/...`) | Responsibility |
|---|---|
| `admin_Layouts/` | Shell chrome: sidebar, header, backdrop, provider composition |
| `dashboard/` | KPI/metrics/chart landing page after login |
| `staff-admin/`, `driver/`, `promoter/` | Simple resource CRUD (internal staff, drivers, promoters) |
| `package-management/` | Rate cards ("packages") per vehicle type/model — the pricing source of truth consumed by order creation |
| `Vehicles/Vehicle_Onboarding/`, `Vehicles/Vehicle_Inventory/` | Fleet registry: onboarding new vehicles, browsing/managing inventory and live status |
| `order-creation/` | Admin-initiated order wizard (customer → vehicles/pricing → summary) plus the order list/detail/print views |
| `sales-handling/` | Sales CRM kanban: `enquiry → needAnalysis → proposalPriceQuote → negotiationReview → closedWon → projectCodeCreation` (with `closedLost` as a terminal side-branch at any point) |
| `operation-handling/` | Ops execution kanban: `todo → projectExecution → onRoad → clientClosure → closedWon / closedLost`, with `vehicleUnavailable` as a parallel/history lane |

### 3.4 Data flow

- **Vehicle types** (`api/vehicle-types`) and **packages** (`packages/*`) are reference data fetched into context/local state and used to compute live pricing previews client-side (see §8) before an order is submitted.
- **Orders** move through the sales pipeline as documents with a `stage` field; drag-and-drop in the kanban PATCHes the order's stage (`sales/pipeline/:id/...` endpoints). Once `closedWon`, the same order (or its linked record) appears in the operations pipeline for execution.
- **Pipeline sub-resources** (comments, extra-km entries, on-road driver/vehicle assignments, closure documents) are stored as arrays on the order/pipeline document and mutated via dedicated sub-routes (e.g. `admin/pipeline/:orderId/onroad-details/:entryId`), not separate top-level collections — the frontend always re-fetches or optimistically patches the parent order after these calls.

## 4. Frontend Architecture

### 4.1 Component structure

- **Route components** (`page.tsx`) hold data-fetching + top-level state; they compose **step/tab components** (e.g. `CustomerDetailsStep`, `OnRoadTab`) and **modal components** (`*FormModal.tsx`, `Closed*Modal.tsx`, `DeleteModal.tsx`) for actions.
- **Reusable primitives** live in `src/components/ui/*` (Button, Modal, Badge, Avatar, Dropdown, Table, Alert) and `src/components/form/*` (Input, Select, MultiSelect, DatePicker, Checkbox, Radio, Switch) — modeled after the original "Adinn" admin template.
- **Domain-specific one-offs** (`src/components/reusableFormField.tsx` exporting `FormField`/`inputClass`/`selectClass`) are used pervasively by the newer roadshow modules in preference to the generic `form/` primitives — prefer `reusableFormField` when editing `admin/**` business screens, and the `components/form|ui` set when editing generic/template screens.
- **Public site components** live under `src/components/Client/**` (`Navbar`, `Footer`, `HomeBanner`, `HomePageSection1/2`), each paired with a co-located `.css` file (not Tailwind-only) for bespoke styling/animation.

### 4.2 Routing

- Next.js App Router, file-system based. Route groups `(auth)` and `(full-width-pages)` under `admin/` opt specific pages out of the sidebar shell without changing the URL.
- Client-side redirects: `useAuthGuard` → `/admin/signin`; edge redirects: `src/middleware.tsx` (see §3.2). There are two overlapping auth mechanisms (edge middleware + client hook) — both must keep agreeing on `/admin/signin` as the login route if either is changed.

### 4.3 API layer

- No shared API client. Every file imports a base URL constant and builds full URLs by string concatenation:
  - `import API_BASE from "../../../../baseurl"` (root `baseurl.js`, reads `process.env.NEXT_PUBLIC_API_BASE`, **no leading slash** on calls, so the env value must end in `/`) — used by ~40 files, this is the one to use for new code.
  - `import { baseUrl } from "../../../../BaseUrl"` (actually the default export of `src/BaseUrl.tsx`, **hardcoded** to the production URL) — only used by the two `Vehicles/*` pages, calls use a **leading slash**. Don't mix the two conventions in the same file.
- Auth header is attached manually per call: `headers: { Authorization: \`Bearer ${getToken()}\` }`.
- See §7 for the endpoint inventory.

### 4.4 State management

- No global store. Cross-cutting UI state goes through React Context (`ThemeContext`, `SidebarContext`, `SearchContext`, `vehicletypecontext`), all admin-only and composed in `admin_Layouts/AdminLayout.tsx`.
- Everything else (form state, fetched lists, pipeline data) is local `useState`/`useEffect` per page/component — there is no caching layer (no React Query/SWR); every mount re-fetches.

### 4.5 Reusable components

- `src/components/ui/*`, `src/components/form/*` — generic template-derived primitives (buttons, modals, tables, inputs).
- `src/components/charts/*`, `src/components/ecommerce/*`, `src/components/tables/*` — dashboard widgets from the original template, some still wired to demo data (`BasicTableOne`, `RecentOrders`).
- `src/hooks/useModal.ts`, `useGoBack.ts` — small reusable hooks.
- `src/icons/index.tsx` — barrel file re-exporting every SVG in `src/icons/*.svg` as a React component (via SVGR, configured in `next.config.ts` for both webpack and turbopack).

### 4.6 Styling conventions

- Tailwind utility-first; dark mode via a `dark` class toggled on `<html>` by `ThemeContext` (admin only — the public site does not use dark mode).
- Design tokens (brand colors, custom breakpoints, title font sizes) are defined once in `src/app/globals.css` under `@theme`.
- Some public-site components pair a `.tsx` with a hand-written `.css` file (`HomeBanner.css`, `Navbar.css`, `Footer.css`, `page.css` for `VehicleDetails`) for effects Tailwind doesn't cover cleanly (GSAP-driven animation, complex gradients) — follow the existing pattern in a component rather than migrating it to pure Tailwind mid-task.
- `prettier.config.js` only configures `prettier-plugin-tailwindcss` (class sorting) — no other Prettier overrides.

## 5. Backend Architecture *(external service — inferred from usage only)*

The backend is not present in this repo. From the URL paths the frontend calls, the API appears organized as:

- **Flat resource routers**: `promoters`, `drivers`, `staff-admins`, `packages`, `locations`, `gstdetails` — plain REST CRUD (`GET /`, `GET /:id`, `POST /`, `PUT /:id`, `DELETE /:id`), matching the "one router per Mongoose model" pattern typical of an Express + Mongoose backend.
- **`api/*` namespace**: vehicle-types, vehicle registration/availability lookups (`api/vehicle-types`, `api/checkAvailability`, `api/getNewVehicles`, `api/updateRegistrationVehicle*`) — looks like a separate/older router group for fleet + availability logic.
- **`admin/*` namespace**: order creation (`admin/orders/create`), the **operations pipeline** (`admin/pipeline/:orderId/...` sub-routes for extra-km, onroad-details, closed-won, closed-lost, comments), campaign types (`admin/campaign-types`), and a live-tracking proxy (`admin/vamosys/vehicle-locations`, suggesting a third-party GPS/telematics provider called "Vamosys" is integrated server-side).
- **`sales/*` namespace**: the **sales pipeline** (`sales/pipeline`, `sales/pipeline/:orderId/...`) — a parallel set of routes to `admin/pipeline`, implying sales and operations pipelines are handled by separate controllers even though they may operate on the same underlying order documents (or on linked ones — unconfirmed from the frontend alone).
- **Auth**: a single `POST admin` login endpoint returns `{ token, user: { id, username, role } }`; there's also a `register-admin` endpoint (used by `SignUpForm`). No separate staff-admin login endpoint was found — `staff-admins` appears to be a plain assignable-user directory (e.g. "assign this lead to X") rather than a second auth principal.
- **Middleware (inferred)**: endpoints under `admin/*`, `sales/*`, and the plain resource routers require `Authorization: Bearer <JWT>`; `gstdetails/verify` and the public `api/checkAvailability` look unauthenticated from the frontend's usage.
- **Error handling (inferred)**: non-2xx responses return `{ success: false, message: string }`; the frontend uniformly reads `.message` for toasts, so keep new backend error responses consistent with that shape if you're asked to stub or mock the API.

## 6. Database Design *(external — inferred from frontend payloads)*

No schema files exist here; the following is reconstructed from `interface`/`type` declarations and observed API payloads in the frontend. Treat field lists as **incomplete** and **unverified against the real schema**.

| Entity | Key fields seen from the frontend | Notes |
|---|---|---|
| **VehicleType** | `_id`, `name`/`typeName`, `isActive` | referenced by `vehicleType` on Package |
| **Package** (rate card) | `_id`, `vehicleType` (ref, sometimes populated as object), `vehicleModel`, `perDayRentalCost`, `driverCharges`, `rtoCharges`, `dailyKmLimit`, `perKmCharge`, `additionalHourCharges`, `promoterAvailable`, `promoterChargePerDay`, `isActive`, `inactiveReason` | one package per (vehicleType, vehicleModel) — enforced client-side via `packages/check-exists` before create |
| **Driver** | `_id`, `name`, `dob`, `gender`, `aadharNo`, `house`, `dist`, `state`, `country`, `pincode`, `panNumber`, `drivingLicenseNo` | KYC-heavy — Aadhaar, PAN, DL number all required |
| **Promoter** | `_id`, `name`, `phone`, `email`, `language` (array), `gender`, `promoterCharge`, `status` (`active`/`inactive`) | |
| **StaffAdmin** | `_id`, `username`, `email`, `password` (write-only), `phone`, `status` | used both as a login-adjacent entity and as an assignable "owner" on sales pipeline orders |
| **GstDetail** | `gstDetailId`, `gst_number`, `business_name` | resolved server-side via `gstdetails/verify` (likely a GSTIN lookup/validation API call on the backend) |
| **Order / Pipeline document** | `_id`, `orderId`, `stage` (sales) / kanban column key (ops), `customerType` (0=individual, 1=organization), `bookingItems[]` (with `totalAmount`), `negotiationLogs[]` (with `discountAmount`), `projectCodeArray[]` (with `projectCode`, `savedAt`), `campaignClosureArray[]` (with `type`, `status`), `onRoadExecutionArray[]` (with `unavailableStatus`, driver/vehicle assignment fields), `grandTotal` | this single document is the backbone of both pipelines — sales and ops tabs mostly append to or read these arrays rather than referencing separate collections |
| **Vehicle (fleet/inventory)** | registration number, current status, location — via `api/getNewVehicles`, `api/updateRegistrationVehicle*` | status enum and priority order defined client-side in `AdminSelectOptions.json` (`statusOptions`, `statusPriority`) |

**Relationships (inferred):** Package → VehicleType (many-to-one); Order → Package(s) (via `vehicle_${i}` line items referencing `packageId`); Order → StaffAdmin (assignment); Order → Driver/Vehicle (via `onRoadExecutionArray` entries); Order → GstDetail (0 or 1, for organization customers).

**Business constraints observed:**
- A package is unique per `(vehicleType, vehicleModel)` pair (checked via `packages/check-exists`).
- Vehicle status has a defined priority order (`Waiting for Status` < `Available` < `Unavailable` < `Booked` < `Maintenance` < `Damaged`) — used for sorting/precedence, not just display.
- `remarks` are required when a vehicle is set to `Unavailable`, `Maintenance`, or `Damaged`, and optional for `Booked` (`remarksRequiredStatuses` / `remarksOptionalStatuses` in `AdminSelectOptions.json`).

## 7. API Documentation *(inferred from frontend call sites — not authoritative)*

All paths are relative to `NEXT_PUBLIC_API_BASE` (trailing slash required) unless noted as using the legacy `src/BaseUrl.tsx` constant (leading slash instead). Auth column reflects whether the frontend sends a Bearer token on that call.

| Endpoint | Method(s) | Used by | Auth |
|---|---|---|---|
| `admin` | POST | `SignInForm.tsx` (admin login) | No |
| `register-admin` | POST | `SignUpForm.tsx` | No |
| `api/vehicle-types` | GET | `vehicletypecontext.tsx`, `VehicleFormModal`, `PackageFormModal`, `package-management/page.tsx` | No |
| `api/checkAvailability` | POST | `Adminorderapi.tsx` (`checkVehicleAvailability`) | No |
| `api/getNewVehicles` | GET | `ProjectExecutionTab`, `LiveVehicleRow`, Vehicle_Inventory | Mixed |
| `api/updateRegistrationVehicle/:vehicleDocId/:regNo` | PUT/PATCH | `ProjectExecutionTab.tsx` | Yes |
| `api/updateRegistrationVehicleByRegNo/:regNo` | PUT/PATCH | `LiveVehicleRow.tsx` | Yes |
| `promoters`, `promoters/:id` | GET/POST/PUT/DELETE | `promoter/page.tsx`, `PromoterFormModal.tsx` | Yes |
| `drivers`, `drivers/:id` | GET/POST/PUT/DELETE | `driver/page.tsx`, `driverFormModal.tsx` | Yes |
| `staff-admins`, `staff-admins/:id` | GET/POST/PUT/DELETE | `staff-admin/page.tsx`, `StaffAdminFormModal.tsx`, also read-only from sales/operation pipelines (assignment dropdown) | Yes |
| `packages`, `packages/:id`, `packages/add`, `packages/check-exists` | GET/POST/PUT/DELETE | `package-management/*`, `VehicleFormModal.tsx` | Yes |
| `locations`, `locations/:city` | GET | `cityselect.tsx`, `VehicleFormModal.tsx` | No |
| `gstdetails/verify` | POST | `CustomerDetailsStep.tsx` | No |
| `admin/orders/create` | POST (multipart `FormData`) | `AdminOrderForm.tsx` | Yes |
| `admin/orders` | GET | `order-creation/page.tsx` | Yes |
| `admin/campaign-types` | GET/POST | `VehicleFormModal.tsx` | Yes |
| `admin/pipeline` | GET | `operation-handling/page.tsx` (kanban data) | Yes |
| `admin/pipeline/:orderId/...` (`extra-km`, `onroad-details[/:entryId]`, `closed-won`, `closed-lost`, comments sub-routes) | GET/POST/PUT | Most of `operation-handling/*` (tabs, modals, rows) | Yes |
| `admin/vamosys/vehicle-locations` | GET | `OnRoadTab.tsx` (live GPS) | Yes |
| `api/orders/:orderId` | GET | `OnRoadTab.tsx` | Yes |
| `sales/pipeline`, `sales/pipeline/:orderId/...` | GET/POST/PUT | `sales-handling/*` (page, `SalesDetailDrawer`, `CodeCreationTab`) | Yes |
| *(legacy `BaseUrl.tsx`, leading-slash style)* `/packages`, `/api/getNewVehicles`, `/api/vehicle-types`, `/locations` | GET | `Vehicles/Vehicle_Inventory`, `Vehicles/Vehicle_Onboarding` only | Mixed |

**Request/response conventions:**
- Standard envelope: `{ success: boolean, message?: string, data: T }`. Some list endpoints nest again (`data.data.data`) — check the call site.
- File uploads (`admin/orders/create`, `closed-won`, `closed-lost`) use `multipart/form-data` via `FormData`, with JSON sub-objects stringified into individual form fields (e.g. `vehicle_0`, `campaignImages_0`).
- Client-side validation before hitting the API: GSTIN format `^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$`, Indian mobile `^[6-9]\d{9}$`, standard email regex.

## 8. Business Rules

### 8.1 Pricing calculation (`order-creation/VehicleFormModal.tsx: calcPricing`)

For a vehicle line item, given the selected package and form inputs:

```
baseDays   = ceil((toDate - fromDate) / 1 day)
totalDays  = baseDays + extraDays

rentalCost     = perDayRentalCost * totalDays * quantity
driverCost     = driverCharges    * totalDays * quantity
promoterCost   = needPromoter ? promoterChargePerDay * totalDays * promoterQuantity : 0
rtoCost        = rtoCharges * quantity
extraKmCost    = extraKm    > 0 ? perKmCharge          * extraKm    : 0
extraHourCost  = extraHours > 0 ? additionalHourCharges * extraHours : 0
additionalAdds = sum(additionalCharges where mode === "+")

subtotal = rentalCost + promoterCost + rtoCost + extraKmCost + extraHourCost + additionalAdds
```

- **Discount cap:** `maxDiscountAmount = floor(subtotal * MAX_DISCOUNT_PCT / 100)`, where `MAX_DISCOUNT_PCT` comes from `NEXT_PUBLIC_MAX_DISCOUNT_PERCENT` (default 15 if unset). Additional charges with `mode === "-"` are applied **in order**, each capped by whatever discount budget remains (`remaining = maxDiscountAmount - alreadyUsed`) — a percent-based cut (`reduceType === "percent"`) is computed against the *subtotal*, then clamped to the remaining budget; excess requested discount is silently dropped, not erroring.
- `totalAmount = max(subtotal - additionalCuts, 0)`. Note `gstAmount` is hardcoded to `0` here — GST is **not** applied at the line-item pricing-preview stage.
- Contrast with `operation-handling/page.tsx: computeFinalNet`, which **does** apply 18% GST when computing an order's final net for display/search (`taxable = subtotal - totalDiscount; gstAmt = floor(taxable * 0.18)`). These two GST treatments are not reconciled in the frontend — don't assume one is authoritative without checking the actual order total returned by the backend.

### 8.2 Sales pipeline (`sales-handling`)

Stages, in order: `enquiry → needAnalysis → proposalPriceQuote → negotiationReview → closedWon → projectCodeCreation`, with `closedLost` reachable from any active stage.

- Cannot drag a card back to `enquiry` or `needAnalysis` once past them (`LOCKED_BACK_STAGES`).
- Cannot move a card **out of** `projectCodeCreation` at all ("Cannot move back from Project Code Creation stage!").
- Moving into `projectCodeCreation` requires the order to have already completed `closedWon` — if not, the UI offers to mark it Closed Won first before proceeding.
- `closedLost` requires a typed **reason** and an explicit confirmation checkbox ("I understand this is permanent"); it is terminal — no stage transitions are allowed afterward.
- `closedWon` requires a **comment** (required) and accepts an optional supporting document.

### 8.3 Operations pipeline (`operation-handling`)

Stages: `todo → projectExecution → onRoad → clientClosure → closedWon / closedLost`, plus `vehicleUnavailable` as a parallel lane.

- Cannot drag a card back to `todo` or `projectExecution` once past them.
- Cannot drag a card **into** `vehicleUnavailable` manually — that lane is populated automatically as a history/log view of vehicles marked unavailable, not a destination stage.
- Same `closedWon`/`closedLost` rules as the sales pipeline (comment/reason + document, `closedLost` terminal).
- **Extra KM / hours**: recorded per driver/vehicle entry, requires both a from- and to-date within (or informed by) the vehicle's campaign date range, and at least one of extra KM or extra hours must be > 0.
- **FOC (free-of-charge) tracking**: `campaignClosureArray` entries of `type === "foc"` are considered "pending" until explicitly given a non-pending `status`; a card shows a pending-FOC indicator until resolved.
- **File uploads** for closure documents: images (`jpeg/jpg/png/webp`) capped at 5 MB, other documents (PDF) capped at 10 MB (`sales-handling/page.tsx` constants — mirrors validation likely duplicated in operation-handling; verify both if changing limits).

### 8.4 Customer & order validation

- Individual customers require name, a valid 10-digit Indian mobile number (`^[6-9]\d{9}$`), and a valid email.
- Organization customers additionally require company/client/designation details and, if GST is provided, must pass GSTIN format validation and **server-side verification** (`gstdetails/verify`) before the order can proceed — verification auto-fills the business name from the GST registry response.
- Switching between "individual"/"organization" customer category preserves each category's form values independently (so toggling back and forth doesn't lose data) and resets the customer selection + GST verification state.

### 8.5 Auth & session

- JWT stored in a **non-httpOnly** cookie (`adminToken`, `SameSite=Strict`, 7-day `max-age`) — readable/writable from client JS, not a secure-cookie pattern.
- Client-side auto-logout: `useAuthGuard` decodes the JWT payload's `exp` and schedules a `setTimeout` to clear the token and redirect to `/admin/signin` exactly when it expires (in addition to normal expiry handling the backend presumably also enforces).
- No role-based UI gating was found — the JWT payload carries a `role` field, but nothing in the frontend branches on it to show/hide admin features; all authenticated admin users see the same sidebar/modules.

## 9. Development Standards

### 9.1 Coding conventions

- Functional components + hooks throughout; no class components.
- `"use client"` is declared at the top of any file using state/effects/browser APIs — Server Components are the default but are only really exercised by simple layout/static files.
- TypeScript is used inconsistently in the newer business modules: many files under `operation-handling/`, `sales-handling/`, and `order-creation/` start with `/* eslint-disable */` and `// @ts-nocheck`, effectively writing plain JS-in-`.tsx`. Older/template-derived code (components/ui, components/form) is properly typed. When editing a `@ts-nocheck` file, match its existing (untyped) style rather than introducing partial typing that the rest of the file doesn't have — or, if asked to improve it, do so file-at-a-time rather than half-typing.

### 9.2 Naming conventions

- Components: `PascalCase.tsx` (`PromoterFormModal.tsx`). Route files: Next.js-mandated `page.tsx`/`layout.tsx`.
- A few filenames are inconsistent case (`driverFormModal.tsx`, `cityselect.tsx`, `orderdetails.tsx` — lowercase-first) — don't "fix" the casing incidentally while making unrelated changes; it can break imports on case-sensitive filesystems/CI (`forceConsistentCasingInFileNames` is on in `tsconfig.json`).
- Context hooks follow `useX` returning from `XContext`/`XProvider` (`useSidebar`, `useTheme`, `useSearch`, `useVehicle`).

### 9.3 File organization

- Each admin CRUD module is self-contained in its own folder under `src/app/admin/<module>/` with `page.tsx` + `*FormModal.tsx` (+ exported entity interface) + `DeleteModal.tsx`.
- Larger pipeline modules (`sales-handling`, `operation-handling`) keep one file per kanban tab/modal in a flat folder rather than nested subfolders — follow that flat convention when adding a new tab/modal rather than introducing a new nesting scheme.

### 9.4 Error handling

- No centralized error boundary or API error normalization. Pattern is: `try { ... } catch (err: any) { toast.error(err.message || err?.response?.data?.message || "fallback") }` (or, in older code, a plain `alert(...)`). Match whichever pattern the surrounding file already uses (`react-hot-toast` in newer files, `alert` in `AdminOrderForm.tsx`, `react-toastify` in the older Vehicles pages).

### 9.5 Logging

- `console.log`/`console.error` calls are scattered through business logic (e.g. `console.log("order", order)` in `AdminOrderForm.tsx`) — there is no logging abstraction. Don't assume any of these are intentional instrumentation; feel free to remove ones you introduce, but leave pre-existing ones unless asked.

### 9.6 Code reuse guidelines

- Before adding a new fetch helper, form field, or modal shell, check whether `reusableFormField.tsx`, `components/form/*`, or `components/ui/*` already covers it.
- Stage/status color/label maps (`STAGES`, `SALES_STAGES`, `STAGE_MAP`) and formatters (`fmt`, `fmtDate`) are currently **redefined per-file** rather than shared — when adding a new file to `sales-handling`/`operation-handling` that needs these, check whether the existing per-file copies are close enough to import/re-export rather than writing a fourth copy.

## 10. Environment Setup

### 10.1 Installation

```bash
cd Roadshow_Frontend
npm install          # use --legacy-peer-deps if peer-dependency errors occur
```

### 10.2 Environment variables (`.env`)

| Variable | Purpose | Consumed by |
|---|---|---|
| `NEXT_PUBLIC_API_BASE` | Base URL for (almost) all API calls; must end with `/` | `baseurl.js` → `API_BASE` |
| `NEXT_PUBLIC_MAX_DISCOUNT_PERCENT` | Max % of subtotal that manual discounts can reduce (default `15`) | `VehicleFormModal.tsx` (pricing calc) |
| `NEXT_PUBLIC_DEFAULT_PROMOTER_CHARGE_PER_DAY` | Default promoter day-rate suggestion | promoter-related forms |

`src/BaseUrl.tsx` is a second, hardcoded (non-env) base URL used only by the two `Vehicles/*` pages — see §4.3.

### 10.3 Development commands

```bash
npm run dev     # next dev --webpack — starts local dev server
npm run lint    # eslint .
```

### 10.4 Production build commands

```bash
npm run build   # next build
npm run start   # next start (serve the production build)
```

There is **no test command** — no test runner/framework is configured in this repo.

## 11. Important Files

| Path | Responsibility |
|---|---|
| `src/middleware.tsx` | Edge auth gate for all `/admin*` routes |
| `src/app/utils/auth.tsx` | Cookie get/set/clear for `adminToken` |
| `src/app/utils/useAuthGuard.tsx` | Client-side JWT expiry watchdog + redirect |
| `baseurl.js` (repo root) | Primary API base URL (env-driven) |
| `src/BaseUrl.tsx` | Secondary/legacy hardcoded API base URL (Vehicles pages only) |
| `src/app/admin/admin_Layouts/AdminLayout.tsx` | Composes all admin-only context providers + sidebar/header shell |
| `src/context/*.tsx` | Theme, Sidebar, Search, VehicleType global state |
| `src/app/admin/order-creation/AdminOrderForm.tsx` | Order wizard orchestrator + submit payload assembly |
| `src/app/admin/order-creation/VehicleFormModal.tsx` | Per-vehicle pricing engine (`calcPricing`) + line-item form |
| `src/app/admin/sales-handling/page.tsx` | Sales pipeline kanban (stage config, drag rules, order list) |
| `src/app/admin/operation-handling/page.tsx` | Ops pipeline kanban (stage config, drag rules, order list) |
| `src/app/admin/operation-handling/OnRoadTab.tsx` | Live GPS ("vamosys") + on-road execution tracking |
| `src/app/admin/AdminSelectOptions.json` | Shared enum/option data: vehicle status, remarks, cities, states, package option lists |
| `src/app/utils/collection.json` | Shared option lists (languages, designations) |
| `src/app/globals.css` | Tailwind import + design tokens (`@theme`) |
| `src/icons/index.tsx` | Barrel export of all SVG icon components |

## 12. Current Project Status

### Completed / functional modules

- Admin auth (signin/signup, cookie JWT, edge middleware, client expiry guard).
- Admin CRUD: Staff Admin, Driver, Promoter, Package Management — all fully wired to the backend with list/create/edit/delete.
- Order creation wizard (customer → vehicles/pricing → summary), including live pricing preview, GST verification, print output (`print.tsx`), and multipart submission with campaign images/videos.
- Sales pipeline kanban (`sales-handling`) — drag-and-drop stage transitions, per-stage detail drawer, code creation tab, stage-lock business rules.
- Operations pipeline kanban (`operation-handling`) — drag-and-drop, on-road tracking with live vehicle locations, extra-km/hours, vehicle-unavailable tracking, client closure, closed-won/lost with document upload.
- Vehicle fleet: onboarding + inventory pages (using the legacy `BaseUrl.tsx`).
- Generic admin dashboard/template pages inherited from the "Adinn" starter (charts, tables, calendar, profile, modal examples) — still present under `src/components/` and referenced from the sidebar's "Tables"/"Charts" sections; largely template demo content rather than roadshow-specific features.

### Partially completed / demo modules

- **Public site** (`src/app/page.tsx`, `src/app/roadshow/**`): marketing home page and `VehicleDetails`/`my-bookings` pages render **hardcoded/sample data** (see the `SAMPLE JSON DATA` block in `my-bookings/page.tsx`) — no `fetch`/API calls exist in these files. This is a UI-only preview, not a working customer booking flow yet.
- Several template-inherited dashboard widgets (`RecentOrders`, `BasicTableOne`, ecommerce cards) still reference their original demo/sample data rather than roadshow domain data — check each before assuming it's live.

### Not yet identifiable as separate modules

No other planned/future modules are documented anywhere in this repo (no roadmap, issue tracker, or TODO file was found) — don't infer future scope beyond what's above.

## 13. Known Technical Debt

- **Two backend-base-URL conventions** (`baseurl.js` env-driven vs. `src/BaseUrl.tsx` hardcoded) with different slash conventions — a real risk of hitting the wrong environment if a file is copy-pasted across the boundary. Prefer consolidating on `baseurl.js` for any new code.
- **Widespread `// @ts-nocheck` / `/* eslint-disable */`** across ~35 files, concentrated in the highest-business-value modules (`sales-handling`, `operation-handling`, `order-creation`). TypeScript's safety net does not apply there today.
- **Very large single-file components**: `sales-handling/page.tsx` (~2,350 lines), `order-creation/VehicleFormModal.tsx` (~1,840 lines), `sales-handling/SalesDetailDrawer.tsx` (~1,700 lines), `operation-handling/LiveVehicleRow.tsx` (~1,070 lines). Prefer surgical edits over full-file rewrites in these.
- **Duplicated stage/format helpers**: `STAGES`/`SALES_STAGES`, `STAGE_MAP`, `fmt`, `fmtDate` are each redefined locally in multiple files instead of being imported from one shared module.
- **Inconsistent GST handling**: pricing preview (`VehicleFormModal.calcPricing`) hardcodes `gstAmount = 0`, while `operation-handling/page.tsx`'s `computeFinalNet` applies a hardcoded 18% GST — these two code paths disagree and neither reads a GST rate from config/the backend.
- **Two closely-named files that look like an in-progress rewrite**: `operation-handling/ClientClosureTab.tsx` and `ClientClosureTabsecond.tsx` coexist — confirm which is actually rendered by `operation-handling/page.tsx` before editing "the" client closure tab.
- **Mixed HTTP clients** (`fetch` vs `axios`) and **mixed toast libraries** (`react-hot-toast` vs `react-toastify`) with no enforced convention — pick whichever the file you're editing already uses.
- **Manual JWT decoding** (`atob` + `JSON.parse`) in `useAuthGuard.tsx` duplicates what the already-installed `jwt-decode` package would do more safely.
- **Non-httpOnly auth cookie**: the JWT is stored in a client-readable cookie, which is an XSS exposure surface — flag this if asked to review auth security, but changing it is a backend+frontend contract change, not a quick frontend fix.
- **Public booking flow is not integrated with the backend at all** (hardcoded sample data) — treat any "make the booking page work" request as a build-from-scratch integration task, not a bug fix.

## 14. Debugging Guide

### Common issues & where to look

- **"Login redirects in a loop" / stuck on signin**: check `src/middleware.tsx` matcher (`/`, `/admin`, `/admin/:path*`) and `useAuthGuard.tsx` together — they must agree on the cookie name (`adminToken`) and redirect target (`/admin/signin`).
- **"Pricing looks wrong"**: check `VehicleFormModal.tsx: calcPricing` first (line-item level; discount cap logic is non-obvious — see §8.1) and `operation-handling/page.tsx: computeFinalNet` second (order-level GST) — a mismatch between the two is expected today, not necessarily a new bug.
- **"Can't drag a card to stage X"**: check the `LOCKED_BACK_STAGES` / explicit stage-guard `toast.error(...)` blocks in `sales-handling/page.tsx` or `operation-handling/page.tsx` before assuming a bug — several transitions are intentionally blocked (§8.2, §8.3).
- **"Fetch returns data but the UI shows nothing"**: check for double-nested envelopes (`data.data.data`) — this bit at least the promoter list; verify the exact shape at the call site rather than assuming `data.data`.
- **"Works with `baseurl.js` but not on the Vehicles pages" (or vice versa)**: you're almost certainly looking at the `src/BaseUrl.tsx` hardcoded-URL path — check which base-URL import the file uses (§4.3) and whether `.env`'s `NEXT_PUBLIC_API_BASE` actually points where you expect.
- **SVG import errors**: confirm `next.config.ts`'s SVGR rule covers the loader you're running under (webpack vs Turbopack) — both are configured, but if one is edited without the other, only one runtime dev mode will pick it up.

### Frequently modified files (per module, based on where business logic concentrates)

- Sales pipeline: `sales-handling/page.tsx`, `SalesDetailDrawer.tsx`, `CodeCreationTab.tsx`.
- Operations pipeline: `operation-handling/page.tsx`, `LiveVehicleRow.tsx`, `OnRoadTab.tsx`, `ProjectExecutionTab.tsx`.
- Order creation/pricing: `order-creation/VehicleFormModal.tsx`, `AdminOrderForm.tsx`, `CustomerDetailsStep.tsx`.

## 15. Developer Guidelines

### Things to avoid

- Don't introduce a third base-URL convention — use `baseurl.js`'s `API_BASE` unless you're specifically working inside `Vehicles/Vehicle_Onboarding` or `Vehicles/Vehicle_Inventory`, where the existing file already uses `BaseUrl.tsx`.
- Don't "fix" `@ts-nocheck`/`eslint-disable` files into strict TypeScript as a side effect of an unrelated change — it's a large, separate undertaking in files this size; do it only if explicitly asked, and scoped to one file at a time.
- Don't rename/re-case existing filenames (`driverFormModal.tsx`, `cityselect.tsx`, etc.) opportunistically — casing changes can silently break imports on case-sensitive environments.
- Don't assume the two `PipelineHistoryTab.tsx` files (one in `sales-handling`, one in `operation-handling`) or the two `ClientClosureTab*.tsx` files are interchangeable or that one is dead code without checking which is actually imported by that module's `page.tsx`.
- Don't wire the public site's mock data (`VehicleDetails`, `my-bookings`) to real APIs unless asked — it's an intentionally separate, unfinished surface (§12).

### Existing design patterns to follow

- CRUD module shape: `page.tsx` (list + fetch + state) + `<Entity>FormModal.tsx` (create/edit, exports the entity type) + `DeleteModal.tsx` (confirm delete) — replicate this for any new simple resource.
- Kanban pipeline shape: a `STAGES`/`SALES_STAGES` config array + `STAGE_MAP` lookup + `OrderCard`/`StageColumn` components + drag handlers with explicit stage-transition guards — replicate this for any new pipeline-style feature rather than inventing a new state-machine pattern.
- Manual bearer-token attachment and `{ success, message, data }` envelope handling on every API call — keep new calls consistent with this even though it isn't abstracted into a shared client.

### Best practices specific to this project

- Always check `NEXT_PUBLIC_MAX_DISCOUNT_PERCENT`/other env-driven business constants before hardcoding a number that already has an env var.
- When touching pricing or GST logic, check both `VehicleFormModal.calcPricing` and `operation-handling`'s `computeFinalNet` — they are easy to change in only one place and silently diverge further.
- When adding a new pipeline stage or sub-route, mirror the existing `admin/pipeline/:orderId/...` vs `sales/pipeline/:orderId/...` split rather than merging the two pipelines' routes.

## 16. Claude Code Working Instructions

- Always understand existing code before generating new code — read the relevant module's `page.tsx` and sibling files first; this codebase has enough local convention variance (see §13) that assuming a "standard" React/Next pattern will often be wrong for a specific file.
- Reuse existing components and APIs whenever possible — check `reusableFormField.tsx`, `components/ui/*`, `components/form/*`, and the existing endpoint inventory (§7) before adding new ones.
- Never duplicate business logic — especially pricing (`calcPricing`), stage-transition rules, and GST calculation. If a rule needs to change, find every place it's duplicated (this file's §8/§13 note the known duplicates) and update them together, or explicitly flag to the user that you're only updating one of several copies.
- Follow the existing architecture — two-pipeline model (sales vs. operations), context-provider composition in `AdminLayout`, manual fetch/axios + bearer-token pattern. Don't introduce a new state-management library, API client, or routing convention without discussing it first.
- Minimize breaking changes and preserve backward compatibility — this is a live internal tool; avoid renaming API-facing field names, cookie names, or route paths without explicit instruction.
- Explain architectural decisions before major refactoring — e.g., before consolidating the two base-URL modules, deduplicating stage configs, or converting `@ts-nocheck` files to strict TypeScript, describe the plan and get confirmation, since these touch many files at once.
- Suggest improvements without changing unrelated code — if you spot an issue outside the scope of the current task (e.g., another instance of the GST inconsistency), mention it rather than fixing it inline.
- Keep responses concise unless detailed explanations are requested.
