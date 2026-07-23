# Project Context

_Last updated: 2026-07-22_

## Current project status

Roadshow Admin frontend repo is stable and under active feature/bugfix work on the public `roadshow/CampaignRequest` page and its auth context. No build/lint/test run was performed this session — changes were reviewed as diffs and applied incrementally, file by file.

## Completed tasks (this session)

1. **"Review Your Order & Confirm" popup** — Submit on `CampaignRequest` no longer saves immediately. It now validates the form (`handleReviewSubmit`) and opens a review modal (reusing the existing `Modal` / `useModal` from `src/components/ui/modal`) showing Contact Details, Selected Vehicles, and a Pricing Summary. "Edit Details" closes the modal; "Send Request" (`handleConfirmSend`) runs the original save logic (sessionStorage payload + success toast) and then closes the modal. Company Name row was intentionally **left out** — `clientDetails` has no `companyName` field anywhere in the form.
2. **Carousel prev/next buttons disable at the ends** — new `canScrollLeft`/`canScrollRight` state, driven by a `scroll`/`resize`-listening effect on `productScrollerRef`, wired to `disabled` on the nav buttons; matching `:disabled` styles added to `.rdsw_crfProdDetailsNavigationButton` in `page.css`.
3. **Vehicle quantity +/− buttons disable at limits** — "−" disables at quantity 1 (already the floor via `Math.max(...,1)`, now visible); "+" disables once quantity reaches `vehicle.availableVehicles` (confirmed as the correct cap via user decision).
4. **Selected vehicles float to the front of the carousel** — new `sortedVehicles` memo (selected first, stable order otherwise) replaces the raw `vehicles` list in the card map, combined with a plain-CSS/JS **FLIP animation** (`cardNodesRef` + `cardPositionsRef` + a `useLayoutEffect`) so cards slide (320ms ease) into their new position instead of jumping. No new dependency added (framer-motion was considered and declined).
5. **Fixed a real refresh/session bug in `AuthContext.tsx`** — `loginUser` was writing to `localStorage["roadshow_user"/"roadshow_token"]` while the mount effect and `logoutUser` read/cleared plain `"user"/"token"`. This silently broke session restore on every refresh. Fixed to consistent `roadshow_user`/`roadshow_token`/`roadshow_session_expiry` keys.
6. **Added session expiry + idle auto-logout to `AuthContext.tsx`** — login session now expires after `NEXT_PUBLIC_SESSION_DURATION_MINUTES` (default **120 min / 2 hours**, per user decision); an idle timer logs the user out and shows `"You've been logged out due to inactivity."` after `NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES` of no mouse/keyboard/scroll/touch activity (default **30 min**, per user decision).
7. **Fixed a login-popup race condition** — `AuthProvider` (parent) restores the session from localStorage in a `useEffect`, but `CampaignRequestPage` (child, deeper in the tree) fired its own "prompt login if no user" effect first on mount, before the restore had run — so the login popup opened even for an already-valid session (form fields would still populate correctly a moment later, which is what made it confusing). Fixed by adding an `authLoading` flag to `AuthContext` (`true` until the restore check completes) and having `CampaignRequestPage`'s prompt effect bail out while `authLoading` is true.

## Pending tasks

- Live-test all of the above in the browser (`npm run dev` → `/roadshow/CampaignRequest`): Submit → review popup → Send Request; carousel arrows at both scroll ends; quantity buttons at min (1) and max (`availableVehicles`); adding/removing vehicles to see the FLIP slide; refresh while logged in (popup should no longer appear); idle 30 min to confirm the auto-logout toast.
- `page.css` was modified outside this session (by the user or a linter, per tooling note) — not reverted, not yet diffed against what this session's carousel `:disabled` rule expects. Worth a quick visual check that nothing conflicts.
- No `.env` changes were made — `NEXT_PUBLIC_SESSION_DURATION_MINUTES` / `NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES` are optional overrides; defaults (120 / 30) apply if unset.

## Current architecture

See `CLAUDE.md` for the full reference. Points most relevant to this session:

- `CampaignRequestPage` (`src/app/roadshow/CampaignRequest/page.tsx`) consumes the **legacy `AuthContext`** (`src/context/AuthContext.tsx`, `localStorage`-based) — not the admin cookie/JWT flow, not the OTP customer flow. All auth work this session was scoped to that one context.
- Modal pattern: `src/components/ui/modal` (`Modal` component) + `src/hooks/useModal.ts` (`isOpen`/`openModal`/`closeModal`) — now used by both the review-order popup here and elsewhere in admin.

## Important business rules

- **Sales pipeline** (`sales-handling/page.tsx`): `enquiry → needAnalysis → proposalPriceQuote → negotiationReview → closedWon → projectCodeCreation`, with `closedLost` as a terminal exit.
- **Operations pipeline** (`operation-handling/page.tsx`): `todo → projectExecution → onRoad → vehicleUnavailable → clientClosure → closedWon / closedLost`. Distinct from the sales pipeline.
- **Order pricing**: promoter cost = `NEXT_PUBLIC_DEFAULT_PROMOTER_CHARGE` (default ₹1000) × totalDays × promoterQuantity.
- **Discount cap**: client-side only, `NEXT_PUBLIC_MAX_DISCOUNT_PERCENT` (default 15%).
- **Vehicle availability**: check both `statusAvailability.currentStatus` and `activeStatus`. `availableVehicles` (a count, distinct from `statusAvailability`) is what now caps campaign-request quantity per vehicle.
- **Uploads** (sales-handling): images ≤ 5MB, other documents ≤ 10MB.

## Decisions taken

- **Company Name row**: omitted from the review-order modal — no `companyName` field exists in `clientDetails` today; add a real input first if this is wanted later.
- **Max quantity source**: `vehicle.availableVehicles` from the vehicles API.
- **Session length**: 2 hours (`NEXT_PUBLIC_SESSION_DURATION_MINUTES`, default `"120"`).
- **Idle timeout**: 30 minutes (`NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES`, default `"30"`).
- **Reorder animation**: plain CSS/JS FLIP, no new dependency (framer-motion declined).
- **Confirm-before-edit workflow** (standing, from a prior session): propose changes before writing. This session it evolved further as requested: plain-text diff → GitHub-PR-style Artifact → VS Code diff-editor-style Artifact → finally applying directly and pointing to VS Code's own native Source Control diff/gutter instead of a separate Artifact link, one hunk at a time when asked.

## Files modified

| File | Change |
|---|---|
| `src/app/roadshow/CampaignRequest/page.tsx` | Review-order modal + handlers; carousel scroll-state effect + disabled nav buttons; quantity button disabled states; `sortedVehicles` + FLIP animation refs/effect; `authLoading` consumed in the login-prompt effect |
| `src/app/roadshow/CampaignRequest/page.css` | `:disabled` styles for `.rdsw_crfProdDetailsNavigationButton`; plus out-of-session edits by user/linter (not authored by this session) |
| `src/context/AuthContext.tsx` | Fixed `localStorage` key mismatch; added session expiry, idle auto-logout, `authLoading` flag |

## Known issues (carried forward, not caused by this session)

- `admin/Vehicles/Vehicle_Onboarding/page.tsx` and `sales-handling/page.tsx` are multi-thousand-line monolith files with commented-out legacy blocks — read fully before editing.
- API path prefixing is inconsistent (`api/...` vs bare) — existing backend quirk, not a bug to fix from the frontend.
- No test runner configured in the repo.
- Client-side-only validation (discount cap, promoter charge default, JWT expiry check, quantity cap) — backend enforcement is out of this repo's visibility.

## Next session TODO

- [ ] Run `npm run dev` and manually verify all 7 changes listed under "Completed tasks" at `/roadshow/CampaignRequest`.
- [ ] Confirm `page.css`'s externally-modified state doesn't conflict with the new `:disabled` nav-button rule.
- [ ] If Company Name is actually wanted in the review popup, add a real `companyName` field to `clientDetails` + the left-side form first.
