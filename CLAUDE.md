# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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
