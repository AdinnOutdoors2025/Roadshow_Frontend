// "use client";

// import React, { useEffect, useState } from "react";
// import { HiOutlineMail } from "react-icons/hi";
// import { toast, Toaster } from "react-hot-toast";
// import API_BASE from "../../../../baseurl";
// import { getToken } from "../../utils/auth";

// const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

// const isValidEmailField = (value: string) => {
//   if (!value.trim()) return true;
//   const emails = value.split(",").map((e) => e.trim()).filter(Boolean);
//   return emails.every(isValidEmail);
// };

// export default function ProjectSettingPage() {
//   const [defaultTo, setDefaultTo] = useState("");
//   const [defaultCc, setDefaultCc] = useState("");
//   const [toError, setToError] = useState("");
//   const [ccError, setCcError] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   const fetchSetting = async () => {
//     try {
//       setLoading(true);
//       const token = getToken();
//       const res = await fetch(`${API_BASE}project-settings`, {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       const data = await res.json();
//       if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch project setting");
//       setDefaultTo(data.data?.data?.defaultTo || "");
//       setDefaultCc(data.data?.data?.defaultCc || "");
//     } catch (err: any) {
//       toast.error(err.message || "Failed to fetch project setting");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSetting();
//   }, []);

//   const handleSave = async () => {
//     setToError("");
//     setCcError("");

//     if (!defaultTo.trim()) {
//       setToError("To email is required");
//       return;
//     }
//     if (!isValidEmailField(defaultTo)) {
//       setToError("Enter a valid email address");
//       return;
//     }
//     if (defaultCc.trim() && !isValidEmailField(defaultCc)) {
//       setCcError("Enter a valid email address");
//       return;
//     }

//     try {
//       setSaving(true);
//       const token = getToken();
//       const res = await fetch(`${API_BASE}project-settings`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ defaultTo, defaultCc }),
//       });
//       const data = await res.json();
//       if (!res.ok || !data.success) throw new Error(data.message || "Failed to update project setting");
//       toast.success("Project setting updated successfully!");
//       setDefaultTo(data.data?.data?.defaultTo || defaultTo);
//       setDefaultCc(data.data?.data?.defaultCc || defaultCc);
//     } catch (err: any) {
//       toast.error(err.message || "Failed to update project setting");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <div className="p-4 md:p-6">
//       <Toaster position="top-right" />
//       <div className="mb-5 flex items-center gap-2">
//         <HiOutlineMail className="text-2xl text-brand-500" />
//         <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
//           Project Settings
//         </h1>
//       </div>

//       <div className="max-w-xl rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
//         <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
//           Default To / CC email addresses used when sending the Project Code Creation mail
//           (Sales Handling: Order Confirmation → Project Code Creation). Multiple emails can be
//           separated by commas.
//         </p>

//         {loading ? (
//           <p className="text-sm text-gray-400">Loading...</p>
//         ) : (
//           <div className="space-y-4">
//             <div>
//               <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 To <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={defaultTo}
//                 onChange={(e) => setDefaultTo(e.target.value)}
//                 placeholder="adinn@gmail.com,adinn1@gmail.com"
//                 className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
//               />
//               {toError && <p className="mt-1 text-xs text-red-500">{toError}</p>}
//             </div>

//             <div>
//               <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
//                 CC
//               </label>
//               <input
//                 type="text"
//                 value={defaultCc}
//                 onChange={(e) => setDefaultCc(e.target.value)}
//                 placeholder="adinn1@gmail.com,adinn2@gmail.com"
//                 className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
//               />
//               {ccError && <p className="mt-1 text-xs text-red-500">{ccError}</p>}
//             </div>

//             <button
//               onClick={handleSave}
//               disabled={saving}
//               className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-60"
//             >
//               {saving ? "Saving..." : "Save"}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import React, { useEffect, useState } from "react";
import { HiOutlineMail, HiOutlineInformationCircle, HiCheckCircle } from "react-icons/hi";
import { toast, Toaster } from "react-hot-toast";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidEmailField = (value: string) => {
  if (!value.trim()) return true;
  const emails = value.split(",").map((e) => e.trim()).filter(Boolean);
  return emails.every(isValidEmail);
};

