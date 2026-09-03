# Progress Log

## 2026-09-03 — booking-summary PDF, PO-mail dedup, order SMS integration, contact-page mail-image & toast fixes

Cross-repo session (frontend `karthi-claude` + backend `karthi-claude`), several independent bug fixes and one new feature, done incrementally per explicit user requests (no unrequested refactors).

**Booking-summary PDF loader race** (frontend + backend): Puppeteer was capturing `/print-summary/[orderId]` while `GlobalRoadshowLoader`'s full-screen overlay was still visible/fading, producing PDFs with the loader baked in. Fixed at the root — `GlobalRoadshowLoader.tsx` now excludes `pathname.startsWith("/print-summary")` entirely — plus defense-in-depth: a new `PdfReadySignal.tsx` client component sets `window.__BOOKING_SUMMARY_READY__` once fonts/images settle, and `Utils/bookingSummaryPdfRenderer.js` waits on that flag (+ `document.fonts.ready`, + `prefers-reduced-motion: reduce` emulation) before calling `page.pdf()`.

**Duplicate campaign-request mail**: `uploadAgencyPoDocument` unconditionally called `sendCampaignRequestMail`, so a customer submitting without a PO and adding one later got two mails. Fixed with a `campaignMailSent` boolean guard on the Order model, checked/set inside `sendCampaignRequestMail` itself (`Utils/campaignMailer.js`) so it protects every call site, not just this one.

**PO document / Vehicle Onboarding storage paths separated**: PO documents now use their own top-level local folder via `PO_DOCUMENT_LOCAL_PATH` (default `public/po_doc_uploads`), no longer nested under `public/uploads` alongside vehicle images. Decision made explicitly via AskUserQuestion: separate top-level folders, no migration of existing files (new uploads only).

**Admin-edited booking dates now sync to the client-facing frontend**: `Utils/clientJourneyStages.js` gained `applyOrderDateOverrides(vehicleTypes, order)`, used in `attachTrackingSummary`/`getClientRequestTracking` so a date change made in admin order review is reflected back to the customer-facing tracking view instead of only living in the admin order document.

**Order-creation SMS (new feature)**: added Nettyfish SMS integration for order creation — `Utils/nettyfishSms.js` (shared utility: phone normalization, mode switch via `SMS_MODE`, never throws on normal failure) and `Utils/orderSms.js` (`sendOrderCreatedSms`, builds separate admin/customer messages, sends the order ID via the Adinn Outdoors DLT template). Wired into both order-creation entry points: `Adminordercontroller.js`'s `createAdminOrder` (admin-created orders) and `ClientRequestController.js`'s `createClientRequest` (customer/agency-submitted requests), both as non-fatal try/catch blocks so an SMS failure never blocks order creation. **OTP flow was explicitly left untouched** — user caught an over-eager first pass that rerouted OTP through the new shared utility and changed its template/phone-formatting; reverted per instruction to keep `ClientAuthController.js`'s original phone formatting, message text, and template ID, with only the pre-existing crash bug fixed (`NETTYFISH_API_KEY`/`SENDER_ID`/`TEMPLATE_ID` were undeclared bare identifiers instead of `process.env.*` reads — would `ReferenceError` the instant `OTP_MODE` left `"local"`) plus added `[OTP SMS]` console logging on the production branch.

**Contact page vehicle image showing "not available" in mail**: root-caused via the user's own pasted PHP source (`index_rdsw_Campaign.php`, not in this repo) — the `roadshow_contact_page` mail case never extracted `vehicleImageUrl` from the payload at all. Fixed on this repo's side: `contactEnquiryModel.js` was missing several schema fields (`userPreferredLocation`, `userStartDate`, `userEndDate`, `userPreferredVehicle`, `userPreferredVehicleImage`, `source`) that the controller was already trying to save — Mongoose strict mode was silently dropping them; added them to the schema. `ContactEnquiry.js` now forwards `userPreferredVehicleImage` to the PHP payload as `vehicleImageUrl`. **The PHP-side fix itself (adding the missing extraction line) must be applied by the user** — that file isn't accessible from this repo. A compressed-image (`sharp`, ~10-16KB, `/images/assets/mail/*.jpg`) pipeline was also built for mail-friendly images, but the user declined to push/deploy those assets yet, so `selectedVehicleImageUrl` on the Contact page currently still points at the original full-res `image` field, not the new `mailImage` field — the compressed assets and `mailImage` field exist in the codebase, unused, ready for a one-line swap-back once deployed.

**Contact page toast hidden behind Navbar**: two rounds of investigation. First pass (z-index bump + submit-delay) didn't fix it. Root cause, found from the user's own observation that other pages' shared toasts worked fine while Contact's didn't: Contact's local `<Toaster/>` was nested inside `GlobalSmoothScroll`'s transformed `#smooth-content` wrapper (`roadshow/layout.tsx`) — a `transform` on any ancestor breaks `position: fixed` for every descendant, the same trap `Navbar` already portals to `document.body` to avoid. Structural fix: moved the bespoke pill-styled Toaster out to `src/components/Notify/ContactToastProvider.tsx`, rendered by `GlobalToastGate.tsx` at root-layout level (outside the transform) instead of inline in the page.

