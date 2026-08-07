"use client";

import React, { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { HiOutlineShieldCheck } from "react-icons/hi";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";

type Role = "sales" | "operation";

// Kept in sync with the menu `key`/`path` values in AppSidebar.tsx —
// this is the full list of gate-able sidebar entries an admin can grant
// to the Sales Management / Operation Management login roles.
const MENU_OPTIONS: { key: string; label: string }[] = [
  { key: "/admin/dashboard", label: "Dashboard" },
  { key: "/admin/sales-management", label: "Sales Management" },
  { key: "/admin/operation-management", label: "Operation Management" },
  // { key: "/admin/client-request-order", label: "Client Request Order" },
  { key: "/admin/order-creation", label: "Order Creation" },
  { key: "/admin/sales-handling", label: "Sales Handling" },
  { key: "/admin/operation-handling", label: "Operation Handling" },
  { key: "/admin/package-management", label: "Package Management" },
  { key: "/admin/driver", label: "Driver Management" },
  { key: "/admin/promoter", label: "Promoter" },
  { key: "/admin/project-setting", label: "Project Settings" },
  { key: "/admin/invoice-generation", label: "Invoice Generation" },
  { key: "/admin/Vehicles/Vehicle_Onboarding", label: "Vehicle Onboarding" },
  { key: "/admin/Vehicles/Vehicle_Inventory", label: "Vehicle Inventory" },
];

export default function RolePermissionPage() {
  const [role, setRole] = useState<Role>("sales");
  const [allowedMenus, setAllowedMenus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPermission = async (r: Role) => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_BASE}role-permissions/${r}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch role permission");
      const data = await res.json();
      setAllowedMenus(data.data?.data?.allowedMenus || []);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermission(role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const toggleMenu = (key: string) => {
    setAllowedMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = getToken();
      const res = await fetch(`${API_BASE}role-permissions/${role}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ allowedMenus }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.message || "Failed to save");
      }
      toast.success("Permission saved. Takes effect on the user's next login.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 md:p-6">
      <Toaster position="top-right" />
      <div className="mb-5 flex items-center gap-2">
        <HiOutlineShieldCheck className="text-2xl text-red-600" />
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Role Permission
        </h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Select Role
        </label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as Role)}
          className="mb-6 w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        >
          <option value="sales">Sales Management</option>
          <option value="operation">Operation Management</option>
        </select>

        {loading ? (
          <div className="py-10 text-center text-gray-400">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {MENU_OPTIONS.map((m) => (
              <label
                key={m.key}
                className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2.5 text-sm dark:border-gray-800"
              >
                <input
                  type="checkbox"
                  checked={allowedMenus.includes(m.key)}
                  onChange={() => toggleMenu(m.key)}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700 dark:text-gray-300">{m.label}</span>
              </label>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Permission"}
          </button>
        </div>
      </div>
    </div>
  );
}
