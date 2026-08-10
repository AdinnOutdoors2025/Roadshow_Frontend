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

    /* Last known pointer position, and whether this button's bubble is
       currently expanded. Both feed watchPointer() below. */
    const pointer = { x: -1, y: -1 };

    let expanded = false;
    let frameId = 0;

    const collapseBubble = () => {
      expanded = false;

      if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = 0;
      }

      bubble.style.transition =
        "transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.55s ease";

      bubble.style.transform =
        "scale(0)";

      bubble.style.opacity = "0";
    };

    /* Why this exists: the public site scrolls through GSAP ScrollSmoother,
       which TRANSLATES #smooth-content rather than scrolling it. The button
       slides out from under a cursor that never moved, so the browser fires
       no mouseleave and the bubble stayed filled — a red "Book Now" that
       followed the reader into the next section until they happened to hover
       and leave that same button again.

       Scroll events are not enough either (the smoother, Lenis and a trackpad
       fling all report differently), so while a bubble is up we simply
       hit-test the pointer every frame. It runs for one button at a time, only
       while it is filled, and stops the moment it collapses. */
    const watchPointer = () => {
      frameId = 0;

      if (!expanded) return;

      const under =
        pointer.x >= 0
          ? document.elementFromPoint(
              pointer.x,
              pointer.y
            )
          : null;

      if (!under || !btn.contains(under)) {
        collapseBubble();
        return;
      }

      frameId =
        requestAnimationFrame(watchPointer);
    };

    const handlePointerMove = (
      event: PointerEvent
    ) => {
      pointer.x = event.clientX;
      pointer.y = event.clientY;
    };

    const handleMouseEnter = (
      event: MouseEvent
    ) => {
      if (btn.disabled) return;

      pointer.x = event.clientX;
      pointer.y = event.clientY;

      expanded = true;

      if (!frameId) {
        frameId =
          requestAnimationFrame(watchPointer);
      }

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
        expanded = false;

        bubble.style.transform =
          "scale(0)";

        bubble.style.opacity = "0";

        return;
      }

      placeBubble(event);

      collapseBubble();
    };

    /* Alt-tabbing away, or the pointer leaving the window entirely, both end
       the hover without a mouseleave on the button itself. */
    const handleWindowBlur = () => {
      if (expanded) collapseBubble();
    };

    btn.addEventListener(
      "mouseenter",
      handleMouseEnter
    );

    btn.addEventListener(
      "mouseleave",
      handleMouseLeave
    );

    window.addEventListener(
      "pointermove",
      handlePointerMove,
      { passive: true }
    );

    window.addEventListener(
      "blur",
      handleWindowBlur
    );

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId);
      }

      btn.removeEventListener(
        "mouseenter",
        handleMouseEnter
      );

      btn.removeEventListener(
        "mouseleave",
        handleMouseLeave
      );

      window.removeEventListener(
        "pointermove",
        handlePointerMove
      );

      window.removeEventListener(
        "blur",
        handleWindowBlur
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
      <span className="relative z-2 flex items-center justify-center gap-2">
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