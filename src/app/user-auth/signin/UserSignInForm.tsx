"use client";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, ChangeEvent, FormEvent } from "react";
import { saveUserToken } from "@/app/utils/userAuth";
import { parseUserJwt } from "@/app/utils/useUserAuthGuard";
import API_BASE from "../../../../baseurl";

interface FormState {
  username: string;
  password: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: {
    token: string;
    user: {
      id: string;
      username: string;
      role: string;
    };
  };
}

const ERROR_MESSAGES: Record<string, string> = {
  ADMIN_NOT_FOUND: "Account not found.",
  INVALID_PASSWORD: "Incorrect password.",
  ACCOUNT_INACTIVE: "Your account has been deactivated. Please contact an administrator.",
};

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

export default function UserSignInForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [form, setForm] = useState<FormState>({
    username: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");

    if (!form.username.trim() || !form.password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}admin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username.trim(),
          password: form.password,
        }),
      });

      const data: ApiResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(ERROR_MESSAGES[data.message] || data.message || "Login failed.");
        return;
      }

      if (!data.data?.token) {
        setError("Login failed.");
        return;
      }

      saveUserToken(data.data.token);

      const payload = parseUserJwt(data.data.token);
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
    <div className="flex w-full max-w-md flex-col rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-950">
      <div className="mb-6">
        <h1 className="mb-2 text-title-sm font-semibold text-gray-800 dark:text-white/90">
          Sign In
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your credentials to access your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-6">
          <div>
            <Label>
              Username or Email <span className="text-error-500">*</span>
            </Label>
            <input
              type="text"
              name="username"
              placeholder="Enter your username or email"
              value={form.username}
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
                placeholder="Enter your password"
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

          {error && <p className="text-sm text-error-500">{error}</p>}

          <div>
            <Button type="submit" className="w-full" size="sm" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </div>
        </div>
      </form>

      <div className="mt-5">
        <p className="text-center text-sm font-normal text-gray-700 dark:text-gray-400">
          Don&apos;t have an account?{" "}
          <Link href="/user-auth/signup" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
