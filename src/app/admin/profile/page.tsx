
// "use client";

// import React, { useEffect, useState } from "react";
// import { jwtDecode } from "jwt-decode";
// import { toast, Toaster } from "react-hot-toast";
// import { FaEye, FaEyeSlash } from "react-icons/fa";
// import API_BASE from "../../../../baseurl";
// import { getToken, saveToken } from "@/app/utils/auth";
// import FormField, { inputClass } from "@/components/reusableFormField";
// import ComponentCard from "@/components/common/ComponentCard";
// import PageBreadcrumb from "@/components/common/PageBreadCrumb";

// interface DecodedToken {
//   id: string;
//   username: string;
//   email: string;
//   role: string;
//   isAdmin: number;
// }

// const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// export default function ProfilePage() {
//   const [username, setUsername] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [errors, setErrors] = useState<Record<string, string>>({});
//   const [saving, setSaving] = useState(false);
//   const [roleLabel, setRoleLabel] = useState("Admin");

//   useEffect(() => {
//     const token = getToken();
//     if (!token) return;
//     try {
//       const decoded = jwtDecode<DecodedToken>(token);
//       setUsername(decoded.username || "");
//       setEmail(decoded.email || "");
//       const isAdminNum = Number(decoded.isAdmin);
//       setRoleLabel(isAdminNum === 1 ? "Admin" : isAdminNum === 2 ? "Sales" : isAdminNum === 3 ? "Operation" : "Staff Admin");
//     } catch {
//       // ignore decode failure — form stays blank, useAuthGuard elsewhere handles invalid tokens
//     }
//   }, []);

