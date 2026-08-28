// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest): NextResponse {
//   const token = request.cookies.get("adminToken")?.value;
//   const { pathname } = request.nextUrl;

//   const protectedPaths: string[] = ["/admin/dashboard"];
//   const authPaths: string[] = ["/signin", "/signup"];

//   const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
//   const isAuthPage = authPaths.some((p) => pathname.startsWith(p));


//   if (pathname === "/") {
//     if (!token) {
//       return NextResponse.redirect(new URL("/signin", request.url));
//     }
//     return NextResponse.redirect(new URL("/admin/dashboard", request.url));
//   }

//   if (isProtected && !token) {
//     return NextResponse.redirect(new URL("/signin", request.url));
//   }

//   if (isAuthPage && token) {
//     return NextResponse.redirect(new URL("/admin/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/", "/admin/dashboard/:path*", "/signin", "/signup"],
// };

// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import API_BASE from "../baseurl";
import { parseAdminJwtPayload, fetchLiveAllowedMenus } from "./app/utils/permissionSync";

// pathname prefix → menu key (must stay in sync with MENU_OPTIONS in
// src/app/admin/role-permission/page.tsx and the `key`/`path` values in
// AppSidebar.tsx). Longest/most-specific prefixes first so a match like
// "/admin/sales-handling" resolves before a broader "/admin" one would.
const ROLE_GATED_PREFIXES: [string, string][] = [
  ["/admin/dashboard", "/admin/dashboard"],
  ["/admin/sales-management", "/admin/sales-management"],
  ["/admin/operation-management", "/admin/operation-management"],
  ["/admin/client-request-order", "/admin/client-request-order"],
  ["/admin/order-creation", "/admin/order-creation"],
  ["/admin/sales-handling", "/admin/sales-handling"],
  ["/admin/operation-handling", "/admin/operation-handling"],
  ["/admin/package-management", "/admin/package-management"],
  ["/admin/driver", "/admin/driver"],
  ["/admin/promoter", "/admin/promoter"],
  ["/admin/project-setting", "/admin/project-setting"],
  ["/admin/invoice-generation", "/admin/invoice-generation"],
  ["/admin/Vehicles/Vehicle_Onboarding", "/admin/Vehicles/Vehicle_Onboarding"],
  ["/admin/Vehicles/Vehicle_Inventory", "/admin/Vehicles/Vehicle_Inventory"],
];

// Routes any authenticated role (sales/operation) may always reach, regardless
// of RolePermission config — self profile and the 404 fallback itself.
const ALWAYS_ALLOWED_PREFIXES = ["/admin/profile", "/admin/error-404", "/admin/no-access"];

// Given a user's current allowedMenus, picks the first gated route they're
// permitted to land on (in the same priority order as ROLE_GATED_PREFIXES),
// so a restricted user is never blindly sent to /admin/dashboard.
function firstAllowedPath(allowedMenus: string[]): string | null {
  const match = ROLE_GATED_PREFIXES.find(([, key]) => allowedMenus.includes(key));
  return match ? match[1] : null;
}

// Fetches this token's latest allowedMenus from the backend (falling back to
// the JWT-embedded snapshot on any failure) so permission edits made by
// Admin take effect on the user's very next request — no logout/login
// required. Only called for sales/operation tokens; admin/super-admin never
// pays this extra round trip since their access isn't menu-gated.
async function resolveAllowedMenus(
  token: string,
  payload: { id?: string; allowedMenus?: string[] }
): Promise<string[]> {
  const live = payload.id
    ? await fetchLiveAllowedMenus(API_BASE, token, payload.id, AbortSignal.timeout(4000))
    : null;
  return live ?? payload.allowedMenus ?? [];
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get("adminToken")?.value;
  const { pathname } = request.nextUrl;

  const adminAuthPaths = ["/admin/signin", "/admin/signup", "/admin/forgot-password"];

  // /admin exact → redirect based on token + latest permissions.
  if (pathname === "/admin") {
    if (!token) {
      return NextResponse.redirect(new URL("/admin/signin", request.url));
    }
    const payload = parseAdminJwtPayload(token);
    if (!payload || !payload.role || payload.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    const allowedMenus = await resolveAllowedMenus(token, payload);
    const landing = firstAllowedPath(allowedMenus) || "/admin/no-access";
    return NextResponse.redirect(new URL(landing, request.url));
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedAdminRoute =
    isAdminRoute && !adminAuthPaths.some((p) => pathname.startsWith(p));

  if (isProtectedAdminRoute && !token) {
    // Carry the originally-requested path along so SignInForm can send the
    // user back there after login instead of always landing on the
    // dashboard — e.g. an admin/sales-handling link from an email.
    const signinUrl = new URL("/admin/signin", request.url);
    signinUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
    return NextResponse.redirect(signinUrl);
  }

  if (token && adminAuthPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Role + menu-permission gate: admin sees everything; sales/operation
  // logins only reach paths present in their latest RolePermission.allowedMenus
  // (re-fetched from the backend on every request, not just the JWT snapshot
  // taken at login). Direct URL entry, not just sidebar clicks, is blocked
  // here — a disallowed path redirects to the user's first permitted module,
  // falling back to the 404 page only when they have no permitted modules at all.
  if (isProtectedAdminRoute && token && !ALWAYS_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const payload = parseAdminJwtPayload(token);
    if (payload && payload.role && payload.role !== "admin") {
      const allowed = await resolveAllowedMenus(token, payload);
      const isRolePermissionPage = pathname.startsWith("/admin/role-permission");
      const matched = ROLE_GATED_PREFIXES.find(([prefix]) => pathname.startsWith(prefix));
      const isAllowed = !isRolePermissionPage && !!matched && allowed.includes(matched[1]);
      if (!isAllowed) {
        const landing = firstAllowedPath(allowed);
        if (landing && landing !== pathname) {
          return NextResponse.redirect(new URL(landing, request.url));
        }
        return NextResponse.rewrite(new URL("/admin/error-404", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin", "/admin/:path*"],  // ← added "/admin" here
};