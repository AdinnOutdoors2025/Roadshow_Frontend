# ENV Migration Report

**Projects:** Frontend `D:\Roadshow_Admin` (Next.js) · Backend `D:\Roadshow-Backend\roadshow_Backend` (Express)
**Date:** 2026-10-16 · **Status:** changes applied locally, **nothing committed**

> No real secret values are shown in this report.

---

## 1. Environment variables added / now used

### Frontend (`D:\Roadshow_Admin\.env`)

| Variable | Type | Status | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | public | **added** | Public site URL for images in outgoing mails. Replaces the `IS_LIVE` toggle |
| `NEXT_PUBLIC_GA_ID` | public | **added** | Google Analytics ID. The script is skipped when empty |
| `NEXT_PUBLIC_CLARITY_ID` | public | **added** | Microsoft Clarity ID. The script is skipped when empty |
| `NEXT_PUBLIC_VAMOSYS_USER_ID` | public | **added** | Vamosys public tracking iframe account ID |
| `NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER` | public | existed, **now read** | WhatsApp admin number. Was hardcoded, and the env var was never read |

### Backend (`D:\Roadshow-Backend\roadshow_Backend\.env`)

| Variable | Status | Purpose |
|---|---|---|
| `MONGODB_URI` | existed, **now used** | DB connection. The connection string was hardcoded in code before |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | existed, **now used** | Cloudinary config (keys were hardcoded in code) |
| `ALLOWED_ORIGINS` | existed, **now used and updated** | CORS origins (CSV). Set to the full list that was hardcoded |
| `CORS_ALLOW_VERCEL_PREVIEWS` | **added** | Allow any `*.vercel.app` origin (default `true`, same as before) |
| `ROADSHOW_QUOTATION_APPROVAL_PASSWORD` | **added** | Quotation approval password. The hardcoded fallback was removed |
| `VAMOSYS_USER_ID` | **added** | Vamosys GPS account ID (was hardcoded in 2 files) |
| `VAMOSYS_GROUP_ID` | **added** | Vamosys group ID |
| `VAMOSYS_CONTACT_EMAIL` | **added** | Contact email for Vamosys `getVehicleExp` (was a personal email in code) |
| `VAMOSYS_CONTACT_PHONE` | **added** | Contact phone for Vamosys `getVehicleExp` (was a personal phone number in code) |
| `VAMOSYS_API_BASE_URL` | **new, optional** | Default `https://api.vamosys.com` |
| `VAMOSYS_LOCATIONS_URL` | **new, optional** | Default: the old hardcoded locations URL |
| `VAMOSYS_HISTORY_URL` | **new, optional** | Default: the old hardcoded history URL |
| `MEON_BASE_URL` | **new, optional** | Meon GST API base. Default `https://ocr.meon.co.in` |
| `JWT_SECRET` | existed, **fallback removed** | Must be set. There is no longer a hardcoded default |
| `NETTYFISH_API_KEY` | existed, **fallback removed** | Must be set. There is no longer a hardcoded default |
| `NODE_ENV` | existed, **value fixed** | Was `local //comment…`, which dotenv reads verbatim. Now `local` (same effect) |
| `LOCAL_BASE_URL` / `PRODUCTION_BASE_URL` | existed, **now also used** by `orderController.js` | Replaces the leaked `MONGODB_URI` usage |

A startup check in `VehicleMain.js` logs `❌ Missing required env vars: …` if any of these are empty: `MONGODB_URI`, `JWT_SECRET`, `INTERNAL_API_SECRET`, `ROADSHOW_QUOTATION_APPROVAL_PASSWORD`, `NETTYFISH_API_KEY`, `VAMOSYS_USER_ID`.

---

## 2. Frontend vs backend

- **Frontend public (`NEXT_PUBLIC_*`)** values are inlined into the browser bundle at **build time**. Only public IDs and URLs go there. Changing one requires a rebuild.
- **Frontend server-only:** `INTERNAL_API_SECRET`, `INTERNAL_API_BASE`. These are never exposed to the browser.
- **Backend:** every secret (DB, JWT, Cloudinary, Spaces, SMS, Meon, Vamosys account, mail APIs).
- No backend secret was put in a frontend `NEXT_PUBLIC_*` variable.

