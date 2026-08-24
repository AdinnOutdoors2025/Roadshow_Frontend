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

import {
  // HiOutlineMail,
  HiOutlineInformationCircle,
  HiCheckCircle,
  HiOutlinePaperAirplane,
  HiOutlineUserGroup,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";

import { HiOutlineMail } from "react-icons/hi";

import { toast, Toaster } from "react-hot-toast";

import API_BASE from "../../../../baseurl";

import { getToken } from "../../utils/auth";

const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const isValidEmailField = (value: string) => {
  if (!value.trim()) return true;

  const emails = value
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

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

  const hasChanges =
    defaultTo !== initialTo || defaultCc !== initialCc;

  const fetchSetting = async () => {
    try {
      setLoading(true);

      const token = getToken();

      const res = await fetch(
        `${API_BASE}project-settings`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to fetch project setting"
        );
      }

      const to =
        data.data?.data?.defaultTo || "";

      const cc =
        data.data?.data?.defaultCc || "";

      setDefaultTo(to);
      setDefaultCc(cc);

      setInitialTo(to);
      setInitialCc(cc);
    } catch (err: any) {
      toast.error(
        err.message ||
          "Failed to fetch project setting"
      );
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
      setToError(
        "Enter a valid email address"
      );
      return;
    }

    if (
      defaultCc.trim() &&
      !isValidEmailField(defaultCc)
    ) {
      setCcError(
        "Enter a valid email address"
      );
      return;
    }

    try {
      setSaving(true);

      const token = getToken();

      const res = await fetch(
        `${API_BASE}project-settings`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },

          body: JSON.stringify({
            defaultTo,
            defaultCc,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message ||
            "Failed to update project setting"
        );
      }

      const to =
        data.data?.data?.defaultTo ||
        defaultTo;

      const cc =
        data.data?.data?.defaultCc ||
        defaultCc;

      toast.success(
        "Project setting updated successfully!"
      );

      setDefaultTo(to);
      setDefaultCc(cc);

      setInitialTo(to);
      setInitialCc(cc);
    } catch (err: any) {
      toast.error(
        err.message ||
          "Failed to update project setting"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faff] px-4 py-6 dark:bg-gray-950 md:px-6 lg:px-8">
      <Toaster position="top-right" />

      <div className="mx-auto max-w-5xl">

        {/* =========================
            PAGE HEADER
        ========================== */}

        <div className="relative mb-6 overflow-hidden rounded-3xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-violet-50 px-6 py-6 shadow-sm dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-violet-950/20 md:px-8 md:py-7">

          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-violet-200/30 blur-3xl dark:bg-violet-500/10" />

          <div className="pointer-events-none absolute right-40 bottom-[-80px] h-40 w-40 rounded-full bg-blue-200/30 blur-3xl dark:bg-blue-500/10" />

          <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">

            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 text-white shadow-lg shadow-blue-500/20">
                <HiOutlineCog6Tooth className="text-2xl" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Project Settings
                </h1>

                <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
                  Manage default notification
                  recipients used during project
                  workflows.
                </p>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-medium text-blue-600 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/70 dark:text-blue-400 md:flex">
              <HiOutlineMail className="text-base" />
              Email Configuration
            </div>
          </div>
        </div>

        {/* =========================
            MAIN CARD
        ========================== */}

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.05)] dark:border-gray-800 dark:bg-gray-900">

          {/* Card Header */}

          <div className="relative border-b border-gray-100 bg-gradient-to-r from-white via-blue-50/40 to-violet-50/50 px-6 py-6 dark:border-gray-800 dark:from-gray-900 dark:via-gray-900 dark:to-violet-950/10 md:px-8">

            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 ring-1 ring-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:ring-blue-500/20">
                  <HiOutlineMail className="text-2xl" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Project Code Creation Mail
                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Configure default email recipients
                    for Project Code Creation
                    notifications.
                  </p>
                </div>
              </div>

              <div className="hidden rounded-2xl bg-gradient-to-br from-violet-50 to-blue-50 p-4 text-violet-500 dark:from-violet-500/10 dark:to-blue-500/10 md:block">
                <HiOutlinePaperAirplane className="text-3xl" />
              </div>
            </div>
          </div>

          {/* =========================
              INFO BANNER
          ========================== */}

          <div className="px-6 pt-6 md:px-8">
            <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 to-blue-50/40 px-4 py-4 dark:border-blue-500/20 dark:from-blue-500/10 dark:to-transparent">

              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                <HiOutlineInformationCircle className="text-lg" />
              </div>

              <p className="text-sm leading-6 text-blue-700 dark:text-blue-300">
                These default{" "}
                <span className="font-semibold">
                  To / CC
                </span>{" "}
                addresses are used when sending the{" "}
                <span className="font-semibold">
                  Project Code Creation
                </span>{" "}
                mail during{" "}
                <span className="font-semibold">
                  Sales Handling → Order Confirmation
                  → Project Code Creation
                </span>
                . Separate multiple emails with commas.
              </p>
            </div>
          </div>

          {/* =========================
              BODY
          ========================== */}

          <div className="px-6 py-7 md:px-8">

            {loading ? (
              <div className="space-y-6">

                <div>
                  <div className="mb-2 h-4 w-20 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                </div>

                <div>
                  <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-100 dark:bg-gray-800" />
                  <div className="h-12 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-800" />
                </div>

              </div>
            ) : (
              <div className="space-y-6">

                {/* =========================
                    TO FIELD
                ========================== */}

                <div>
                  <div className="mb-2 flex items-center justify-between">

                    <label className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      To
                      <span className="text-red-500">
                        *
                      </span>
                    </label>

                    <span className="text-xs text-gray-400">
                      Required
                    </span>
                  </div>

                  <div className="relative">

                    <HiOutlineUserGroup className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />

                    <input
                      type="text"
                      value={defaultTo}
                      onChange={(e) => {
                        setDefaultTo(
                          e.target.value
                        );

                        if (toError) {
                          setToError("");
                        }
                      }}
                      placeholder="adinn@gmail.com, adinn1@gmail.com"
                      className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:ring-4 dark:bg-gray-800 dark:text-white ${
                        toError
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/50 dark:focus:ring-red-500/10"
                          : "border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                      }`}
                    />
                  </div>

                  {toError && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {toError}
                    </p>
                  )}

                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                    Add one or multiple recipient
                    email addresses separated by
                    commas.
                  </p>
                </div>

                {/* Divider */}

                <div className="border-t border-gray-100 dark:border-gray-800" />

                {/* =========================
                    CC FIELD
                ========================== */}

                <div>

                  <div className="mb-2 flex items-center justify-between">

                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      CC{" "}
                      <span className="font-normal text-gray-400 dark:text-gray-500">
                        (optional)
                      </span>
                    </label>

                    <span className="text-xs text-gray-400">
                      Optional
                    </span>
                  </div>

                  <div className="relative">

                    <HiOutlineUserGroup className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-lg text-gray-400" />

                    <input
                      type="text"
                      value={defaultCc}
                      onChange={(e) => {
                        setDefaultCc(
                          e.target.value
                        );

                        if (ccError) {
                          setCcError("");
                        }
                      }}
                      placeholder="adinn1@gmail.com, adinn2@gmail.com"
                      className={`w-full rounded-xl border bg-white py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:ring-4 dark:bg-gray-800 dark:text-white ${
                        ccError
                          ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-500/50 dark:focus:ring-red-500/10"
                          : "border-gray-200 hover:border-gray-300 focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:hover:border-gray-600 dark:focus:border-blue-500 dark:focus:ring-blue-500/10"
                      }`}
                    />
                  </div>

                  {ccError && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {ccError}
                    </p>
                  )}

                  <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
                    Additional recipients can be
                    added here if required.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* =========================
              FOOTER
          ========================== */}

          {!loading && (
            <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50/70 px-6 py-5 dark:border-gray-800 dark:bg-gray-800/30 sm:flex-row sm:items-center sm:justify-between md:px-8">

              <div className="text-xs text-gray-400">
                {hasChanges
                  ? "You have unsaved changes."
                  : "All changes are saved."}
              </div>

              <button
                type="button"
                onClick={handleSave}
                disabled={
                  saving || !hasChanges
                }
                className="inline-flex min-w-[155px] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-md"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Saving...
                  </>
                ) : (
                  <>
                    <HiCheckCircle className="text-lg" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* =========================
            BOTTOM NOTE
        ========================== */}

        <div className="mt-4 flex items-start gap-2 px-1 text-xs leading-5 text-gray-400 dark:text-gray-500">
          <HiOutlineInformationCircle className="mt-0.5 shrink-0 text-sm" />

          <span>
            Changes made here will be used as the
            default mail recipients for future
            Project Code Creation emails.
          </span>
        </div>
      </div>
    </div>
  );
}