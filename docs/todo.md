# TODO — Adinn Roadshow Frontend

_Reviewed: 2026-07-23 — see `docs/progress.md` (2026-07-23) and `docs/context.md` §2/§7 for what was done this session._

## Housekeeping

- [ ] Decide whether to commit the currently untracked `CLAUDE.md`, `.claude/`, `docs/`, and `src/app/contact/` on branch `arun_claude`.
- [ ] **Confirm whether the `HomePageSection1.tsx`/`HomePageSection1.css` reversion (working tree currently matches `HEAD`, undoing this session's GSAP/Figma-accuracy work) was intentional.** If not, re-implement the "Why Adinn Roadshows Works Best" fixes — full design rationale and exact Figma measurements are recorded in `docs/context.md` §2c so they don't need re-deriving.
- [ ] Check what's actually changed in `src/app/roadshow/VehicleDetails/page.tsx` (shows modified in git, not touched by the 2026-07-23 session).

## Product / Feature Backlog

- [ ] Integrate the public booking flow with the real backend — `src/app/page.tsx`, `src/app/roadshow/VehicleDetails`, `src/app/roadshow/my-bookings`, and now `src/app/contact` currently render hardcoded sample data / local-only form state only, with no `fetch`/API calls at all. Treat as a build-from-scratch integration, not a bug fix (per `CLAUDE.md` §13).
- [ ] `/contact` form currently only validates locally and shows an inline success/error message — no backend submission endpoint exists yet; wire one up if/when the contact flow needs to actually deliver messages.
- [ ] Homepage vehicle-showcase area (`HomePageSection1`) approximates but doesn't pixel-match Figma's absolute bleed-positioned vehicle image (~66% of card width, overflowing the card's right edge) — would need restructuring away from the current flex-column layout to match exactly; see `docs/context.md` §2c "Known accepted gap".
- [ ] Replace remaining template demo data in dashboard widgets (`RecentOrders`, `BasicTableOne`, ecommerce cards) with real roadshow data, if/when these are prioritized.

## Technical Debt (not urgent, address only if explicitly requested)

- [ ] Consolidate the two backend base-URL conventions (`baseurl.js` vs `src/BaseUrl.tsx`) — requires discussion first, touches multiple files.
- [ ] Reconcile GST calculation divergence between `VehicleFormModal.calcPricing` (0% GST) and `operation-handling/page.tsx`'s `computeFinalNet` (18% GST).
- [ ] De-duplicate stage/format helpers (`STAGES`/`SALES_STAGES`, `STAGE_MAP`, `fmt`, `fmtDate`) currently redefined per-file.
- [ ] Confirm which of `ClientClosureTab.tsx` / `ClientClosureTabsecond.tsx` is actually live before ever touching "the" client closure tab.
- [ ] Consider migrating manual JWT decode in `useAuthGuard.tsx` to the already-installed `jwt-decode` package.
- [ ] Flag (don't silently fix) the non-httpOnly `adminToken` cookie if a security review comes up — changing it is a backend+frontend contract change.
- [ ] Large single-file components that would benefit from surgical, not wholesale, refactor if touched: `sales-handling/page.tsx`, `order-creation/VehicleFormModal.tsx`, `sales-handling/SalesDetailDrawer.tsx`, `operation-handling/LiveVehicleRow.tsx`.

## Next Session

- [ ] Start by confirming the `HomePageSection1` reversion (Housekeeping, above) with the user before anything else — it determines whether this session's biggest task needs redoing.
