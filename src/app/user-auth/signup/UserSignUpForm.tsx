"use client";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { saveUserToken } from "@/app/utils/userAuth";
import { parseUserJwt } from "@/app/utils/useUserAuthGuard";
import {
  isValidEmail,
  isValidPassword,
  isValidUsername,
  passwordsMatch,
  MIN_PASSWORD_LENGTH,
} from "../validators";
import API_BASE from "../../../../baseurl";

interface FormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

const ERROR_MESSAGES: Record<string, string> = {
  USERNAME_ALREADY_EXISTS: "Username already taken. Try another.",
  EMAIL_ALREADY_EXISTS: "Email already registered. Try logging in instead.",
};

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

export default function UserSignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [form, setForm] = useState<FormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!form.username || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (!isValidUsername(form.username)) {
      setError("Username must be 4-20 characters and contain only letters, numbers, and underscores.");
      return;
    }

    if (!isValidEmail(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!isValidPassword(form.password)) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    if (!passwordsMatch(form.password, form.confirmPassword)) {
      setError("Passwords do not match.");
      return;
    }

    if (!isChecked) {
      setError("Please accept the Terms and Conditions to continue.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}register-admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          email: form.email.trim(),
          password: form.password,
        }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(ERROR_MESSAGES[data.message] || data.message || "Registration failed.");
        return;
      }

      if (!data.token) {
        setError("Registration failed.");
        return;
      }

      saveUserToken(data.token);

      const payload = parseUserJwt(data.token);
      if (payload?.role === "admin") {
        router.push("/user-auth/admin-panel");
      } else {
        router.push("/user-auth/dashboard");
      }
    } catch {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full max-w-md flex-col overflow-y-auto rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-6">
        <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90">
          Create Account
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your details to create a new account.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          <div>
            <Label>
              Username <span className="text-error-500">*</span>
            </Label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username (4-20 chars)"
              value={form.username}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <Label>
              Email <span className="text-error-500">*</span>
            </Label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <Label>
              Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={`Enter your password (min ${MIN_PASSWORD_LENGTH} chars)`}
                value={form.password}
                onChange={handleChange}
                className={inputClass}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
              >
                {showPassword ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          <div>
            <Label>
              Confirm Password <span className="text-error-500">*</span>
            </Label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Re-enter your password"
                value={form.confirmPassword}
                onChange={handleChange}
                className={inputClass}
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-4 top-1/2 z-30 -translate-y-1/2 cursor-pointer"
              >
                {showConfirm ? (
                  <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                ) : (
                  <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                )}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="user-auth-terms"
              checked={isChecked}
              onChange={(e) => setIsChecked(e.target.checked)}
              className="h-5 w-5 cursor-pointer rounded border-gray-300 text-brand-500 accent-brand-500"
            />
            <label
              htmlFor="user-auth-terms"
              className="inline-block cursor-pointer font-normal text-gray-500 dark:text-gray-400"
            >
              By creating an account you agree to the{" "}
              <span className="text-gray-800 dark:text-white/90">Terms and Conditions</span>{" "}
              and our <span className="text-gray-800 dark:text-white">Privacy Policy</span>
            </label>
          </div>

          {error && <p className="text-sm text-error-500">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white shadow-theme-xs transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Registering..." : "Sign Up"}
            </button>
          </div>
        </div>
      </form>

      <div className="mt-5">
        <p className="text-center text-sm font-normal text-gray-700 dark:text-gray-400">
          Already have an account?{" "}
          <Link href="/user-auth/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
