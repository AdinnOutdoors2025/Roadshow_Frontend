"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  FileText,
  Landmark,
  Loader2,
  MapPin,
  ShieldAlert,
  Briefcase,
} from "lucide-react";
import {
  GstBusiness,
  formatGstDate,
  getCachedGst,
  isGstBlocked,
  isValidGstFormat,
  normalizeGst,
  verifyGst,
} from "@/lib/gst";

/**
 * Reusable "enter GST → verified business" panel.
 *
 * Shared by the public agency signup, the CampaignRequest form and the admin
 * order-creation Customer Details step, so a business is described the same
 * way everywhere and the customer only ever types the GST number.
 */

interface Props {
  value: string;
  onChange: (gstNumber: string) => void;
  /** Fires once a business is verified (or restored from cache). */
  onVerified: (business: GstBusiness) => void;
  /** Fires when the verified state is lost — edited number, failed verify. */
  onCleared?: () => void;
  /** A business already verified elsewhere, rendered without re-calling the API. */
  business?: GstBusiness | null;
  disabled?: boolean;
  /** Blocks verification when the GST registration is not Active. */
  requireActive?: boolean;
  label?: string;
  helperText?: string;
  className?: string;
  /** "light" for the public site's white card, "admin" for the dashboard. */
  variant?: "light" | "admin";
  /** Verify as soon as a valid 15-char number is typed. */
  autoVerify?: boolean;
  /**
   * Height-constrained hosts (the auth modal) show only the identity a
   * customer needs to recognise their business — name, address, PAN — and
   * drop the registration metadata rows.
   */
  compact?: boolean;
}

const detailRow = (
  icon: React.ReactNode,
  label: string,
  value?: string
): { icon: React.ReactNode; label: string; value: string } | null =>
  value && value.trim() ? { icon, label, value } : null;

