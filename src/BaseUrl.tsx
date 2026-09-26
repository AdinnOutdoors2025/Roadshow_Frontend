/* =========================================================
   BACKEND API URL
========================================================= */

// Local backend
// export const baseUrl = "http://localhost:3001";

// Production backend
export const baseUrl =
  process.env.NEXT_PUBLIC_API_BASE_LIVE?.replace(/\/+$/, "") ||
  "https://roadshow-backend.onrender.com";

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
  true  = Production / Live
  false = Localhost
*/
const IS_LIVE = true;

const LOCAL_MAIL_IMAGE_URL =
  "http://localhost:3000";

const PRODUCTION_MAIL_IMAGE_URL =
  "https://roadshowfrontend.netlify.app";

export const mailImageUrl = IS_LIVE
  ? PRODUCTION_MAIL_IMAGE_URL
  : LOCAL_MAIL_IMAGE_URL;


//WHATSAPP NUMBER FOR ADMIN 
export const NEXT_PUBLIC_ADMIN_WHATSAPP_NUMBER = "7092558277";