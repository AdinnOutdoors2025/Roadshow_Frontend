"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { clearToken, getToken } from "@/app/utils/auth";
import API_BASE from "../../../baseurl";

// Public admin auth pages — no token is expected here, so the guard must not
// try to redirect away from them (e.g. signup would be unreachable otherwise).
const PUBLIC_AUTH_PATHS = ["/admin/signin", "/admin/signup", "/admin/forgot-password"];

interface JwtPayload {
  id: string;
  username: string;
  role: string;
  exp: number;
  iat: number;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    return JSON.parse(atob(token.split(".")[1])) as JwtPayload;
  } catch {
    return null;
  }
}

// export function useAuthGuard(): void {
//   const router = useRouter();

//   useEffect(() => {
//     const token = getToken();

   
//     if (!token) {
//       router.replace("/signin");
//       return;
//     }

//     const payload = parseJwt(token);

    
//     if (!payload || Date.now() >= payload.exp * 1000) {
//       clearToken();
//       router.replace("/signin");
//       return;
//     }

  
//     const msLeft = payload.exp * 1000 - Date.now();
//     const timer = setTimeout(() => {
//       clearToken();
//       router.replace("/signin");
//     }, msLeft);

//     return () => clearTimeout(timer);
//   }, [router]);
// }

// utils/auth.ts (or wherever useAuthGuard is defined)
export function useAuthGuard(): void {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (PUBLIC_AUTH_PATHS.some((p) => pathname.startsWith(p))) return;

    const token = getToken();
    if (!token) {
      router.replace("/admin/signin");   // was "/signin"
      return;
    }

    const payload = parseJwt(token);
    if (!payload || Date.now() >= payload.exp * 1000) {
      clearToken();
      router.replace("/admin/signin");   // was "/signin"
      return;
    }

    const msLeft = payload.exp * 1000 - Date.now();
    const timer = setTimeout(() => {
      clearToken();
      router.replace("/admin/signin");
    }, msLeft);

    // Detects an admin deactivating this account mid-session (the JWT itself
    // has no way to know that until it expires, up to 7 days later).
    const forceLogout = () => {
      clearToken();
      router.replace("/admin/signin");
    };

    const checkSession = async () => {
      const currentToken = getToken();
      if (!currentToken) return;
      // admin role has no revocation risk worth polling for — only
      // sales/operation logins need the live account-status check.
      if (payload.role !== "sales" && payload.role !== "operation") return;
      try {
        const res = await fetch(`${API_BASE}admin/session-check`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        if (res.status === 401) forceLogout();
      } catch {
        // network hiccup — don't log the user out over a transient failure
      }
    };

    // Runs once per route change/page load — not on a recurring interval.
    checkSession();

    return () => {
      clearTimeout(timer);
    };
  }, [router, pathname]);
}