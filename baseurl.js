// const API_BASE = process.env.NEXT_PUBLIC_API_BASE; //for local
const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_BASE_LIVE; //for production

// Server-side only (middleware + server components, e.g. print-summary):
// inside Docker the backend is reachable via its service name, not the
// browser-facing URL. Unset everywhere else, so behaviour is unchanged.
const API_BASE =
  (typeof window === "undefined" && process.env.INTERNAL_API_BASE) || PUBLIC_API_BASE;




export default API_BASE;