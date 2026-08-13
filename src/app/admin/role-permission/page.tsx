"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { HiOutlineShieldCheck } from "react-icons/hi";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";

type Role = "sales" | "operation";

interface ManagementUser {
  _id: string;
  username: string;
  email: string;
  status: "active" | "inactive";
}

// Kept in sync with the menu `key`/`path` values in AppSidebar.tsx —
// this is the full list of gate-able sidebar entries an admin can grant
// to individual Sales Management / Operation Management users.
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

// Sales Management ("sales" role) uses /staff-admins, Operation Management
// ("operation" role) uses /operation-users — same shape, different endpoint.
const USER_LIST_PATH: Record<Role, string> = {
  sales: "staff-admins",
  operation: "operation-users",
};

export default function RolePermissionPage() {
  const [role, setRole] = useState<Role>("sales");
  const [users, setUsers] = useState<ManagementUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");

  const [allowedMenus, setAllowedMenus] = useState<string[]>([]);
  const [isRoleDefault, setIsRoleDefault] = useState(false);
  const [permLoading, setPermLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchUsers = async (r: Role) => {
    try {
      setUsersLoading(true);
      setSelectedUserId("");
      setAllowedMenus([]);
      const token = getToken();
      const { data } = await axios.get(`${API_BASE}${USER_LIST_PATH[r]}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const list: ManagementUser[] = data?.data?.data || data?.data || [];
      setUsers(list);
      if (list.length) setSelectedUserId(list[0]._id);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to fetch users");
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchUserPermission = async (userId: string) => {
    try {
      setPermLoading(true);
      const token = getToken();
      const res = await fetch(`${API_BASE}user-permissions/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch user permission");
      const data = await res.json();
      setAllowedMenus(data.data?.data?.allowedMenus || []);
      setIsRoleDefault(!!data.data?.data?.isRoleDefault);
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setPermLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(role);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (selectedUserId) fetchUserPermission(selectedUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  const toggleMenu = (key: string) => {
    setAllowedMenus((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const handleSave = async () => {
    if (!selectedUserId) return;
    try {
      setSaving(true);
      const token = getToken();
      const res = await fetch(`${API_BASE}user-permissions/${selectedUserId}`, {
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
      setIsRoleDefault(false);
      toast.success("Permission saved. Takes effect on this user's next login.");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const loading = usersLoading || permLoading;

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
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              <option value="sales">Sales Management</option>
              <option value="operation">Operation Management</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Select User
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={usersLoading || users.length === 0}
              className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {users.length === 0 && <option value="">No users found</option>}
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.username}
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedUserId && isRoleDefault && !permLoading && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
            This user has no individual permission saved yet — showing the {role === "sales" ? "Sales Management" : "Operation Management"} role's default access. Saving below creates an override just for this user.
          </div>
        )}

        {loading ? (
          <div className="py-10 text-center text-gray-400">Loading...</div>
        ) : !selectedUserId ? (
          <div className="py-10 text-center text-gray-400">Select a user to configure permissions</div>
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
            disabled={saving || loading || !selectedUserId}
            className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Permission"}
          </button>
        </div>
      </div>
    </div>
  );
}
