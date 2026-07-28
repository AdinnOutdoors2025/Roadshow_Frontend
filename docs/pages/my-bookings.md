# Page: `/roadshow/my-bookings`

File: `src/app/roadshow/my-bookings/page.tsx` (single-file page — data, types, icons, and sub-components all co-located; no shared imports besides React hooks).

## Purpose

Public-site (non-admin) "My Bookings" page — lets a visiting customer search, filter, sort, and page through their roadshow booking requests, and open a booking's full detail in a modal. Currently renders **hardcoded sample data** (`bookingData`) — no backend integration (see `CLAUDE.md` §12/§13). Not in scope for this page's requests to change.

## Requirements (as given across sessions — keep this list current, don't duplicate)

1. Preserve all existing data, logic, routes, filters, buttons, and functionality — this page is UI-only work, never touch `bookingData`, state logic, filtering/sorting/pagination math, or the cancel/download handlers.
2. Visual style must match the rest of the public Roadshow site — Outfit font (inherited globally, no per-file font-family needed), the site's typography hierarchy, button style, border radius, spacing, shadows, and general premium/calm tone.
3. Keep the page header (title `<h1>My Bookings</h1>` + subtitle paragraph) visually unchanged between redesign passes — only the inner content (search/filter bar, tabs, cards, pagination, empty state) and the View Details modal are in scope for restyling.
4. Booking details open in a responsive, scrollable modal (not inline below the page).
5. Do not modify: root layout, `RoadshowLayout`, Navbar, Footer, smooth-scroll wrapper, APIs, unrelated pages/routes, or business logic. Do not add dependencies.
6. When reference screenshots are supplied, they take precedence over prior styling decisions in this doc — reconcile and update the "final UI rules" below rather than layering a second, conflicting convention.

## Final UI rules (current — supersedes earlier red/black-CTA iteration)

