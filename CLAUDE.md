# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

**Roadshow Admin** is a Next.js frontend that combines two applications in one codebase:

1. A **public marketing/booking site** (`src/app/`, `src/app/roadshow/*`) where customers browse roadshow vehicles and submit campaign/booking requests.
2. An **admin back office** (`src/app/admin/*`) where staff manage vehicle inventory, drivers, promoters, packages, orders, sales pipeline, and day-to-day roadshow operations.

The codebase originated from the "Adinn" free Next.js Tailwind admin dashboard template; most template scaffolding (auth screens, generic charts/tables/UI kit) has been kept, while the business pages (`Vehicles`, `order-creation`, `sales-handling`, `operation-handling`, `promoter`, `driver`, `package-management`, `client-request-order`, `staff-admin`) are custom.

**This repository is frontend-only.** There is no backend or database code here — the app is a pure client of a REST API reached via `NEXT_PUBLIC_API_BASE`. The actual database schema and business logic enforcement live in that separate backend service, which is not part of this repo.

## Tech stack

- **Framework**: Next.js 16 (App Router), React 19, TypeScript 5 (`strict: true`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/postcss`, CSS-based config in `src/app/globals.css`, no `tailwind.config.js`), `tailwind-merge`, `prettier-plugin-tailwindcss`
- **HTTP**: native `fetch` and `axios`, used interchangeably depending on the file (see Coding standards)
- **Charts**: ApexCharts (`react-apexcharts`), plus jsvectormap for maps
- **Calendar**: FullCalendar (`@fullcalendar/*`)
- **Forms/UX**: `react-dropzone`, `flatpickr`, `react-dnd` (drag-and-drop kanban boards), `react-hot-toast` / `react-toastify`
- **PDF/export**: `jspdf`, `html2canvas`
- **Auth**: hand-rolled cookie + JWT flow (`jwt-decode`), no NextAuth/Clerk/etc.
- **Icons**: `lucide-react`, `react-icons`, FontAwesome, plus a custom SVG icon set in `src/icons`
- **Linting**: ESLint 9 flat config (`eslint-config-next`), Prettier

## Commands

```bash
npm install       # install dependencies (use --legacy-peer-deps if peer-dep errors occur)
npm run dev       # start dev server (next dev --webpack), http://localhost:3000
npm run build     # production build
npm run start     # run the production build
npm run lint      # eslint .
```

There is no test suite configured in this repo (no `test` script, no test files) — do not assume Jest/Vitest/Playwright exist.

## Environment setup

Configuration lives in a root `.env` (not committed):

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE` | Base URL of the backend REST API. Re-exported as the default export of root `baseurl.js`. All API calls are built as string-concatenation of this value with a path, e.g. `` `${API_BASE}admin` `` or `` `${API_BASE}api/getNewVehicles` `` — **note there is no leading `/` and no path-joining helper**, so `NEXT_PUBLIC_API_BASE` must itself end in `/`. |
| `NEXT_PUBLIC_MAX_DISCOUNT_PERCENT` | Max discount % allowed on an order line (default `15` if unset). Enforced client-side only in `order-creation/VehicleFormModal.tsx`. |
| `NEXT_PUBLIC_DEFAULT_PROMOTER_CHARGE` | Default per-day promoter charge (default `1000` if unset), used to compute promoter cost in order creation. |

`baseurl.js` (root) and `src/app/utils/*` both import `process.env.NEXT_PUBLIC_API_BASE` — some files reference it via `@/...` alias, others via relative paths like `../../../baseurl`, depending on file depth.

## Folder structure

```
src/
  app/
    page.tsx                 # public homepage
    layout.tsx                # root layout
    roadshow/                 # public site: CampaignRequest form, VehicleDetails/[vehicleId]
    admin/                     # admin dashboard (see Architecture below)
    utils/                     # fetch-based API modules + auth cookie helpers (not React components)
  components/
    Client/                   # public-site-only components (Navbar, Footer, HomeBanner, sections)
    ui/                       # generic UI primitives (button, modal, table, alert, badge, dropdown…)
    form/                     # form building blocks
    charts/                   # ApexCharts bar/line wrappers
    calendar/, calendars/     # FullCalendar-based components
    auth/                     # SignInForm, SignUpForm, ClientAuthModal (OTP)
    tables/, header/, common/, user-profile/, example/
  context/                    # React Context providers (Theme, Sidebar, Search, VehicleType, legacy Auth)
  hooks/                      # useGoBack, useModal
  lib/                        # roadshowVehicles.tsx (public-site vehicle data fetch/normalization)
  icons/                      # SVG icon components
baseurl.js                    # root-level API_BASE re-export
```

Inside `src/app/admin`, each business feature is a folder with `page.tsx` plus colocated, feature-specific modals/tabs/forms (not shared components) — e.g. `promoter/PromoterFormModal.tsx`, `promoter/DeleteModal.tsx` live next to `promoter/page.tsx` and are not reused elsewhere. When adding a new admin feature, follow this same colocation pattern rather than putting feature-specific components under `src/components`.

## Architecture

### Two route trees, two audiences

- **`src/app/roadshow/*`** — public client-facing pages (campaign request form, vehicle detail pages at `${baseUrl}/roadshow/VehicleDetails/[vehicleId]`). Wrapped by `src/app/roadshow/layout.tsx` (Navbar/Footer). The homepage (`src/app/page.tsx`) separately composes `src/components/Client/*` sections directly (it does not live under `roadshow/`).
- **`src/app/admin/*`** — the admin dashboard. Route groups: `(auth)` for `/admin/signin` and `/admin/signup`, `(full-width-pages)/(error-pages)` for full-bleed pages like `error-404`. Everything else is a flat feature folder under `admin/`.

### Admin provider/layout nesting

`src/app/admin/layout.tsx` → `admin_Layouts/AdminLayout.tsx` composes providers in this fixed order:

```
ThemeProvider → SidebarProvider → SearchProvider → AdminShell → VehicleProvider → {page content}
```

`AdminShell` renders `AppSidebar` / `AppHeader` / `Backdrop` and computes the main-content left margin from `SidebarContext` (`isExpanded`/`isHovered`/`isMobileOpen`), but skips all chrome and renders `children` directly when the current path is `/admin/signin` or `/admin/signup`. When adding a new cross-cutting admin context, nest it inside this chain rather than creating a parallel provider tree.

### Auth model (dual-layer, admin only)

1. **Edge middleware gate** (`src/middleware.tsx`): reads the `adminToken` cookie. `/admin` exact path redirects to `/admin/dashboard` (cookie present) or `/admin/signin` (no cookie); all other `/admin/*` routes redirect to `/admin/signin` if unauthenticated; authenticated users hitting `/admin/signin`/`/admin/signup` are bounced to `/admin/dashboard`.
2. **Client-side JWT guard** (`src/app/utils/useAuthGuard.tsx` + `src/app/utils/auth.tsx`): `auth.tsx`'s `saveToken`/`getToken`/`clearToken` read/write the `adminToken` **cookie** (`SameSite=Strict`, 7-day max-age) — not localStorage. `useAuthGuard()` decodes the JWT client-side (`atob` on the payload segment, no signature check — server must still validate), redirects to `/admin/signin` if missing/expired, and sets a `setTimeout` to auto-clear the token and redirect exactly at expiry. Call `useAuthGuard()` inside a page/component when you need enforced session expiry beyond the middleware's simple presence check.

Sign-in posts `{ username, password }` to `` `${API_BASE}admin` ``; known backend error codes (`ADMIN_NOT_FOUND`, `INVALID_PASSWORD`) are mapped to friendly messages via an `ERROR_MESSAGES` lookup in `SignInForm.tsx` — extend that map rather than showing raw backend error strings.

**Legacy context**: `src/context/AuthContext.tsx` is an older, separate `localStorage`-based user/token context (`AuthProvider`/`useAuth`) with its own `loginUser`/`logoutUser`. It is superseded by the cookie + `useAuthGuard` approach above but is still present in the tree — confirm which mechanism a given feature actually relies on before changing auth behavior.

**Public-site auth is different again**: `components/auth/ClientAuthModal.tsx` implements OTP-based auth for end customers (`api/client-auth/send-otp`, `api/client-auth/verify-otp`) — unrelated to the admin JWT/cookie flow.

### API access pattern

There is no centralized API client/axios instance. Two conventions coexist:

- **Domain modules** (`src/app/utils/Adminorderapi.tsx`, `src/lib/roadshowVehicles.tsx`) export plain `async function`s that `fetch()` a URL, check `res.ok && data.success`, throw an `Error` on failure, and return `data.data` on success. Backend responses uniformly follow a `{ success, message, data }` envelope.
- **Inline fetches** — most admin `page.tsx`/modal files call `fetch`/`axios` directly inside `useEffect`/handlers rather than going through a shared module. Follow whichever pattern the surrounding file already uses; don't introduce a third pattern or a new HTTP client.

**Inconsistent path prefixing** — some endpoints are called as `` `${API_BASE}api/...` `` (e.g. `api/vehicle-types`, `api/getNewVehicles`, `api/createVehicle`) and others without the `api/` segment (e.g. `promoters`, `drivers`, `packages/`, `client-requests`, `locations`, `admin/orders`, `staff-admins`, `admin` for login). This is an existing backend routing quirk, not a typo to "fix" — copy the exact prefix used by a sibling call for the same resource rather than guessing.

Several files (`src/lib/roadshowVehicles.tsx`, large chunks of `src/app/admin/Vehicles/Vehicle_Onboarding/page.tsx`) contain large blocks of **commented-out prior implementations** left above/below the active code. Before editing, search for the actual uncommented `export`/function to confirm what's live — don't assume the top of the file is current.

### Contexts (`src/context/*`)

- `ThemeContext` — dark/light mode
- `SidebarContext` — expanded/hovered/mobile-open state that drives `AdminShell`'s layout margins
- `SearchContext` — admin header search state
- `vehicletypecontext` (`VehicleProvider`) — shared vehicle-type list for admin pages, fetched from `api/vehicle-types`
- `AuthContext` — legacy user/token context (see Auth model above)

### Path alias

`@/*` maps to `src/*` (see `tsconfig.json`). Prefer the alias for cross-folder imports; relative paths (`../../../baseurl`) are only used for the root-level `baseurl.js`/`.env` re-export.

### SVG imports

Both Webpack (`next.config.ts` `webpack()` rule) and Turbopack (`turbopack.rules`) are configured to import `*.svg` as React components via `@svgr/webpack` — `import Icon from "./foo.svg"` gives a component, not a URL.

## Business rules

- **Two distinct pipelines** model different parts of the business and must not be confused:
  - **Sales pipeline** (`sales-handling/page.tsx`, `SALES_STAGES`/`SALES_STAGE_MAP`): `enquiry` → `needAnalysis` → `proposalPriceQuote` → `negotiationReview` → `closedWon` → `projectCodeCreation`, with `closedLost` as a terminal exit stage. The kanban board disallows dragging a card backward into `enquiry` or `needAnalysis` (`LOCKED_BACK_STAGES`).
  - **Operations pipeline** (`operation-handling/page.tsx`, `STAGES`): `todo` → `projectExecution` → `onRoad` → `vehicleUnavailable` → `clientClosure` → `closedWon` / `closedLost`.
- **Order pricing**: when `needPromoter` is set, promoter cost = `NEXT_PUBLIC_DEFAULT_PROMOTER_CHARGE` (default ₹1000) × `totalDays` × `promoterQuantity`, computed client-side in `order-creation/VehicleFormModal.tsx`.
- **Discount cap**: order-line discounts are capped client-side at `NEXT_PUBLIC_MAX_DISCOUNT_PERCENT` (default 15%) in the same file — this is UI-level validation, not a guarantee the backend also enforces it.
- **Vehicle availability**: a vehicle registration's live status is tracked via `statusAvailability.currentStatus` (observed values: `"Available"`, `"Booked"`), and can be force-disabled via an `activeStatus: false` flag independent of `currentStatus`.
- **Vehicle media**: onboarding captures exactly 5 fixed image slots — `frontViewImage`, `leftSideImage`, `rightSideImage`, `rearViewImage`, `interiorImage` — plus one `demoVideo`. `src/lib/roadshowVehicles.tsx` falls back to `/images/Truck_Image.jpg` (`FALLBACK_VEHICLE_IMAGE`) when a vehicle has no resolvable images.
- **Upload size limits** (sales-handling document/photo uploads): images (`jpeg`/`jpg`/`png`/`webp`) ≤ 5MB, other documents ≤ 10MB (`IMAGE_MAX_MB`/`DOC_MAX_MB` in `sales-handling/page.tsx`).
- **GST verification**: `order-creation/CustomerDetailsStep.tsx` posts to `gstdetails/verify` to validate a customer's GST number during order creation.

## Data entities (inferred from frontend contracts)

There is no schema file in this repo — the shapes below are reconstructed from TypeScript interfaces and API payloads actually used in the frontend. Treat as a guide, not an authoritative schema; the source of truth is the backend repo.

- **Admin user** (`_id`, `name`, `email`, `phone`, `userType`, `status` — see legacy `AuthContext.User`; login itself uses `username`/`password` and returns a JWT plus `{ id, username, role }`).
- **Vehicle / VehicleType** — vehicle types fetched from `api/vehicle-types`; individual vehicle "groups" (a model, with per-registration-plate instances) fetched from `api/getNewVehicles` / `api/getVehicleGroupByType/:typeId`, each registration having its own `statusAvailability` and media fields (see Business rules above).
- **Order / SalesOrder** (`sales-handling/page.tsx`, `SalesOrder` interface) — `_id`, `orderId`, customer fields (`name`, `phone`, `email`, `address`, `customerType`, `customerCategory`, `companyName`, `clientName`, `designation`, `gstNumber`), `salesPipelineStatus`, `salesHandlerName`, financials (`grandTotal`, `grandGst`, `salesNegotiationFinalAmount`), and per-stage arrays (`bookingItems`, `needAnalysisArray`, `proposalArray`, `salesNegotiationArray`, `closedWonArray`, `closedLostArray`, `salesPipelineLogs`, plus comment/log arrays per stage).
- **Package** — CRUD via `packages/`, toggled active/inactive via `packages/:id/toggle`, associated with a vehicle type.
- **Promoter / Driver / Staff Admin** — parallel CRUD resources (`promoters`, `drivers`, `staff-admins`), each with its own `page.tsx` + `*FormModal.tsx` + `DeleteModal.tsx` triplet.
- **Client request** — a customer-submitted booking/campaign request (`client-requests`), which admin order-creation can convert into an order (`order.selectedClientOrder`), updating its status via `client-requests/:id/status`.

## Important APIs

All paths are relative to `NEXT_PUBLIC_API_BASE` (see the prefix-inconsistency note above — copy the exact prefix from an existing caller).

| Area | Endpoint(s) |
|---|---|
| Admin auth | `POST admin` (signin), `POST register-admin` (signup) |
| Client auth | `POST api/client-auth/send-otp`, `POST api/client-auth/verify-otp` |
| Vehicle types | `GET/POST api/vehicle-types`, `PUT/DELETE api/vehicle-types/:id` |
| Vehicles | `GET api/getNewVehicles`, `GET api/getVehicleGroupByType/:typeId`, `GET api/generate-vehicle-id`, `POST api/createVehicle`, `PUT api/updateVehicle/:groupId`, `PUT api/updateVehicleStep/:groupId` |
| Vehicle registrations | `PUT api/updateRegistrationVehicle/:groupId/:reg`, `PUT api/updateRegistrationVehicleByRegNo/:reg`, `DELETE api/deleteRegistrationVehicle/:groupId/:reg` |
| Availability | `POST api/checkAvailability` |
| Orders | `GET/POST admin/orders`, `GET api/orders/:id/driver-location` |
| Client requests | `GET client-requests`, `PATCH client-requests/:id/status` |
| Packages | `GET/POST packages/`, `DELETE packages/:id`, `PATCH packages/:id/toggle` |
| Promoters | `GET/POST promoters`, `DELETE promoters/:id` |
| Drivers | `GET/POST drivers`, `DELETE drivers/:id` |
| Staff admins | `GET/POST staff-admins`, `DELETE staff-admins/:id` |
| Locations | `GET locations`, `GET locations/:state/cities` |
| Campaign types | `GET/POST admin/campaign-types` |
| GST | `POST gstdetails/verify` |

## Coding standards (observed conventions)

- `"use client"` is used liberally — most admin/interactive components are client components; only a few simple wrapper pages omit it.
- TypeScript `strict` mode is on project-wide, but individual files sometimes opt out with `/* eslint-disable */` and/or `// @ts-nocheck` (e.g. `AuthContext.tsx`) — this is an established escape hatch in this codebase for older/loosely-typed files, not a pattern to spread to new code.
- Prefer `interface` for object/prop shapes; local one-off types are fine inline.
- Component/modal files are colocated per feature (see Folder structure) rather than centralized by type.
- Tailwind utility classes are used directly in JSX; `prettier-plugin-tailwindcss` auto-sorts them — run Prettier/formatting rather than manually ordering classes.
- Some feature files are very large and monolithic (e.g. `admin/Vehicles/Vehicle_Onboarding/page.tsx` is several thousand lines with multiple wizard steps, form state, and API calls in one file). Match the existing file's internal organization when editing rather than unilaterally splitting it up mid-task.

## Development guidelines
- Give the corrected full code without affecting the current UI styles and formats and functionalities and suggest where i need to changed the code also.
- When adding a new admin feature, mirror an existing one end-to-end: a folder under `src/app/admin/<feature>/` with `page.tsx`, a `*FormModal.tsx`, and a `DeleteModal.tsx` if it's a CRUD resource.
- When touching auth, be explicit about which of the three auth mechanisms you're modifying (admin cookie+JWT, legacy `AuthContext`, or client OTP) — they are independent and easy to conflate.
- When adding an API call, check whether a domain module already exists for that resource (`src/app/utils/*`, `src/lib/*`) before adding another inline `fetch` — but if every other call site for that resource is inline, stay consistent with the file you're editing.
- Confirm which code in a file is actually active before modifying it — commented-out legacy versions are common (see API access pattern above).
- New environment-driven business constants should follow the existing `parseFloat(process.env.NEXT_PUBLIC_X || "<default>")` pattern used for discount/promoter charge, so a missing `.env` value degrades gracefully instead of crashing.

## Do's and Don'ts

**Do:**
- Reuse the `{ success, message, data }` response envelope convention when calling or mocking the API.
- Keep new admin routes under `src/app/admin/*` and gated by the existing middleware matcher (`/admin/:path*`).
- Use the `@/*` path alias for new imports.
- Check both `statusAvailability.currentStatus` and `activeStatus` when reasoning about whether a vehicle registration is bookable.

**Don't:**
- Don't add a new global HTTP client or replace `fetch`/`axios` usage wholesale — this codebase deliberately (if inconsistently) mixes both; a large-scale swap is out of scope for incremental changes.
- Don't trust client-side validation (discount cap, promoter charge, JWT expiry check) as the sole enforcement point — it exists for UX only; the backend is the real authority and isn't visible from this repo.
- Don't delete commented-out blocks you don't understand without checking git history/asking — some are dead code, but treat them as intentional until confirmed otherwise.
- Don't assume `NEXT_PUBLIC_API_BASE` has a leading or trailing slash normalized for you — path construction is plain string concatenation throughout the codebase.
- Don't add automated tests assuming an existing test runner — none is configured; if tests are requested, a runner needs to be set up first.

## Future contributor guidelines

- If you touch `admin/Vehicles/Vehicle_Onboarding/page.tsx` or `sales-handling/page.tsx` (both very large, multi-thousand-line files), read the relevant section in full before editing rather than pattern-matching on a snippet — state, stages, and validation logic are tightly coupled across the file.
- If you discover the backend/API contract for an endpoint differs from what's documented here (e.g. a different response envelope or path prefix), trust the live behavior over this file and consider updating this document.
- Because there is no backend in this repo, changes that appear to require new server-side validation, database fields, or endpoints cannot be completed here alone — flag that a corresponding backend change is needed rather than working around it purely in the frontend.
## Commands

```bash
npm run dev      # start dev server (Next.js, Turbopack) at localhost:3000
npm run build    # production build
npm run start    # run a production build
npm run lint     # eslint .
```

There is no test suite/framework configured in this repo (no jest/vitest/playwright, no test script). Don't assume one exists.

`npm install` may need `--legacy-peer-deps` due to jvectormap peer dependency ranges (see `overrides` in package.json).

## Environment

Config is read from `.env` via `baseurl.js` (re-exported from `NEXT_PUBLIC_API_BASE`). Key vars:
- `NEXT_PUBLIC_API_BASE` — backend API origin, **with a trailing slash** (e.g. `http://localhost:3001/`). Every call site does `` `${API_BASE}some/path` `` with no leading slash — keep that convention when adding new calls.
- `NEXT_PUBLIC_MAX_DISCOUNT_PERCENT`, `NEXT_PUBLIC_DEFAULT_PROMOTER_CHARGE` — business rule constants used in order/pricing forms.

Import the base URL as `import API_BASE from "@/../baseurl"` or the relative equivalent depending on file depth (existing files use relative paths like `../../../baseurl`, matching however many directories deep they are under `src/`).

## Architecture

This is a Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 app with **two independent front-ends sharing one codebase**:

1. **`src/app/admin/*`** — the internal admin dashboard (staff-facing). This is the vast majority of the app.
2. **`src/app/roadshow/*`** — a public/client-facing site (marketing pages, vehicle details), using components under `src/components/Client/*`. Its layout comment (`src/app/roadshow/layout.tsx`) says `src/app/(client)/layout.tsx`, a holdover from before the route was renamed from a route group to `roadshow` — the file path is the source of truth.

### Admin dashboard structure

- `src/app/admin/layout.tsx` wraps every admin route in `ThemeProvider` → `SidebarProvider` → `SearchProvider` → `AdminShell` → `VehicleProvider`. `AdminShell` (inline in that file) special-cases auth routes (`/admin/signin`, `/admin/signup`) to skip the sidebar/header chrome.
- `src/app/admin/admin_Layouts/` holds the shell chrome itself: `AppSidebar`, `AppHeader`, `Backdrop`, `AuthLayout`, `SidebarWidget`.
- `src/app/admin/(auth)/` — signin/signup pages, using components in `src/components/auth/`.
- Each business feature lives in its own top-level folder under `src/app/admin/`, following a consistent shape: a `page.tsx` (often very large — see below) plus sibling `*Modal.tsx` / `*Tab.tsx` / `Delete*Modal.tsx` files colocated in the same folder rather than under `components/`:
  - `dashboard`, `order-creation`, `sales-handling`, `operation-handling`, `client-request-order`, `driver`, `promoter`, `package-management`, `staff-admin`, `Vehicles/Vehicle_Inventory`, `Vehicles/Vehicle_Onboarding`.
  - `operation-handling` is the largest and most complex module (a Kanban-style pipeline: `todo` → `projectExecution` → `onRoad` → `vehicleUnavailable` → `clientClosure` → `closedWon`/`closedLost`, defined via a `STAGES` array in its `page.tsx`). Expect page files here in the 500–1500 line range.
- `src/context/` — app-wide React contexts: `ThemeContext`, `SidebarContext`, `SearchContext`, `vehicletypecontext` (`VehicleProvider`/`useVehicle`, fetches `api/vehicle-types` on mount).
- `src/components/` — shared UI: `ui/` (button, modal, table, dropdown, badge, alert, avatar…), `form/` (inputs, switches, group-input), `common/` (ComponentCard, PageBreadCrumb, ThemeToggleButton…), plus feature-adjacent folders (`charts`, `calendar`, `tables`, `ecommerce`, `header`, `user-profile`, `videos`).

### Auth

Token-based, not NextAuth:
- `src/app/utils/auth.tsx` — `saveToken`/`getToken`/`clearToken` store a JWT in a plain `adminToken` cookie (`document.cookie`, not httpOnly — set client-side).
- `src/app/utils/useAuthGuard.tsx` — client hook that decodes the JWT (`atob` on the payload segment, not a library) and redirects to `/admin/signin` if missing/expired; also schedules a timeout to log out exactly when the token expires. Call this hook at the top of any protected admin page.
- Sign-in posts to `` `${API_BASE}admin` `` and expects `{ success, message, data: { token, user } }`; error codes are mapped through an `ERROR_MESSAGES` dict (see `src/components/auth/SignInForm.tsx`) — extend that dict rather than showing raw backend messages.
- There is no middleware.ts — route protection is done per-page via `useAuthGuard`, not at the edge.

### Data fetching conventions

- No shared API client/interceptor layer exists; most feature files call `fetch` or `axios` directly against `` `${API_BASE}<path>` `` inline, and re-implement error handling per file. `src/app/utils/Adminorderapi.tsx` is one of the few extracted API helper modules (`checkVehicleAvailability`) — prefer extending files like this over adding more inline fetches when working in `order-creation`.
- Reads of `getToken()` + manual `Authorization` headers (and `jwt-decode` for payload inspection) are done ad hoc per component that needs them, not through a central axios instance.

### Notable file-level conventions

- Many large page/feature files start with `/* eslint-disable */` and `// @ts-nocheck` (e.g. `operation-handling/page.tsx`, root `layout.tsx`, several Vehicle pages, sales-handling/order-creation files). This is an existing, intentional pattern in this codebase for the more complex/legacy files — don't strip these directives as a "cleanup" unless asked, and don't be surprised by loose typing (`any[]` on domain models like `Order.bookingItems`) in those files.
- Tailwind v4 is configured via `@tailwindcss/postcss` (no `tailwind.config.js`); custom theme values appear as arbitrary values like `max-w-(--breakpoint-2xl)` in JSX directly.
- SVGs are imported as React components via `@svgr/webpack` (configured in both the webpack and turbopack sections of `next.config.ts`).
- Path alias: `@/*` → `src/*` (see `tsconfig.json`).

## Mandatory Module Completion QA

For meaningful feature/module implementations, track the work using:

```
[MODULE] <Module Name>
```

Do not run full QA after every edit or intermediate development step. Do not run it while a module is still being developed. The full QA workflow is a **module completion gate**, not an every-turn hook — see `COMMON_PROMPT.md` for the portable version of this policy and the full rationale.

Before marking any `[MODULE]` task complete:

1. Invoke the `module-qa` subagent (`.claude/agents/module-qa.md`).
2. Pass it: TASK_ID, the exact TASK_SUBJECT, the module name, requirements/acceptance criteria, and the relevant changed files.
3. Require Smoke, Functional, Regression, Regex/Input Validation, API, Security, and Performance testing — each category resolves to `PASS`, `FAIL`, `BLOCKED`, or `NOT_APPLICABLE`.
4. Require generated module tests under `tests/module-qa/<module-slug>/` when coverage is missing, in this repo's existing test framework (Vitest + React Testing Library for unit/functional/regex/API-shaped tests, Playwright for smoke/e2e browser flows — see `vitest.config.ts` / `playwright.config.ts`).
5. Require a QA report at `.qa/reports/<task-id>-<module-slug>.md`.
6. Require a QA status file at `.qa/status/<task-id>.json`.
7. If QA returns `FAIL` or `BLOCKED`, keep the module `IN_PROGRESS`.
8. Fix module-caused failures.
9. Rerun relevant tests.
10. Mark the task complete only when overall QA status is `PASS`.

This is enforced mechanically: a `TaskCompleted` hook (`.claude/hooks/module-qa-gate.cjs`, wired in `.claude/settings.json`) blocks completion of any task whose subject starts with `[MODULE]` unless a matching `.qa/status/<task-id>.json` reports `overall: PASS` with every required category `PASS` or `NOT_APPLICABLE`. Tasks without the `[MODULE]` prefix (bug fixes, CSS tweaks, refactors, small file updates, debugging, documentation) are never gated.


