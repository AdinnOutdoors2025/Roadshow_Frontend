// "use client";

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { toast, Toaster } from "react-hot-toast";
// import { HiOutlineShieldCheck } from "react-icons/hi";
// import API_BASE from "../../../../baseurl";
// import { getToken } from "../../utils/auth";
// import SearchableSelect from "../../utils/SearchableSelect";

// type Role = "sales" | "operation";

// interface ManagementUser {
//   _id: string;
//   username: string;
//   email: string;
//   status: "active" | "inactive";
// }

// // Kept in sync with the menu `key`/`path` values in AppSidebar.tsx —
// // this is the full list of gate-able sidebar entries an admin can grant
// // to individual Sales Management / Operation Management users.
// const MENU_OPTIONS: { key: string; label: string }[] = [
//   { key: "/admin/dashboard", label: "Dashboard" },
//   { key: "/admin/sales-management", label: "Sales Management" },
//   { key: "/admin/operation-management", label: "Operation Management" },
//   // { key: "/admin/client-request-order", label: "Client Request Order" },
//   { key: "/admin/order-creation", label: "Order Creation" },
//   { key: "/admin/sales-handling", label: "Sales Handling" },
//   { key: "/admin/operation-handling", label: "Operation Handling" },
//   { key: "/admin/package-management", label: "Package Management" },
//   { key: "/admin/driver", label: "Driver Management" },
//   { key: "/admin/promoter", label: "Promoter" },
//   { key: "/admin/project-setting", label: "Project Settings" },
//   { key: "/admin/invoice-generation", label: "Invoice Generation" },
//   { key: "/admin/Vehicles/Vehicle_Onboarding", label: "Vehicle Onboarding" },
//   { key: "/admin/Vehicles/Vehicle_Inventory", label: "Vehicle Inventory" },
// ];

// // Sales Management ("sales" role) uses /staff-admins, Operation Management
// // ("operation" role) uses /operation-users — same shape, different endpoint.
// const USER_LIST_PATH: Record<Role, string> = {
//   sales: "staff-admins",
//   operation: "operation-users",
// };

// export default function RolePermissionPage() {
//   const [role, setRole] = useState<Role>("sales");
//   const [users, setUsers] = useState<ManagementUser[]>([]);
//   const [usersLoading, setUsersLoading] = useState(false);
//   const [selectedUserId, setSelectedUserId] = useState<string>("");

//   const [allowedMenus, setAllowedMenus] = useState<string[]>([]);
//   const [isRoleDefault, setIsRoleDefault] = useState(false);
//   const [permLoading, setPermLoading] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const fetchUsers = async (r: Role) => {
//     try {
//       setUsersLoading(true);
//       setSelectedUserId("");
//       setAllowedMenus([]);
//       const token = getToken();
//       const { data } = await axios.get(`${API_BASE}${USER_LIST_PATH[r]}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const list: ManagementUser[] = data?.data?.data || data?.data || [];
//       setUsers(list);
//       if (list.length) setSelectedUserId(list[0]._id);
//     } catch (err: any) {
//       toast.error(err?.response?.data?.message || "Failed to fetch users");
//       setUsers([]);
//     } finally {
//       setUsersLoading(false);
//     }
//   };

//   const fetchUserPermission = async (userId: string) => {
//     try {
//       setPermLoading(true);
//       const token = getToken();
//       const res = await fetch(`${API_BASE}user-permissions/${userId}`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (!res.ok) throw new Error("Failed to fetch user permission");
//       const data = await res.json();
//       setAllowedMenus(data.data?.data?.allowedMenus || []);
//       setIsRoleDefault(!!data.data?.data?.isRoleDefault);
//     } catch (err: any) {
//       toast.error(err.message || "Something went wrong");
//     } finally {
//       setPermLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchUsers(role);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [role]);

//   useEffect(() => {
//     if (selectedUserId) fetchUserPermission(selectedUserId);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [selectedUserId]);

//   const toggleMenu = (key: string) => {
//     setAllowedMenus((prev) =>
//       prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
//     );
//   };