---

## 3. Files changed

### Frontend

| File | Change |
|---|---|
| `src/BaseUrl.tsx` | `IS_LIVE` toggle and mail image URLs → `NEXT_PUBLIC_SITE_URL`. WhatsApp number → env. New `VAMOSYS_TRACK_USER_ID` export |
| `src/app/layout.tsx` | GA and Clarity IDs → env. Each script renders only when its ID is set. Removed the unused `SITE_URL` and GTM constants |
| `src/app/admin/operation-handling/OnRoadTab.tsx` | Tracking iframe `userID` → `VAMOSYS_TRACK_USER_ID` |
| `src/app/roadshow/my-bookings/[bookingId]/page.tsx` | Same as above |
| `src/app/roadshow/my-bookings/[bookingId]/RouteTrackMap.tsx` | Same as above |
| `.gitignore` | Added `.env`, `.env.*`, `!.env.example` |
| `.env.example` | **New:** documented variable names, no real values |
| `.env` | 4 public variables appended (local file, not tracked) |
| git index | `.env` untracked (`git rm --cached .env`, **staged, not committed**; the file is still on disk) |

### Backend

| File | Change |
|---|---|
| `VehicleMain.js` | Mongo → `MONGODB_URI`. Removed the commented line holding the old cluster's credentials. Cloudinary → env. CORS → `ALLOWED_ORIGINS` + `CORS_ALLOW_VERCEL_PREVIEWS`. Spaces bucket → `DO_SPACES_BUCKET`. Added the startup check for required env vars |
| `controllers/VehiclesController/vehicles.js` | Cloudinary keys → env |
| `controllers/OrderController/orderController.js` | **Security fix:** `productImage` used `MONGODB_URI` as a URL base. Now uses `PRODUCTION_BASE_URL` / `LOCAL_BASE_URL` |
| `controllers/UserController/userController.js` | Removed the hardcoded JWT secret fallback |
| `Middleware/authmiddleware.js` | Removed the hardcoded JWT secret fallback |
| `controllers/roadshowQuotation/roadshowQuotationController.js` | Removed the hardcoded approval password fallback |
| `controllers/ClientAuthController/ClientAuthController.js` | Removed the hardcoded Nettyfish API key fallback |
| `Utils/vamosysClient.js` | User ID, group ID, contact email and phone → env. URLs → env with defaults |
| `Utils/vamosysHistoryClient.js` | User ID and history URL → env |
| `controllers/gstDetailController/gstDetail.js` | Meon URLs → `MEON_BASE_URL` |
| `scripts/fixRolePermissionIndex.js` | Hardcoded Mongo URI → `MONGODB_URI` (loads `.env`) |
| `.gitignore` | Added `.env.*`, `!.env.example` |
| `.env.example` | **New:** every variable documented, `[REQUIRED]` ones marked |
| `.env` | `NODE_ENV` fixed, `ALLOWED_ORIGINS` completed, 6 variables added |

---

## 4. Where each hardcoded value was found

