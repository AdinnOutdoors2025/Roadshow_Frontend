"use client";

import {
  useState,
  type CSSProperties,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

type ButtonHoverProps = {
  label?: string;
  children?: ReactNode;

  loading?: boolean;
  loadingLabel?: string;

  className?: string;

  href?: string;

  type?: "button" | "submit" | "reset";

  onClick?: () => void;

  disabled?: boolean;

  ariaLabel?: string;

  target?: "_self" | "_blank";
  rel?: string;

  style?: CSSProperties;
};

export function ButtonHover({
  label,
  children,

  loading = false,
  loadingLabel = "Loading...",

  className = "",

  href,

  type = "button",

  onClick,

  disabled = false,

  ariaLabel,

  target = "_self",
  rel,

  style,
}: ButtonHoverProps) {
  const [isHovered, setIsHovered] =
    useState(false);

  const [isFocused, setIsFocused] =
    useState(false);

  const [isPressed, setIsPressed] =
    useState(false);

  const isDisabled =
    disabled || loading;

  const content =
    loading
      ? loadingLabel
      : children ?? label ?? "";

  /*
   * Old Roadshow cursor-bleed behaviour:
   * find the exact pointer position inside the button
   * and use it as the centre of the red circle.
   */
  const setBleedOrigin = (
    event: ReactMouseEvent<HTMLElement>,
  ) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    const x =
      event.clientX -
      rect.left;

    const y =
      event.clientY -
      rect.top;

    event.currentTarget.style.setProperty(
      "--bleed-x",
      `${x}px`,
    );

    event.currentTarget.style.setProperty(
      "--bleed-y",
      `${y}px`,
    );
  };

  const showBleed =
    isHovered || isFocused;

  /*
   * These styles only control the bleed mechanics.
   * Button dimensions/background/font still come from
   * your existing classes:
   *
   * RS_VehicleButton
   * RS_ViewAllClientsBtn
   * RS_GpsConsultBtn
   * FooterCTAButton
   */
  const rootStyle: CSSProperties = {
    ...style,

    position: "relative",
    isolation: "isolate",
    overflow: "hidden",

    cursor:
      isDisabled
        ? "not-allowed"
        : "pointer",

    transform:
      isPressed
        ? "translateY(0) scale(0.98)"
        : showBleed
          ? "translateY(-2px)"
          : "translateY(0)",

    transition:
      "transform 0.9s cubic-bezier(0.16, 1, 0.3, 1)",

    WebkitTapHighlightColor:
      "transparent",
  };

  const bubbleStyle: CSSProperties = {
    position: "absolute",

    zIndex: 0,

    left:
      "var(--bleed-x, 50%)",

    top:
      "var(--bleed-y, 50%)",

    width: "340%",

    aspectRatio: "1 / 1",

    borderRadius: "50%",

    background: "#e3000f",

    pointerEvents: "none",

    transform:
      showBleed
        ? "translate(-50%, -50%) scale(1)"
        : "translate(-50%, -50%) scale(0)",

    transformOrigin:
      "center",

    transition:
      "transform 1.65s cubic-bezier(0.19, 1, 0.22, 1)",

    willChange:
      "transform",
  };

  const textStyle: CSSProperties = {
    position: "relative",

    zIndex: 1,

    display: "inline-flex",

    alignItems: "center",
    justifyContent: "center",

    width: "max-content",

    whiteSpace: "nowrap",

    color:
      showBleed
        ? "#ffffff"
        : "inherit",

    transition:
      "color 1s ease",

    pointerEvents:
      "none",
  };

  const handleMouseEnter = (
    event: ReactMouseEvent<HTMLElement>,
  ) => {
    setBleedOrigin(event);
    setIsHovered(true);
  };

  const handleMouseMove = (
    event: ReactMouseEvent<HTMLElement>,
  ) => {
    setBleedOrigin(event);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPressed(false);
  };

  const innerContent = (
    <>
      <span
        className="RS_BtnBubble"
        aria-hidden="true"
        style={bubbleStyle}
      />

      <span style={textStyle}>
        {content}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={
          isDisabled
            ? undefined
            : href
        }
        aria-label={ariaLabel}
        aria-disabled={
          isDisabled
            ? true
            : undefined
        }
        target={target}
        rel={
          rel ??
          (
            target === "_blank"
              ? "noopener noreferrer"
              : undefined
          )
        }
        className={className}
        style={rootStyle}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => {
          if (!isDisabled) {
            setIsPressed(true);
          }
        }}
        onMouseUp={() =>
          setIsPressed(false)
        }
        onFocus={() =>
          setIsFocused(true)
        }
        onBlur={() => {
          setIsFocused(false);
          setIsPressed(false);
        }}
        onClick={(event) => {
          if (isDisabled) {
            event.preventDefault();
            return;
          }

          onClick?.();
        }}
      >
        {innerContent}
      </a>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={className}
      style={rootStyle}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={() => {
        if (!isDisabled) {
          setIsPressed(true);
        }
      }}
      onMouseUp={() =>
        setIsPressed(false)
      }
      onFocus={() =>
        setIsFocused(true)
      }
      onBlur={() => {
        setIsFocused(false);
        setIsPressed(false);
      }}
      onClick={onClick}
    >
      {innerContent}
    </button>
  );
}

export {
  ButtonHover as BleedButton,
};

export default ButtonHover;