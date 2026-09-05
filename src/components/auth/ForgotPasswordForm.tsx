"use client";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import { CheckCircleIcon, ChevronLeftIcon, EyeCloseIcon, EyeIcon, LockIcon } from "@/icons";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState, ChangeEvent, FormEvent } from "react";
import API_BASE from "../../../baseurl";

interface FormState {
  identifier: string;
  newPassword: string;
  confirmPassword: string;
}

const ERROR_MESSAGES: Record<string, string> = {
  ACCOUNT_NOT_FOUND: "No account found with this username or email.",
};

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-none focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const [form, setForm] = useState<FormState>({
    identifier: "",
    newPassword: "",
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

    if (!form.identifier || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (form.newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}admin/forgot-password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: form.identifier.trim(),
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(ERROR_MESSAGES[data.message] || data.message || "Password reset failed.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/admin/signin"), 1500);
    } catch (err) {
      setError("Server error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto px-4 py-8 sm:px-0">
        <Link
          href="/admin/signin"
          className="mb-6 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-brand-500 dark:text-gray-400 dark:hover:text-brand-400 transition-colors"
        >
          <ChevronLeftIcon className="size-5" />
          Back to Sign In
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-8">
          <div className="mb-7 flex flex-col items-center text-center">
            <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-500/10">
              <LockIcon className="size-6 fill-brand-500" />
            </div>
            <h1 className="mb-1.5 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Forgot Password
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Enter your username or email and set a new password.
            </p>
          </div>

          {success ? (
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-success-50 dark:bg-success-500/10">
                <CheckCircleIcon className="size-7 fill-success-600 dark:fill-success-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  Password reset successfully
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Redirecting to Sign In...
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label>Username or Email <span className="text-error-500">*</span></Label>
                  <input
                    type="text"
                    name="identifier"
                    placeholder="Enter your username or email"
                    value={form.identifier}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <Label>New Password <span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="newPassword"
                      placeholder="Enter new password"
                      value={form.newPassword}
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
                  <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                    Must be at least 6 characters.
                  </p>
                </div>

                <div>
                  <Label>Confirm Password <span className="text-error-500">*</span></Label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Re-enter new password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={inputClass}
                    />
                    <span
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400" />
                      )}
                    </span>
                  </div>
                </div>

                {error && (
                  <div className="rounded-lg border border-error-200 bg-error-50 px-3.5 py-2.5 dark:border-error-500/30 dark:bg-error-500/10">
                    <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
                  </div>
                )}

                <div>
                  <Button type="submit" className="w-full" size="sm" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>

        {!success && (
          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400">
              Remembered your password?{" "}
              <Link href="/admin/signin" className="text-brand-500 hover:text-brand-600 dark:text-brand-400">
                Sign In
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