| Value | Original location | Now |
|---|---|---|
| MongoDB connection string (live cluster) | `VehicleMain.js:203`, `scripts/fixRolePermissionIndex.js:7` | `MONGODB_URI` |
| MongoDB connection string (old cluster, commented) | `VehicleMain.js:201` | line removed |
| Cloudinary cloud name, key and secret | `VehicleMain.js:268-270`, `controllers/VehiclesController/vehicles.js:6-8` | `CLOUDINARY_*` |
| CORS origin list (15 entries) | `VehicleMain.js:142-159` | `ALLOWED_ORIGINS` (with a code default) |
| `*.vercel.app` wildcard | `VehicleMain.js:171` | `CORS_ALLOW_VERCEL_PREVIEWS` |
| JWT secret fallback | `Middleware/authmiddleware.js:20`, `controllers/UserController/userController.js:6` | `JWT_SECRET` (required) |
| Quotation approval password fallback | `roadshowQuotationController.js:31` | `ROADSHOW_QUOTATION_APPROVAL_PASSWORD` |
| Nettyfish API key fallback | `ClientAuthController.js:87` | `NETTYFISH_API_KEY` |
| Spaces bucket name | `VehicleMain.js:417` | `DO_SPACES_BUCKET` |
| Vamosys user and group ID | `Utils/vamosysClient.js:14-15`, `Utils/vamosysHistoryClient.js:11` | `VAMOSYS_USER_ID` / `VAMOSYS_GROUP_ID` |
| Vamosys personal email and phone | `Utils/vamosysClient.js:216` | `VAMOSYS_CONTACT_EMAIL` / `_PHONE` |
| Vamosys API URLs | `Utils/vamosysClient.js:31,47,134,215`, `vamosysHistoryClient.js:10` | `VAMOSYS_*_URL` (defaults kept) |
| Meon GST URLs | `controllers/gstDetailController/gstDetail.js:129,147` | `MEON_BASE_URL` |
| `MONGODB_URI` misused as image URL | `controllers/OrderController/orderController.js:167` | `PRODUCTION_BASE_URL` / `LOCAL_BASE_URL` |
| GA ID, GTM ID, Clarity ID, `SITE_URL` | `src/app/layout.tsx:13-17` | `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_CLARITY_ID` (GTM and `SITE_URL` were unused, so removed) |
| `IS_LIVE` + local/production mail image URLs | `src/BaseUrl.tsx:41-51` | `NEXT_PUBLIC_SITE_URL` |
| WhatsApp admin number | `src/BaseUrl.tsx:55` | `NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER` |
| Vamosys iframe `userID` | `OnRoadTab.tsx:912`, `my-bookings/[bookingId]/page.tsx:882`, `RouteTrackMap.tsx:29` | `NEXT_PUBLIC_VAMOSYS_USER_ID` |

---

## 5. Environment variables to update on the live server

See the **LIVE ENV UPDATE LIST** at the end for the short version. Notes:

- **Backend `MONGODB_URI` matters most.** The live backend used the **hardcoded** connection string until now and ignored this variable. If it is missing on the live server, the backend **cannot connect to the database**.
- **Backend `ALLOWED_ORIGINS`** is now actually used. The current live value may be the old 6-entry list. Set it to every frontend origin that calls the API, or those sites get CORS errors.
- **Backend `NODE_ENV`** on live must be exactly `production`, with no inline `//` comment. Otherwise every production switch (base URLs, frontend links in mails, SMS sending) silently runs in local mode.
- **Frontend:** `NEXT_PUBLIC_*` values are baked in when you **build**, so set them in the `.env` used for `npm run build` / `build:docker`, then rebuild.

---

## 6. Mandatory in production

| Side | Variable | Why |
|---|---|---|
| Backend | `MONGODB_URI` | No DB without it |
| Backend | `JWT_SECRET` | No fallback any more. Login and auth fail without it |
| Backend | `INTERNAL_API_SECRET` | Booking-summary PDF endpoint (must match the frontend) |
| Backend | `ROADSHOW_QUOTATION_APPROVAL_PASSWORD` | Quotation approval always rejects without it |
| Backend | `NETTYFISH_API_KEY` | OTP and SMS |
| Backend | `VAMOSYS_USER_ID` | GPS tracking |
| Backend | `ALLOWED_ORIGINS` | CORS for the live frontends |
| Backend | `NODE_ENV=production` | Production URLs and SMS |
| Backend | `PRODUCTION_BASE_URL`, `FRONTEND_BASE_URL_LIVE` | Links in mails and responses |
| Backend | `DO_SPACES_KEY` / `_SECRET` / `_BUCKET` / `_CDN_BASE` (when `STORAGE_TYPE=space`) | Uploads |
| Frontend | `NEXT_PUBLIC_API_BASE_LIVE` (must end with `/`) | All API calls |
| Frontend | `INTERNAL_API_SECRET` | Server-side booking-summary fetch |
| Frontend | `NEXT_PUBLIC_SITE_URL` | Mail images (falls back to the live site if unset) |

---

## 7. Hardcoded values intentionally left in code

