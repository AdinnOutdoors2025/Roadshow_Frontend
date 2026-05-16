"use client";

import React, { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import API_BASE from "../../../../../baseurl";
import { inputClass, selectClass } from "../../../../components/reusableFormField";
import FormField from "../../../../components/reusableFormField";
import { getToken } from "@/utils/auth";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export interface StaffAdmin {
  _id?: string;
  username: string;
  password?: string;
  phone: string;
  status: "active" | "inactive";
}

interface Props {
  editingStaffAdmin: StaffAdmin | null;
  onSuccess: () => void;
  onClose: () => void;
}

const defaultForm: StaffAdmin = {
  username: "",
  password: "",
  phone: "",
  status: "active",
};

export default function StaffAdminFormModal({ editingStaffAdmin, onSuccess, onClose }: Props) {
  const [form, setForm] = useState<StaffAdmin>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof StaffAdmin, string>>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEdit = !!editingStaffAdmin;

  useEffect(() => {
    setForm(editingStaffAdmin ? { ...editingStaffAdmin, password: "" } : defaultForm);
    setErrors({});
    setConfirmPassword("");
  }, [editingStaffAdmin]);

  const handleChange = (field: keyof StaffAdmin, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StaffAdmin, string>> = {};
    if (!form.username.trim()) newErrors.username = "Username is required";
    if (!isEdit && !form.password) newErrors.password = "Password is required";
    // if (form.password && form.password.length < 6) newErrors.password = "Min 6 characters";
    if (form.password && form.password !== confirmPassword)
      newErrors.password = "Passwords do not match";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const token = getToken();

      const payload: any = {
        username: form.username.trim(),
        phone: form.phone.trim(),
        status: form.status,
      };
      if (form.password) payload.password = form.password;

      const url = isEdit
        ? `${API_BASE}staff-admins/${editingStaffAdmin!._id}`
        : `${API_BASE}staff-admins/`;

      const res = await fetch(url, {
        method: isEdit ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to save");
      }
      onSuccess();
    } catch (err: any) {
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md max-h-[70vh] overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">

        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
            {isEdit ? "Edit Staff Admin" : "Add Staff Admin"}
          </h2>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
            <IoMdClose />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <FormField label="Username" error={errors.username} required>
            <input
              type="text"
              value={form.username}
              onChange={(e) => handleChange("username", e.target.value)}
              placeholder="e.g. staffjohn"
              className={inputClass(!!errors.username)}
            />
          </FormField>

          {/* <FormField
            label={isEdit ? "New Password (optional)" : "Password"}
            error={errors.password}
            required={!isEdit}
          >
            <input
              type="password"
              value={form.password || ""}
              onChange={(e) => handleChange("password", e.target.value)}
              placeholder={isEdit ? "Leave blank to keep current" : "Min 6 characters"}
              className={inputClass(!!errors.password)}
            />
          </FormField> */}

          <FormField label={isEdit ? "New Password (optional)" : "Password"}>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password || ""}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder={isEdit ? "Leave blank to keep current" : "Min 6 characters"}
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

          {(form.password || !isEdit) && (
            <FormField label="Confirm Password" required={!isEdit}>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onPaste={(e) => e.preventDefault()}  // paste disable
                  placeholder="Re-enter password"
                  className={inputClass(false)}
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

          <FormField label="Phone Number">
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                handleChange("phone", val);
              }}
              placeholder="e.g. 9876543210"
              maxLength={10}
              className={inputClass(false)}
            />
          </FormField>

          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</p>
            <button
              type="button"
              onClick={() => handleChange("status", form.status === "active" ? "inactive" : "active")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.status === "active" ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-md transition-transform ${form.status === "active" ? "translate-x-6" : "translate-x-1"
                }`} />
            </button>
            <span className={`text-sm font-medium ${form.status === "active" ? "text-green-600" : "text-red-500"}`}>
              {form.status === "active" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 flex items-center justify-end gap-3 border-t border-gray-100 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            )}
            {isEdit ? "Update" : "Add Staff Admin"}
          </button>
        </div>
      </div>
    </div >
  );
}