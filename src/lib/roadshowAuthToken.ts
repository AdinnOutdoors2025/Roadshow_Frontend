/* -------------------------------------------------------------------------- */
/*                        PUBLIC-SITE AUTH TOKEN ACCESS                       */
/* -------------------------------------------------------------------------- */
/*  The customer's JWT is written to localStorage by AuthContext on sign-in     */
/*  (`roadshow_token`) and removed on sign-out. Components can read it from     */
/*  useAuth(), but the plain modules that talk to the API — roadshowRequest-    */
/*  Submit and friends — are not components, so they read it here instead of    */
/*  each reaching into localStorage with its own spelling of the key.           */
/*                                                                            */
/*  Deliberately NOT the admin token: `adminToken` is a cookie set by           */
/*  src/app/utils/auth.tsx for the back office and is a different account       */
/*  entirely. Keep the two apart.                                              */

export const CLIENT_TOKEN_KEY = "roadshow_token";

/** The signed-in customer's token, or "" when signed out / server-rendered. */
export const getClientToken = (): string => {
  if (typeof window === "undefined") return "";

  try {
    return window.localStorage.getItem(CLIENT_TOKEN_KEY) || "";
  } catch {
    /* Storage blocked — treated the same as signed out */
    return "";
  }
};

/**
 * Authorization header for a customer-authenticated call.
 *
 * Returns an empty object when there is no token, so it can be spread into
 * any fetch init without producing a header of `Bearer undefined` — which
 * the backend would reject differently from no header at all.
 */
export const clientAuthHeaders = (
  token?: string | null
): Record<string, string> => {
  const value = String(token ?? getClientToken()).trim();

  return value ? { Authorization: `Bearer ${value}` } : {};
};