| Value | Location | Why left |
|---|---|---|
| **`baseUrl = "http://localhost:3001"`** | `src/BaseUrl.tsx:6` | ⚠️ **Re-hardcoded by a local edit made during this task. I did not revert it.** The env-driven version is commented at lines 9-11. **Restore it before any production build**, or the live site will call `localhost`. |
| Fallback `https://roadshow-backend.onrender.com` | `src/BaseUrl.tsx:10` (in the commented env version) | Safety fallback. It doesn't match the current backend host, so review it when restoring the env version |
| Vamosys key, personal email/phone and `userId` in **browser** code | `VehicleUnavailableTab.tsx:472-474`, `OnRoadTab.tsx:208-210`, `TimelineHoursTab.tsx:214` | A `NEXT_PUBLIC_` variable would still ship them to the browser. The proper fix is to route these calls through the backend's existing Vamosys proxy, which is a functional change. **Left by decision; follow-up task** |
| `NEXT_PUBLIC_VAMOSYS_USER_ID` fallback `ADINN12` | `src/BaseUrl.tsx` | The ID is visible in the public tracking iframe URL anyway |
| Port `3001`, Dockerfile `EXPOSE`/healthcheck | `VehicleMain.js:11`, backend `Dockerfile` | Must not change ports or Docker. Already `process.env.PORT \|\| 3001` |
| `DEFAULT_ALLOWED_ORIGINS` list | `VehicleMain.js` | Fallback when `ALLOWED_ORIGINS` is unset. Same list as before, so behaviour is unchanged |
| Defaults like `DO_SPACES_REGION \|\| "sgp1"`, the bucket name, mail TO/CC defaults, Nettyfish sender/template IDs | various | Already env-driven. The defaults are not secrets |
| Business constants (GST 18%, RTO 30 days, discount %, promoter charge, work hours) | `src/BaseUrl.tsx`, admin pages, backend controllers | Business rules, not environment config |
| Public map, routing and geocoding endpoints (OpenStreetMap tiles, OSRM, Nominatim) | frontend map components, `vamosysClient.js` | Public endpoints with no keys |
| Footer contact info, social links, fonts and CDNs, mail HTML content | Footer, mail templates, `layout.tsx` | Content, not config |
| `LoginMain.js`, `UserAdminLogin.js` | backend root | **Dead files** (not required anywhere) that still contain secrets. Flagged rather than deleted. **Recommend deleting them** |
| Commented `localhost:3001` lines | `SalesDetailDrawer.tsx:103`, `CommentsTab.tsx:408`, `OverviewTab.tsx:839`, `BaseUrl.tsx:14` | Commented-out code, not active |
| AWS S3 `/uploadaws` route | `VehicleMain.js` | Already env-based, but `AWS_*` is not set, so the route does not work. Documented in `.env.example` |

---

## 8. Security issues found

| # | Severity | Issue | Action |
|---|---|---|---|
| 1 | 🔴 High | **Frontend `.env` was committed to git** (25 commits), including `INTERNAL_API_SECRET` | Untracked (staged) and ignored. **Rotate `INTERNAL_API_SECRET`** (frontend and backend) |
| 2 | 🔴 High | **Live MongoDB credentials hardcoded** in tracked backend code (pushed to GitHub), plus a second, older cluster's credentials in a comment | Moved to env and the comment removed. **Rotate both DB users' passwords**; they remain in git history |
| 3 | 🔴 High | **DB connection string (with password) sent to the external mail API** inside `productImage` | **Fixed** (`orderController.js`) |
| 4 | 🔴 High | **Cloudinary API key and secret hardcoded** (2 files) | Moved to env. **Rotate the Cloudinary secret** |
| 5 | 🟠 Medium | Hardcoded fallback **JWT secret** | Removed. **Make sure live `JWT_SECRET` is a strong random value** |
| 6 | 🟠 Medium | Hardcoded **quotation approval password** and **Nettyfish SMS API key** | Removed from code. **Rotate both** |
| 7 | 🟠 Medium | **Vamosys API key in the browser bundle**, plus a developer's **personal email and phone** sent from the browser | Backend side moved to env. **Frontend side left (see section 7); proxy through the backend and rotate the key** |
| 8 | 🟠 Medium | **Gmail app password and secret codes in dead `LoginMain.js`** | Flagged. **Revoke the Gmail app password and delete the file** |
| 9 | 🟡 Low | Backend `NODE_ENV` value broken by an inline `//` comment | Fixed locally. **Check live** |
| 10 | 🟡 Low | Vamosys locations API uses plain `http://` (API key in clear text) | Now configurable via `VAMOSYS_LOCATIONS_URL`. Switch to `https://` if Vamosys supports it |
| 11 | 🟡 Low | Any `*.vercel.app` site can call the API with credentials | Now switchable: `CORS_ALLOW_VERCEL_PREVIEWS=false` on live |