//   const handleSave = async () => {
//     if (!selectedUserId) return;
//     try {
//       setSaving(true);
//       const token = getToken();
//       const res = await fetch(`${API_BASE}user-permissions/${selectedUserId}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ allowedMenus }),
//       });
//       if (!res.ok) {
//         const errData = await res.json().catch(() => ({}));
//         throw new Error(errData?.message || "Failed to save");
//       }
//       setIsRoleDefault(false);
//       toast.success(".");
//     } catch (err: any) {
//       toast.error(err.message || "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const loading = usersLoading || permLoading;

//   return (
//     <div className="p-4 md:p-6">
//       <Toaster position="top-right" />
//       <div className="mb-5 flex items-center gap-2">
//         <HiOutlineShieldCheck className="text-2xl text-red-600" />
//         <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
//           Role Permission
//         </h1>
//       </div>

//       <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
//         <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
//           <div className="w-full max-w-xs">
//             <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Select Role
//             </label>
//             <SearchableSelect
//               value={role}
//               onChange={(v) => setRole(v as Role)}
//               placeholder="Select role..."
//               options={[
//                 { value: "sales", label: "Sales Management" },
//                 { value: "operation", label: "Operation Management" },
//               ]}
//             />
//           </div>

//           <div className="w-full max-w-xs">
//             <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
//               Select User
//             </label>
//             <SearchableSelect
//               value={selectedUserId}
//               onChange={setSelectedUserId}
//               disabled={usersLoading || users.length === 0}
//               placeholder={users.length === 0 ? "No users found" : "Select user..."}
//               options={users.map((u) => ({ value: u._id, label: u.username }))}
//             />
//           </div>
//         </div>

//         {selectedUserId && isRoleDefault && !permLoading && (
//           <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400">
//             This user has no individual permission saved yet — showing the {role === "sales" ? "Sales Management" : "Operation Management"} role's default access. Saving below creates an override just for this user.
//           </div>
//         )}

//         {loading ? (
//           <div className="py-10 text-center text-gray-400">Loading...</div>
//         ) : !selectedUserId ? (
//           <div className="py-10 text-center text-gray-400">Select a user to configure permissions</div>
//         ) : (
//           <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
//             {MENU_OPTIONS.map((m) => (
//               <label
//                 key={m.key}
//                 className="flex items-center gap-2 rounded-lg border border-gray-100 px-3 py-2.5 text-sm dark:border-gray-800"
//               >
//                 <input
//                   type="checkbox"
//                   checked={allowedMenus.includes(m.key)}
//                   onChange={() => toggleMenu(m.key)}
//                   className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
//                 />
//                 <span className="text-gray-700 dark:text-gray-300">{m.label}</span>
//               </label>
//             ))}
//           </div>
//         )}

//         <div className="mt-6 flex justify-end">
//           <button
//             onClick={handleSave}
//             disabled={saving || loading || !selectedUserId}
//             className="rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
//           >
//             {saving ? "Saving..." : "Save Permission"}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

import {
  HiOutlineShieldCheck,
  HiOutlineInformationCircle,
  HiOutlineUserGroup,
  HiOutlineSquares2X2,
  HiOutlineClipboardDocumentCheck,
  HiOutlineCube,
  HiOutlineTruck,
  HiOutlineMegaphone,
  HiOutlineCog6Tooth,
  HiOutlineDocumentText,
  HiOutlineBriefcase,
  HiOutlineChartBarSquare,
  HiOutlineWrenchScrewdriver,
 
} from "react-icons/hi2";

import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import SearchableSelect from "../../utils/SearchableSelect";
import { HiOutlineSave } from "react-icons/hi";

type Role = "sales" | "operation";

interface ManagementUser {
  _id: string;
  username: string;
  email: string;
  status: "active" | "inactive";
}

