/* =========================================================
   BACKEND API URL
========================================================= */

// Local backend
export const baseUrl = "http://localhost:3001";

// Production backend
// export const baseUrl = "https://roadshow-backend.onrender.com";

// Local network backend
// export const baseUrl = "http://192.168.2.134:3001";

export const GST_Percentage = "18";

/* =========================================================
   EMAIL IMAGE FRONTEND URL
========================================================= */

/*
  true  = Production / Live
  false = Localhost
*/
const IS_LIVE = false;

const LOCAL_MAIL_IMAGE_URL =
  "http://localhost:3000";

const PRODUCTION_MAIL_IMAGE_URL =
  "https://roadshowfrontend.netlify.app";

export const mailImageUrl = IS_LIVE
  ? PRODUCTION_MAIL_IMAGE_URL
  : LOCAL_MAIL_IMAGE_URL;