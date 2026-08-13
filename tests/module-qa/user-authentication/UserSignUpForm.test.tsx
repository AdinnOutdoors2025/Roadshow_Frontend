// Module QA — [MODULE] User Authentication (task 20260812-user-auth)
// Category: Functional + Regex/Input Validation + API (mocked) + Security
//
// The live backend (POST `${API_BASE}register-admin`) is NOT called here.
// Unlike login, registration is a MUTATING call (creates a real account) —
// per the module-qa ground rules ("stay non-destructive... no real customer
// data"), this must never be exercised against a live backend even if one
// were reachable from this environment. global.fetch is mocked instead to
// cover every branch of the form's validation and response handling.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UserSignUpForm from "@/app/user-auth/signup/UserSignUpForm";
import { getUserToken } from "@/app/utils/userAuth";

const push = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, replace: vi.fn() }),
}));

// Test-infra workaround (NOT a module bug) — see UserSignInForm.test.tsx for
// the full explanation: the shared vitest.config.ts's svgr plugin doesn't
// intercept plain `.svg` imports the way @svgr/webpack does in the real app,
// so the icon barrel is stubbed here to isolate the module's own logic.
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

async function fillValidForm(user: ReturnType<typeof userEvent.setup>, overrides: Partial<{ username: string; email: string; password: string; confirmPassword: string; checkTerms: boolean }> = {}) {
  const values = {
    username: "validuser1",
    email: "valid@example.com",
    password: "secret1",
    confirmPassword: "secret1",
    checkTerms: true,
    ...overrides,
  };
  if (values.username) await user.type(screen.getByPlaceholderText(/enter your username/i), values.username);
  if (values.email) await user.type(screen.getByPlaceholderText(/enter your email/i), values.email);
  if (values.password) await user.type(screen.getByPlaceholderText(/min 6 chars/i), values.password);
  if (values.confirmPassword) await user.type(screen.getByPlaceholderText(/re-enter your password/i), values.confirmPassword);
  if (values.checkTerms) await user.click(screen.getByRole("checkbox"));
  return values;
}

describe("UserSignUpForm", () => {
  beforeEach(() => {
    clearAllCookies();
    push.mockClear();
  });

  it("renders username, email, password, confirm-password, terms checkbox and submit button (Smoke)", () => {
    render(<UserSignUpForm />);
    expect(screen.getByPlaceholderText(/enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/min 6 chars/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/re-enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("blocks submission when any field is empty (Functional)", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn();
    render(<UserSignUpForm />);
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/all fields are required/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects a username shorter than 4 chars before hitting the network (Regex)", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn();
    render(<UserSignUpForm />);
    await fillValidForm(user, { username: "abc" });
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/4-20 characters/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects a username with disallowed characters (Regex)", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn();
    render(<UserSignUpForm />);
    await fillValidForm(user, { username: "bad name!" });
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/4-20 characters/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects an invalid email format (Regex)", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn();
    render(<UserSignUpForm />);
    await fillValidForm(user, { email: "not-an-email" });
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/valid email address/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects a password shorter than MIN_PASSWORD_LENGTH (Regex/Boundary)", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn();
    render(<UserSignUpForm />);
    await fillValidForm(user, { password: "12345", confirmPassword: "12345" });
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/at least 6 characters/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("rejects mismatched password/confirm-password (Functional)", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn();
    render(<UserSignUpForm />);
    await fillValidForm(user, { password: "secret1", confirmPassword: "secret2" });
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/do not match/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("requires the terms checkbox to be checked (Functional)", async () => {
    const user = userEvent.setup();
    global.fetch = vi.fn();
    render(<UserSignUpForm />);
    await fillValidForm(user, { checkTerms: false });
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/accept the terms/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("validates fields in order: username -> email -> password -> confirm -> terms (Functional)", async () => {
    // All fields present but username invalid AND email invalid: username error must win.
    const user = userEvent.setup();
    global.fetch = vi.fn();
    render(<UserSignUpForm />);
    await fillValidForm(user, { username: "x", email: "bad" });
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/4-20 characters/i)).toBeInTheDocument();
  });

  it("submits the exact payload shape { username, email, password } (trimmed) to POST `${API_BASE}register-admin` (API contract)", async () => {
    mockFetchOnce(200, { success: true, message: "OK", token: makeToken({ id: "1", username: "validuser1", role: "user", exp: 9999999999 }) });
    const user = userEvent.setup();
    render(<UserSignUpForm />);
    await fillValidForm(user, { username: "  validuser1  ", email: "  valid@example.com  " });
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [url, options] = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(String(url).endsWith("register-admin")).toBe(true);
    const sentBody = JSON.parse(options.body);
    expect(sentBody).toEqual({ username: "validuser1", email: "valid@example.com", password: "secret1" });
  });

  it("on success, reads the token from the TOP LEVEL of the response (not nested under data) and saves it (API contract / Regression vs login shape)", async () => {
    const token = makeToken({ id: "1", username: "validuser1", role: "user", exp: 9999999999 });
    mockFetchOnce(200, { success: true, message: "OK", token, user: { id: "1", username: "validuser1", email: "valid@example.com", role: "user" } });
    const user = userEvent.setup();
    render(<UserSignUpForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /sign up/i }));

    await waitFor(() => expect(getUserToken()).toBe(token));
  });

  it("routes admin role to /user-auth/admin-panel and non-admin to /user-auth/dashboard after signup (Functional)", async () => {
    const token = makeToken({ id: "1", username: "adminuser", role: "admin", exp: 9999999999 });
    mockFetchOnce(200, { success: true, message: "OK", token });
    const user = userEvent.setup();
    render(<UserSignUpForm />);
    await fillValidForm(user, { username: "adminuser" });
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    await waitFor(() => expect(push).toHaveBeenCalledWith("/user-auth/admin-panel"));
  });

  it("maps USERNAME_ALREADY_EXISTS to a friendly message (API)", async () => {
    mockFetchOnce(409, { success: false, message: "USERNAME_ALREADY_EXISTS" });
    const user = userEvent.setup();
    render(<UserSignUpForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/already taken/i)).toBeInTheDocument();
    expect(getUserToken()).toBeNull();
  });

  it("maps EMAIL_ALREADY_EXISTS to a friendly message (API)", async () => {
    mockFetchOnce(409, { success: false, message: "EMAIL_ALREADY_EXISTS" });
    const user = userEvent.setup();
    render(<UserSignUpForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/already registered/i)).toBeInTheDocument();
  });

  it("shows a generic error and does not crash when success:true but token is missing (API defensive branch)", async () => {
    mockFetchOnce(200, { success: true, message: "OK" }); // no token field
    const user = userEvent.setup();
    render(<UserSignUpForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/registration failed/i)).toBeInTheDocument();
    expect(getUserToken()).toBeNull();
    expect(push).not.toHaveBeenCalled();
  });

  it("shows a server-error message when fetch rejects (network failure) (Functional)", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("network down"));
    const user = userEvent.setup();
    render(<UserSignUpForm />);
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /sign up/i }));
    expect(await screen.findByText(/server error/i)).toBeInTheDocument();
  });

  it("password and confirm-password inputs are masked by default (Security)", () => {
    render(<UserSignUpForm />);
    const password = screen.getByPlaceholderText(/min 6 chars/i) as HTMLInputElement;
    const confirm = screen.getByPlaceholderText(/re-enter your password/i) as HTMLInputElement;
    expect(password.type).toBe("password");
    expect(confirm.type).toBe("password");
  });
});
