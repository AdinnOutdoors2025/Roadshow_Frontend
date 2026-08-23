
"use client";

import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast, Toaster } from "react-hot-toast";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import API_BASE from "../../../../baseurl";
import { getToken, saveToken } from "@/app/utils/auth";
import FormField, { inputClass } from "@/components/reusableFormField";
import ComponentCard from "@/components/common/ComponentCard";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

interface DecodedToken {
  id: string;
  username: string;
  email: string;
  role: string;
  isAdmin: number;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [roleLabel, setRoleLabel] = useState("Admin");

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      setUsername(decoded.username || "");
      setEmail(decoded.email || "");
      const isAdminNum = Number(decoded.isAdmin);
      setRoleLabel(isAdminNum === 1 ? "Admin" : isAdminNum === 2 ? "Sales" : isAdminNum === 3 ? "Operation" : "Staff Admin");
    } catch {
      // ignore decode failure — form stays blank, useAuthGuard elsewhere handles invalid tokens
    }
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!username.trim() || !/^[a-zA-Z0-9]{4,20}$/.test(username.trim()))
      newErrors.username = "Username must be 4-20 alphanumeric characters";
    if (!email.trim() || !EMAIL_REGEX.test(email.trim()))
      newErrors.email = "Enter a valid email";
    if (password && password.length < 6)
      newErrors.password = "Password must be at least 6 characters";
    if (password && password !== confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const token = getToken();
      const payload: Record<string, string> = {
        username: username.trim(),
        email: email.trim(),
      };
      if (password) {
        payload.password = password;
        payload.confirmPassword = confirmPassword;
      }

      const res = await fetch(`${API_BASE}admin/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        const msg =
          data?.message === "EMAIL_ALREADY_EXISTS"
            ? "Email already registered to another account."
            : data?.message || "Failed to update profile";
        throw new Error(msg);
      }

      if (data.data?.token) {
        saveToken(data.data.token);
      }

      setPassword("");
      setConfirmPassword("");
      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const initials = username.trim().slice(0, 2).toUpperCase() || "AD";

  return (
    <div>
      <Toaster position="top-right" />
      <PageBreadcrumb pageTitle="Edit Profile" />

      <ComponentCard
        title={`${roleLabel} Profile`}
        desc="Update your own login username, email, and password."
      >
        {/* Header: avatar + role badge */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white shadow-sm">
            {initials}
          </div>
          <div>
            <p className="text-base font-semibold text-gray-800 dark:text-white/90">
              {username || "Your Account"}
            </p>
            <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
              {roleLabel}
            </span>
          </div>
        </div>

        <div className="max-w-2xl space-y-6">
          {/* Basic info */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="Username" error={errors.username} required>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. johndoe"
                  className={inputClass(!!errors.username)}
                />
              </FormField>

              <FormField label="Email" error={errors.email} required>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. johndoe@example.com"
                  className={inputClass(!!errors.email)}
                />
              </FormField>
            </div>
          </div>

          {/* Password section */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
            <h3 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              Change Password
            </h3>
            <p className="mb-3 text-xs text-gray-400">
              Leave blank if you don&apos;t want to change your password.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField label="New Password" error={errors.password}>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Leave blank to keep current"
                    className={inputClass(!!errors.password)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>

              {password && (
                <FormField label="Confirm Password" error={errors.confirmPassword} required>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onPaste={(e) => e.preventDefault()}
                      placeholder="Re-enter new password"
                      className={inputClass(!!errors.confirmPassword)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormField>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 hover:shadow-md disabled:opacity-60 disabled:hover:shadow-none transition-all"
            >
              {saving && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
              )}
              Save Changes
            </button>
          </div>
        </div>
      </ComponentCard>
    </div>
  );
}