const MENU_OPTIONS: {
  key: string;
  label: string;
}[] = [
  {
    key: "/admin/dashboard",
    label: "Dashboard",
  },
  {
    key: "/admin/sales-management",
    label: "Sales Management",
  },
  {
    key: "/admin/operation-management",
    label: "Operation Management",
  },
  {
    key: "/admin/order-creation",
    label: "Order Creation",
  },
  {
    key: "/admin/sales-handling",
    label: "Sales Handling",
  },
  {
    key: "/admin/operation-handling",
    label: "Operation Handling",
  },
  {
    key: "/admin/package-management",
    label: "Package Management",
  },
  {
    key: "/admin/driver",
    label: "Driver Management",
  },
  {
    key: "/admin/promoter",
    label: "Promoter",
  },
  {
    key: "/admin/project-setting",
    label: "Project Settings",
  },
  {
    key: "/admin/invoice-generation",
    label: "Invoice Generation",
  },
  {
    key: "/admin/Vehicles/Vehicle_Onboarding",
    label: "Vehicle Onboarding",
  },
  {
    key: "/admin/Vehicles/Vehicle_Inventory",
    label: "Vehicle Inventory",
  },
];

const USER_LIST_PATH: Record<Role, string> = {
  sales: "staff-admins",
  operation: "operation-users",
};

