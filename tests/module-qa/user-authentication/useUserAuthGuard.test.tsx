// Module QA — [MODULE] User Authentication (task 20260812-user-auth)
// Category: Functional + Security
// Covers src/app/utils/useUserAuthGuard.tsx: parseUserJwt (client-side JWT
// decode, no signature verification — by design, server must still validate)
// and the useUserAuthGuard() route-guard hook (redirect-if-missing,
// redirect-if-expired, redirect-if-wrong-role, auto-logout-at-expiry).
//
// next/navigation's useRouter is mocked since this hook is only ever used
// inside "use client" pages rendered under the Next.js router context, which
// is not present under plain jsdom + Testing Library.

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { parseUserJwt, useUserAuthGuard } from "@/app/utils/useUserAuthGuard";
import { saveUserToken, getUserToken } from "@/app/utils/userAuth";

const replace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));

function makeToken(payload: Record<string, unknown>): string {
  // Strip base64 '=' padding, matching how real-world JWT encoders emit
  // tokens (base64url, unpadded). This deliberately avoids incidentally
  // tripping the separately-documented getUserToken() '=' truncation bug
  // (see userAuth.test.ts "KNOWN ISSUE") in tests that aren't about that bug.
  const b64 = (s: string) => btoa(s).replace(/=+$/, "");
  const header = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64(JSON.stringify(payload));
  return `${header}.${body}.fakesignature`;
}

function clearAllCookies(): void {
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=; path=/; max-age=0`;
  });
}

describe("parseUserJwt", () => {
  it("returns the decoded payload for a well-formed token", () => {
    const token = makeToken({ id: "1", username: "alice", role: "admin", exp: 9999999999, iat: 1 });
    const payload = parseUserJwt(token);
    expect(payload).toMatchObject({ id: "1", username: "alice", role: "admin" });
  });

  it("returns null for a token with no '.' separators", () => {
    expect(parseUserJwt("not-a-jwt")).toBeNull();
  });

  it("returns null for a token whose payload segment is not valid base64", () => {
    expect(parseUserJwt("header.%%%not-base64%%%.sig")).toBeNull();
  });

  it("returns null for a token whose payload segment is valid base64 but not JSON", () => {
    const notJson = btoa("just some text, not json");
    expect(parseUserJwt(`header.${notJson}.sig`)).toBeNull();
  });

  it("returns null for an empty string", () => {
    expect(parseUserJwt("")).toBeNull();
  });

  it("never throws regardless of malformed input (guards downstream callers)", () => {
    expect(() => parseUserJwt("...")).not.toThrow();
    expect(() => parseUserJwt("a.b")).not.toThrow();
  });
});

describe("useUserAuthGuard", () => {
  beforeEach(() => {
    clearAllCookies();
    replace.mockClear();
  });

  afterEach(() => {
    // Only the auto-logout test below switches to fake timers; make sure it
    // never leaks into a later test if it fails before restoring them.
    vi.useRealTimers();
  });

  it("redirects to /user-auth/signin when no token cookie is present", async () => {
    const { result } = renderHook(() => useUserAuthGuard());
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/user-auth/signin"));
    expect(result.current.ready).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("redirects to /user-auth/signin and clears the cookie when the token is expired", async () => {
    const expired = makeToken({
      id: "1",
      username: "bob",
      role: "user",
      exp: Math.floor(Date.now() / 1000) - 60, // expired 60s ago
      iat: 1,
    });
    saveUserToken(expired);

    const { result } = renderHook(() => useUserAuthGuard());
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/user-auth/signin"));
    expect(getUserToken()).toBeNull(); // cookie was cleared
    expect(result.current.ready).toBe(false);
  });

  it("redirects to /user-auth/dashboard when requireRole is set and the role does not match", async () => {
    const nonAdmin = makeToken({
      id: "2",
      username: "carol",
      role: "user",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: 1,
    });
    saveUserToken(nonAdmin);

    const { result } = renderHook(() => useUserAuthGuard("admin"));
    await waitFor(() => expect(replace).toHaveBeenCalledWith("/user-auth/dashboard"));
    expect(result.current.ready).toBe(false);
  });

  it("does NOT redirect and exposes the decoded user when the token is valid and role matches", async () => {
    const admin = makeToken({
      id: "3",
      username: "dave",
      role: "admin",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: 1,
    });
    saveUserToken(admin);

    const { result } = renderHook(() => useUserAuthGuard("admin"));
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(replace).not.toHaveBeenCalled();
    expect(result.current.user).toMatchObject({ username: "dave", role: "admin" });
  });

  it("does NOT redirect when no requireRole is specified, for any authenticated role", async () => {
    const anyUser = makeToken({
      id: "4",
      username: "erin",
      role: "guest",
      exp: Math.floor(Date.now() / 1000) + 3600,
      iat: 1,
    });
    saveUserToken(anyUser);

    const { result } = renderHook(() => useUserAuthGuard());
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(replace).not.toHaveBeenCalled();
    expect(result.current.user?.username).toBe("erin");
  });

  it("auto-logs-out and redirects exactly at token expiry via the scheduled timer", async () => {
    vi.useFakeTimers();
    const soonToExpire = makeToken({
      id: "5",
      username: "frank",
      role: "user",
      exp: Math.floor(Date.now() / 1000) + 5, // 5s from now
      iat: 1,
    });
    saveUserToken(soonToExpire);

    const { result } = renderHook(() => useUserAuthGuard());
    // Flush the mount-time useEffect (which validates the cookie and sets
    // ready=true + schedules the expiry timer) without waiting on real time.
    await vi.advanceTimersByTimeAsync(0);
    expect(result.current.ready).toBe(true);
    expect(replace).not.toHaveBeenCalled();
    expect(getUserToken()).not.toBeNull();

    await vi.advanceTimersByTimeAsync(5100);

    expect(replace).toHaveBeenCalledWith("/user-auth/signin");
    expect(getUserToken()).toBeNull();
  });
});
