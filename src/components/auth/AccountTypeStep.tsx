"use client";

import React from "react";
import { motion } from "framer-motion";
import { Building2, User2, ArrowRight, Check } from "lucide-react";

export type ClientAccountType = "individual" | "agency";

interface Props {
  value: ClientAccountType | null;
  onSelect: (type: ClientAccountType) => void;
  onContinue: () => void;
  onBackToLogin: () => void;
  disabled?: boolean;
}

const OPTIONS: {
  key: ClientAccountType;
  title: string;
  blurb: string;
  icon: React.ReactNode;
}[] = [
  {
    key: "individual",
    title: "Individual / Direct Client",
    blurb: "Booking a roadshow campaign for yourself or your own brand.",
    icon: <User2 size={20} />,
  },
  {
    key: "agency",
    title: "Agency / Business Partner",
    blurb: "Booking on behalf of clients. Verify your GST once — we fill in the rest.",
    icon: <Building2 size={20} />,
  },
];

export default function AccountTypeStep({
  value,
  onSelect,
  onContinue,
  onBackToLogin,
  disabled = false,
}: Props) {
  return (
    <>
      <h2 id="client-auth-title" className="client-auth-title">
        Sign Up
      </h2>

      <p className="client-auth-accounttype-question">
        How are you booking with us?
      </p>

      <div className="client-auth-accounttype-grid">
        {OPTIONS.map((option, index) => {
          const selected = value === option.key;

          return (
            <motion.button
              key={option.key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(option.key)}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 280, damping: 24 }}
              whileHover={disabled ? undefined : { y: -3 }}
              whileTap={disabled ? undefined : { scale: 0.985 }}
              className={`client-auth-accounttype-card${selected ? " is-selected" : ""}`}
              aria-pressed={selected}
            >
              <span className="client-auth-accounttype-icon">{option.icon}</span>

              <span className="client-auth-accounttype-text">
                <strong>{option.title}</strong>
                <small>{option.blurb}</small>
              </span>

              <span className="client-auth-accounttype-check" aria-hidden="true">
                {selected && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  >
                    <Check size={13} strokeWidth={3} />
                  </motion.span>
                )}
              </span>
            </motion.button>
          );
        })}
      </div>

      <button
        type="button"
        className="client-auth-continue"
        onClick={onContinue}
        disabled={disabled || !value}
      >
        <span className="client-auth-continue-inner">
          Continue
          <ArrowRight size={16} />
        </span>
      </button>

      <p className="client-auth-switch">
        Already have an account?
        <button type="button" onClick={onBackToLogin} disabled={disabled}>
          Sign In
        </button>
      </p>
    </>
  );
}