export default function RolePermissionPage() {
  const [role, setRole] = useState<Role>("sales");

  const [users, setUsers] = useState<ManagementUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");

  const [allowedMenus, setAllowedMenus] = useState<string[]>([]);

  // Stores the currently loaded permissions.
  // This is used only to detect whether anything changed.
  const [initialAllowedMenus, setInitialAllowedMenus] = useState<string[]>([]);

  const [isRoleDefault, setIsRoleDefault] = useState(false);

  const [permLoading, setPermLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Fetch Users
  |--------------------------------------------------------------------------
  */

  const fetchUsers = async (r: Role) => {
    try {
      setUsersLoading(true);

      setSelectedUserId("");
      setAllowedMenus([]);
      setInitialAllowedMenus([]);
      setIsRoleDefault(false);

      const token = getToken();

      const { data } = await axios.get(
        `${API_BASE}${USER_LIST_PATH[r]}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const list: ManagementUser[] =
        data?.data?.data || data?.data || [];

      setUsers(list);

      if (list.length) {
        setSelectedUserId(list[0]._id);
      }
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Failed to fetch users"
      );

      setUsers([]);
      setSelectedUserId("");
    } finally {
      setUsersLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Fetch User Permission
  |--------------------------------------------------------------------------
  */

  const fetchUserPermission = async (userId: string) => {
    try {
      setPermLoading(true);

      const token = getToken();

      const res = await fetch(
        `${API_BASE}user-permissions/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch user permission");
      }

      const data = await res.json();

      const menus: string[] =
        data.data?.data?.allowedMenus || [];

      setAllowedMenus(menus);

      // Important:
      // store loaded permissions separately
      // so Save button can detect real changes.
      setInitialAllowedMenus(menus);

      setIsRoleDefault(
        !!data.data?.data?.isRoleDefault
      );
    } catch (err: any) {
      toast.error(
        err.message || "Something went wrong"
      );

      setAllowedMenus([]);
      setInitialAllowedMenus([]);
    } finally {
      setPermLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | Effects
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    fetchUsers(role);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  useEffect(() => {
    if (selectedUserId) {
      fetchUserPermission(selectedUserId);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUserId]);

  /*
  |--------------------------------------------------------------------------
  | Permission Toggle
  |--------------------------------------------------------------------------
  */

  const toggleMenu = (key: string) => {
    setAllowedMenus((prev) =>
      prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key]
    );
  };

  /*
  |--------------------------------------------------------------------------
  | Detect Changes
  |--------------------------------------------------------------------------
  */

  const hasChanges = useMemo(() => {
    if (!selectedUserId) {
      return false;
    }

    const current = [...allowedMenus].sort();
    const initial = [...initialAllowedMenus].sort();

    if (current.length !== initial.length) {
      return true;
    }

    return current.some(
      (item, index) => item !== initial[index]
    );
  }, [
    allowedMenus,
    initialAllowedMenus,
    selectedUserId,
  ]);

  /*
  |--------------------------------------------------------------------------
  | Save
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
    if (!selectedUserId || !hasChanges) {
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const res = await fetch(
        `${API_BASE}user-permissions/${selectedUserId}`,
        {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            allowedMenus,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res
          .json()
          .catch(() => ({}));

        throw new Error(
          errData?.message || "Failed to save"
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Update initial state after successful save
      |--------------------------------------------------------------------------
      |
      | After saving:
      | current permissions = saved permissions
      | so Save button becomes disabled again.
      |
      */

      setInitialAllowedMenus([...allowedMenus]);

      setIsRoleDefault(false);

      toast.success(
        "Permission saved."
      );
    } catch (err: any) {
      toast.error(
        err.message || "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  };

  const loading = usersLoading || permLoading;

  /*
  |--------------------------------------------------------------------------
  | Menu Icon
  |--------------------------------------------------------------------------
  */

  const getMenuIcon = (key: string) => {
    switch (key) {
      case "/admin/dashboard":
        return HiOutlineSquares2X2;

      case "/admin/sales-management":
        return HiOutlineChartBarSquare;

      case "/admin/operation-management":
        return HiOutlineBriefcase;

      case "/admin/order-creation":
        return HiOutlineClipboardDocumentCheck;

      case "/admin/sales-handling":
        return HiOutlineUserGroup;

      case "/admin/operation-handling":
        return HiOutlineWrenchScrewdriver;

      case "/admin/package-management":
        return HiOutlineCube;

      case "/admin/driver":
        return HiOutlineTruck;

      case "/admin/promoter":
        return HiOutlineMegaphone;

      case "/admin/project-setting":
        return HiOutlineCog6Tooth;

      case "/admin/invoice-generation":
        return HiOutlineDocumentText;

      case "/admin/Vehicles/Vehicle_Onboarding":
      case "/admin/Vehicles/Vehicle_Inventory":
        return HiOutlineTruck;

      default:
        return HiOutlineShieldCheck;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] px-4 py-6 dark:bg-gray-950 md:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-6xl">

        {/* ============================================================
            PAGE HEADER
        ============================================================ */}

        <div className="relative mb-6 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-violet-50 px-6 py-6 shadow-sm dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-violet-950/20 md:px-8 md:py-7">

          <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-500/10" />

          <div className="pointer-events-none absolute right-40 bottom-[-90px] h-44 w-44 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-500/10" />

          <div className="relative flex items-center gap-4">

            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
              <HiOutlineShieldCheck className="text-3xl" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Role Permission
              </h1>

              <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
                Manage individual user access and control
                which modules are available for Sales and
                Operation Management users.
              </p>
            </div>
          </div>
        </div>

        {/* ============================================================
            MAIN CARD
        ============================================================ */}

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)] dark:border-gray-800 dark:bg-gray-900">

          {/* ============================================================
              TOP SECTION
          ============================================================ */}

          <div className="border-b border-gray-100 bg-gradient-to-r from-white via-blue-50/30 to-violet-50/40 px-6 py-6 dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-violet-950/10 md:px-8">

            <div className="mb-5 flex items-start gap-3">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300">
                <HiOutlineUserGroup className="text-xl" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  User Access Configuration
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Choose a management role and user before
                  assigning module permissions.
                </p>
              </div>
            </div>

            {/* Role & User */}

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Select Role
                </label>

                <SearchableSelect
                  value={role}
                  onChange={(v) =>
                    setRole(v as Role)
                  }
                  placeholder="Select role..."
                  options={[
                    {
                      value: "sales",
                      label: "Sales Management",
                    },
                    {
                      value: "operation",
                      label: "Operation Management",
                    },
                  ]}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Select User
                </label>

                <SearchableSelect
                  value={selectedUserId}
                  onChange={setSelectedUserId}
                  disabled={
                    usersLoading ||
                    users.length === 0
                  }
                  placeholder={
                    users.length === 0
                      ? "No users found"
                      : "Select user..."
                  }
                  options={users.map((u) => ({
                    value: u._id,
                    label: u.username,
                  }))}
                />
              </div>
            </div>
          </div>

          {/* ============================================================
              ROLE DEFAULT INFO
          ============================================================ */}

          {selectedUserId &&
            isRoleDefault &&
            !permLoading && (
              <div className="px-6 pt-6 md:px-8">

                <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50/40 px-4 py-4 dark:border-amber-800 dark:from-amber-900/20 dark:to-orange-900/10">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400">
                    <HiOutlineInformationCircle className="text-lg" />
                  </div>

                  <p className="text-sm leading-6 text-amber-700 dark:text-amber-400">
                    This user has no individual permission
                    saved yet — showing the{" "}

                    <span className="font-semibold">
                      {role === "sales"
                        ? "Sales Management"
                        : "Operation Management"}
                    </span>{" "}

                    role&apos;s default access.

                    Saving below creates an override just for
                    this user.
                  </p>
                </div>
              </div>
            )}

          {/* ============================================================
              BODY
          ============================================================ */}

          <div className="px-6 py-6 md:px-8">

            {loading ? (
              /* Loading */

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {Array.from({
                  length: 9,
                }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[72px] animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800"
                  />
                ))}
              </div>
            ) : !selectedUserId ? (
              /* No user */

              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 py-14 text-center dark:border-gray-800 dark:bg-gray-800/20">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-violet-50 text-violet-500 dark:bg-violet-500/10">
                  <HiOutlineUserGroup className="text-2xl" />
                </div>

                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Select a user
                </p>

                <p className="mt-1 text-sm text-gray-400">
                  Choose a user to configure their permissions.
                </p>
              </div>
            ) : (
              <>
                {/* Section heading */}

                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                  <div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      Module Permissions
                    </h3>

                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      Enable or disable the modules this user
                      can access.
                    </p>
                  </div>

                  <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">

                    {allowedMenus.length} of{" "}
                    {MENU_OPTIONS.length} selected
                  </div>
                </div>

                {/* Permission Grid */}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  {MENU_OPTIONS.map((menu) => {
                    const checked =
                      allowedMenus.includes(
                        menu.key
                      );

                    const Icon =
                      getMenuIcon(menu.key);

                    return (
                      <label
                        key={menu.key}
                        className={`group relative flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-4 transition-all duration-200 ${
                          checked
                            ? "border-blue-200 bg-gradient-to-r from-blue-50 to-violet-50/50 shadow-sm dark:border-blue-500/30 dark:from-blue-500/10 dark:to-violet-500/5"
                            : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-800/40"
                        }`}
                      >
                        {/* Menu Icon */}

                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                            checked
                              ? "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                              : "bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 dark:bg-gray-800 dark:text-gray-500"
                          }`}
                        >
                          <Icon className="text-xl" />
                        </div>

                        {/* Label */}

                        <span
                          className={`min-w-0 flex-1 text-sm font-medium ${
                            checked
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {menu.label}
                        </span>

                        {/* Checkbox */}

                        <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">

                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              toggleMenu(menu.key)
                            }
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-gray-300 bg-white transition checked:border-blue-600 checked:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:checked:border-blue-500 dark:checked:bg-blue-500"
                          />

                          <svg
                            className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition peer-checked:opacity-100"
                            viewBox="0 0 20 20"
                            fill="none"
                          >
                            <path
                              d="M4 10.5L8 14L16 6"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* ============================================================
              FOOTER
          ============================================================ */}

          {!loading && selectedUserId && (
            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-5 dark:border-gray-800 dark:bg-gray-800/30 sm:flex-row sm:items-center sm:justify-between md:px-8">

              {/* Change indicator */}

              <div className="text-xs">
                {hasChanges ? (
                  <span className="font-medium text-amber-600 dark:text-amber-400">
                    You have unsaved permission changes.
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">
                    All permission changes are saved.
                  </span>
                )}
              </div>

              {/* Save */}

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving ||
                  loading ||
                  !selectedUserId ||
                  !hasChanges
                }
                className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />

                    Saving...
                  </>
                ) : (
                  <>
                    <HiOutlineSave className="text-lg" />

                    Save Permission
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}