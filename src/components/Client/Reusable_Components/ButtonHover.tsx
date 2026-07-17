/* eslint-disable */
// @ts-nocheck
"use client";

import React, {
  useEffect,
  useRef,
} from "react";

interface ButtonHoverProps {
  label?: React.ReactNode;
  children?: React.ReactNode;

  onClick?: (
    event: React.MouseEvent<HTMLButtonElement>
  ) => void;

  className?: string;

  type?: "button" | "submit" | "reset";

  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: React.ReactNode;

  ariaLabel?: string;
}

export function ButtonHover({
  label,
  children,
  onClick,
  className = "RS_VehicleButton",
  type = "button",
  disabled = false,
  loading = false,
  loadingLabel = "Loading...",
  ariaLabel,
}: ButtonHoverProps) {
  const btnRef =
    useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const btn = btnRef.current;

    if (!btn) return;

    const bubble =
      btn.querySelector<HTMLSpanElement>(
        ".RS_BtnBubble"
      );

    if (!bubble) return;

    const placeBubble = (
      event: MouseEvent
    ) => {
      const rect =
        btn.getBoundingClientRect();

      const x =
        event.clientX - rect.left;

      const y =
        event.clientY - rect.top;

      const size =
        Math.max(
          rect.width,
          rect.height
        ) * 2.4;

      bubble.style.width = `${size}px`;
      bubble.style.height = `${size}px`;
      bubble.style.left = `${
        x - size / 2
      }px`;
      bubble.style.top = `${
        y - size / 2
      }px`;
    };

    const handleMouseEnter = (
      event: MouseEvent
    ) => {
      if (btn.disabled) return;

      placeBubble(event);

      bubble.style.transition = "none";
      bubble.style.transform =
        "scale(0)";
      bubble.style.opacity = "0";

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bubble.style.transition =
            "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.55s ease";

          bubble.style.transform =
            "scale(1)";

          bubble.style.opacity = "1";
        });
      });
    };

    const handleMouseLeave = (
      event: MouseEvent
    ) => {
      if (btn.disabled) {
        bubble.style.transform =
          "scale(0)";

        bubble.style.opacity = "0";

        return;
      }

      placeBubble(event);

      bubble.style.transition =
        "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.55s ease";

      bubble.style.transform =
        "scale(0)";

      bubble.style.opacity = "0";
    };

    btn.addEventListener(
      "mouseenter",
      handleMouseEnter
    );

    btn.addEventListener(
      "mouseleave",
      handleMouseLeave
    );

    return () => {
      btn.removeEventListener(
        "mouseenter",
        handleMouseEnter
      );

      btn.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );
    };
  }, []);

  useEffect(() => {
    if (!disabled && !loading) return;

    const btn = btnRef.current;

    const bubble =
      btn?.querySelector<HTMLSpanElement>(
        ".RS_BtnBubble"
      );

    if (!bubble) return;

    bubble.style.transform = "scale(0)";
    bubble.style.opacity = "0";
  }, [disabled, loading]);

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }

    onClick?.(event);
  };

  const buttonContent =
    loading
      ? loadingLabel
      : children ?? label;

  return (
    <button
      ref={btnRef}
      type={type}
      className={`${className} ${
        loading ? "is-loading" : ""
      }`}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      aria-label={
        ariaLabel ||
        (typeof label === "string"
          ? label
          : undefined)
      }
    >
      <span className="relative z-[2] flex items-center justify-center gap-2">
        {loading && (
          <span
            className="RS_BtnSpinner"
            aria-hidden="true"
          />
        )}

        <span>{buttonContent}</span>
      </span>

      <span
        className="RS_BtnBubble"
        aria-hidden="true"
      />
    </button>
  );
}