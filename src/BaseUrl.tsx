/* =========================================================
   BACKEND API URL
========================================================= */

// Local backend
export const baseUrl = "http://localhost:3001";

// Production backend
// export const baseUrl =
//   process.env.NEXT_PUBLIC_API_BASE_LIVE?.replace(/\/+$/, "") ||
//   "https://roadshow-backend.onrender.com";

// Local network backend
// export const baseUrl = "http://192.168.2.134:3001";

export const GST_Percentage = "18";

/* =========================================================
   RTO (Return-To-Origin) CYCLE LENGTH
========================================================= */
// One RTO charge per vehicle per this many campaign days (ceil), used by
// the client order flow (src/lib/roadshowPricing.ts). Admin order pricing
// does not read this yet — its RTO stays a flat rtoCharges x quantity
// charge until that flow is scoped separately.
//
// MUST match RTO_CYCLE_DAYS in the backend's .env
// (D:\Roadshow-Backend\roadshow_Backend\.env) — they are two independent
// values in two separate apps/repos, not synced automatically. Bump both
// together whenever the business rule changes, otherwise the live pricing
// preview here will disagree with what the backend actually saves.
export const RTO_CYCLE_DAYS = 30;

/* =========================================================
   EMAIL IMAGE FRONTEND URL
========================================================= */

/*
  Public site URL used for images inside outgoing mails.
  Set NEXT_PUBLIC_SITE_URL per environment (e.g. http://localhost:3000
  locally, https://www.adinnroadshows.com on live). Falls back to the live
  site, which is what the old IS_LIVE = true toggle always produced.
*/
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.adinnroadshows.com"
).replace(/\/+$/, "");

export const mailImageUrl = SITE_URL;


//WHATSAPP NUMBER FOR ADMIN
export const NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER || "9626907861";

/* Vamosys public tracking embed (gpsvts.vamosys.com iframe) account id. */
export const VAMOSYS_TRACK_USER_ID =
  process.env.NEXT_PUBLIC_VAMOSYS_USER_ID || "ADINN12";