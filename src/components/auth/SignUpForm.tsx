"use client";
import Label from "@/components/form/Label";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { saveToken } from "@/utils/auth";
import API_BASE from "../../../baseurl";

interface FormState {
  username: string;
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
    role: string;
  };
}

const ERROR_MESSAGES: Record<string, string> = {
  USERNAME_ALREADY_EXISTS: "Username already taken. Try another.",
};

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

export default function SignUpForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [form, setForm] = useState<FormState>({
    username: "",
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

    if (!form.username || !form.password || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    // ✅ Confirm password check
    if (form.password !== form.confirmPassword) {
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
          password: form.password,
        }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(ERROR_MESSAGES[data.message] || data.message || "Registration failed.");
        return;
      }

      if (data.token) {
        saveToken(data.token);
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full overflow-y-auto no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Admin Register
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your credentials to create an admin account.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label>Username <span className="text-error-500">*</span></Label>
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your username (4–20 chars)"
                  value={form.username}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <Label>Password <span className="text-error-500">*</span></Label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password (min 6 chars)"
                    value={form.password}
                    onChange={handleChange}
                    className={inputClass}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                    )}
                  </span>
                </div>
              </div>

              {/* ✅ Confirm Password - புதிய field */}
              <div>
                <Label>Confirm Password <span className="text-error-500">*</span></Label>
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
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
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
                  id="terms"
                  checked={isChecked}
                  onChange={(e) => setIsChecked(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-brand-500 cursor-pointer accent-brand-500"
                />
                <label htmlFor="terms" className="inline-block font-normal text-gray-500 dark:text-gray-400 cursor-pointer">
                  By creating an account means you agree to the{" "}
                  <span className="text-gray-800 dark:text-white/90">Terms and Conditions,</span>{" "}
                  and our{" "}
                  <span className="text-gray-800 dark:text-white">Privacy Policy</span>
                </label>
              </div>

              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center justify-center w-full px-4 py-3 text-sm font-medium text-white transition rounded-lg bg-brand-500 shadow-theme-xs hover:bg-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Registering..." : "Sign Up"}
                </button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Already have an account?{" "}
              <Link href="/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}