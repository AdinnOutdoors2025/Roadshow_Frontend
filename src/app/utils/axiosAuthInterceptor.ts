import axios from "axios";
import { clearToken } from "@/app/utils/auth";

// Registered once (from AdminLayout) on the shared default `axios` instance —
// not a new HTTP client, just a response hook on the one every page already
// imports. Catches ACCOUNT_INACTIVE/TOKEN_EXPIRED/INVALID_TOKEN 401s from
// ANY axios call app-wide and force-logs-out immediately, instead of waiting
// for the 60s session-check poll (useAuthGuard) to catch it. `fetch`-based
// calls aren't covered by this — those still rely on that poll.
let registered = false;
let loggingOut = false;

const PUBLIC_ADMIN_PATHS = ["/admin/signin", "/admin/signup", "/admin/forgot-password"];

export function registerAxiosAuthInterceptor(): void {
  if (registered) return;
  registered = true;

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      const isAuthFailure =
        status === 401 &&
        ["ACCOUNT_INACTIVE", "TOKEN_EXPIRED", "INVALID_TOKEN", "ACCOUNT_NOT_FOUND"].includes(message);

      if (isAuthFailure && !loggingOut) {
        const alreadyOnPublicPath = PUBLIC_ADMIN_PATHS.some((p) =>
          window.location.pathname.startsWith(p)
        );
        if (!alreadyOnPublicPath) {
          loggingOut = true;
          clearToken();
          window.location.href = "/admin/signin";
        }
      }

      return Promise.reject(error);
    }
  );
}
