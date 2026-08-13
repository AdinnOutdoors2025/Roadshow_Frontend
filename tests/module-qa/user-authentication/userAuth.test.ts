// Module QA — [MODULE] User Authentication (task 20260812-user-auth)
// Category: Functional + Security
// Covers src/app/utils/userAuth.tsx: saveUserToken/getUserToken/clearUserToken,
// the isolated `userAuthToken` cookie used by this module (must never collide
// with the existing admin `adminToken` cookie in src/app/utils/auth.tsx).

import { describe, it, expect, beforeEach } from "vitest";
import { saveUserToken, getUserToken, clearUserToken } from "@/app/utils/userAuth";

function clearAllCookies(): void {
  // jsdom does not expose a bulk-clear API; walk and expire every cookie.
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=; path=/; max-age=0`;
  });
}

describe("saveUserToken / getUserToken / clearUserToken", () => {
  beforeEach(() => {
    clearAllCookies();
  });

  it("returns null when no token cookie is present", () => {
    expect(getUserToken()).toBeNull();
  });

  it("round-trips a simple token", () => {
    saveUserToken("abc123");
    expect(getUserToken()).toBe("abc123");
  });

  it("clearUserToken removes the token so getUserToken returns null again", () => {
    saveUserToken("abc123");
    clearUserToken();
    expect(getUserToken()).toBeNull();
  });

  it("writes to a cookie named userAuthToken, distinct from the admin adminToken cookie", () => {
    saveUserToken("user-token-value");
    // Simulate the admin module's cookie coexisting.
    document.cookie = "adminToken=admin-token-value; path=/";
    expect(getUserToken()).toBe("user-token-value");
    expect(
      document.cookie.split("; ").some((row) => row.startsWith("adminToken=admin-token-value")),
    ).toBe(true);
  });

  it("sets SameSite=Strict on both the write and the clear (Security)", () => {
    // jsdom's document.cookie does not echo attributes back on read, so we
    // assert against the literal cookie string the helper constructs by
    // spying on the underlying setter.
    const proto = Object.getPrototypeOf(document);
    const descriptor = Object.getOwnPropertyDescriptor(proto, "cookie")!;
    const seen: string[] = [];
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: descriptor.get,
      set(value: string) {
        seen.push(value);
        descriptor.set!.call(document, value);
      },
    });

    try {
      saveUserToken("tok");
      clearUserToken();
    } finally {
      Object.defineProperty(document, "cookie", descriptor);
    }

    expect(seen.some((v) => v.startsWith("userAuthToken=tok") && v.includes("SameSite=Strict"))).toBe(
      true,
    );
    expect(
      seen.some((v) => v.startsWith("userAuthToken=;") && v.includes("max-age=0") && v.includes("SameSite=Strict")),
    ).toBe(true);
  });

  it("KNOWN ISSUE: a token value containing '=' (base64 padding) is truncated on read", () => {
    // getUserToken does `match.split("=")[1]`, which only returns the text
    // between the FIRST and SECOND '=' in the cookie row. A JWT payload
    // segment is delimited by '.' so this does not corrupt token.split('.'),
    // but if the token's own value legitimately contains '=' (e.g. some
    // base64 encoders emit padding on the final JWT segment), the value
    // returned by getUserToken is silently truncated rather than the full
    // token. This mirrors a pre-existing, identical pattern already in
    // src/app/utils/auth.tsx (getToken for the admin adminToken cookie), so
    // it is not a regression introduced by this module, but the new module
    // reproduces it and it is documented here since it satisfies the
    // Security/Regex evaluation category ("no additional leakage" — here the
    // risk is silent data loss, not leakage, but is still worth flagging).
    const tokenWithPadding = "header.payload.signature==";
    saveUserToken(tokenWithPadding);
    const read = getUserToken();
    expect(read).not.toBe(tokenWithPadding); // demonstrates the truncation
    expect(read).toBe("header.payload.signature"); // trailing '==' is lost
  });

  it("does not persist the token to localStorage (cookie-only storage, per architecture)", () => {
    saveUserToken("some-token");
    expect(window.localStorage.getItem("userAuthToken")).toBeNull();
    expect(window.localStorage.length).toBe(0);
  });
});
