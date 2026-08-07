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

function parseJwtPayload(token: string): { role?: string; allowedMenus?: string[] } | null {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest): NextResponse {
  const token = request.cookies.get("adminToken")?.value;
  const { pathname } = request.nextUrl;

  const adminAuthPaths = ["/admin/signin", "/admin/signup"];

  // /admin exact → redirect based on token
  if (pathname === "/admin") {
    if (token) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/admin/signin", request.url));
    }
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedAdminRoute =
    isAdminRoute && !adminAuthPaths.some((p) => pathname.startsWith(p));

  if (isProtectedAdminRoute && !token) {
    return NextResponse.redirect(new URL("/admin/signin", request.url));
  }

  if (token && adminAuthPaths.some((p) => pathname.startsWith(p))) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Role + menu-permission gate: admin sees everything; sales/operation
  // logins only reach paths present in their RolePermission.allowedMenus
  // (baked into the JWT at login). Direct URL entry, not just sidebar clicks,
  // is blocked here — a disallowed path is served the 404 page.
  if (isProtectedAdminRoute && token && !ALWAYS_ALLOWED_PREFIXES.some((p) => pathname.startsWith(p))) {
    const payload = parseJwtPayload(token);
    if (payload && payload.role && payload.role !== "admin") {
      const isRolePermissionPage = pathname.startsWith("/admin/role-permission");
      const matched = ROLE_GATED_PREFIXES.find(([prefix]) => pathname.startsWith(prefix));
      const allowed = payload.allowedMenus || [];
      if (isRolePermissionPage || !matched || !allowed.includes(matched[1])) {
        return NextResponse.rewrite(new URL("/admin/error-404", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin", "/admin/:path*"],  // ← added "/admin" here
};