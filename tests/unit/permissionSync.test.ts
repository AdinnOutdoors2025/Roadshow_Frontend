// QA-02 Unit Testing — src/app/utils/permissionSync.ts
// parseAdminJwtPayload is a pure decode; fetchLiveAllowedMenus is tested with
// a mocked global fetch (no real network calls).

import { describe, it, expect, vi, afterEach } from "vitest";
import {
  parseAdminJwtPayload,
  fetchLiveAllowedMenus,
} from "@/app/utils/permissionSync";

function makeToken(payload: object): string {
  const b64 = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64");
  return `${b64({ alg: "none" })}.${b64(payload)}.sig`;
}

describe("parseAdminJwtPayload", () => {
  it("decodes a well-formed JWT payload", () => {
    const token = makeToken({ id: "1", username: "admin", role: "admin" });
    expect(parseAdminJwtPayload(token)).toEqual({
      id: "1",
      username: "admin",
      role: "admin",
    });
  });

  it("returns null for a malformed token instead of throwing", () => {
    expect(parseAdminJwtPayload("not-a-jwt")).toBeNull();
    expect(parseAdminJwtPayload("")).toBeNull();
    expect(parseAdminJwtPayload("a.b")).toBeNull();
  });
});

describe("fetchLiveAllowedMenus", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when apiBase is missing", async () => {
    expect(await fetchLiveAllowedMenus(undefined, "tok", "u1")).toBeNull();
  });

  it("returns the allowedMenus array on success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ data: { data: { allowedMenus: ["dashboard", "orders"] } } }),
      })
    );
    const result = await fetchLiveAllowedMenus("http://api/", "tok", "u1");
    expect(result).toEqual(["dashboard", "orders"]);
  });

  it("returns null (not throw) on a non-2xx response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    expect(await fetchLiveAllowedMenus("http://api/", "tok", "u1")).toBeNull();
  });

  it("returns null (not throw) when fetch rejects (network failure)", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    expect(await fetchLiveAllowedMenus("http://api/", "tok", "u1")).toBeNull();
  });

  it("returns null when allowedMenus is missing/not an array", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: {} }) })
    );
    expect(await fetchLiveAllowedMenus("http://api/", "tok", "u1")).toBeNull();
  });
});
