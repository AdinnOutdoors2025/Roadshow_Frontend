"use client";

import {
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";

type BleedButtonProps = {
  href?: string;
  children: ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
};

export function BleedButton({
  href,
  children,
  className = "",
  type = "button",
  onClick,
  disabled = false,
}: BleedButtonProps) {
  const setBleedOrigin = (event: ReactMouseEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    event.currentTarget.style.setProperty("--x", `${x}px`);
    event.currentTarget.style.setProperty("--y", `${y}px`);
  };

  const buttonClassName = `bleed-button ${className}`;

  if (href) {
    return (
      <a
        href={href}
        className={buttonClassName}
        onMouseEnter={setBleedOrigin}
        onMouseMove={setBleedOrigin}
      >
        <span>{children}</span>
      </a>
    );
  }

  return (
    <button
      type={type}
      className={buttonClassName}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={setBleedOrigin}
      onMouseMove={setBleedOrigin}
    >
      <span>{children}</span>
    </button>
  );
}