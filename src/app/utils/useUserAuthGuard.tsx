"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { clearUserToken, getUserToken } from "@/app/utils/userAuth";

export interface UserAuthJwtPayload {
  id: string;
  username: string;
  role: string;
  exp: number;
  iat: number;
}

export function parseUserJwt(token: string): UserAuthJwtPayload | null {
  try {
    return JSON.parse(atob(token.split(".")[1])) as UserAuthJwtPayload;
  } catch {
    return null;
  }
}

interface UseUserAuthGuardResult {
  user: UserAuthJwtPayload | null;
  ready: boolean;
}

function readValidPayload(requireRole?: string): UserAuthJwtPayload | null {
  const token = getUserToken();
  if (!token) return null;
  const payload = parseUserJwt(token);
  if (!payload || Date.now() >= payload.exp * 1000) return null;
  if (requireRole && payload.role !== requireRole) return null;
  return payload;
}

// Client-side guard for the standalone user-auth module's protected routes.
// Pass requireRole to additionally gate a page to a single role (e.g. "admin").
// Deliberately does not touch src/middleware.tsx, which already owns complex
// role-gating for /admin/* — this module stays fully separate.
//
// `ready` only flips true once the effect below has validated the cookie
// client-side (avoids a hydration mismatch from reading document.cookie
// during the server render pass); `user` is then derived directly from the
// cookie on each render rather than mirrored into state.
export function useUserAuthGuard(requireRole?: string): UseUserAuthGuardResult {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getUserToken();
    if (!token) {
      router.replace("/user-auth/signin");
      return;
    }

    const payload = parseUserJwt(token);
    if (!payload || Date.now() >= payload.exp * 1000) {
      clearUserToken();
      router.replace("/user-auth/signin");
      return;
    }

    if (requireRole && payload.role !== requireRole) {
      router.replace("/user-auth/dashboard");
      return;
    }

    // Standard hydration-safe "mounted" flag: document.cookie is unavailable
    // during the server render pass, so there is no synchronous way to know
    // readiness before this effect runs.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setReady(true);

    const msLeft = payload.exp * 1000 - Date.now();
    const timer = setTimeout(() => {
      clearUserToken();
      router.replace("/user-auth/signin");
    }, msLeft);

    return () => clearTimeout(timer);
  }, [router, requireRole]);

  return { user: ready ? readValidPayload(requireRole) : null, ready };
}
