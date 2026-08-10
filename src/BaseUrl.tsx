/* =========================================================
   BACKEND API URL
========================================================= */

// Local backend
// export const baseUrl = "http://localhost:3001";

// Production backend
export const baseUrl = "https://roadshow-backend.onrender.com";

// Local network backend
// export const baseUrl = "http://192.168.2.134:3001";

export const GST_Percentage = "18";

/* =========================================================
   EMAIL IMAGE FRONTEND URL
========================================================= */

type MailEnvironment = "local" | "production";

const mailEnvironment: MailEnvironment =
  process.env.NEXT_PUBLIC_MAIL_ENV === "production"
    ? "production"
    : "local";

const MAIL_IMAGE_URLS: Record<MailEnvironment, string> = {
  local: "http://localhost:3000",
  production: "https://adinnroadshows.com",
};

export const mailImageUrl =
  MAIL_IMAGE_URLS[mailEnvironment];
