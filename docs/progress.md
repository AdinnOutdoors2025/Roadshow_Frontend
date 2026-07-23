# Progress Log

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
