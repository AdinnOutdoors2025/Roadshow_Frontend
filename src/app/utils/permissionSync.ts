// Shared helpers for keeping sales/operation admin permissions in sync with
// the backend without requiring logout/login. Used by both the Edge
// middleware (src/middleware.tsx, route gating + /admin redirect) and the
// client sidebar (AppSidebar.tsx, menu visibility) so both read the exact
// same live source of truth instead of only the JWT's embedded snapshot.

export interface AdminJwtPayload {
  id?: string;
  username?: string;
  role?: string;
  allowedMenus?: string[];
  exp?: number;
  iat?: number;
}

export function parseAdminJwtPayload(token: string): AdminJwtPayload | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

// Reuses the same GET user-permissions/:userId endpoint the admin's
// role-permission editor already reads (RolePermissionController.getUserPermission),
// so a logged-in sales/operation user can fetch their own current
// allowedMenus. Returns null on any failure (network error, timeout,
// non-2xx) so callers fall back to the JWT-embedded value instead of
// locking the user out over a transient error.
export async function fetchLiveAllowedMenus(
  apiBase: string | undefined,
  token: string,
  userId: string,
  signal?: AbortSignal
): Promise<string[] | null> {
  if (!apiBase) return null;
  try {
    const res = await fetch(`${apiBase}user-permissions/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    const menus = json?.data?.data?.allowedMenus;
    return Array.isArray(menus) ? menus : null;
  } catch {
    return null;
  }
}
