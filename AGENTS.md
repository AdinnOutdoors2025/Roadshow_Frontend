# AGENTS.md — Roadshow Frontend

## What this is

Next.js 16 (App Router) + React 19 + TypeScript 5 + Tailwind CSS v4 admin dashboard and public marketing site. **Frontend only** — no backend code here. Backend is a separate REST API.

## Commands

```bash
npm run dev          # next dev (localhost:3000)
npm run build        # production build
npm run lint         # eslint .
npm run test         # vitest run (unit/functional tests)
npm run test:watch   # vitest in watch mode
npm run test:e2e     # playwright test (browser e2e)
```

Install may need `--legacy-peer-deps` (jvectormap peer range issue). No CI config exists.

## Architecture: Two front-ends, one codebase

- **`src/app/admin/*`** — staff dashboard (sidebar + header chrome, JWT auth)
- **`src/app/roadshow/*`** — public marketing/booking site (Navbar + Footer via its own layout)
- **`src/app/page.tsx`** — homepage (NOT under roadshow/, mounts its own Navbar/Footer/GlobalSmoothScroll)

Admin layout nesting: `ThemeProvider → SidebarProvider → SearchProvider → AdminShell → VehicleProvider → {page}`. Auth pages (`/admin/signin`, `/admin/signup`, `/admin/forgot-password`) skip the sidebar/header shell entirely.

## Auth: two independent systems

1. **Admin auth**: cookie-based JWT (`adminToken`). Token stored via `document.cookie` (not httpOnly). Guard: `src/middleware.tsx` (role/menu permission gate) + `src/app/utils/useAuthGuard.tsx` (client-side JWT decode + session check). Both run — middleware handles route-level access, `useAuthGuard` handles expiry and mid-session deactivation.
2. **Client/public auth**: OTP-based (`src/components/auth/ClientAuthModal.tsx`). Completely separate from admin auth.

Sign-in posts `{ username, password }` to `${API_BASE}admin`. Error codes mapped via `ERROR_MESSAGES` in `SignInForm.tsx`.

## API base URL: two files, one truth

- **`baseurl.js`** (root): exports `process.env.NEXT_PUBLIC_API_BASE`. Used by admin pages via `import API_BASE from "../../../baseurl"`.
- **`src/BaseUrl.tsx`**: hardcoded `baseUrl` (currently `http://localhost:3001`). Used by some roadshow/public files.

These are **separate** — `NEXT_PUBLIC_API_BASE` must end with `/`. API paths are string-concatenated with no leading slash: `` `${API_BASE}admin` ``, `` `${API_BASE}api/vehicle-types` ``.

## Key gotchas

- **Commented-out code is everywhere.** Many files have large blocks of old implementations above/below active code. Always search for the actual active export/function before editing. Don't assume the top of a file is current.
- **`// @ts-nocheck` and `/* eslint-disable */`** are common in complex files (operation-handling, sales-handling, vehicle onboarding). These are intentional, not mistakes — don't strip them.
- **No `tailwind.config.js`** — Tailwind v4 uses CSS-based config (`src/app/globals.css`) with `@tailwindcss/postcss`. Custom values appear as arbitrary values in JSX.
- **SVGs imported as React components** via `@svgr/webpack` (configured in both webpack and turbopack in `next.config.ts`). `import Icon from "./foo.svg"` gives a component.
- **Path alias**: `@/*` → `src/*`.
- **`npm install` may need `--legacy-peer-deps`** for vectormap overrides.
- **`next.config.ts`** has both `webpack()` and `turbopack` rules for SVG — keep both in sync.
- **No centralized API client** — `fetch` and `axios` are mixed freely. Follow whichever pattern the file you're editing uses. Don't introduce a new HTTP client.

## Testing

- **Vitest** (`vitest.config.ts`): unit/functional/regex/API-shaped tests. Files: `tests/**/*.{test,spec}.{ts,tsx}`. Setup: `tests/setup.ts` (imports `@testing-library/jest-dom/vitest`). Uses jsdom, `@` alias, react + svgr plugins.
- **Playwright** (`playwright.config.ts`): browser e2e. Files: `tests/**/*.e2e.spec.ts`. Starts dev server automatically. Chromium only.
- **Module QA gate**: tasks prefixed `[MODULE]` trigger a QA workflow (`.claude/hooks/module-qa-gate.cjs`). Reports go in `.qa/reports/`, status in `.qa/status/`. Categories: smoke, functional, regression, regex, api, security, performance. Overall PASS required to complete. See `COMMON_PROMPT.md` for full policy.

## Key env vars

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_BASE` | Backend API origin (must end with `/`) |
| `NEXT_PUBLIC_MAX_DISCOUNT_PERCENT` | Max order-line discount % (default 15) |
| `NEXT_PUBLIC_DEFAULT_PROMOTER_CHARGE` | Per-day promoter cost (default 1000) |
| `NEXT_PUBLIC_CAMPAIGN_HOURS_PER_DAY` | Hours per campaign day (default 8) |

## Folder conventions

- Admin features are **colocated** under `src/app/admin/<feature>/` — `page.tsx` + `*FormModal.tsx` + `DeleteModal.tsx` siblings. Not shared under `src/components/`.
- Shared UI lives in `src/components/ui/` (shadcn-style, using `components.json` config with `base-nova` style, lucide icons).
- Roadshow public components: `src/components/Client/`.
- Contexts: `src/context/` (Theme, Sidebar, Search, VehicleType, Auth — the legacy `AuthContext` is localStorage-based, superseded by cookie+useAuthGuard but still in the tree).
- Utility/API modules: `src/app/utils/` (auth, axios interceptor, order API helpers).

## Don'ts

- Don't add a new global HTTP client or replace fetch/axios wholesale.
- Don't trust client-side validation (discount cap, JWT check) as sole enforcement — backend is authority.
- Don't delete commented-out blocks without checking git history first.
- Don't assume `NEXT_PUBLIC_API_BASE` normalization — it's plain string concatenation everywhere.
- Don't run module QA after every edit — only when a `[MODULE]` task is fully implemented.
- Don't add tests assuming Jest/Vitest/Playwright is set up — it is (Vitest + Playwright), but verify the test framework the project uses before adding new tests.

## Existing instruction files

- `CLAUDE.md` — comprehensive architecture, business rules, entity shapes, API reference. **Read it** before touching auth, orders, vehicles, or sales/operations pipelines.
- `COMMON_PROMPT.md` — module QA completion policy (stack-agnostic version of the QA gate).
- `.claude/agents/module-qa.md` — QA agent definition.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
