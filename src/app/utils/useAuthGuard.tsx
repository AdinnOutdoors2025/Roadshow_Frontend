"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken } from "@/app/utils/auth";

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

    return () => clearTimeout(timer);
  }, [router]);
}