//   const validate = (): boolean => {
//     const newErrors: Record<string, string> = {};
//     if (!username.trim() || !/^[a-zA-Z0-9]{4,20}$/.test(username.trim()))
//       newErrors.username = "Username must be 4-20 alphanumeric characters";
//     if (!email.trim() || !EMAIL_REGEX.test(email.trim()))
//       newErrors.email = "Enter a valid email";
//     if (password && password.length < 6)
//       newErrors.password = "Password must be at least 6 characters";
//     if (password && password !== confirmPassword)
//       newErrors.confirmPassword = "Passwords do not match";
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async () => {
//     if (!validate()) return;
//     setSaving(true);
//     try {
//       const token = getToken();
//       const payload: Record<string, string> = {
//         username: username.trim(),
//         email: email.trim(),
//       };
//       if (password) {
//         payload.password = password;
//         payload.confirmPassword = confirmPassword;
//       }

//       const res = await fetch(`${API_BASE}admin/update-profile`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok || !data?.success) {
//         const msg =
//           data?.message === "EMAIL_ALREADY_EXISTS"
//             ? "Email already registered to another account."
//             : data?.message || "Failed to update profile";
//         throw new Error(msg);
//       }

//       if (data.data?.token) {
//         saveToken(data.data.token);
//       }

//       setPassword("");
//       setConfirmPassword("");
//       toast.success("Profile updated successfully");
//     } catch (err: any) {
//       toast.error(err.message || "Something went wrong");
//     } finally {
//       setSaving(false);
//     }
//   };

//   const initials = username.trim().slice(0, 2).toUpperCase() || "AD";

//   return (
//     <div>
//       <Toaster position="top-right" />
//       <PageBreadcrumb pageTitle="Edit Profile" />

//       <ComponentCard
//         title={`${roleLabel} Profile`}
//         desc="Update your own login username, email, and password."
//       >
//         {/* Header: avatar + role badge */}
//         <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
//           <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-lg font-semibold text-white shadow-sm">
//             {initials}
//           </div>
//           <div>
//             <p className="text-base font-semibold text-gray-800 dark:text-white/90">
//               {username || "Your Account"}
//             </p>
//             <span className="mt-1 inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
//               {roleLabel}
//             </span>
//           </div>
//         </div>

//         <div className="max-w-2xl space-y-6">
//           {/* Basic info */}
//           <div>
//             <h3 className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
//               Basic Information
//             </h3>
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <FormField label="Username" error={errors.username} required>
//                 <input
//                   type="text"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   placeholder="e.g. johndoe"
//                   className={inputClass(!!errors.username)}
//                 />
//               </FormField>

//               <FormField label="Email" error={errors.email} required>
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   placeholder="e.g. johndoe@example.com"
//                   className={inputClass(!!errors.email)}
//                 />
//               </FormField>
//             </div>
//           </div>

//           {/* Password section */}
//           <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 dark:border-gray-800 dark:bg-white/[0.02]">
//             <h3 className="mb-1 text-sm font-medium text-gray-500 dark:text-gray-400">
//               Change Password
//             </h3>
//             <p className="mb-3 text-xs text-gray-400">
//               Leave blank if you don&apos;t want to change your password.
//             </p>

//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <FormField label="New Password" error={errors.password}>
//                 <div className="relative">
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     placeholder="Leave blank to keep current"
//                     className={inputClass(!!errors.password)}
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword((p) => !p)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     {showPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </FormField>

//               {password && (
//                 <FormField label="Confirm Password" error={errors.confirmPassword} required>
//                   <div className="relative">
//                     <input
//                       type={showConfirmPassword ? "text" : "password"}
//                       value={confirmPassword}
//                       onChange={(e) => setConfirmPassword(e.target.value)}
//                       onPaste={(e) => e.preventDefault()}
//                       placeholder="Re-enter new password"
//                       className={inputClass(!!errors.confirmPassword)}
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowConfirmPassword((p) => !p)}
//                       className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       {showConfirmPassword ? <FaEyeSlash className="h-4 w-4" /> : <FaEye className="h-4 w-4" />}
//                     </button>
//                   </div>
//                 </FormField>
//               )}
//             </div>
//           </div>

//           <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-800">
//             <button
//               onClick={handleSubmit}
//               disabled={saving}
//               className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 hover:shadow-md disabled:opacity-60 disabled:hover:shadow-none transition-all"
//             >
//               {saving && (
//                 <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
//                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
//                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
//                 </svg>
//               )}
//               Save Changes
//             </button>
//           </div>
//         </div>
//       </ComponentCard>
//     </div>
//   );
// }

"use client";

import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { toast, Toaster } from "react-hot-toast";
import {
  FaEye,
  FaEyeSlash,
  FaUser,
  FaLock,
  FaEnvelope,
  FaCheck,
  FaSave,
  FaShieldAlt,
} from "react-icons/fa";

import API_BASE from "../../../../baseurl";
import { getToken, saveToken } from "@/app/utils/auth";
import FormField, { inputClass } from "@/components/reusableFormField";
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

  // Original values used for change detection
  const [originalUsername, setOriginalUsername] = useState("");
  const [originalEmail, setOriginalEmail] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [roleLabel, setRoleLabel] = useState("Admin");

  useEffect(() => {
    const token = getToken();

    if (!token) return;

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      const decodedUsername = decoded.username || "";
      const decodedEmail = decoded.email || "";

      setUsername(decodedUsername);
      setEmail(decodedEmail);

      // Store original values
      setOriginalUsername(decodedUsername);
      setOriginalEmail(decodedEmail);

      const isAdminNum = Number(decoded.isAdmin);

      setRoleLabel(
        isAdminNum === 1
          ? "Admin"
          : isAdminNum === 2
            ? "Sales"
            : isAdminNum === 3
              ? "Operation"
              : "Staff Admin",
      );
    } catch {
      // Ignore decode failure.
      // Existing auth guard can handle invalid tokens.
    }
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (
      !username.trim() ||
      !/^[a-zA-Z0-9]{4,20}$/.test(username.trim())
    ) {
      newErrors.username =
        "Username must be 4-20 alphanumeric characters";
    }

    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      newErrors.email = "Enter a valid email";
    }

    if (password && password.length < 6) {
      newErrors.password =
        "Password must be at least 6 characters";
    }

    if (password && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!hasChanges || saving) return;

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

      // Update originals after successful save
      setOriginalUsername(username.trim());
      setOriginalEmail(email.trim());

      // Clear password fields
      setPassword("");
      setConfirmPassword("");

      // Clear old errors
      setErrors({});

      toast.success("Profile updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  const initials =
    username.trim().slice(0, 2).toUpperCase() || "AD";

  // ============================================================
  // CHANGE DETECTION
  // Save button enabled only when something is changed
  // ============================================================

  const hasChanges =
    username.trim() !== originalUsername.trim() ||
    email.trim() !== originalEmail.trim() ||
    password.length > 0 ||
    confirmPassword.length > 0;

  return (
    <div className="w-full">
      <Toaster position="top-right" />

      {/* =========================================================
          PAGE HEADER / BREADCRUMB
      ========================================================== */}

      <div className="mb-5">
        <PageBreadcrumb pageTitle="Edit Profile" />

        <p className="-mt-2 text-[15px] font-normal text-gray-500 dark:text-gray-400">
          Manage your account information and update your login
          details.
        </p>
      </div>

      {/* =========================================================
          PROFILE SUMMARY BANNER
      ========================================================== */}

      <div
        className="
          relative
          mb-5
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-[0_3px_10px_rgba(16,24,40,0.05)]
          dark:border-gray-800
          dark:bg-gray-900
        "
      >
        {/* Background gradient */}

        <div
          className="
            pointer-events-none
            absolute
            inset-0
            bg-gradient-to-r
            from-white
            via-white
            to-violet-100/80
            dark:from-gray-900
            dark:via-gray-900
            dark:to-violet-950/30
          "
        />

        {/* Decorative waves */}

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div
            className="
              absolute
              -right-[8%]
              top-[8%]
              h-[180px]
              w-[65%]
              rotate-[-5deg]
              rounded-[50%]
              border-t
              border-violet-200/50
              opacity-70
              dark:border-violet-700/20
            "
          />

          <div
            className="
              absolute
              -right-[3%]
              top-[20%]
              h-[160px]
              w-[60%]
              rotate-[-8deg]
              rounded-[50%]
              border-t
              border-violet-200/50
              opacity-60
              dark:border-violet-700/20
            "
          />

          <div
            className="
              absolute
              right-[-10%]
              top-[33%]
              h-[160px]
              w-[70%]
              rotate-[-3deg]
              rounded-[50%]
              border-t
              border-violet-200/40
              opacity-50
              dark:border-violet-700/20
            "
          />

          <div
            className="
              absolute
              right-[2%]
              top-[-35px]
              h-[170px]
              w-[38%]
              rotate-[12deg]
              bg-gradient-to-br
              from-transparent
              via-violet-100/20
              to-violet-200/20
              blur-xl
              dark:via-violet-900/10
              dark:to-violet-900/10
            "
          />
        </div>

        <div className="relative z-10 px-6 py-6 lg:px-8 lg:py-7">
          {/* Profile top */}

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            {/* Avatar */}

            <div
              className="
                flex
                h-[96px]
                w-[96px]
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-gradient-to-br
                from-violet-500
                via-purple-600
                to-indigo-600
                text-[32px]
                font-bold
                tracking-wide
                text-white
                shadow-[0_10px_25px_rgba(124,58,237,0.22)]
              "
            >
              {initials}
            </div>

            {/* Name / role */}

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[26px] font-bold text-gray-900 dark:text-white">
                  {username || "Your Account"}
                </h2>

                <span
                  className="
                    inline-flex
                    items-center
                    rounded-full
                    border
                    border-violet-100
                    bg-violet-50
                    px-3.5
                    py-1.5
                    text-[14px]
                    font-semibold
                    text-violet-600
                    dark:border-violet-800
                    dark:bg-violet-500/10
                    dark:text-violet-300
                  "
                >
                  {roleLabel}
                </span>
              </div>

              <p className="mt-2 text-[16px] font-medium text-gray-600 dark:text-gray-300">
                {roleLabel === "Admin"
                  ? "Administrator"
                  : roleLabel}
              </p>
            </div>
          </div>

          {/* Divider */}

          <div className="my-6 max-w-[540px] border-t border-gray-200/80 dark:border-gray-700" />

          {/* Account metadata */}

          <div className="flex flex-col gap-5 md:flex-row md:items-center">
            {/* Email */}

            <div className="flex min-w-[280px] items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-50
                  text-violet-600
                  dark:bg-violet-500/10
                  dark:text-violet-300
                "
              >
                <FaEnvelope className="h-[20px] w-[20px]" />
              </div>

              <div>
                <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400">
                  Email Address
                </p>

                <p className="mt-1 break-all text-[15px] font-semibold text-gray-900 dark:text-white">
                  {email || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN PROFILE FORM
      ========================================================== */}

      <div
        className="
          overflow-hidden
          rounded-2xl
          border
          border-gray-200
          bg-white
          shadow-[0_3px_10px_rgba(16,24,40,0.04)]
          dark:border-gray-800
          dark:bg-gray-900
        "
      >
        <div className="p-6 lg:p-8">
          {/* =====================================================
              BASIC INFORMATION
          ====================================================== */}

          <div>
            <div className="mb-7 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-50
                  text-violet-600
                  dark:bg-violet-500/10
                  dark:text-violet-300
                "
              >
                <FaUser className="h-[19px] w-[19px]" />
              </div>

              <div>
                <h3 className="text-[18px] font-bold text-gray-900 dark:text-white">
                  Basic Information
                </h3>

                <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">
                  Update your personal information and login
                  details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
              {/* Username */}

              <FormField
                label="Username"
                error={errors.username}
                required
              >
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);

                    if (errors.username) {
                      setErrors((prev) => ({
                        ...prev,
                        username: "",
                      }));
                    }
                  }}
                  placeholder="e.g. johndoe"
                  className={`${inputClass(
                    !!errors.username,
                  )} !h-[46px] !rounded-lg !text-[15px]`}
                />
              </FormField>

              {/* Email */}

              <FormField
                label="Email Address"
                error={errors.email}
                required
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);

                    if (errors.email) {
                      setErrors((prev) => ({
                        ...prev,
                        email: "",
                      }));
                    }
                  }}
                  placeholder="e.g. johndoe@example.com"
                  className={`${inputClass(
                    !!errors.email,
                  )} !h-[46px] !rounded-lg !text-[15px]`}
                />
              </FormField>
            </div>
          </div>

          {/* Main divider */}

          <div className="my-7 border-t border-gray-200 dark:border-gray-800" />

          {/* =====================================================
              CHANGE PASSWORD
          ====================================================== */}

          <div>
            <div className="mb-7 flex items-center gap-4">
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-50
                  text-violet-600
                  dark:bg-violet-500/10
                  dark:text-violet-300
                "
              >
                <FaLock className="h-[18px] w-[18px]" />
              </div>

              <div>
                <h3 className="text-[18px] font-bold text-gray-900 dark:text-white">
                  Change Password
                </h3>

                <p className="mt-1 text-[14px] text-gray-500 dark:text-gray-400">
                  Leave blank if you don&apos;t want to change your
                  password.
                </p>
              </div>
            </div>

            {/* Password fields */}

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-8">
              {/* New Password */}

              <FormField
                label="New Password"
                error={errors.password}
              >
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      const value = e.target.value;

                      setPassword(value);

                      if (!value) {
                        setConfirmPassword("");
                      }

                      if (errors.password) {
                        setErrors((prev) => ({
                          ...prev,
                          password: "",
                        }));
                      }
                    }}
                    placeholder="Enter new password"
                    className={`${inputClass(
                      !!errors.password,
                    )} !h-[46px] !rounded-lg !pr-11 !text-[15px]`}
                  />

                  <button
                    type="button"
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    onClick={() =>
                      setShowPassword((prev) => !prev)
                    }
                    className="
                      absolute
                      right-3.5
                      top-1/2
                      -translate-y-1/2
                      rounded-md
                      p-1
                      text-gray-400
                      transition-colors
                      hover:text-gray-600
                      dark:hover:text-gray-200
                    "
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-4 w-4" />
                    ) : (
                      <FaEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormField>

              {/* Confirm Password */}

              <FormField
                label="Confirm Password"
                error={errors.confirmPassword}
                required={!!password}
              >
                <div className="relative">
                  <input
                    type={
                      showConfirmPassword ? "text" : "password"
                    }
                    value={confirmPassword}
                    disabled={!password}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);

                      if (errors.confirmPassword) {
                        setErrors((prev) => ({
                          ...prev,
                          confirmPassword: "",
                        }));
                      }
                    }}
                    onPaste={(e) => e.preventDefault()}
                    placeholder="Confirm new password"
                    className={`${inputClass(
                      !!errors.confirmPassword,
                    )} !h-[46px] !rounded-lg !pr-11 !text-[15px] disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400 dark:disabled:bg-gray-800/50`}
                  />

                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                    disabled={!password}
                    onClick={() =>
                      setShowConfirmPassword(
                        (prev) => !prev,
                      )
                    }
                    className="
                      absolute
                      right-3.5
                      top-1/2
                      -translate-y-1/2
                      rounded-md
                      p-1
                      text-gray-400
                      transition-colors
                      hover:text-gray-600
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                      dark:hover:text-gray-200
                    "
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="h-4 w-4" />
                    ) : (
                      <FaEye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FormField>
            </div>

            {/* =====================================================
                PASSWORD REQUIREMENTS
            ====================================================== */}

            <div
              className="
                mt-6
                rounded-xl
                border
                border-violet-100
                bg-gradient-to-r
                from-violet-50/80
                to-purple-50/60
                px-5
                py-4
                dark:border-violet-900/60
                dark:from-violet-950/20
                dark:to-purple-950/10
              "
            >
              <div className="flex gap-3">
                <div className="mt-[2px] text-violet-600 dark:text-violet-300">
                  <FaShieldAlt className="h-[17px] w-[17px]" />
                </div>

                <div>
                  <p className="mb-3 text-[14px] font-semibold text-gray-800 dark:text-gray-200">
                    Password Requirements:
                  </p>

                  <div className="space-y-2">
                    <PasswordRequirement>
                      At least 6 characters long
                    </PasswordRequirement>

                    <PasswordRequirement>
                      Contains uppercase and lowercase letters
                    </PasswordRequirement>

                    <PasswordRequirement>
                      Includes at least one number or special
                      character
                    </PasswordRequirement>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =====================================================
              SAVE BUTTON
          ====================================================== */}

          <div className="mt-7 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving || !hasChanges}
              className={`
                inline-flex
                min-w-[190px]
                items-center
                justify-center
                gap-2.5
                rounded-lg
                px-7
                py-3
                text-[15px]
                font-semibold
                transition-all
                duration-200

                ${
                  hasChanges && !saving
                    ? `
                      bg-gradient-to-r
                      from-indigo-600
                      via-violet-600
                      to-purple-600
                      text-white
                      shadow-[0_7px_18px_rgba(99,102,241,0.20)]
                      hover:-translate-y-[1px]
                      hover:shadow-[0_9px_22px_rgba(99,102,241,0.28)]
                    `
                    : `
                      cursor-not-allowed
                      bg-gray-200
                      text-gray-400
                      shadow-none
                      dark:bg-gray-800
                      dark:text-gray-500
                    `
                }
              `}
            >
              {saving ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />

                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>

                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="h-[15px] w-[15px]" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PasswordRequirement({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="
          flex
          h-[18px]
          w-[18px]
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-white
          text-violet-600
          shadow-sm
          dark:bg-gray-800
          dark:text-violet-300
        "
      >
        <FaCheck className="h-[10px] w-[10px]" />
      </span>

      <span className="text-[13px] text-gray-600 dark:text-gray-400">
        {children}
      </span>
    </div>
  );
}