"use client";

/* eslint-disable */
// @ts-nocheck

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { label: "Home", href: "/", icon: "home" },
  { label: "Vehicle", href: "/vehicle", icon: "vehicle" },
  { label: "Contact Us", href: "/contact", icon: "contact" },
];

const menuItems = [
  { label: "Name", icon: "user" },
  { label: "Email", icon: "mail" },
  { label: "Phone Number", icon: "phone" },
  { label: "My Cart", icon: "cart" },
  { label: "Order History", icon: "history" },
];

function Icon({
  name,
  size = 58,
}: {
  name: string;
  size?: number;
}) {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "home") {
    return (
      <svg {...commonProps}>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h4.5v-6h3v6H18a1 1 0 0 0 1-1V9.5" />
      </svg>
    );
  }

  if (name === "vehicle") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="7" width="18" height="10" rx="2" />
        <path d="M7 17v2" />
        <path d="M17 17v2" />
        <path d="M3 12h18" />
      </svg>
    );
  }

  if (name === "contact" || name === "mail") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="m4 7 8 6 8-6" />
      </svg>
    );
  }

  if (name === "user") {
    return (
      <svg {...commonProps}>
        <circle cx="12" cy="7" r="4" />
        <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...commonProps}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.28-1.28a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92Z" />
      </svg>
    );
  }

  if (name === "cart") {
    return (
      <svg {...commonProps}>
        <circle cx="9" cy="20" r="1" />
        <circle cx="19" cy="20" r="1" />
        <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.55h8.8a2 2 0 0 0 1.95-1.55L22 7H6" />
      </svg>
    );
  }

  if (name === "history") {
    return (
      <svg {...commonProps}>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l3 2" />
      </svg>
    );
  }

  return null;
}

function ChevronIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);

  const navbarRef = useRef<HTMLElement | null>(null);
  const dropdownRef = useRef<HTMLElement | null>(null);

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedNavbar = navbarRef.current?.contains(target);
      const clickedDropdown = dropdownRef.current?.contains(target);

      if (!clickedNavbar && !clickedDropdown) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const handleMenuItemClick = (label: string) => {
    setOpen(false);

    /*
      Add menu navigation here.

      Example:

      if (label === "My Cart") {
        router.push("/cart");
      }
    */
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .RS_SoftHeaderRoot,
            .RS_SoftHeaderRoot *,
            .RS_SoftDropdown,
            .RS_SoftDropdown * {
              box-sizing: border-box;
            }

            /* ================================================
               FLOATING BORDERLESS GLASS HEADER
            ================================================ */

            .RS_SoftHeaderRoot {
              position: fixed;
              top: 12px;
              left: 0;

              width: 100%;

              z-index: 9999;
              pointer-events: none;

              transform: translate3d(0, 0, 0);
              -webkit-transform: translate3d(0, 0, 0);

              backface-visibility: hidden;
              -webkit-backface-visibility: hidden;

              will-change: transform;
            }

            .RS_SoftHeader {
              position: relative;

              /*
                Reduced from 1120px to 820px.
                Header height remains unchanged.
              */
              width: min(820px, calc(100% - 28px));
              height: 78px;

              margin: 0 auto;
              padding: 0 17px;

              display: flex;
              align-items: center;
              justify-content: space-between;

              overflow: hidden;
              isolation: isolate;

              border: none;
              border-radius: 50px;

              transform: translate3d(0, 0, 0);
              -webkit-transform: translate3d(0, 0, 0);

              backface-visibility: hidden;
              -webkit-backface-visibility: hidden;

              will-change: transform;
              contain: paint;

              background:
                radial-gradient(
                  470px 90px at 8% -35%,
                  rgba(255, 255, 255, 0.9),
                  rgba(255, 255, 255, 0.16) 47%,
                  transparent 72%
                ),
                linear-gradient(
                  135deg,
                  rgba(255, 255, 255, 0.57),
                  rgba(246, 248, 251, 0.42) 12%,
                  rgba(225, 231, 239, 0.28)
                );

              -webkit-backdrop-filter:
                blur(13px)
                saturate(130%);

              backdrop-filter:
                blur(13px)
                saturate(130%);

              box-shadow:
                0 14px 28px rgba(15, 23, 42, 0.08),
                0 4px 10px rgba(15, 23, 42, 0.04),
                inset 0 1px 0 rgba(255, 255, 255, 0.64);

              pointer-events: auto;
            }

            .RS_SoftHeader::before {
              content: "";

              position: absolute;
              inset: 0;

              z-index: 0;

              border-radius: inherit;

              background:
                linear-gradient(
                  112deg,
                  rgba(255, 255, 255, 0.22),
                  rgba(255, 255, 255, 0.05) 35%,
                  transparent 62%
                );

              pointer-events: none;
            }

            .RS_SoftHeader::after {
              content: "";

              position: absolute;

              top: 1px;
              left: 30px;

              width: 36%;
              height: 1px;

              border-radius: 999px;

              background:
                linear-gradient(
                  90deg,
                  transparent,
                  rgba(255, 255, 255, 0.76),
                  transparent
                );

              opacity: 0.65;

              pointer-events: none;
            }

            .RS_SoftHeader > * {
              position: relative;
              z-index: 2;
            }

            /* ================================================
               LOGO
            ================================================ */

            .RS_SoftBrand {
              display: inline-flex;
              align-items: center;
              justify-content: flex-start;

              flex: 0 0 auto;

              width: fit-content;
              height: 44px;

              margin: 0;
              padding: 0;

              text-decoration: none;
              outline: none;
            }

            .RS_SoftLogo {
  display: block;

  width: auto;
  height: 31px;

  object-fit: contain;
  user-select: none;

  /* Keep the logo's original SVG colors */
  filter: none;
  opacity: 1;

  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;

  transition:
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 220ms ease;
}

  .RS_SoftBrand:hover .RS_SoftLogo {
  filter: none;
  opacity: 1;

  transform:
    translate3d(0, 0, 0)
    scale(1.018);
}

            /* ================================================
               CENTRE NAVIGATION
            ================================================ */

            .RS_SoftNavigation {
              position: absolute;
              left: 50%;
              top: 50%;

              display: flex;
              align-items: center;
              justify-content: center;

              gap: 3px;

              width: fit-content;
              height: 40px;

              margin: 0;
              padding: 3px;

              border: none;
              border-radius: 999px;

              background:
                linear-gradient(
                  180deg,
                  rgba(255, 255, 255, 0.34),
                  rgba(226, 232, 240, 0.11)
                );

              box-shadow:
                inset 0 1px 0 rgba(255, 255, 255, 0.54),
                0 3px 12px rgba(15, 23, 42, 0.025);

              transform: translate3d(-50%, -50%, 0);
              -webkit-transform: translate3d(-50%, -50%, 0);
            }

            .RS_SoftNavLink {
              position: relative;

              display: inline-flex;
              align-items: center;
              justify-content: center;

              gap: 6px;

              min-width: 90px;
              height: 32px;

              padding: 0 12px;

              border: none;
              border-radius: 999px;

              color: rgba(30, 41, 59, 0.59);

              font-family: inherit;
              font-size: 13px;
              font-weight: 500;
              letter-spacing: -0.01em;
              line-height: 1;

              text-decoration: none;
              white-space: nowrap;
              outline: none;

              transform: translate3d(0, 0, 0);
              backface-visibility: hidden;

              transition:
                color 220ms ease,
                background 220ms ease,
                box-shadow 220ms ease,
                transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
            }

            .RS_SoftNavIcon {
              display: inline-flex;
              align-items: center;
              justify-content: center;

              flex-shrink: 0;
            }

            .RS_SoftNavLink:hover,
            .RS_SoftNavLink:focus-visible {
              color: #111827;

              background:
                rgba(255, 255, 255, 0.55);

              box-shadow:
                0 4px 13px rgba(15, 23, 42, 0.045),
                inset 0 1px 0 rgba(255, 255, 255, 0.7);

              transform: translate3d(0, -1px, 0);
            }

            .RS_SoftNavLink--active {
              color: #111827;
              font-weight: 600;

              background:
                rgba(255, 255, 255, 0.64);

              box-shadow:
                0 4px 13px rgba(15, 23, 42, 0.045),
                inset 0 1px 0 rgba(255, 255, 255, 0.76);
            }

            .RS_SoftNavLink--active::after {
              content: "";

              position: absolute;
              bottom: 2px;
              left: 50%;

              width: 13px;
              height: 2px;

              border-radius: 999px;

              background:
                linear-gradient(
                  90deg,
                  transparent,
                  #e43b34,
                  transparent
                );

              opacity: 0.8;

              transform: translateX(-50%);
            }

            /* ================================================
               HAMBURGER
            ================================================ */

            .RS_SoftRight {
              display: flex;
              align-items: center;
              justify-content: flex-end;

              flex: 0 0 auto;

              width: fit-content;

              margin: 0;
              padding: 0;
            }

            .RS_SoftMenuButton {
              display: inline-flex;
              align-items: center;
              justify-content: center;

              width: 40px;
              height: 40px;

              padding: 0;

              border: none;
              border-radius: 14px;

              background:
                linear-gradient(
                  145deg,
                  rgba(255, 255, 255, 0.53),
                  rgba(226, 232, 240, 0.18)
                );

              box-shadow:
                0 4px 12px rgba(15, 23, 42, 0.045),
                inset 0 1px 0 rgba(255, 255, 255, 0.62);

              cursor: pointer;
              outline: none;

              transform: translate3d(0, 0, 0);
              backface-visibility: hidden;

              transition:
                transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
                background 220ms ease,
                box-shadow 220ms ease;
            }

            .RS_SoftMenuButton:hover {
              background:
                rgba(255, 255, 255, 0.69);

              box-shadow:
                0 7px 16px rgba(15, 23, 42, 0.065),
                inset 0 1px 0 rgba(255, 255, 255, 0.78);

              transform: translate3d(0, -1px, 0);
            }

            .RS_SoftMenuButton--open {
              background:
                linear-gradient(
                  145deg,
                  rgba(255, 255, 255, 0.77),
                  rgba(254, 226, 226, 0.44)
                );

              box-shadow:
                0 6px 15px rgba(228, 59, 52, 0.06),
                inset 0 1px 0 rgba(255, 255, 255, 0.74);
            }

            .RS_SoftHamburger {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;

              gap: 4px;

              width: 18px;
              height: 16px;
            }

            .RS_SoftHamburgerLine {
              display: block;

              width: 18px;
              height: 1.5px;

              border-radius: 999px;

              background:
                rgba(15, 23, 42, 0.76);

              transform-origin: center;
              backface-visibility: hidden;

              transition:
                transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
                width 260ms ease,
                margin 260ms ease,
                opacity 180ms ease;
            }

            .RS_SoftHamburgerLine:nth-child(2) {
              width: 13px;
              margin-left: 5px;
            }

            .RS_SoftMenuButton:hover
            .RS_SoftHamburgerLine:nth-child(2) {
              width: 18px;
              margin-left: 0;
            }

            .RS_SoftMenuButton--open
            .RS_SoftHamburgerLine:nth-child(1) {
              transform:
                translate3d(0, 5.5px, 0)
                rotate(45deg);
            }

            .RS_SoftMenuButton--open
            .RS_SoftHamburgerLine:nth-child(2) {
              width: 0;
              margin-left: 0;

              opacity: 0;

              transform: scaleX(0);
            }

            .RS_SoftMenuButton--open
            .RS_SoftHamburgerLine:nth-child(3) {
              transform:
                translate3d(0, -5.5px, 0)
                rotate(-45deg);
            }

            /* ================================================
               BORDERLESS GLASS DROPDOWN
            ================================================ */

            .RS_SoftDropdown {
              position: fixed;

              top: 82px;
              right:
                max(
                  14px,
                  calc((100vw - 820px) / 2)
                );

              width: 315px;
              padding: 11px;

              overflow: hidden;

              border: none;
              border-radius: 22px;

              color: #0f172a;

              background:
                radial-gradient(
                  390px 125px at 5% -14%,
                  rgba(255, 255, 255, 0.9),
                  transparent 65%
                ),
                linear-gradient(
                  145deg,
                  rgba(255, 255, 255, 0.74),
                  rgba(239, 243, 248, 0.62)
                );

              -webkit-backdrop-filter:
                blur(13px)
                saturate(124%);

              backdrop-filter:
                blur(13px)
                saturate(124%);

              box-shadow:
                0 18px 36px rgba(15, 23, 42, 0.1),
                0 6px 15px rgba(15, 23, 42, 0.05),
                inset 0 1px 0 rgba(255, 255, 255, 0.62);

              opacity: 0;
              visibility: hidden;
              pointer-events: none;

              transform:
                translate3d(0, -9px, 0)
                scale(0.97);

              -webkit-transform:
                translate3d(0, -9px, 0)
                scale(0.97);

              transform-origin: 90% 0%;

              backface-visibility: hidden;
              -webkit-backface-visibility: hidden;

              will-change: transform, opacity;
              contain: paint;

              transition:
                opacity 220ms ease,
                transform 470ms cubic-bezier(0.16, 1, 0.3, 1),
                visibility 0s linear 470ms;

              z-index: 10000;
            }

            .RS_SoftDropdown::before {
              content: "";

              position: absolute;
              inset: 0;

              border-radius: inherit;

              background:
                linear-gradient(
                  112deg,
                  rgba(255, 255, 255, 0.18),
                  transparent 44%
                );

              pointer-events: none;
            }

            .RS_SoftDropdown--open {
              opacity: 1;
              visibility: visible;
              pointer-events: auto;

              transform:
                translate3d(0, 0, 0)
                scale(1);

              -webkit-transform:
                translate3d(0, 0, 0)
                scale(1);

              transition:
                opacity 250ms ease,
                transform 490ms cubic-bezier(0.16, 1, 0.3, 1),
                visibility 0s;
            }

            .RS_SoftDropContent {
              position: relative;
              z-index: 2;

              padding: 7px 5px 5px;
            }

            .RS_SoftDropHeader {
              display: flex;
              align-items: center;
              justify-content: space-between;

              padding: 7px 9px 13px;
            }

            .RS_SoftDropEyebrow {
              display: block;

              margin-bottom: 4px;

              color: rgba(71, 85, 105, 0.55);

              font-size: 9px;
              font-weight: 700;
              letter-spacing: 0.13em;

              text-transform: uppercase;
            }

            .RS_SoftDropTitle {
              display: block;

              color: #0f172a;

              font-size: 17px;
              font-weight: 650;
              letter-spacing: -0.025em;
            }

            .RS_SoftStatus {
              display: inline-flex;
              align-items: center;

              gap: 6px;

              padding: 6px 9px;

              border: none;
              border-radius: 999px;

              color: rgba(51, 65, 85, 0.6);

              font-size: 10px;
              font-weight: 550;

              background:
                rgba(255, 255, 255, 0.39);

              box-shadow:
                0 3px 10px rgba(15, 23, 42, 0.025);
            }

            .RS_SoftStatusDot {
              width: 6px;
              height: 6px;

              border-radius: 50%;

              background: #e43b34;

              box-shadow:
                0 0 0 3px rgba(228, 59, 52, 0.08);
            }

            .RS_SoftDivider {
              width: calc(100% - 28px);
              height: 1px;

              margin: 7px auto;

              background:
                linear-gradient(
                  90deg,
                  transparent,
                  rgba(100, 116, 139, 0.11),
                  transparent
                );
            }

            .RS_SoftMenuList {
              display: flex;
              flex-direction: column;

              gap: 3px;
            }

            .RS_SoftDropRow {
              display: flex;
              align-items: center;

              width: 100%;
              min-height: 48px;

              padding: 5px 8px;

              border: none;
              border-radius: 14px;

              color: rgba(30, 41, 59, 0.65);

              font-family: inherit;
              font-size: 13px;
              font-weight: 520;
              text-align: left;

              background: transparent;

              cursor: pointer;
              outline: none;

              opacity: 0;

              transform:
                translate3d(0, 7px, 0)
                scale(0.985);

              backface-visibility: hidden;

              transition:
                opacity 220ms ease,
                transform 410ms cubic-bezier(0.16, 1, 0.3, 1),
                color 200ms ease,
                background 200ms ease,
                box-shadow 200ms ease;
            }

            .RS_SoftDropdown--open
            .RS_SoftDropRow {
              opacity: 1;

              transform:
                translate3d(0, 0, 0)
                scale(1);

              transition-delay:
                calc(55ms + (var(--row-index) * 36ms)),
                calc(55ms + (var(--row-index) * 36ms)),
                0ms,
                0ms,
                0ms;
            }

            .RS_SoftDropRow:hover,
            .RS_SoftDropRow:focus-visible {
              color: #111827;

              background:
                rgba(255, 255, 255, 0.46);

              box-shadow:
                0 5px 13px rgba(15, 23, 42, 0.035);

              transform: translate3d(2px, 0, 0);
            }

            .RS_SoftDropIcon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;

              width: 34px;
              height: 34px;

              margin-right: 10px;

              border: none;
              border-radius: 11px;

              color: rgba(30, 41, 59, 0.63);

              background:
                rgba(255, 255, 255, 0.42);

              box-shadow:
                0 3px 9px rgba(15, 23, 42, 0.03);
            }

            .RS_SoftDropLabel {
              flex: 1;
            }

            .RS_SoftDropArrow {
              display: inline-flex;
              align-items: center;
              justify-content: center;

              color: rgba(71, 85, 105, 0.32);

              transition:
                color 200ms ease,
                transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
            }

            .RS_SoftDropRow:hover
            .RS_SoftDropArrow {
              color: rgba(15, 23, 42, 0.65);

              transform: translate3d(2px, 0, 0);
            }

            /* ================================================
               MOBILE NAVIGATION
            ================================================ */

            .RS_SoftMobileNavigation {
              display: none;
              flex-direction: column;

              gap: 3px;

              padding-bottom: 3px;
            }

            .RS_SoftMobileNavLink {
              display: flex;
              align-items: center;
              justify-content: space-between;

              min-height: 44px;

              padding: 0 13px;

              border: none;
              border-radius: 13px;

              color: rgba(30, 41, 59, 0.65);

              font-size: 13px;
              font-weight: 520;

              text-decoration: none;

              transition:
                color 200ms ease,
                background 200ms ease;
            }

            .RS_SoftMobileNavLink:hover,
            .RS_SoftMobileNavLink--active {
              color: #111827;

              background:
                rgba(255, 255, 255, 0.44);
            }

            .RS_SoftMobileIndicator {
              width: 7px;
              height: 7px;

              border-radius: 50%;

              background:
                rgba(100, 116, 139, 0.2);
            }

            .RS_SoftMobileNavLink--active
            .RS_SoftMobileIndicator {
              background: #e43b34;
            }

            /* ================================================
               RESPONSIVE
            ================================================ */

            @media (max-width: 900px) {
              .RS_SoftHeader {
                width: min(680px, calc(100% - 20px));

                padding: 0 14px 0 18px;

                display: flex;
                align-items: center;
                justify-content: space-between;
              }

              .RS_SoftNavigation {
                display: none;
              }

              .RS_SoftMobileNavigation {
                display: flex;
              }

              .RS_SoftDropdown {
                right:
                  max(
                    10px,
                    calc((100vw - 680px) / 2)
                  );
              }
            }

            @media (max-width: 767px) {
              .RS_SoftHeaderRoot {
                top: 8px;
              }

              .RS_SoftHeader {
                width: calc(100% - 16px);

                /* Original mobile height retained */
                height: 56px;

                padding: 0 9px 0 15px;

                border-radius: 19px;

                -webkit-backdrop-filter:
                  blur(9px)
                  saturate(120%);

                backdrop-filter:
                  blur(9px)
                  saturate(120%);
              }

              .RS_SoftLogo {
                height: 27px;
                max-width: 140px;
              }

              .RS_SoftMenuButton {
                width: 38px;
                height: 38px;

                border-radius: 13px;
              }

              .RS_SoftDropdown {
                top: 72px;
                right: 8px;
                left: 8px;

                width: auto;
                max-height: calc(100dvh - 84px);

                overflow-y: auto;

                border-radius: 20px;

                -webkit-backdrop-filter:
                  blur(9px)
                  saturate(118%);

                backdrop-filter:
                  blur(9px)
                  saturate(118%);
              }
            }

            @media (max-width: 380px) {
              .RS_SoftLogo {
                height: 25px;
                max-width: 125px;
              }

              .RS_SoftDropdown {
                padding: 8px;
              }
            }

            @supports not (
              (backdrop-filter: blur(13px)) or
              (-webkit-backdrop-filter: blur(13px))
            ) {
              .RS_SoftHeader {
                background:
                  rgba(244, 247, 250, 0.95);
              }

              .RS_SoftDropdown {
                background:
                  rgba(247, 249, 252, 0.97);
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .RS_SoftHeader,
              .RS_SoftHeader *,
              .RS_SoftDropdown,
              .RS_SoftDropdown * {
                animation: none !important;
                transition-duration: 0.01ms !important;
              }
            }
          `,
        }}
      />

      <div className="RS_SoftHeaderRoot">
        <nav
          ref={navbarRef}
          className="RS_SoftHeader"
          aria-label="Main navigation"
        >
          <Link
            href="/"
            className="RS_SoftBrand"
            aria-label="Adinn Roadshow home"
            onClick={() => setOpen(false)}
          >
            <Image
              src="/images/assets/Roadshow_AdinnLogo.svg"
              alt="Adinn Roadshow"
              width={170}
              height={46}
              className="RS_SoftLogo"
              priority
            />
          </Link>

          <div className="RS_SoftNavigation">
            {navLinks.map(({ label, href, icon }) => {
              const active = isActive(href);

              return (
                <Link
                  key={label}
                  href={href}
                  className={`RS_SoftNavLink ${active ? "RS_SoftNavLink--active" : ""
                    }`}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="RS_SoftNavIcon">
                    <Icon name={icon} size={15} />
                  </span>

                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="RS_SoftRight">
            <button
              type="button"
              className={`RS_SoftMenuButton ${open ? "RS_SoftMenuButton--open" : ""
                }`}
              onClick={() => setOpen((previous) => !previous)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="roadshow-soft-menu"
            >
              <span className="RS_SoftHamburger" aria-hidden="true">
                <span className="RS_SoftHamburgerLine" />
                <span className="RS_SoftHamburgerLine" />
                <span className="RS_SoftHamburgerLine" />
              </span>
            </button>
          </div>
        </nav>
      </div>

      <aside
        ref={dropdownRef}
        id="roadshow-soft-menu"
        className={`RS_SoftDropdown ${open ? "RS_SoftDropdown--open" : ""
          }`}
        aria-hidden={!open}
      >
        <div className="RS_SoftDropContent">
          <div className="RS_SoftMobileNavigation">
            {navLinks.map(({ label, href }) => {
              const active = isActive(href);

              return (
                <Link
                  key={label}
                  href={href}
                  tabIndex={open ? 0 : -1}
                  className={`RS_SoftMobileNavLink ${active ? "RS_SoftMobileNavLink--active" : ""
                    }`}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                >
                  <span>{label}</span>
                  <span className="RS_SoftMobileIndicator" />
                </Link>
              );
            })}

            <div className="RS_SoftDivider" />
          </div>

          <div className="RS_SoftDropHeader">
            <div>
              <span className="RS_SoftDropEyebrow">
                Roadshow
              </span>

              <span className="RS_SoftDropTitle">
                Your account
              </span>
            </div>

            <div className="RS_SoftStatus">
              <span className="RS_SoftStatusDot" />
              Online
            </div>
          </div>

          <div className="RS_SoftMenuList">
            {menuItems.map(({ label, icon }, index) => (
              <React.Fragment key={label}>
                {index === 3 && (
                  <div className="RS_SoftDivider" />
                )}

                <button
                  type="button"
                  role="menuitem"
                  tabIndex={open ? 0 : -1}
                  className="RS_SoftDropRow"
                  style={{
                    "--row-index": index,
                  }}
                  onClick={() => handleMenuItemClick(label)}
                >
                  <span className="RS_SoftDropIcon">
                    <Icon name={icon} />
                  </span>

                  <span className="RS_SoftDropLabel">
                    {label}
                  </span>

                  <span className="RS_SoftDropArrow">
                    <ChevronIcon />
                  </span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}