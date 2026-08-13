// Module QA — [MODULE] User Authentication (task 20260812-user-auth)
// Category: Functional + API (mocked) + Security
//
// The live backend (POST `${API_BASE}admin`) is NOT reachable/exercised here
// — there is no backend server in this repo/environment, and hitting the
// value baseurl.js actually resolves to in a real .env (a deployed backend)
// would be an unsafe, non-idempotent live call this QA agent must not make
// (see ground rules: no destructive testing, no production side effects).
// Instead `global.fetch` is mocked to exercise every response-shape branch
// the form's handleSubmit code path actually contains. Anything requiring a
// genuine live 200/401 from the real API is BLOCKED — see the QA report.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserSignInForm from "@/app/user-auth/signin/UserSignInForm";
import { getUserToken } from "@/app/utils/userAuth";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

// Test-infra workaround (NOT a module bug): plain `import X from "./icon.svg"`
// is treated as a React component by @svgr/webpack (next.config.ts) but the
// shared vitest.config.ts's vite-plugin-svgr only intercepts the `?react`
// query form by default, so under Vitest these imports resolve to raw asset
// URL strings instead of components, which crashes JSX rendering. This is a
// pre-existing gap in the newly-added Vitest setup that affects every
// component in the repo using the `@/icons` barrel, not something introduced
// by the user-auth module. Stubbed here so the module's own logic can be
// exercised; flagged in the QA report as a shared tooling gap to fix.
vi.mock("@/icons", () => ({
  EyeIcon: () => null,
  EyeCloseIcon: () => null,
}));

function makeToken(payload: Record<string, unknown>): string {
  // Strip base64 '=' padding, matching how real-world JWT encoders emit
  // tokens (base64url, unpadded). This deliberately avoids incidentally
  // tripping the separately-documented getUserToken() '=' truncation bug
  // (see userAuth.test.ts "KNOWN ISSUE") in tests that aren't about that bug.
  const b64 = (s: string) => btoa(s).replace(/=+$/, "");
  const header = b64(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = b64(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

function clearAllCookies(): void {
  document.cookie.split(";").forEach((c) => {
    const name = c.split("=")[0]?.trim();
    if (name) document.cookie = `${name}=; path=/; max-age=0`;
  });
}

function mockFetchOnce(status: number, body: unknown): void {
  global.fetch = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as unknown as typeof fetch;
}

describe("UserSignInForm", () => {
  beforeEach(() => {
    clearAllCookies();
    push.mockClear();
  });

  it("renders username and password fields and a submit button (Smoke)", () => {
    render(<UserSignInForm />);
    expect(screen.getByPlaceholderText(/username or email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("blocks submission client-side and shows an error when fields are empty (Functional/Regex)", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn();
    render(<UserSignInForm />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("submits trimmed username and raw password to POST `${API_BASE}admin` (API contract)", async () => {
    mockFetchOnce(200, {
      success: true,
      message: "OK",
      data: { token: makeToken({ id: "1", username: "alice", role: "user", exp: 9999999999 }), user: { id: "1", username: "alice", role: "user" } },
    });
    const user = userEvent.setup();
    render(<UserSignInForm />);

    await user.type(screen.getByPlaceholderText(/username or email/i), "  alice  ");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(String(url).endsWith("admin")).toBe(true);
    expect(options.method).toBe("POST");
    const sentBody = JSON.parse(options.body);
    expect(sentBody).toEqual({ username: "alice", password: "secret1" }); // trimmed, and password NOT trimmed
  });

  it("on success, saves the token to the userAuthToken cookie and routes admin role to /user-auth/admin-panel (Functional)", async () => {
    const token = makeToken({ id: "1", username: "admin1", role: "admin", exp: 9999999999 });
    mockFetchOnce(200, { success: true, message: "OK", data: { token, user: { id: "1", username: "admin1", role: "admin" } } });
    const user = userEvent.setup();
    render(<UserSignInForm />);

    await user.type(screen.getByPlaceholderText(/username or email/i), "admin1");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/user-auth/admin-panel"));
    expect(getUserToken()).toBe(token);
  });

  it("on success, routes a non-admin role to /user-auth/dashboard (Functional)", async () => {
    const token = makeToken({ id: "2", username: "user1", role: "user", exp: 9999999999 });
    mockFetchOnce(200, { success: true, message: "OK", data: { token, user: { id: "2", username: "user1", role: "user" } } });
    const user = userEvent.setup();
    render(<UserSignInForm />);

    await user.type(screen.getByPlaceholderText(/username or email/i), "user1");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => expect(push).toHaveBeenCalledWith("/user-auth/dashboard"));
  });

  it("maps ADMIN_NOT_FOUND to a friendly message and does not save a token (API/Functional)", async () => {
    mockFetchOnce(404, { success: false, message: "ADMIN_NOT_FOUND" });
    const user = userEvent.setup();
    render(<UserSignInForm />);

    await user.type(screen.getByPlaceholderText(/username or email/i), "ghost");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "whatever");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/account not found/i)).toBeInTheDocument();
    expect(getUserToken()).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("maps INVALID_PASSWORD to a friendly message (API/Functional)", async () => {
    mockFetchOnce(401, { success: false, message: "INVALID_PASSWORD" });
    const user = userEvent.setup();
    render(<UserSignInForm />);

    await user.type(screen.getByPlaceholderText(/username or email/i), "alice");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "wrongpass");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/incorrect password/i)).toBeInTheDocument();
  });

  it("maps ACCOUNT_INACTIVE to a friendly message (API/Functional)", async () => {
    mockFetchOnce(403, { success: false, message: "ACCOUNT_INACTIVE" });
    const user = userEvent.setup();
    render(<UserSignInForm />);

    await user.type(screen.getByPlaceholderText(/username or email/i), "alice");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/deactivated/i)).toBeInTheDocument();
  });

  it("falls back to the raw backend message for an unmapped error code (API)", async () => {
    mockFetchOnce(400, { success: false, message: "SOME_UNMAPPED_CODE" });
    const user = userEvent.setup();
    render(<UserSignInForm />);

    await user.type(screen.getByPlaceholderText(/username or email/i), "alice");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("SOME_UNMAPPED_CODE")).toBeInTheDocument();
  });

  it("shows a generic error and does not crash when success:true but data.token is missing (API defensive branch)", async () => {
    mockFetchOnce(200, { success: true, message: "OK" }); // no data field
    const user = userEvent.setup();
    render(<UserSignInForm />);

    await user.type(screen.getByPlaceholderText(/username or email/i), "alice");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/login failed/i)).toBeInTheDocument();
    expect(getUserToken()).toBeNull();
  });

  it("shows a server-error message when fetch itself rejects (network failure) (Functional)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));
    const user = userEvent.setup();
    render(<UserSignInForm />);

    await user.type(screen.getByPlaceholderText(/username or email/i), "alice");
    await user.type(screen.getByPlaceholderText(/enter your password/i), "secret1");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });

  it("does not render the password value in plaintext in the DOM when masked (Security)", async () => {
    const user = userEvent.setup();
    render(<UserSignInForm />);
    const passwordInput = screen.getByPlaceholderText(/enter your password/i) as HTMLInputElement;
    await user.type(passwordInput, "supersecret");
    expect(passwordInput.type).toBe("password");
  });
});
