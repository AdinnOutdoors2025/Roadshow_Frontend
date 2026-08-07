"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken } from "@/app/utils/auth";
import API_BASE from "../../../baseurl";

// How often an already-open tab re-checks whether the account got
// deactivated mid-session — a JWT alone can't reflect that until it expires.
const SESSION_CHECK_INTERVAL_MS = 60 * 1000;

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

  useEffect(() => {
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

    const sessionCheck = setInterval(async () => {
      const currentToken = getToken();
      if (!currentToken) return;
      try {
        const res = await fetch(`${API_BASE}admin/session-check`, {
          headers: { Authorization: `Bearer ${currentToken}` },
        });
        if (res.status === 401) forceLogout();
      } catch {
        // network hiccup — don't log the user out over a transient failure
      }
    }, SESSION_CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(timer);
      clearInterval(sessionCheck);
    };
  }, [router]);
}