**Next.js dev-overlay noise for "already submitted today" (409)**: `Contact/page.tsx`'s `handleSubmit` used `throw new Error(...)` for the 409/non-OK cases, which Next 16's dev overlay reports even when immediately caught. Refactored to `return` early with a new `showResultToast(kind, message)` helper instead of throwing for these expected outcomes; `catch` is now reserved for genuinely unexpected failures (e.g. `fetch` itself rejecting).

**Flagged, not fixed** (left for a future explicit request): phone-number dedup normalization mismatch in `enquiryDedup.js` (compares last-10-digits but saves the raw/untrimmed phone); inconsistent mail-failure UX between `ContactEnquiry.js` (shows error toast) and `NewsletterController.js` (always shows success even on mail failure); Order Images / Sales-order-uploads still on a flat, non-env-driven `public/uploads` path shared across a large operations surface (bigger/riskier change, deliberately out of scope here).

## 2026-08-27 — docs reconciliation (no code changes)

Docs (`context.md`/`progress.md`/`todo.md`) hadn't been touched since 2026-07-23, but the repo kept moving — ~90 frontend + ~50 backend commits from 4 contributors (`vignesh`, `karthika`, `Arun Prasath`, `SathishKumar Dhanasekaran`) merged in that gap. This entry reconciles the docs against `git log` for both repos (frontend `Roadshow_Frontend` branch `karthi-claude`, backend `roadshow_Backend` branch `karthi-claude`, both clean and in sync with origin as of today).

