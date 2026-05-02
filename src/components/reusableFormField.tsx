"use client";

import React from "react";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  required?: boolean;
}

export default function FormField({ label, children, error, required }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

export function inputClass(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-gray-700 placeholder-gray-400 outline-none transition-colors focus:ring-2 dark:bg-gray-800 dark:text-gray-200 dark:placeholder-gray-500 ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100 dark:border-red-600 dark:focus:ring-red-900/30"
      : "border-gray-200 focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
  }`;
}

export function selectClass(hasError: boolean) {
  return `w-full rounded-lg border px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:ring-2 dark:bg-gray-800 dark:text-gray-200 ${
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-100 dark:border-red-600 dark:focus:ring-red-900/30"
      : "border-gray-200 focus:border-blue-400 focus:ring-blue-100 dark:border-gray-700 dark:focus:border-blue-500 dark:focus:ring-blue-900/30"
  }`;
}