export default function GstVerifyPanel({
  value,
  onChange,
  onVerified,
  onCleared,
  business = null,
  disabled = false,
  requireActive = false,
  label = "GST Number",
  helperText = "We'll fetch your business details automatically — nothing else to type.",
  className = "",
  variant = "admin",
  autoVerify = false,
  compact = false,
}: Props) {
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(0);
  const autoVerifiedFor = useRef<string>("");

  const gst = normalizeGst(value);
  const formatOk = isValidGstFormat(gst);
  const verified = !!business;
  /* Absent status means "not reported" — only an explicit non-Active blocks. */
  const blockedInactive = requireActive && isGstBlocked(business);
  const active = verified && !blockedInactive;

  const runVerify = async (candidate: string) => {
    const target = normalizeGst(candidate);

    if (!target) {
      setError("GST number is required to continue");
      setShake((s) => s + 1);
      return;
    }
    if (!isValidGstFormat(target)) {
      setError("Enter a valid 15-character GST number");
      setShake((s) => s + 1);
      return;
    }

    setVerifying(true);
    setError("");

    try {
      const result = await verifyGst(target);
      onVerified(result);

      if (requireActive && isGstBlocked(result)) {
        setError(
          `This GST registration is "${result.status}". Please use an Active GSTIN.`
        );
        setShake((s) => s + 1);
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "GST verification failed"
      );
      setShake((s) => s + 1);
      onCleared?.();
    } finally {
      setVerifying(false);
    }
  };

  /* Editing the number invalidates the previous verification. */
  const handleChange = (raw: string) => {
    const next = normalizeGst(raw).slice(0, 15);
    onChange(next);
    setError("");

    if (verified && next !== normalizeGst(business!.gst_number)) {
      onCleared?.();
    }
  };

  /* Re-verifying a known number is free — restore it from cache instantly. */
  useEffect(() => {
    if (verified || verifying || !formatOk) return;

    const cached = getCachedGst(gst);
    if (cached) {
      onVerified(cached);
      return;
    }

    if (autoVerify && autoVerifiedFor.current !== gst) {
      autoVerifiedFor.current = gst;
      runVerify(gst);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gst, formatOk, verified, verifying, autoVerify]);

  const isLight = variant === "light";

  const inputClass = [
    "w-full rounded-xl border px-4 py-3 text-sm font-semibold tracking-[0.08em] uppercase outline-none transition-all",
    "placeholder:font-normal placeholder:tracking-normal placeholder:normal-case",
    verified && active
      ? "border-emerald-400 bg-emerald-50/60 text-emerald-900"
      : error
        ? "border-red-400 bg-red-50/60 text-red-900"
        : isLight
          ? "border-gray-200 bg-white text-gray-900 focus:border-[#E4002B] focus:ring-2 focus:ring-[#E4002B]/15"
          : "border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100",
    disabled ? "cursor-not-allowed opacity-60" : "",
  ].join(" ");

  const allRows = [
    detailRow(<Landmark size={14} />, "PAN", business?.business_pan),
    detailRow(<Briefcase size={14} />, "Entity Type", business?.business_entity_type),
    detailRow(
      <FileText size={14} />,
      "Registration",
      business?.business_registration_type
    ),
    detailRow(<Building2 size={14} />, "Nature of Business", business?.nature_of_business),
    detailRow(
      <CalendarDays size={14} />,
      "Registered On",
      business?.business_registration_date
        ? formatGstDate(business.business_registration_date)
        : ""
    ),
    detailRow(<MapPin size={14} />, "Department", business?.business_department_code),
  ].filter(Boolean) as { icon: React.ReactNode; label: string; value: string }[];

  /* PAN is first in the list, so compact keeps exactly that one row. */
  const rows = compact ? allRows.slice(0, 1) : allRows;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-baseline justify-between gap-2">
        <label className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label} <span className="text-red-500">*</span>
        </label>
        {verified && active && (
          <motion.span
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600"
          >
            <BadgeCheck size={13} /> Verified
          </motion.span>
        )}
      </div>

      <motion.div
        key={shake}
        animate={shake ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-2 sm:flex-row"
      >
        <input
          type="text"
          value={gst}
          maxLength={15}
          disabled={disabled || verifying}
          placeholder="33AFOPU0177R1ZL"
          spellCheck={false}
          autoComplete="off"
          aria-invalid={!!error}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (!verified) runVerify(gst);
            }
          }}
          className={inputClass}
        />

        <button
          type="button"
          disabled={disabled || verifying || (verified && active)}
          onClick={() => runVerify(gst)}
          className={[
            "shrink-0 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all",
            "disabled:cursor-not-allowed disabled:opacity-60",
            verified && active
              ? "bg-emerald-500"
              : isLight
                ? "bg-[#E4002B] hover:bg-[#B8001F]"
                : "bg-blue-600 hover:bg-blue-700",
          ].join(" ")}
        >
          {verifying ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 size={15} className="animate-spin" />
              Verifying
            </span>
          ) : verified && active ? (
            <span className="inline-flex items-center gap-2">
              <BadgeCheck size={15} />
              Verified
            </span>
          ) : (
            "Verify"
          )}
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="gst-error"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="flex items-start gap-1.5 text-xs font-medium text-red-500"
          >
            <ShieldAlert size={14} className="mt-px shrink-0" />
            {error}
          </motion.p>
        )}

        {!error && !verified && (
          <motion.p
            key="gst-helper"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-xs text-gray-400"
          >
            {helperText}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Verified business card — the whole point: everything below is fetched, not typed */}
      <AnimatePresence>
        {verified && (
          <motion.div
            key={business!.gst_number}
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className={[
              "overflow-hidden rounded-2xl border shadow-sm",
              blockedInactive
                ? "border-amber-300 bg-amber-50/70 dark:border-amber-700 dark:bg-amber-900/10"
                : "border-emerald-200 bg-emerald-50/60 dark:border-emerald-800 dark:bg-emerald-900/10",
            ].join(" ")}
          >
            {/* <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/70 px-4 py-2.5 dark:border-emerald-800/60">
              <span className="font-mono text-xs font-semibold tracking-wider text-gray-600 dark:text-gray-300">
                {business!.gst_number}
              </span>
              <span
                className={[
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide",
                  active
                    ? "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-400",
                ].join(" ")}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-amber-500"}`}
                />
                {business!.status || "Verified"}
              </span>
            </div> */}

            <div className="px-4 py-3.5">
              <motion.h4
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="text-base font-bold leading-tight text-gray-900 dark:text-gray-100"
              >
                {business!.business_name || "—"}
              </motion.h4>

              {business!.business_address && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-1 flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400"
                >
                  <MapPin size={13} className="mt-0.5 shrink-0" />
                  {business!.business_address}
                </motion.p>
              )}

              {rows.length > 0 && (
                <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                  {rows.map((row, i) => (
                    <motion.div
                      key={row.label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.04 }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-gray-400">{row.icon}</span>
                      <span className="text-[11px] uppercase tracking-wide text-gray-400">
                        {row.label}
                      </span>
                      <span className="ml-auto truncate text-xs font-semibold text-gray-700 dark:text-gray-200">
                        {row.value}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