export default function ProjectSettingPage() {
  const [defaultTo, setDefaultTo] = useState("");
  const [defaultCc, setDefaultCc] = useState("");
  const [initialTo, setInitialTo] = useState("");
  const [initialCc, setInitialCc] = useState("");
  const [toError, setToError] = useState("");
  const [ccError, setCcError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Only enabled when To or CC has actually changed from the loaded values
  const hasChanges = defaultTo !== initialTo || defaultCc !== initialCc;

  const fetchSetting = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const res = await fetch(`${API_BASE}project-settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to fetch project setting");

      const to = data.data?.data?.defaultTo || "";
      const cc = data.data?.data?.defaultCc || "";

      setDefaultTo(to);
      setDefaultCc(cc);
      setInitialTo(to);
      setInitialCc(cc);
    } catch (err: any) {
      toast.error(err.message || "Failed to fetch project setting");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSetting();
  }, []);

  const handleSave = async () => {
    setToError("");
    setCcError("");

    if (!defaultTo.trim()) {
      setToError("To email is required");
      return;
    }
    if (!isValidEmailField(defaultTo)) {
      setToError("Enter a valid email address");
      return;
    }
    if (defaultCc.trim() && !isValidEmailField(defaultCc)) {
      setCcError("Enter a valid email address");
      return;
    }

    try {
      setSaving(true);
      const token = getToken();
      const res = await fetch(`${API_BASE}project-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ defaultTo, defaultCc }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to update project setting");

      const to = data.data?.data?.defaultTo || defaultTo;
      const cc = data.data?.data?.defaultCc || defaultCc;

      toast.success("Project setting updated successfully!");
      setDefaultTo(to);
      setDefaultCc(cc);
      setInitialTo(to);
      setInitialCc(cc);
    } catch (err: any) {
      toast.error(err.message || "Failed to update project setting");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-950 md:p-8">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-3xl">
        {/* Page header */}
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
            <HiOutlineMail className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Project Settings
            </h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Manage default notification recipients for project workflows
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          {/* Card header */}
          <div className="border-b border-gray-100 bg-gray-50/60 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/40">
            <h2 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              Project Code Creation Mail
            </h2>
          </div>

          {/* Info banner */}
          <div className="mx-6 mt-5 flex items-start gap-2.5 rounded-lg border border-blue-100 bg-blue-50 px-3.5 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
            <HiOutlineInformationCircle className="mt-0.5 shrink-0 text-base text-blue-500 dark:text-blue-400" />
            <p className="text-xs leading-relaxed text-blue-700 dark:text-blue-300">
              These default To / CC addresses are used when sending the Project Code Creation
              mail during{" "}
              <span className="font-medium">
                Sales Handling → Order Confirmation → Project Code Creation
              </span>
              . Separate multiple emails with commas.
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-6">
            {loading ? (
              <div className="space-y-4">
                <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-800" />
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                    To
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={defaultTo}
                    onChange={(e) => setDefaultTo(e.target.value)}
                    placeholder="adinn@gmail.com, adinn1@gmail.com"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 dark:bg-gray-800 dark:text-white ${
                      toError
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/50 dark:focus:ring-red-500/10"
                        : "border-gray-300 focus:border-brand-400 focus:ring-brand-100 dark:border-gray-700 dark:focus:ring-brand-500/10"
                    }`}
                  />
                  {toError && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{toError}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    CC{" "}
                    <span className="font-normal text-gray-400 dark:text-gray-500">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={defaultCc}
                    onChange={(e) => setDefaultCc(e.target.value)}
                    placeholder="adinn1@gmail.com, adinn2@gmail.com"
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-800 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 dark:bg-gray-800 dark:text-white ${
                      ccError
                        ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/50 dark:focus:ring-red-500/10"
                        : "border-gray-300 focus:border-brand-400 focus:ring-brand-100 dark:border-gray-700 dark:focus:ring-brand-500/10"
                    }`}
                  />
                  {ccError && (
                    <p className="mt-1.5 text-xs font-medium text-red-500">{ccError}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer / actions */}
          {!loading && (
            <div className="flex items-center justify-end gap-3 border-t border-gray-100 bg-gray-50/60 px-6 py-4 dark:border-gray-800 dark:bg-gray-800/40">
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <HiCheckCircle className="text-base" />
                    Save Changes
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