> Moving a secret into `.env` does **not** remove it from git history. Every secret in rows 1, 2, 4, 6, 7 and 8 should be treated as leaked and **rotated**.

---

## 9. Final verification status

The backend was verified on a separate instance (port 3002), so the running 3001 instance was not touched.

| Check | Result |
|---|---|
| Frontend build (`npm run build`) | ✅ PASS (exit 0) |
| Backend syntax (`node --check`, all 11 changed JS files) | ✅ PASS |
| Backend start | ✅ PASS: "Server running on port 3002", no missing-env warning |
| Database (via `MONGODB_URI`) | ✅ PASS: "MongoDB Connected Successfully" |
| API | ✅ PASS: `GET /api/vehicle-types` 200, `GET /locations` 200 |
| CORS | ✅ PASS: adinnroadshows.com, both netlify sites, localhost:3000 and `*.vercel.app` allowed; an unknown origin is blocked |
| Authentication | ✅ PASS: protected routes 401 without or with a bad token. A token signed with env `JWT_SECRET` is verified (`ACCOUNT_NOT_FOUND` for the fake user, not `INVALID_TOKEN`). Admin login error path `ADMIN_NOT_FOUND`. Client profile 401 |
| Internal secret | ✅ PASS: 403 without or with a wrong secret; accepted with the env secret |
| Quotation approval password | ✅ PASS: wrong password → "Invalid approval password" |
| GPS (Vamosys) | ✅ PASS: live read call through the env-based client returned 236 vehicles |
| GST (Meon) route | ✅ PASS: route reachable (400 on empty body). External call not triggered |
| Mail config | ✅ Config loads (all mail API URLs and TO/CC set). ⚪ **No real mail sent** (deliberately, to avoid spam) |
| SMS config | ✅ Config loads. ⚪ No SMS sent |
| Uploads / storage | ✅ Config loads (`STORAGE_TYPE=space`; key, secret and bucket set). ⚪ No test upload performed |
| Socket | ⚪ N/A: the project has no socket/WebSocket code |
| Frontend ↔ backend in a browser | ⚪ Not clicked through in a browser |

> ℹ️ **Unrelated to this migration:** the earlier `/api` route aliases (backend) and the `apiPrefix.ts` URL rewrite (frontend) are no longer in the code. Both sides are consistent on the original paths, and `/api/locations` returning 404 is expected for that reason.

---

## LIVE ENV UPDATE LIST

### Frontend
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_CLARITY_ID`
- `NEXT_PUBLIC_VAMOSYS_USER_ID`
- `NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER`
- `NEXT_PUBLIC_API_BASE_LIVE` *(verify it is set and ends with `/`)*
- `INTERNAL_API_SECRET` *(update after rotation)*

### Backend
- `MONGODB_URI` *(critical)*
- `ALLOWED_ORIGINS` *(update to the full list)*
- `CORS_ALLOW_VERCEL_PREVIEWS`
- `NODE_ENV` *(must be exactly `production`)*
- `JWT_SECRET`
- `INTERNAL_API_SECRET` *(update after rotation)*
- `ROADSHOW_QUOTATION_APPROVAL_PASSWORD`
- `NETTYFISH_API_KEY`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `VAMOSYS_USER_ID`
- `VAMOSYS_GROUP_ID`
- `VAMOSYS_CONTACT_EMAIL`
- `VAMOSYS_CONTACT_PHONE`
- `PRODUCTION_BASE_URL` *(verify; now also used by order mails)*