The page went through two visual iterations. The first borrowed VehicleDetails' black-button/`#d70000`-hover/red-gradient-heading convention. Reference screenshots of the site's actual home page (vehicle cards, "Book Now" buttons, the floating navbar's segmented nav, and the GPS/RTO feature accordion) showed a calmer, lighter tone than that — light-gray pill buttons with black text, circular gray icon buttons, and a white-pill-on-gray "segmented control" selection pattern instead of solid black/red. The rules below are the reconciled, current standard for this page:

- **Font:** Outfit, inherited globally (`globals.css` `font-outfit`, `Navbar.css` `* { font-family: Outfit }`) — never set per-component.
- **Default buttons (View Details, Download Summary, Close, Contact Us, Contact Support, Clear Filters):** light-gray pill — `rounded-full bg-[#F1F2F4] text-[#1A1A1A] font-bold hover:bg-[#E4E6EA]`. No black or red button backgrounds anywhere on this page.
- **Destructive action (Cancel Request):** kept visually distinct with a soft red tint — `rounded-full bg-[#FFE9EA] text-[#D9343C] hover:bg-[#FFDCDD]` — the one intentional exception to the neutral-gray button rule, since it needs to read as "careful, this cancels the booking."
- **Selection / active state (status tabs, pagination page numbers, selected sort option):** a "segmented control" — the group sits in a light-gray pill container (`bg-[#EFEFF1]` or `bg-[#F1F2F4]`, `rounded-full`, padded), and the active item is a **white** pill with a soft shadow and black bold text (`bg-white text-[#151619] shadow-[...]`); inactive items are transparent with gray text. This mirrors the site's floating navbar, where the active nav item is a white pill on a translucent gray bar.
- **Icon circles** (calendar/clock/vehicle on cards; user/company/phone/mail/vehicle/send/support in the modal; pagination arrows; modal close button): circular (`rounded-full`), light-gray or white background, dark neutral icon color — never colored/brand-tinted.
- **Status badges** (Pending/Confirmed/Ongoing/Completed/Cancelled, on the card image and modal header): unchanged — light tinted background + colored text + colored dot per status. These are functional differentiators, not brand decoration, and already matched the reference's "rating pill" look (light bg + colored small text/icon), so they were left alone.
- **Price / total figures** (card "Estimated Total", modal "Estimated Total", vehicle row "Total"): bold black (`#151619`), not a red accent — matches the reference vehicle cards, where price is bold black and only the rating chip carries color.
- **Modal section headings** (Customer Details, Vehicles & Booking Details, Amount Summary, What Happens Next): plain bold black (`text-[15px] font-bold text-[#1A1A1A]`) with a neutral icon circle beside them — not a colored/gradient treatment.
- **Border radius:** buttons/inputs/tabs/pagination/badges are pill-shaped (`rounded-full`); cards and panels use large radii (22–28px, e.g. booking card `28px`, modal section panels `26px`, vehicle row `22px`).
- **Shadows:** soft, diffuse, low-opacity black (`rgba(0,0,0,0.05–0.16)`), never hard-edged.
- **Search input:** white pill (`rounded-full bg-white`) — kept visually distinct from gray-pill buttons since it's an input, not an action.

## Structural/behavioral changes made across passes (all logic-preserving)

- **Responsive card layout:** booking cards previously stacked all 4 info blocks (ID, dates/vehicles, total, button) into one column between `md` and `xl` breakpoints (768–1279px). Added an intermediate `md:grid-cols-2` 2×2 arrangement.
- **Filter dropdown:** closes on outside click (`filterRef` + `mousedown` listener), not just on selecting an option.
- **Empty state:** added a "Clear filters" action (calls existing `setActiveTab`/`setSearchValue`/`setCurrentPage` — no new logic), shown only when a tab/search filter is active.
- **Pagination:** page-number buttons wrap in a segmented-control pill (see above); prev/next remain separate circular buttons; wraps/centers on very small screens instead of risking overflow.
- **Tabs:** status filter tabs converted from individually-boxed buttons to one segmented-control bar (see above).
- **Modal:** already implemented as a fixed, backdrop-blurred, `overflow-y-auto` dialog (max-height 94vh, Escape-to-close, body-scroll-lock, `overscroll-contain`) — this was in place before the visual passes and was not rebuilt, only restyled.

## What was intentionally left alone

- Status badge semantic colors — see "Final UI rules" above.
- The "Need Help?" dark panel (`bg-[#17181B]`) inside the modal — an intentional contrast card, kept as-is; only its button was restyled to the neutral pill convention.
- All data (`bookingData`), types, filtering/sorting/pagination logic, cancel/download handlers, and routes — untouched, per requirement #1.
- Page header block (`<h1>My Bookings</h1>` + subtitle) — untouched, per requirement #3.

## Verification performed

- `npx tsc --noEmit` — no errors in this file (pre-existing unrelated errors in `AdminOrderForm.tsx`, `CustomerTypeStep.tsx`, `Navbar.tsx` are not from this page).
- `npx eslint src/app/roadshow/my-bookings/page.tsx` — 0 errors, 2 pre-existing `<img>`-vs-`next/image` warnings (not introduced by this change).
- Loaded the page against the running dev server (`http://localhost:3000/roadshow/my-bookings`) — HTTP 200 both before and after this pass, no error markers, header block byte-for-byte unchanged.
- Responsive breakpoints reviewed at code level for desktop (`xl`+), tablet (`md`–`lg`), and mobile (base/`sm`) — card grid, tabs (horizontal scroll), search/filter bar (stacked → row), pagination (wrap), and modal (bottom-sheet on mobile → centered dialog on `sm`+) all have explicit responsive classes.

## Known pre-existing gaps (not addressed here — out of scope)

- No backend integration — `bookingData` is hardcoded sample data (see `CLAUDE.md` §12, `docs/todo.md`).
- Uses `<img>` instead of `next/image` for vehicle photos (pre-existing lint warning, not fixed since it wasn't requested and touches file structure beyond styling).

## Update — 2026-07-22: modal portal, fill-only styling pass

Note on file state: between the previous update above and this one, the page was substantially reworked externally (outside this task) into a new `BubbleButton`/`RS_VehicleButton` component system (a red-gradient hover "bubble" effect button, driven by a `<style jsx global>` block) with an updated neutral palette (`#EFEFF2`/`#111114`/`#B20D19` etc.). That rework is out of scope for this entry — the "Final UI rules" section above no longer reflects the exact current colors/button implementation and should be treated as superseded/historical rather than corrected here, per instruction to append rather than rewrite. This update only covers the specific, scoped changes below, made on top of that existing state.

Changes made in this pass:

- **Modal now renders via `createPortal`** into `document.body` (added `import { createPortal } from "react-dom"`), instead of rendering inline in the component tree. A lazy `useState(() => typeof document !== "undefined")` guards against SSR/hydration issues — the modal returns `null` until it's safe to touch `document.body` (avoids the `react-hooks/set-state-in-effect` lint error that a `useEffect`-driven "mounted" flag would trigger).
- **Modal is always centered in the viewport**, including when the page is scrolled: the overlay is `fixed inset-0 z-[9999] grid place-items-center` (previously `flex items-end justify-center ... sm:items-center`, a mobile bottom-sheet layout). The bottom-sheet drag-handle bar (the small rounded bar shown only on mobile) was removed along with it, since it was a bottom-sheet-only affordance.
- **Body and `<html>` scrolling are both locked** while the modal is open (previously only `document.body.style.overflow` was touched; `document.documentElement.style.overflow` is now also set to `"hidden"` and restored on close/unmount).
- **Only the modal panel scrolls internally** (`overflow-y-auto overscroll-contain` stays on the inner panel, not the overlay), with `max-h-[calc(100dvh-2rem)]` so it's sized off the dynamic viewport height rather than `94vh`, leaving a small margin for the overlay's own padding.
- **The decorative underline below the "My Bookings" heading was removed** — deleted the `.RS_PageTitle::after` CSS rule (the small red bar) and its now-unneeded `padding-bottom` on `.RS_PageTitle`. The heading text/content itself is untouched.
- **Status tabs (All/Pending/Confirmed/Ongoing/Completed/Cancelled) now use `font-normal` for both the label and the count number, and both are always black text**, regardless of selected state. The selected tab is shown with a solid white fill only (`bg-white`) inside the existing gray segmented-control bar — no shadow, no ring, on either the active or inactive tab. The count chip keeps its per-status background tint (for at-a-glance grouping) but the number itself is now black, not the previous semantic color.
- **All inner/inset shadows were removed** — the one instance on the page, `shadow-inner shadow-black/[0.025]` on the tabs container, was deleted.
- **Fill-only styling enforced**: removed every `ring-1 ring-*` combination that paired a background fill with a ring — booking card, search input, Filters button, the modal panel (`sm:ring-1 sm:ring-white/70`), and the active status tab. Also removed the `outline`/`outline-offset` focus-visible rule from the shared `.RS_VehicleButton` CSS (a border-like decoration layered on top of the button's fill).
- **Filters button** is now a plain filled button with no border/ring/inner-shadow — it keeps only its existing ambient drop shadow (not a click/press shadow, which the button never had).

Verification: `npx tsc --noEmit` — no errors in this file; `npx eslint src/app/roadshow/my-bookings/page.tsx` — 0 errors after fixing one `react-hooks/set-state-in-effect` error encountered mid-change (2 pre-existing `<img>` warnings remain, unrelated); page confirmed serving HTTP 200 from the running dev server after the change. No data, filters, search, sorting, pagination logic, download/cancel actions, vehicle image, or `RS_VehicleButton`/bubble hover animation were modified.

## Update — 2026-07-22 (follow-up): full background scroll lock + real PDF download

Two scoped fixes on top of the previous entries. Layout, modal design/centering, booking data, filters, search, sorting, pagination, cancel action, vehicle image, and the `RS_VehicleButton` bubble animation were not touched.

**1. Background scrolling is now completely locked while the modal is open.** The previous fix only toggled `overflow: hidden` on `body`/`<html>`, which does not reliably block wheel/touch/keyboard (Page Up/Down, Home, End, spacebar) scroll on all browsers. The modal's scroll-lock effect now:
- Captures `window.scrollY` the moment the modal opens.
- Sets `document.body.style.position = "fixed"`, `top = -scrollY + "px"`, `left = "0"`, `width = "100%"` (the standard no-jump scroll-lock technique), in addition to `overflow: hidden` on both `body` and `document.documentElement`.
- On close/unmount, restores every inline style it touched (`position`, `top`, `left`, `width`, `overflow` on body; `overflow` on `<html>`) to its previous value, then calls `window.scrollTo(0, scrollY)` to put the page back exactly where it was — no jump, no drift.
- Only the modal's own content panel can scroll: it already had `overflow-y-auto` and `overscroll-contain` (unchanged), so internal scrolling and keyboard scrolling while focus is inside the modal both keep working normally — the fix only affects the page underneath.

**2. "Download Summary" now generates a real PDF instead of a JSON file.** The old `handleDownloadSummary` built a `Blob` of `JSON.stringify(selectedBooking)` and downloaded it as `<id>-summary.json`. It's been replaced with a client-side PDF built directly with **jsPDF** (already a project dependency — `jspdf` in `package.json`, previously used by `OrderReportPDF.tsx` via html2canvas; this page uses jsPDF's own text/line drawing API directly instead, since the content is simple structured text rather than a rendered HTML snapshot).
- The PDF is A4 portrait, generated entirely client-side via a dynamic `import("jspdf")`.
- Content, in order: a "Booking Summary" heading, then **Booking Details** (ID, status, requested-on), **Customer Details** (name, company, phone, email), **Vehicles & Booking Details** (every vehicle: name, start/end date, duration, quantity, rate/day, vehicle total — separated by a divider line between vehicles), and **Amount Summary** (subtotal, taxes & charges, estimated total).
- Section headings, label/value rows, and thin divider lines are drawn with consistent spacing; a `newPageIfNeeded()` helper checks the remaining vertical space before every block and calls `doc.addPage()` automatically when a section or vehicle wouldn't fit, so long booking lists paginate cleanly instead of overflowing the page.
- Monetary values use `toLocaleString("en-IN")` (Indian digit grouping) via a new `formatINRForPdf` helper. jsPDF's built-in "helvetica" font (WinAnsi encoding) cannot render the ₹ glyph, so the PDF uses the literal text `INR` instead of `₹` to avoid a broken/blank character — the on-screen UI's `formatINR` (₹ symbol) is untouched.
- File name: `${booking.id}-booking-summary.pdf`, e.g. `RD-20260716-024-booking-summary.pdf`.

Verification: `npx tsc --noEmit` and `npx eslint src/app/roadshow/my-bookings/page.tsx` both clean (0 errors; the 2 pre-existing `<img>` warnings remain, unrelated); page confirmed serving HTTP 200 from the running dev server after the change.