**Themes of the last month** (see `context.md`'s "Status as of 2026-08-27" section for the full breakdown):
- Campaign Calculator / Operation Handling: daily timeline, hours math, extra charges, handler reassign/overview, onroad-only filtering.
- Invoice generation: built → discount added → partially removed from Sales Handling → rebuilt (iterated repeatedly, current state not re-verified line-by-line).
- RTO calculation: removed and reintroduced more than once — needs a fresh confirmation with the user of intended current behavior before anyone touches it again.
- Package Management module now exists; onroad available/unavailable vehicles handling split out.
- Sales Handling notification tab (`VehicleAvailabilityNotificationTab.tsx`) added.
- Public site: home page revamp, My Bookings, Thank You page, customer-facing order/campaign-details flow, GPS tracking page rebuild, T&Cs, agency login, email PDF export, and (today, 08-27) a separate Flex/LED spec tab on the public vehicle detail modal.
- Auth/infra: CORS + baseurl fixes (recurring), client-auth model changes, admin login/profile/role-permission redesign.

**Verified still true today**:
- Per-day "Estimated (Campaign Calculator)" breakdown on Daily Timeline — still not implemented (grepped for `estimatedTotalAmount`/`perDayEstimate`, no hits). Carries forward as open.
- `.qa/status/20260812-user-auth.json` still says `BLOCKED` (reported file-loss mid-QA-run), but the files it claimed were lost (`userAuth.tsx`, `vitest.config.ts`, `playwright.config.ts`, user-auth pages) all exist on disk now — looks resolved in practice, status file just never got updated. Flagged for the user to decide whether to re-run the QA gate.

**Caveat**: this reconciliation is git-log + targeted grep level, not a full re-audit of business logic in each touched file. Treat the theme list as a map of where to look, not a verified statement of current behavior — especially for RTO and invoice logic, which changed direction multiple times.

## 2026-07-22

**Completed:**
- Generated repo-root `CLAUDE.md` via `/init` — documents tech stack, folder structure, architecture, auth model, API conventions, business rules, and endpoint reference for the whole codebase.
- Changed the vehicle-card "Add Vehicle" button on `roadshow/CampaignRequest` from white to red (`#E4002B`, hover `#B8001F`) in `page.css`.
- Changed the "Add More Vehicle" button on the same page from grey/black to blue/white (`#0057D9`, hover `#0046AD`) in `page.tsx` + `page.css`, after presenting the change as a git-style red/green diff for review.
- Established and saved a persistent workflow preference: propose edits before writing them, shown as diffs on request.

**Pending:**
- Visual confirmation of both button color changes in a running dev server.

---

**Completed (later same day):**
- Added a "Review Your Order & Confirm" popup on `CampaignRequest` Submit (Contact Details, Selected Vehicles, Pricing Summary, Edit Details / Send Request), reusing the existing `Modal`/`useModal`.
- Carousel prev/next arrows now disable at each scroll end; vehicle quantity +/− buttons disable at min (1) and max (`vehicle.availableVehicles`).
- Selected vehicles now sort to the front of the carousel, with a plain CSS/JS FLIP animation so cards slide instead of jumping.
- Fixed a real bug in `AuthContext.tsx`: mismatched `localStorage` keys were silently breaking session restore on every page refresh.
- Added 2-hour session expiry and 30-minute idle auto-logout (with toast message) to `AuthContext.tsx`.
- Fixed a login-popup race condition where the popup could open on refresh even with a valid session, via a new `authLoading` flag.

**Pending:**
- Live-test everything above in the browser (dev server not run this session).
## 2026-07-23
- Order Creation: added final vehicle-availability re-check at Submit (was only checked when adding a vehicle to the form) + surfaced the failure as `toast.error` instead of `alert`.
- Found and fixed a root-cause bug: backend `.env` work-window hours were stored as `"HH:mm"` strings but parsed with `Number()` (→ `NaN`), silently corrupting all campaign-hour math — fixed via proper `parseTimeToDecimalHour`/`istWallClock` rewrite, mirrored on the frontend for Vehicle History.
- Wired the previously-orphaned `LogHoursModal.tsx` ("Mark Absent" / Log Daily Hours) into the Campaign Calculator's Daily Timeline — it existed in code but was never rendered anywhere before this session.
- Built a role-gated FOC (Free-of-Cost extension) approval flow reusing the existing Client Closure system: super admin creates+approves instantly, any other staff submits a pending request needing super-admin approval. Applied to both "Mark Absent → Extend +1 Day" and Compensation's "Extra Campaign Days".
- Found and fixed the root cause of "FOC created but Client Closure tab shows nothing": `CampaignCalculatorTab` was never given the parent's `onRefresh`, so mutations only refreshed its own local state, leaving the shared `order` object (read by other tabs) stale.
- Widened the Client Closure tab's visibility condition (was stage-gated only) to also show whenever any FOC request exists on the order, regardless of pipeline stage — per explicit user decision that FOC requests must NOT move the pipeline stage.
- Fixed a kanban card-click bug where a pending FOC always forced the "Client Closure" tab open even for cards clicked from the "Vehicle Unavailable" column, hiding that column's own dedicated tab.
- Added "no stage move" guards for the virtual "Vehicle Unavailable" kanban column — both drag-and-drop and the modal's "Move to Client Closure" button.
- Fully reworked `CompensationModal.tsx`: conditional UI for "this date only" vs "split across a range" × hours/days type, added a modal scroll fix, and fixed two `DatePicker` bugs (popup clipped by a 2-col grid inside a scrollable modal; empty year dropdown when `maxDate` was left undefined for a future-dated range).
- Daily Timeline: added `combinedRunningHoursToday` (old + replacement vehicle running hours summed) and a `compensationStatus` per day/vehicle (applied / not-applied / this-date / split, with the matching date range), then redesigned the vehicle card's cost section into a proper "Price Breakdown" list (label-left/amount-right, bold Day Total) matching the Order Creation card's visual style.
- Verified throughout: `tsc --noEmit` stayed at the same 4 pre-existing, unrelated errors; backend controller/model reloaded clean via `node -e "require(...)"` after every change.

## 2026-07-22
- Explained Campaign Calculator's Estimated vs Actual variance table (Extra KM/Hours overage vs Rental savings) to help the user understand a real invoice discrepancy.
- Ran full business-logic audits (via subagents) of Order Creation and Sales Handling flows — found: silent discount clamping, no vehicle-availability re-check at submit, no duplicate-vehicle guard, pricing-model divergence between order-creation and operation-handling, a crash risk in `SalesDetailDrawer` on zero-booking-item orders, unclamped negotiated discounts, and several silent error catches.
- Produced a full business-improvement plan (missing workflows, new features, approval flows, dashboards) across Sales Handling / Order Creation / Operation Handling, then a second round covering handler handover, PO document versioning, and cross-cutting audit/governance needs (Tanglish request).
- Implemented, full-stack:
  - **Handler handover/reassignment** for both Sales Handling and Operation Handling — temporary/permanent reassignment, resolve (Return/Make Permanent), full audit history, reusable `DatePicker` for leave dates.
  - **PO Document correction** for Sales Handling's "PO Document" tab — open to admin + handler, versioned edit history with document preview, locked once the order reaches Project Code Creation (fixed twice: once to correct the underlying array being edited/gate location, once to gate on pipeline stage rather than array length).
- Fixed two backend bugs found during live testing:
  - Schema field misplacement (`opsHandlerAssignmentHistory` inserted into the wrong sub-schema due to a duplicate field-name match).
  - Missing field in `getOrdersByPipeline`'s `.select()` projection, which silently stripped the new fields from API responses.
- Redesigned Handover History and PO Edit History UI (card layout, status badges, document preview) and unified the design/date-picker usage between Sales Handling and Operation Handling.

## Pending
- Per-day Estimated (Campaign Calculator) breakdown on the Daily Timeline tab (vehicle-wise + day-total) — plan accepted 2026-07-23, not yet implemented.
- Live smoke-testing of the Mark Absent → FOC flow (both admin-instant and staff-pending-then-approved paths), the Compensation modal's new scope/type combinations, and the Vehicle Unavailable no-move guards.
- Live smoke-testing of the 2026-07-22 handover/PO-document flows (not yet confirmed working end-to-end beyond the bugs already caught).
- See `docs/todo.md` for the open business-logic findings not yet actioned.
