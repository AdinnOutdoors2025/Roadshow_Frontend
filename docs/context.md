# Project Context — Adinn Roadshow Frontend

_Last updated: 2026-07-23 (session end via /bye)_

## 1. Current Project Status

- Repo: `Roadshow_Frontend` (Next.js 16 / React 19 / TypeScript, App Router). Full architecture, stack, and conventions are documented in `CLAUDE.md` at the repo root — treat that file as the primary source of truth and this doc as a running session/status log on top of it.
- Current branch: `arun_claude`, up to date with `origin/arun_claude`.
- Working tree (per `git status` at session end):
  - Modified: `src/app/roadshow/VehicleDetails/page.tsx`, `src/app/roadshow/my-bookings/page.tsx`.
  - Untracked: `.claude/`, `CLAUDE.md`, `docs/`, `src/app/contact/` (new page).
- This session covered three pieces of work on the public Roadshow site: (1) building a new `/contact` page from a Figma frame, (2) two small UI/animation polish fixes on `/roadshow/my-bookings`, and (3) two passes of Figma-accuracy + animation-quality work on the homepage's "Why Adinn Roadshows Works Best" section — see §2 and §7 for the important caveat on (3).

## 2. Completed Tasks

### a) Contact Us page (`src/app/contact/page.tsx`) — new file
- Implemented from Figma (`Road-Show-2`, frame "Desktop - 4", node `3108:14056`) via `get_design_context`/`get_screenshot`.
- Route `/contact` previously had no page file even though `Navbar.tsx` and `Footer.tsx` already link to it — this was a genuine gap, not a redesign.
- Content: hero heading, Service pill-selector, contact details form (Name/Contact/Email/Preferred Location), Campaign Dates, Message textarea, gradient-text + circular-arrow Submit control (matches the existing black→red hover convention from `VehicleDetails`).
- Navbar/Footer are not duplicated — the root layout (`src/app/layout.tsx`) already renders them globally, and the Figma frame's own header/footer chrome is that same global chrome.
- No backend wiring — local-state validation (name/contact/email required) + inline success/error message only, consistent with the rest of the public site being presentation-only (`CLAUDE.md` §12/§13). Flagged as a candidate for real API wiring if/when requested.
- Validated: `tsc --noEmit` clean, `eslint` clean, `/contact` → HTTP 200.

### b) `/roadshow/my-bookings` — two small fixes on top of prior sessions' work
- Status-tab switching now animates via one shared, ref-tracked, absolutely-positioned white pill (CSS `left`/`width` transition, no-bounce `cubic-bezier(0.22, 1, 0.36, 1)`-style easing) instead of an instant `bg-white` swap. Framer Motion was checked and confirmed **not installed**, so this was built without adding a dependency.
- Reduced the oversized horizontal gap between the date/duration/vehicle-details block and the Estimated Total column via `xl:justify-self-end` on the details block only — grid-template-columns, gaps, and the View Details button position were left untouched.
- Validated: `tsc --noEmit` clean, `eslint` clean (only the 2 pre-existing unrelated `<img>` warnings), `/roadshow/my-bookings` → HTTP 200.

### c) Homepage "Why Adinn Roadshows Works Best" (`HomePageSections/HomePageSection1.tsx` + `.css`) — completed and validated, but see §7
Two passes of work were done and each was verified compiling/linting cleanly at the time:

1. **Softened the crossfade** (first pass): the vehicle-image crossfade felt "hard and aggressive" — reduced travel distance, scale delta, and blur, switched to a gentler easing curve, shortened durations, and synced the JS cleanup timer to match.
2. **Full rebuild** (second/third pass, in response to "doesn't match Figma / jerky / vehicle disappears / layout moves"):
   - Replaced the CSS-keyframe + `setTimeout` crossfade with a **GSAP timeline** (`gsap` is already a project dependency, used elsewhere in `GlobalSmoothScroll.tsx`), animating **only `scale`** (no opacity, no filter) between `0.94` and `1`, per explicit instruction to never fade vehicles.
   - Fixed the actual "vehicle disappears" bug: closing/deselecting a feature no longer clears the vehicle layer — the last-shown vehicle now stays visible instead of fading to nothing (tracked via a ref, not React state, so it doesn't touch the existing `activeIndex`/`exitIndex` business logic).
   - Non-current vehicle layers use `visibility: hidden` (not opacity) so transparent PNG edges can never bleed through from an inactive vehicle.
   - Feature capsules converted to real `<button aria-expanded aria-controls>` elements (keyboard accessible — they were plain `onClick` `<div>`s before), a fixed 70px icon+title header row so the title never shifts when the description reveals, description reveal via `grid-template-rows` + `overflow: hidden` only (no opacity/fade), icon resized to 45px and colors/radius corrected to match Figma's measured values.
   - Card container corrected to Figma's exact `1140×798` (was 800px height), capsule-row gaps corrected to Figma's measured ~20px.
   - `prefers-reduced-motion` respected (instant `gsap.set`, no tween).
   - Validated each time: `tsc --noEmit` clean, `eslint` clean, `/` → HTTP 200.
   - **Known accepted gap** (documented in the turn's report, not fixed): Figma's vehicle image is an absolute, bleed-positioned element (~66% of the card width, intentionally overflowing the card's right edge, clipped by it) rather than a member of a fixed-width flex column. The fix widened the vehicle area/image proportionally but did not fully restructure it to Figma's exact absolute percentages — judged a larger, riskier structural change than the explicitly-named defects, without a live browser to verify against.

## 3. Pending Tasks

See `docs/todo.md` for the actionable list. Headline items:

- **Re-verify/redo the "Why Adinn Roadshows Works Best" work** — see §7, this is the most important carry-over item.
- Public site (`src/app/page.tsx`, `src/app/roadshow/**`, now also `src/app/contact/page.tsx`) remains **UI-only with no backend integration** — hardcoded sample data / local-only form state throughout.
- `src/app/roadshow/VehicleDetails/page.tsx` shows as modified in git but was not touched in this session — worth checking what state it's actually in before assuming it's clean.
- `.claude/`, `CLAUDE.md`, and now `docs/`, `src/app/contact/` are untracked — decide whether/when to commit them.
- Several template-inherited dashboard widgets (`RecentOrders`, `BasicTableOne`, ecommerce cards) still reference demo data rather than roadshow domain data.

## 4. Current Architecture

Summarized from `CLAUDE.md` (see that file for full detail — §3–4 especially):

- Single Next.js App Router project renders two experiences: public marketing/booking-preview site (`/`, `/roadshow/*`, `/contact`) and internal admin dashboard (`/admin/**`).
- No shared API client — manual `fetch`/`axios` per call, bearer token attached manually, two competing base-URL conventions (`baseurl.js` env-driven — preferred for new code — vs. legacy hardcoded `src/BaseUrl.tsx`, used only by `Vehicles/*` pages).
- State: React Context for cross-cutting UI state (`ThemeContext`, `SidebarContext`, `SearchContext`, `vehicletypecontext`); everything else is local `useState`/`useEffect`, no caching layer (no React Query/SWR).
- Animation: GSAP (`gsap` package) is the project's real animation library, previously used only for `ScrollSmoother`/`ScrollTrigger` in `GlobalSmoothScroll.tsx`; this session's homepage work is the first place a discrete-element GSAP timeline (`gsap.timeline()`, `gsap.set()`) was used, rather than raw CSS `@keyframes`. Framer Motion is **not installed**.
- Two independent kanban pipelines back the core internal business flow: **sales pipeline** (`sales-handling`) and **operations pipeline** (`operation-handling`) — unchanged this session, see `CLAUDE.md` §3.3/§8.

## 5. Important Business Rules

(Full detail in `CLAUDE.md` §8 — unchanged this session; key points worth keeping top-of-mind:)

- **Pricing** (`VehicleFormModal.calcPricing`): subtotal = rental + promoter + RTO + extra-km + extra-hour + additional charges; discount cap = `subtotal * MAX_DISCOUNT_PCT / 100`; `gstAmount` hardcoded to 0 at this stage.
- **GST inconsistency**: `operation-handling/page.tsx: computeFinalNet` applies 18% GST at order level — does **not** reconcile with the 0-GST pricing preview. Known, unresolved divergence.
- **Sales/Operations pipeline stage guards**: see `CLAUDE.md` §8.2/§8.3 — untouched this session.
- **Customer validation**: individual — name + valid 10-digit Indian mobile (`^[6-9]\d{9}$`) + email; organization — additionally GSTIN format + server-side `gstdetails/verify`. The new `/contact` page's own name/contact/email validation is a separate, simpler local check (no GST, no backend call) since it's a marketing contact form, not the order-creation flow.
- **Auth**: JWT in a non-httpOnly cookie (`adminToken`) — known XSS exposure surface, unchanged.

## 6. Decisions Taken

- Built `/contact` as a genuinely new page (not an edit) since no page file existed at that route, despite Navbar/Footer already linking to it.
- Chose plain local-state form handling for `/contact` (no toast library, no backend call) rather than wiring a new API endpoint, consistent with the public site's existing all-mock-data posture — flagged as a decision the user may want to revisit.
- For the homepage carousel, chose **GSAP** (already a dependency) over adding Framer Motion or hand-rolled CSS `@keyframes`, per explicit instruction to use the project's existing animation library and not add new ones.
- Chose **not** to fully restructure the vehicle image's positioning to Figma's exact absolute bleed percentages (see §2c "Known accepted gap") — judged too large/risky a structural change to make without live browser verification, relative to the explicitly-named defects (jerking, disappearing vehicle, section-size stability) that were the priority.
- Standing project-level decision (from `CLAUDE.md`, carried forward): prefer `baseurl.js`/`API_BASE` for all new API-calling code; only touch `src/BaseUrl.tsx`'s convention inside the two existing `Vehicles/*` pages that already use it.

## 7. Files Modified This Session

- **`src/app/contact/page.tsx`** — new file, present in the working tree (untracked).
- **`src/app/roadshow/my-bookings/page.tsx`** — modified (tab-pill animation + card gap fix), present in the working tree.
- **`src/app/roadshow/VehicleDetails/page.tsx`** — shows as modified in `git status`, but was **not edited by this session's tasks**; its current diff was not reviewed before session end.
- **`src/components/Client/HomePageSections/HomePageSection1.tsx`** and **`HomePageSection1.css`** — ⚠️ **substantial work was completed and validated during this session** (see §2c), but by session end `git diff` against `HEAD` for both files is **empty** — the working tree currently matches the pre-session committed state. In other words, the "Why Adinn Roadshows Works Best" animation/Figma-accuracy fixes are not currently present on disk, even though they were implemented, tested (`tsc`/`eslint`/HTTP 200), and reported as done earlier in this session. If that work is still wanted, it will need to be redone from scratch next session (the design rationale and exact Figma measurements are recorded in §2c above so the same ground doesn't need re-deriving).

## 8. Known Issues

Carried from `CLAUDE.md` §13 (Known Technical Debt) — not new findings from this session:

- Two backend base-URL conventions with different slash rules.
- Widespread `// @ts-nocheck` / `/* eslint-disable */` across ~35 files (both `HomePageSection1.tsx` and the new `contact/page.tsx` intentionally follow the existing untyped convention of their neighboring files where applicable).
- Very large single-file components (`sales-handling/page.tsx`, `VehicleFormModal.tsx`, `SalesDetailDrawer.tsx`, `LiveVehicleRow.tsx`).
- Duplicated stage/format helpers redefined per-file.
- GST handling disagreement between pricing preview (0%) and order-level `computeFinalNet` (18%).
- Non-httpOnly auth cookie — XSS exposure surface.
- Public booking flow (`roadshow/**`, now also `contact`) has zero backend integration — hardcoded/local-only data throughout.
- **New this session**: the `HomePageSection1` reversion described in §7 — worth double-checking with the user next session whether that was intentional before spending time re-implementing it.

## 9. Next Session TODO

See `docs/todo.md` for the tracked list. Immediate items:

1. Confirm with the user whether the `HomePageSection1.tsx`/`.css` reversion (§7) was intentional, and if not, re-implement the "Why Adinn Roadshows Works Best" fixes using the design notes in §2c.
2. Decide whether to `git add`/commit the currently untracked `CLAUDE.md`, `.claude/`, `docs/`, and `src/app/contact/`.
3. Check what changed in `src/app/roadshow/VehicleDetails/page.tsx` (modified but not touched by this session) before assuming its state.
