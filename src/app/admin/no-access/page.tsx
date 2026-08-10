"use client";

import { HiOutlineShieldExclamation } from "react-icons/hi";

export default function NoAccessPage() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <HiOutlineShieldExclamation className="text-5xl text-gray-300" />
      <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
        No Menu Access Assigned
      </h1>
      <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
        Your account doesn&apos;t have any pages assigned yet. Please contact the admin
        to grant access via Role Permission.
      </p>
    </div>
  );
}
