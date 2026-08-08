// /* eslint-disable */
// // @ts-nocheck
// "use client";

// import React, { useEffect, useRef, useState } from "react";
// import { createPortal } from "react-dom";
// import Image from "next/image";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import { useAuth } from "@/context/AuthContext";

// const navLinks = [
//   { label: "Home", href: "/", icon: "home" },
//   { label: "Vehicle", href: "/vehicle", icon: "vehicle" },
//   { label: "Contact Us", href: "/roadshow/Contact", icon: "contact" },
// ];

// function Icon({
//   name,
//   size = 58,
// }: {
//   name: string;
//   size?: number;
// }) {
//   const commonProps = {
//     width: size,
//     height: size,
//     viewBox: "0 0 24 24",
//     fill: "none",
//     stroke: "currentColor",
//     strokeWidth: 1.8,
//     strokeLinecap: "round",
//     strokeLinejoin: "round",
//     "aria-hidden": true,
//   };

//   if (name === "home") {
//     return (
//       <svg {...commonProps}>
//         <path d="M3 10.5 12 3l9 7.5" />
//         <path d="M5 9.5V20a1 1 0 0 0 1 1h4.5v-6h3v6H18a1 1 0 0 0 1-1V9.5" />
//       </svg>
//     );
//   }

//   if (name === "vehicle") {
//     return (
//       <svg {...commonProps}>
//         <rect x="3" y="7" width="18" height="10" rx="2" />
//         <path d="M7 17v2" />
//         <path d="M17 17v2" />
//         <path d="M3 12h18" />
//       </svg>
//     );
//   }

//   if (name === "contact" || name === "mail") {
//     return (
//       <svg {...commonProps}>
//         <rect x="3" y="5" width="18" height="14" rx="3" />
//         <path d="m4 7 8 6 8-6" />
//       </svg>
//     );
//   }

//   if (name === "user") {
//     return (
//       <svg {...commonProps}>
//         <circle cx="12" cy="7" r="4" />
//         <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
//       </svg>
//     );
//   }

//   if (name === "phone") {
//     return (
//       <svg {...commonProps}>
//         <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.28-1.28a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92Z" />
//       </svg>
//     );
//   }

//   if (name === "cart") {
//     return (
//       <svg {...commonProps}>
//         <circle cx="9" cy="20" r="1" />
//         <circle cx="19" cy="20" r="1" />
//         <path d="M3 4h2l2.4 10.2a2 2 0 0 0 2 1.55h8.8a2 2 0 0 0 1.95-1.55L22 7H6" />
//       </svg>
//     );
//   }

//   if (name === "history") {
//     return (
//       <svg {...commonProps}>
//         <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
//         <path d="M3 3v5h5" />
//         <path d="M12 7v5l3 2" />
//       </svg>
//     );
//   }

//   return null;
// }

// function ChevronIcon() {
//   return (
//     <svg
//       width="16"
//       height="16"
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth="1.8"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       aria-hidden="true"
//     >
//       <path d="m9 18 6-6-6-6" />
//     </svg>
//   );
// }

// export default function Navbar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const { user, openAuth, logoutUser } = useAuth();

//   const [open, setOpen] = useState(false);

//   // GSAP ScrollSmoother transforms an ancestor of this component, which
//   // breaks `position: fixed` (see .RS_SoftHeaderRoot/.RS_SoftDropdown
//   // below), so the navbar has to be portaled to document.body to escape
//   // it. The mount flag starts false and flips in an effect (not a lazy
//   // useState initializer) so server and first-client-render both output
//   // nothing, avoiding a hydration mismatch — the navbar pops in right
//   // after hydration instead.
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   const navbarRef = useRef<HTMLElement | null>(null);
//   const dropdownRef = useRef<HTMLElement | null>(null);

//   const isActive = (href: string) => {
//     if (href === "/") {
//       return pathname === "/";
//     }

//     return pathname === href || pathname?.startsWith(`${href}/`);
//   };

//   useEffect(() => {
//     setOpen(false);
//   }, [pathname]);

//   useEffect(() => {
//     if (!open) return;

//     const handleOutsideClick = (event: MouseEvent) => {
//       const target = event.target as Node;

//       const clickedNavbar = navbarRef.current?.contains(target);
//       const clickedDropdown = dropdownRef.current?.contains(target);

//       if (!clickedNavbar && !clickedDropdown) {
//         setOpen(false);
//       }
//     };

//     const handleEscape = (event: KeyboardEvent) => {
//       if (event.key === "Escape") {
//         setOpen(false);
//       }
//     };

//     document.addEventListener("mousedown", handleOutsideClick);
//     document.addEventListener("keydown", handleEscape);

//     return () => {
//       document.removeEventListener("mousedown", handleOutsideClick);
//       document.removeEventListener("keydown", handleEscape);
//     };
//   }, [open]);

//   const handleMenuItemClick = (action: string) => {
//     setOpen(false);

//     if (action === "cart") router.push("/roadshow/my-bookings");
//     if (action === "orders") router.push("/roadshow/my-bookings");
//     if (action === "signout") logoutUser();
//     if (action === "signin") openAuth("login");
//     if (action === "signup") openAuth("signup");
//   };

//   if (!mounted) return null;

//   return createPortal(
//     <>
//       <style
//         dangerouslySetInnerHTML={{
//           __html: `
//             .RS_SoftHeaderRoot,
//             .RS_SoftHeaderRoot *,
//             .RS_SoftDropdown,
//             .RS_SoftDropdown * {
//               box-sizing: border-box;
//             }

//             /* ================================================
//                FLOATING BORDERLESS GLASS HEADER
//             ================================================ */

//             .RS_SoftHeaderRoot {
//               --rs-nav-font: 13px;
//               --rs-nav-link-h: 32px;
//               --rs-nav-gap: 3px;
//               --rs-logo-h: 31px;

//               position: fixed;
//               top: 12px;
//               left: 0;

//               width: 100%;

//               z-index: 9999;
//               pointer-events: none;

//               transform: translate3d(0, 0, 0);
//               -webkit-transform: translate3d(0, 0, 0);

//               backface-visibility: hidden;
//               -webkit-backface-visibility: hidden;

//               will-change: transform;
//             }

//             .RS_SoftHeader {
//               position: relative;

//               /*
//                 Reduced from 1120px to 820px.
//                 Header height remains unchanged.
//               */
//               width: min(820px, calc(100% - 28px));
//               height: 78px;

//               margin: 0 auto;
//               padding: 0 17px;

//               display: flex;
//               align-items: center;
//               justify-content: space-between;

//               overflow: hidden;
//               isolation: isolate;

//               border: none;
//               border-radius: 50px;

//               transform: translate3d(0, 0, 0);
//               -webkit-transform: translate3d(0, 0, 0);

//               backface-visibility: hidden;
//               -webkit-backface-visibility: hidden;

//               will-change: transform;
//               contain: paint;

//               background:
//                 radial-gradient(
//                   470px 90px at 8% -35%,
//                   rgba(255, 255, 255, 0.9),
//                   rgba(255, 255, 255, 0.16) 47%,
//                   transparent 72%
//                 ),
//                 linear-gradient(
//                   135deg,
//                   rgba(255, 255, 255, 0.57),
//                   rgba(246, 248, 251, 0.42) 12%,
//                   rgba(225, 231, 239, 0.28)
//                 );

//               -webkit-backdrop-filter:
//                 blur(13px)
//                 saturate(130%);

//               backdrop-filter:
//                 blur(13px)
//                 saturate(130%);

//               box-shadow:
//                 0 14px 28px rgba(15, 23, 42, 0.08),
//                 0 4px 10px rgba(15, 23, 42, 0.04),
//                 inset 0 1px 0 rgba(255, 255, 255, 0.64);

//               pointer-events: auto;
//             }

//             .RS_SoftHeader::before {
//               content: "";

//               position: absolute;
//               inset: 0;

//               z-index: 0;

//               border-radius: inherit;

//               background:
//                 linear-gradient(
//                   112deg,
//                   rgba(255, 255, 255, 0.22),
//                   rgba(255, 255, 255, 0.05) 35%,
//                   transparent 62%
//                 );

//               pointer-events: none;
//             }

//             .RS_SoftHeader::after {
//               content: "";

//               position: absolute;

//               top: 1px;
//               left: 30px;

//               width: 36%;
//               height: 1px;

//               border-radius: 999px;

//               background:
//                 linear-gradient(
//                   90deg,
//                   transparent,
//                   rgba(255, 255, 255, 0.76),
//                   transparent
//                 );

//               opacity: 0.65;

//               pointer-events: none;
//             }

//             .RS_SoftHeader > * {
//               position: relative;
//               z-index: 2;
//             }

//             /* ================================================
//                LOGO
//             ================================================ */

//             .RS_SoftBrand {
//               display: inline-flex;
//               align-items: center;
//               justify-content: flex-start;

//               flex: 0 0 auto;

//               width: fit-content;
//               height: 44px;

//               margin: 0;
//               padding: 0;

//               text-decoration: none;
//               outline: none;
//             }

//             .RS_SoftLogo {
//   display: block;

//   width: auto;
//   height: var(--rs-logo-h);

//   object-fit: contain;
//   user-select: none;

//   /* Keep the logo's original SVG colors */
//   filter: none;
//   opacity: 1;

//   transform: translate3d(0, 0, 0);
//   backface-visibility: hidden;

//   transition:
//     transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
//     opacity 220ms ease;
// }

//   .RS_SoftBrand:hover .RS_SoftLogo {
//   filter: none;
//   opacity: 1;

//   transform:
//     translate3d(0, 0, 0)
//     scale(1.018);
// }

//             /* ================================================
//                CENTRE NAVIGATION
//             ================================================ */

//             .RS_SoftNavigation {
//               position: absolute;
//               left: 50%;
//               top: 50%;

//               display: flex;
//               align-items: center;
//               justify-content: center;

//               gap: var(--rs-nav-gap);

//               width: fit-content;
//               height: 40px;

//               margin: 0;
//               padding: 3px;

//               border: none;
//               border-radius: 999px;

//               background:
//                 linear-gradient(
//                   180deg,
//                   rgba(255, 255, 255, 0.34),
//                   rgba(226, 232, 240, 0.11)
//                 );

//               box-shadow:
//                 inset 0 1px 0 rgba(255, 255, 255, 0.54),
//                 0 3px 12px rgba(15, 23, 42, 0.025);

//               transform: translate3d(-50%, -50%, 0);
//               -webkit-transform: translate3d(-50%, -50%, 0);
//             }

//             .RS_SoftNavLink {
//               position: relative;

//               display: inline-flex;
//               align-items: center;
//               justify-content: center;

//               gap: 6px;

//               min-width: 90px;
//               height: var(--rs-nav-link-h);

//               padding: 0 12px;

//               border: none;
//               border-radius: 999px;

//               color: rgba(30, 41, 59, 0.59);

//               font-family: inherit;
//               font-size: var(--rs-nav-font);
//               font-weight: 500;
//               letter-spacing: -0.01em;
//               line-height: 1;

//               text-decoration: none;
//               white-space: nowrap;
//               outline: none;

//               transform: translate3d(0, 0, 0);
//               backface-visibility: hidden;

//               transition:
//                 color 220ms ease,
//                 background 220ms ease,
//                 box-shadow 220ms ease,
//                 transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
//             }

//             .RS_SoftNavIcon {
//               display: inline-flex;
//               align-items: center;
//               justify-content: center;

//               flex-shrink: 0;
//             }

//             .RS_SoftNavLink:hover,
//             .RS_SoftNavLink:focus-visible {
//               color: #111827;

//               background:
//                 rgba(255, 255, 255, 0.55);

//               box-shadow:
//                 0 4px 13px rgba(15, 23, 42, 0.045),
//                 inset 0 1px 0 rgba(255, 255, 255, 0.7);

//               transform: translate3d(0, -1px, 0);
//             }

//             .RS_SoftNavLink--active {
//               color: #111827;
//               font-weight: 600;

//               background:
//                 rgba(255, 255, 255, 0.64);

//               box-shadow:
//                 0 4px 13px rgba(15, 23, 42, 0.045),
//                 inset 0 1px 0 rgba(255, 255, 255, 0.76);
//             }

//             .RS_SoftNavLink--active::after {
//               content: "";

//               position: absolute;
//               bottom: 2px;
//               left: 50%;

//               width: 13px;
//               height: 2px;

//               border-radius: 999px;

//               background:
//                 linear-gradient(
//                   90deg,
//                   transparent,
//                   #e43b34,
//                   transparent
//                 );

//               opacity: 0.8;

//               transform: translateX(-50%);
//             }

//             /* ================================================
//                HAMBURGER
//             ================================================ */

//             .RS_SoftRight {
//               display: flex;
//               align-items: center;
//               justify-content: flex-end;

//               flex: 0 0 auto;

//               width: fit-content;

//               margin: 0;
//               padding: 0;
//             }

//             .RS_SoftMenuButton {
//               display: inline-flex;
//               align-items: center;
//               justify-content: center;

//               width: 40px;
//               height: 40px;

//               padding: 0;

//               border: none;
//               border-radius: 14px;

//               background:
//                 linear-gradient(
//                   145deg,
//                   rgba(255, 255, 255, 0.53),
//                   rgba(226, 232, 240, 0.18)
//                 );

//               box-shadow:
//                 0 4px 12px rgba(15, 23, 42, 0.045),
//                 inset 0 1px 0 rgba(255, 255, 255, 0.62);

//               cursor: pointer;
//               outline: none;

//               transform: translate3d(0, 0, 0);
//               backface-visibility: hidden;

//               transition:
//                 transform 260ms cubic-bezier(0.16, 1, 0.3, 1),
//                 background 220ms ease,
//                 box-shadow 220ms ease;
//             }

//             .RS_SoftMenuButton:hover {
//               background:
//                 rgba(255, 255, 255, 0.69);

//               box-shadow:
//                 0 7px 16px rgba(15, 23, 42, 0.065),
//                 inset 0 1px 0 rgba(255, 255, 255, 0.78);

//               transform: translate3d(0, -1px, 0);
//             }

//             .RS_SoftMenuButton--open {
//               background:
//                 linear-gradient(
//                   145deg,
//                   rgba(255, 255, 255, 0.77),
//                   rgba(254, 226, 226, 0.44)
//                 );

//               box-shadow:
//                 0 6px 15px rgba(228, 59, 52, 0.06),
//                 inset 0 1px 0 rgba(255, 255, 255, 0.74);
//             }

//             .RS_SoftHamburger {
//               display: flex;
//               flex-direction: column;
//               align-items: center;
//               justify-content: center;

//               gap: 4px;

//               width: 18px;
//               height: 16px;
//             }

//             .RS_SoftHamburgerLine {
//               display: block;

//               width: 18px;
//               height: 1.5px;

//               border-radius: 999px;

//               background:
//                 rgba(15, 23, 42, 0.76);

//               transform-origin: center;
//               backface-visibility: hidden;

//               transition:
//                 transform 400ms cubic-bezier(0.16, 1, 0.3, 1),
//                 width 260ms ease,
//                 margin 260ms ease,
//                 opacity 180ms ease;
//             }

//             .RS_SoftHamburgerLine:nth-child(2) {
//               width: 13px;
//               margin-left: 5px;
//             }

//             .RS_SoftMenuButton:hover
//             .RS_SoftHamburgerLine:nth-child(2) {
//               width: 18px;
//               margin-left: 0;
//             }

//             .RS_SoftMenuButton--open
//             .RS_SoftHamburgerLine:nth-child(1) {
//               transform:
//                 translate3d(0, 5.5px, 0)
//                 rotate(45deg);
//             }

//             .RS_SoftMenuButton--open
//             .RS_SoftHamburgerLine:nth-child(2) {
//               width: 0;
//               margin-left: 0;

//               opacity: 0;

//               transform: scaleX(0);
//             }

//             .RS_SoftMenuButton--open
//             .RS_SoftHamburgerLine:nth-child(3) {
//               transform:
//                 translate3d(0, -5.5px, 0)
//                 rotate(-45deg);
//             }

//             /* ================================================
//                BORDERLESS GLASS DROPDOWN
//             ================================================ */

//             .RS_SoftDropdown {
//               position: fixed;

//               top: 82px;
//               right:
//                 max(
//                   14px,
//                   calc((100vw - 820px) / 2)
//                 );

//               width: 315px;
//               padding: 11px;

//               overflow: hidden;

//               border: none;
//               border-radius: 22px;

//               color: #0f172a;

//               background:
//                 radial-gradient(
//                   390px 125px at 5% -14%,
//                   rgba(255, 255, 255, 0.9),
//                   transparent 65%
//                 ),
//                 linear-gradient(
//                   145deg,
//                   rgba(255, 255, 255, 0.74),
//                   rgba(239, 243, 248, 0.62)
//                 );

//               -webkit-backdrop-filter:
//                 blur(13px)
//                 saturate(124%);

//               backdrop-filter:
//                 blur(13px)
//                 saturate(124%);

//               box-shadow:
//                 0 18px 36px rgba(15, 23, 42, 0.1),
//                 0 6px 15px rgba(15, 23, 42, 0.05),
//                 inset 0 1px 0 rgba(255, 255, 255, 0.62);

//               opacity: 0;
//               visibility: hidden;
//               pointer-events: none;

//               transform:
//                 translate3d(0, -9px, 0)
//                 scale(0.97);

//               -webkit-transform:
//                 translate3d(0, -9px, 0)
//                 scale(0.97);

//               transform-origin: 90% 0%;

//               backface-visibility: hidden;
//               -webkit-backface-visibility: hidden;

//               will-change: transform, opacity;
//               contain: paint;

//               transition:
//                 opacity 220ms ease,
//                 transform 470ms cubic-bezier(0.16, 1, 0.3, 1),
//                 visibility 0s linear 470ms;

//               z-index: 10000;
//             }

//             .RS_SoftDropdown::before {
//               content: "";

//               position: absolute;
//               inset: 0;

//               border-radius: inherit;

//               background:
//                 linear-gradient(
//                   112deg,
//                   rgba(255, 255, 255, 0.18),
//                   transparent 44%
//                 );

//               pointer-events: none;
//             }

//             .RS_SoftDropdown--open {
//               opacity: 1;
//               visibility: visible;
//               pointer-events: auto;

//               transform:
//                 translate3d(0, 0, 0)
//                 scale(1);

//               -webkit-transform:
//                 translate3d(0, 0, 0)
//                 scale(1);

//               transition:
//                 opacity 250ms ease,
//                 transform 490ms cubic-bezier(0.16, 1, 0.3, 1),
//                 visibility 0s;
//             }

//             .RS_SoftDropContent {
//               position: relative;
//               z-index: 2;

//               padding: 7px 5px 5px;
//             }

//             .RS_SoftDropHeader {
//               display: flex;
//               align-items: center;
//               justify-content: space-between;

//               padding: 7px 9px 13px;
//             }

//             .RS_SoftDropEyebrow {
//               display: block;

//               margin-bottom: 4px;

//               color: rgba(71, 85, 105, 0.55);

//               font-size: 9px;
//               font-weight: 700;
//               letter-spacing: 0.13em;

//               text-transform: uppercase;
//             }

//             .RS_SoftDropTitle {
//               display: block;

//               color: #0f172a;

//               font-size: 17px;
//               font-weight: 650;
//               letter-spacing: -0.025em;
//             }

//             .RS_SoftStatus {
//               display: inline-flex;
//               align-items: center;

//               gap: 6px;

//               padding: 6px 9px;

//               border: none;
//               border-radius: 999px;

//               color: rgba(51, 65, 85, 0.6);

//               font-size: 10px;
//               font-weight: 550;

//               background:
//                 rgba(255, 255, 255, 0.39);

//               box-shadow:
//                 0 3px 10px rgba(15, 23, 42, 0.025);
//             }

//             .RS_SoftStatusDot {
//               width: 6px;
//               height: 6px;

//               border-radius: 50%;

//               background: #e43b34;

//               box-shadow:
//                 0 0 0 3px rgba(228, 59, 52, 0.08);
//             }

//             .RS_SoftDivider {
//               width: calc(100% - 28px);
//               height: 1px;

//               margin: 7px auto;

//               background:
//                 linear-gradient(
//                   90deg,
//                   transparent,
//                   rgba(100, 116, 139, 0.11),
//                   transparent
//                 );
//             }

//             .RS_SoftMenuList {
//               display: flex;
//               flex-direction: column;

//               gap: 3px;
//             }

//             .RS_SoftDropRow {
//               display: flex;
//               align-items: center;

//               width: 100%;
//               min-height: 48px;

//               padding: 5px 8px;

//               border: none;
//               border-radius: 14px;

//               color: rgba(30, 41, 59, 0.65);

//               font-family: inherit;
//               font-size: 13px;
//               font-weight: 520;
//               text-align: left;

//               background: transparent;

//               cursor: pointer;
//               outline: none;

//               opacity: 0;

//               transform:
//                 translate3d(0, 7px, 0)
//                 scale(0.985);

//               backface-visibility: hidden;

//               transition:
//                 opacity 220ms ease,
//                 transform 410ms cubic-bezier(0.16, 1, 0.3, 1),
//                 color 200ms ease,
//                 background 200ms ease,
//                 box-shadow 200ms ease;
//             }

//             .RS_SoftDropdown--open
//             .RS_SoftDropRow {
//               opacity: 1;

//               transform:
//                 translate3d(0, 0, 0)
//                 scale(1);

//               transition-delay:
//                 calc(55ms + (var(--row-index) * 36ms)),
//                 calc(55ms + (var(--row-index) * 36ms)),
//                 0ms,
//                 0ms,
//                 0ms;
//             }

//             .RS_SoftDropRow:hover,
//             .RS_SoftDropRow:focus-visible {
//               color: #111827;

//               background:
//                 rgba(255, 255, 255, 0.46);

//               box-shadow:
//                 0 5px 13px rgba(15, 23, 42, 0.035);

//               transform: translate3d(2px, 0, 0);
//             }

//             .RS_SoftDropIcon {
//               display: inline-flex;
//               align-items: center;
//               justify-content: center;
//               flex-shrink: 0;

//               width: 34px;
//               height: 34px;

//               margin-right: 10px;

//               border: none;
//               border-radius: 11px;

//               color: rgba(30, 41, 59, 0.63);

//               background:
//                 rgba(255, 255, 255, 0.42);

//               box-shadow:
//                 0 3px 9px rgba(15, 23, 42, 0.03);
//             }

//             .RS_SoftDropLabel {
//               flex: 1;
//             }

//             .RS_SoftDropArrow {
//               display: inline-flex;
//               align-items: center;
//               justify-content: center;

//               color: rgba(71, 85, 105, 0.32);

//               transition:
//                 color 200ms ease,
//                 transform 260ms cubic-bezier(0.16, 1, 0.3, 1);
//             }

//             .RS_SoftDropRow:hover
//             .RS_SoftDropArrow {
//               color: rgba(15, 23, 42, 0.65);

//               transform: translate3d(2px, 0, 0);
//             }

//             /* ================================================
//                MOBILE NAVIGATION
//             ================================================ */

//             .RS_SoftMobileNavigation {
//               display: none;
//               flex-direction: column;

//               gap: 3px;

//               padding-bottom: 3px;
//             }

//             .RS_SoftMobileNavLink {
//               display: flex;
//               align-items: center;
//               justify-content: space-between;

//               min-height: 44px;

//               padding: 0 13px;

//               border: none;
//               border-radius: 13px;

//               color: rgba(30, 41, 59, 0.65);

//               font-size: 13px;
//               font-weight: 520;

//               text-decoration: none;

//               transition:
//                 color 200ms ease,
//                 background 200ms ease;
//             }

//             .RS_SoftMobileNavLink:hover,
//             .RS_SoftMobileNavLink--active {
//               color: #111827;

//               background:
//                 rgba(255, 255, 255, 0.44);
//             }

//             .RS_SoftMobileIndicator {
//               width: 7px;
//               height: 7px;

//               border-radius: 50%;

//               background:
//                 rgba(100, 116, 139, 0.2);
//             }

//             .RS_SoftMobileNavLink--active
//             .RS_SoftMobileIndicator {
//               background: #e43b34;
//             }

//             /* ================================================
//                RESPONSIVE
//             ================================================ */

//             /* Large desktop */
//             @media (min-width: 1440px) {
//               .RS_SoftHeaderRoot {
//                 --rs-nav-font: 14px;
//                 --rs-nav-link-h: 36px;
//                 --rs-nav-gap: 4px;
//                 --rs-logo-h: 34px;
//               }
//             }

//             /* Small desktop / laptop */
//             @media (min-width: 1024px) and (max-width: 1439px) {
//               .RS_SoftHeaderRoot {
//                 --rs-nav-font: 13px;
//                 --rs-nav-link-h: 32px;
//                 --rs-nav-gap: 3px;
//                 --rs-logo-h: 31px;
//               }
//             }

//             /* Tablet */
//             @media (min-width: 901px) and (max-width: 1023px) {
//               .RS_SoftHeaderRoot {
//                 --rs-nav-font: 12px;
//                 --rs-nav-link-h: 30px;
//                 --rs-nav-gap: 2px;
//                 --rs-logo-h: 29px;
//               }

//               .RS_SoftNavLink {
//                 min-width: 76px;
//                 padding: 0 9px;
//               }
//             }

//             @media (max-width: 900px) {
//               .RS_SoftHeader {
//                 width: min(680px, calc(100% - 20px));

//                 padding: 0 14px 0 18px;

//                 display: flex;
//                 align-items: center;
//                 justify-content: space-between;
//               }

//               .RS_SoftNavigation {
//                 display: none;
//               }

//               .RS_SoftMobileNavigation {
//                 display: flex;
//               }

//               .RS_SoftDropdown {
//                 right:
//                   max(
//                     10px,
//                     calc((100vw - 680px) / 2)
//                   );
//               }
//             }

//             @media (max-width: 767px) {
//               .RS_SoftHeaderRoot {
//                 top: 8px;
//               }

//               .RS_SoftHeader {
//                 width: calc(100% - 16px);

//                 /* Original mobile height retained */
//                 height: 56px;

//                 padding: 0 9px 0 15px;

//                 border-radius: 19px;

//                 -webkit-backdrop-filter:
//                   blur(9px)
//                   saturate(120%);

//                 backdrop-filter:
//                   blur(9px)
//                   saturate(120%);
//               }

//               .RS_SoftLogo {
//                 height: 27px;
//                 max-width: 140px;
//               }

//               .RS_SoftMenuButton {
//                 width: 38px;
//                 height: 38px;

//                 border-radius: 13px;
//               }

//               .RS_SoftDropdown {
//                 top: 72px;
//                 right: 8px;
//                 left: 8px;

//                 width: auto;
//                 max-height: calc(100dvh - 84px);

//                 overflow-y: auto;

//                 border-radius: 20px;

//                 -webkit-backdrop-filter:
//                   blur(9px)
//                   saturate(118%);

//                 backdrop-filter:
//                   blur(9px)
//                   saturate(118%);
//               }
//             }

//             @media (max-width: 380px) {
//               .RS_SoftLogo {
//                 height: 25px;
//                 max-width: 125px;
//               }

//               .RS_SoftDropdown {
//                 padding: 8px;
//               }
//             }

//             @supports not (
//               (backdrop-filter: blur(13px)) or
//               (-webkit-backdrop-filter: blur(13px))
//             ) {
//               .RS_SoftHeader {
//                 background:
//                   rgba(244, 247, 250, 0.95);
//               }

//               .RS_SoftDropdown {
//                 background:
//                   rgba(247, 249, 252, 0.97);
//               }
//             }

//             @media (prefers-reduced-motion: reduce) {
//               .RS_SoftHeader,
//               .RS_SoftHeader *,
//               .RS_SoftDropdown,
//               .RS_SoftDropdown * {
//                 animation: none !important;
//                 transition-duration: 0.01ms !important;
//               }
//             }
//           `,
//         }}
//       />

//       <div className="RS_SoftHeaderRoot">
//         <nav
//           ref={navbarRef}
//           className="RS_SoftHeader"
//           aria-label="Main navigation"
//         >
//           <Link
//             href="/"
//             className="RS_SoftBrand"
//             aria-label="Adinn Roadshow home"
//             onClick={() => setOpen(false)}
//           >
//             <Image
//               src="/images/assets/Roadshow_AdinnLogo.svg"
//               alt="Adinn Roadshow"
//               width={170}
//               height={46}
//               className="RS_SoftLogo"
//               priority
//             />
//           </Link>

//           <div className="RS_SoftNavigation">
//             {navLinks.map(({ label, href, icon }) => {
//               const active = isActive(href);

//               return (
//                 <Link
//                   key={label}
//                   href={href}
//                   className={`RS_SoftNavLink ${active ? "RS_SoftNavLink--active" : ""
//                     }`}
//                   onClick={() => setOpen(false)}
//                   aria-current={active ? "page" : undefined}
//                 >
//                   <span className="RS_SoftNavIcon">
//                     <Icon name={icon} size={15} />
//                   </span>

//                   <span>{label}</span>
//                 </Link>
//               );
//             })}
//           </div>

//           <div className="RS_SoftRight">
//             <button
//               type="button"
//               className={`RS_SoftMenuButton ${open ? "RS_SoftMenuButton--open" : ""
//                 }`}
//               onClick={() => setOpen((previous) => !previous)}
//               aria-label={open ? "Close menu" : "Open menu"}
//               aria-expanded={open}
//               aria-controls="roadshow-soft-menu"
//             >
//               <span className="RS_SoftHamburger" aria-hidden="true">
//                 <span className="RS_SoftHamburgerLine" />
//                 <span className="RS_SoftHamburgerLine" />
//                 <span className="RS_SoftHamburgerLine" />
//               </span>
//             </button>
//           </div>
//         </nav>
//       </div>

//       <aside
//         ref={dropdownRef}
//         id="roadshow-soft-menu"
//         className={`RS_SoftDropdown ${open ? "RS_SoftDropdown--open" : ""
//           }`}
//         aria-hidden={!open}
//       >
//         <div className="RS_SoftDropContent">
//           <div className="RS_SoftMobileNavigation">
//             {navLinks.map(({ label, href }) => {
//               const active = isActive(href);

//               return (
//                 <Link
//                   key={label}
//                   href={href}
//                   tabIndex={open ? 0 : -1}
//                   className={`RS_SoftMobileNavLink ${active ? "RS_SoftMobileNavLink--active" : ""
//                     }`}
//                   onClick={() => setOpen(false)}
//                   aria-current={active ? "page" : undefined}
//                 >
//                   <span>{label}</span>
//                   <span className="RS_SoftMobileIndicator" />
//                 </Link>
//               );
//             })}

//             <div className="RS_SoftDivider" />
//           </div>

//           <div className="RS_SoftDropHeader">
//             <div>
//               <span className="RS_SoftDropEyebrow">
//                 Roadshow
//               </span>

//               <span className="RS_SoftDropTitle">
//                 Your account
//               </span>
//             </div>

//             <div className="RS_SoftStatus">
//               <span className="RS_SoftStatusDot" />
//               {user ? "Signed in" : "Guest"}
//             </div>
//           </div>

//           <div className="RS_SoftMenuList">
//             {user ? (
//               <>
//                 <div
//                   className="RS_SoftDropRow"
//                   style={{ "--row-index": 0 }}
//                 >
//                   <span className="RS_SoftDropIcon">
//                     <Icon name="user" />
//                   </span>

//                   <span className="RS_SoftDropLabel">
//                     {user.name}
//                   </span>
//                 </div>

//                 <div
//                   className="RS_SoftDropRow"
//                   style={{ "--row-index": 1 }}
//                 >
//                   <span className="RS_SoftDropIcon">
//                     <Icon name="mail" />
//                   </span>

//                   <span className="RS_SoftDropLabel">
//                     {user.email}
//                   </span>
//                 </div>

//                 <div
//                   className="RS_SoftDropRow"
//                   style={{ "--row-index": 2 }}
//                 >
//                   <span className="RS_SoftDropIcon">
//                     <Icon name="phone" />
//                   </span>

//                   <span className="RS_SoftDropLabel">
//                     {user.phone}
//                   </span>
//                 </div>

//                 <div className="RS_SoftDivider" />

//                 <button
//                   type="button"
//                   role="menuitem"
//                   tabIndex={open ? 0 : -1}
//                   className="RS_SoftDropRow"
//                   style={{ "--row-index": 3 }}
//                   onClick={() => handleMenuItemClick("cart")}
//                 >
//                   <span className="RS_SoftDropIcon">
//                     <Icon name="cart" />
//                   </span>

//                   <span className="RS_SoftDropLabel">
//                     My Cart
//                   </span>

//                   <span className="RS_SoftDropArrow">
//                     <ChevronIcon />
//                   </span>
//                 </button>

//                 <button
//                   type="button"
//                   role="menuitem"
//                   tabIndex={open ? 0 : -1}
//                   className="RS_SoftDropRow"
//                   style={{ "--row-index": 4 }}
//                   onClick={() => handleMenuItemClick("orders")}
//                 >
//                   <span className="RS_SoftDropIcon">
//                     <Icon name="history" />
//                   </span>

//                   <span className="RS_SoftDropLabel">
//                     Order History
//                   </span>

//                   <span className="RS_SoftDropArrow">
//                     <ChevronIcon />
//                   </span>
//                 </button>

//                 <button
//                   type="button"
//                   role="menuitem"
//                   tabIndex={open ? 0 : -1}
//                   className="RS_SoftDropRow"
//                   style={{ "--row-index": 5 }}
//                   onClick={() => handleMenuItemClick("signout")}
//                 >
//                   <span className="RS_SoftDropIcon">
//                     <Icon name="user" />
//                   </span>

//                   <span className="RS_SoftDropLabel">
//                     Sign Out
//                   </span>

//                   <span className="RS_SoftDropArrow">
//                     <ChevronIcon />
//                   </span>
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   type="button"
//                   role="menuitem"
//                   tabIndex={open ? 0 : -1}
//                   className="RS_SoftDropRow"
//                   style={{ "--row-index": 0 }}
//                   onClick={() => handleMenuItemClick("signin")}
//                 >
//                   <span className="RS_SoftDropIcon">
//                     <Icon name="user" />
//                   </span>

//                   <span className="RS_SoftDropLabel">
//                     Sign In
//                   </span>

//                   <span className="RS_SoftDropArrow">
//                     <ChevronIcon />
//                   </span>
//                 </button>

//                 <button
//                   type="button"
//                   role="menuitem"
//                   tabIndex={open ? 0 : -1}
//                   className="RS_SoftDropRow"
//                   style={{ "--row-index": 1 }}
//                   onClick={() => handleMenuItemClick("signup")}
//                 >
//                   <span className="RS_SoftDropIcon">
//                     <Icon name="user" />
//                   </span>

//                   <span className="RS_SoftDropLabel">
//                     Sign Up
//                   </span>

//                   <span className="RS_SoftDropArrow">
//                     <ChevronIcon />
//                   </span>
//                 </button>
//               </>
//             )}
//           </div>
//         </div>
//       </aside>
//     </>,
//     document.body,
//   );
// }




/* eslint-disable */
// @ts-nocheck
"use client"; 

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  AnimatePresence,
  motion,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCartCount } from "@/hooks/useCartCount";
import {
  HOME_VEHICLES_SECTION_ID,
  scrollToSection,
} from "./scrollToSection";

/* "Vehicle" is a section link, not a route: it takes the user to the
   "Our Roadshow Vehicles" carousel on the homepage. The dedicated
   /roadshow/vehicles page still exists and still works if opened
   directly — it is simply no longer what the navbar points at. */
const navLinks = [
  { label: "Home", href: "/", icon: "home" },
  {
    label: "Vehicle",
    href: `/#${HOME_VEHICLES_SECTION_ID}`,
    icon: "vehicle",
  },
  { label: "Contact Us", href: "/roadshow/Contact", icon: "contact" },
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

/* Shows the stored phone with a +91 country code, without ever doubling it */
const formatPhoneWithCode = (phone?: string): string => {
  const raw = String(phone ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("+")) return raw;

  const digits = raw.replace(/\D/g, "");
  if (!digits) return raw;

  return digits.length > 10 && digits.startsWith("91")
    ? `+${digits}`
    : `+91 ${digits}`;
};

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openAuth, logoutUser } = useAuth();

  const [open, setOpen] = useState(false);

  // GSAP ScrollSmoother transforms an ancestor of this component, which
  // breaks `position: fixed` (see .RS_SoftHeaderRoot/.RS_SoftDropdown
  // below), so the navbar has to be portaled to document.body to escape
  // it. The mount flag starts false and flips in an effect (not a lazy
  // useState initializer) so server and first-client-render both output
  // nothing, avoiding a hydration mismatch — the navbar pops in right
  // after hydration instead.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navbarRef = useRef<HTMLElement | null>(null);
  const dropdownRef = useRef<HTMLElement | null>(null);

  /* ---------------------------------------------------------------
     SCROLL-REACTIVE HEADER
     The header stays sticky at all times; it only condenses the
     glass pill once the page is scrolled. Purely additive — while
     the flag is false the header renders exactly as before.
  ---------------------------------------------------------------- */
  /* Live cart size for the badge on the menu button */
  const cartCount = useCartCount(user?._id);

  const { scrollY } = useScroll();

  const [condensed, setCondensed] = useState(false);

  /* Hysteresis: condense past 60px, release below 30px. A single
     threshold makes the class flip back and forth while the user
     hovers around it, which reads as a shake. */
  useMotionValueEvent(scrollY, "change", (current) => {
    setCondensed((previous) => {
      if (previous) return current > 30;
      return current > 60;
    });
  });

  /* Which section the address bar is currently pointing at. Read from
     window rather than a router hook because the App Router does not
     re-render on hash-only changes. Safe against hydration mismatch:
     the navbar renders nothing until `mounted` flips. */
  const [activeHash, setActiveHash] = useState("");

  useEffect(() => {
    const syncHash = () => setActiveHash(window.location.hash);

    syncHash();
    window.addEventListener("hashchange", syncHash);

    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const isActive = (href: string) => {
    const [path, hash] = href.split("#");

    /* Section link — lit only when we are on its page AND its section is
       the one in the address bar, so "Home" and "Vehicle" (both on "/")
       never light up together. */
    if (hash) {
      return pathname === (path || "/") && activeHash === `#${hash}`;
    }

    if (href === "/") {
      return pathname === "/" && !activeHash;
    }

    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  /* Section links glide instead of reloading when we are already on the
     target page; from any other page the Link navigates normally and the
     destination scrolls itself on arrival (see HomePageSection1). */
  const handleNavLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    setOpen(false);

    const [path, hash] = href.split("#");

    if (!hash) return;
    if (pathname !== (path || "/")) return;

    event.preventDefault();

    if (scrollToSection(hash)) {
      /* replaceState, not a router push: the page is not changing, and a
         push would put a no-op entry in the back stack. */
      window.history.replaceState(null, "", href);
      setActiveHash(`#${hash}`);
    }
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

  const handleMenuItemClick = (action: string) => {
    setOpen(false);

    if (action === "cart") router.push("/roadshow/CampaignRequest");
    if (action === "orders") router.push("/roadshow/my-bookings");
    if (action === "signout") logoutUser();
    if (action === "signin") openAuth("login");
    if (action === "signup") openAuth("signup");
  };

  if (!mounted) return null;

  return createPortal(
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
              --rs-nav-font: 13px;
              --rs-nav-link-h: 32px;
              --rs-nav-gap: 3px;
              --rs-logo-h: 31px;

              position: fixed;
              top: 12px;
              left: 0;

              width: 100%;

              z-index: 100;
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
                blur(30px)
                saturate(130%);

              backdrop-filter:
                blur(30px)
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
  height: var(--rs-logo-h);

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

              gap: var(--rs-nav-gap);

              width: fit-content;
              height: 40px;

              margin: 0;
              padding: 3px;

              border: none;
              border-radius: 999px;

            
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
              height: var(--rs-nav-link-h);

              padding: 0 12px;

              border: none;
              border-radius: 999px;

              color: rgba(30, 41, 59, 0.59);

              font-family: inherit;
              font-size: var(--rs-nav-font);
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

            /* ------------------------------------------------
               NAV LABEL ROLL
               A masked, single-line window holding two copies
               of the label. On hover the black copy slides
               down out of the mask while the red copy drops in
               from above; leaving the link rolls both back.
            ------------------------------------------------ */

            .RS_SoftNavLabel {
              position: relative;
              display: inline-block;
              overflow: hidden;

              /* line-height:1 on the link makes this exactly one line tall,
                 so a 100% shift lands each copy perfectly in/out of view */
              line-height: 1;
              vertical-align: middle;
            }

            .RS_SoftNavLabelText {
              display: block;

              transition:
                transform 420ms cubic-bezier(0.16, 1, 0.3, 1),
                color 420ms ease;
            }

            .RS_SoftNavLabelText--hover {
              position: absolute;
              left: 0;
              top: 0;

              width: 100%;

              color: #d70000;

              transform: translate3d(0, -100%, 0);
            }

            .RS_SoftNavLink:hover .RS_SoftNavLabelText,
            .RS_SoftNavLink:focus-visible .RS_SoftNavLabelText {
              transform: translate3d(0, 100%, 0);
            }

            .RS_SoftNavLink:hover .RS_SoftNavLabelText--hover,
            .RS_SoftNavLink:focus-visible .RS_SoftNavLabelText--hover {
              transform: translate3d(0, 0, 0);
            }

            @media (prefers-reduced-motion: reduce) {
              .RS_SoftNavLabelText {
                transition: none;
              }
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
                blur(30px)
                saturate(124%);

              backdrop-filter:
                blur(30px)
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
               RESPONSIVE + FIXED/STICKY NAVBAR
            ================================================ */

            /*
              The navbar is portaled to document.body and fixed,
              so it remains visible even when GSAP/Lenis transforms
              the page content.
            */
            .RS_SoftHeaderRoot {
              right: 0;
              font-family: "Outfit", sans-serif;
            }

            .RS_SoftDropdown {
              top: 98px;
              max-width: calc(100vw - 28px);
              max-height: calc(100dvh - 112px);
              overflow-x: hidden;
              overflow-y: auto;
              overscroll-behavior: contain;
              scrollbar-width: thin;
            }

            .RS_SoftNavIcon {
              width: 15px;
              height: 15px;
            }

            .RS_SoftNavIcon svg {
              display: block;
              width: 100%;
              height: 100%;
            }

            .RS_SoftDropLabel {
              min-width: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            /* Extra-large desktop */
            @media (min-width: 1600px) {
              .RS_SoftHeaderRoot {
                --rs-nav-font: 18px;
                --rs-nav-link-h: 44px;
                --rs-nav-gap: 7px;
                --rs-logo-h: 42px;
              }

              .RS_SoftHeader {
                width: min(1160px, calc(100% - 56px));
                height: 90px;
                padding: 0 28px;
                border-radius: 54px;
              }

              .RS_SoftNavigation {
                height: 54px;
                padding: 5px;
              }

              .RS_SoftNavLink {
                min-width: 126px;
                gap: 9px;
                padding: 0 20px;
              }

              .RS_SoftNavIcon {
                width: 20px;
                height: 20px;
              }

              .RS_SoftMenuButton {
                width: 48px;
                height: 48px;
                border-radius: 17px;
              }

              .RS_SoftHamburger,
              .RS_SoftHamburgerLine {
                width: 21px;
              }

              .RS_SoftHamburgerLine:nth-child(2) {
                width: 15px;
                margin-left: 6px;
              }

              .RS_SoftDropdown {
                top: 112px;
                right: max(28px, calc((100vw - 1160px) / 2));
                width: 350px;
              }
            }

            /* Large desktop */
            @media (min-width: 1440px) and (max-width: 1599px) {
              .RS_SoftHeaderRoot {
                --rs-nav-font: 17px;
                --rs-nav-link-h: 42px;
                --rs-nav-gap: 6px;
                --rs-logo-h: 39px;
              }

              .RS_SoftHeader {
                width: min(1080px, calc(100% - 44px));
                height: 86px;
                padding: 0 24px;
                border-radius: 50px;
              }

              .RS_SoftNavigation {
                height: 52px;
                padding: 5px;
              }

              .RS_SoftNavLink {
                min-width: 116px;
                gap: 8px;
                padding: 0 18px;
              }

              .RS_SoftNavIcon {
                width: 18px;
                height: 18px;
              }

              .RS_SoftMenuButton {
                width: 46px;
                height: 46px;
                border-radius: 16px;
              }

              .RS_SoftDropdown {
                top: 106px;
                right: max(22px, calc((100vw - 1080px) / 2));
                width: 340px;
              }
            }

            /* Standard desktop and laptop */
            @media (min-width: 1200px) and (max-width: 1439px) {
              .RS_SoftHeaderRoot {
                --rs-nav-font: 15.5px;
                --rs-nav-link-h: 38px;
                --rs-nav-gap: 5px;
                --rs-logo-h: 36px;
              }

              .RS_SoftHeader {
                width: min(960px, calc(100% - 34px));
                height: 80px;
                padding: 0 21px;
                border-radius: 46px;
              }

              .RS_SoftNavigation {
                height: 48px;
                padding: 5px;
              }

              .RS_SoftNavLink {
                min-width: 106px;
                gap: 7px;
                padding: 0 16px;
              }

              .RS_SoftNavIcon {
                width: 17px;
                height: 17px;
              }

              .RS_SoftMenuButton {
                width: 43px;
                height: 43px;
                border-radius: 15px;
              }

              .RS_SoftDropdown {
                top: 100px;
                right: max(17px, calc((100vw - 960px) / 2));
                width: 325px;
              }
            }

            /* Small laptop */
            @media (min-width: 1024px) and (max-width: 1199px) {
              .RS_SoftHeaderRoot {
                top: 10px;
                --rs-nav-font: 12px;
                --rs-nav-link-h: 31px;
                --rs-nav-gap: 2px;
                --rs-logo-h: 29px;
              }

              .RS_SoftHeader {
                width: min(760px, calc(100% - 24px));
                height: 70px;
                padding: 0 15px;
                border-radius: 38px;
              }

              .RS_SoftNavigation {
                height: 38px;
              }

              .RS_SoftNavLink {
                min-width: 80px;
                gap: 5px;
                padding: 0 9px;
              }

              .RS_SoftNavIcon {
                width: 14px;
                height: 14px;
              }

              .RS_SoftMenuButton {
                width: 38px;
                height: 38px;
                border-radius: 13px;
              }

              .RS_SoftDropdown {
                top: 88px;
                right: max(12px, calc((100vw - 760px) / 2));
                width: 300px;
                max-height: calc(100dvh - 100px);
              }
            }

            /* Large tablet: retain centre links but compact them */
            @media (min-width: 901px) and (max-width: 1023px) {
              .RS_SoftHeaderRoot {
                top: 10px;
                --rs-nav-font: 11.5px;
                --rs-nav-link-h: 29px;
                --rs-nav-gap: 1px;
                --rs-logo-h: 27px;
              }

              .RS_SoftHeader {
                width: min(720px, calc(100% - 22px));
                height: 66px;
                padding: 0 13px;
                border-radius: 34px;
              }

              .RS_SoftNavigation {
                height: 37px;
                padding: 4px 3px;
              }

              .RS_SoftNavLink {
                min-width: 72px;
                gap: 4px;
                padding: 0 7px;
              }

              .RS_SoftNavIcon {
                width: 13px;
                height: 13px;
              }

              .RS_SoftMenuButton {
                width: 36px;
                height: 36px;
                border-radius: 12px;
              }

              .RS_SoftDropdown {
                top: 84px;
                right: max(11px, calc((100vw - 720px) / 2));
                width: 290px;
                max-height: calc(100dvh - 96px);
              }
            }

            /* Tablet: centre navigation moves into dropdown */
            @media (max-width: 900px) {
              .RS_SoftHeaderRoot {
                top: 10px;
                --rs-logo-h: 29px;
              }

              .RS_SoftHeader {
                width: min(680px, calc(100% - 20px));
                height: 64px;
                padding: 0 12px 0 17px;
                border-radius: 30px;
              }

              .RS_SoftNavigation {
                display: none;
              }

              .RS_SoftMobileNavigation {
                display: flex;
              }

              .RS_SoftMenuButton {
                width: 40px;
                height: 40px;
                border-radius: 14px;
              }

              .RS_SoftDropdown {
                top: 84px;
                right: max(10px, calc((100vw - 680px) / 2));
                width: min(330px, calc(100vw - 20px));
                max-height: calc(100dvh - 96px);
              }

              .RS_SoftMobileNavLink {
                min-height: 46px;
                padding: 0 14px;
                font-size: 14px;
              }

              .RS_SoftDropRow {
                min-height: 47px;
                font-size: 13px;
              }
            }

            /* Mobile */
            @media (max-width: 767px) {
              .RS_SoftHeaderRoot {
                top: 8px;
                --rs-logo-h: 27px;
              }

              .RS_SoftHeader {
                width: calc(100% - 16px);
                height: 56px;
                padding: 0 9px 0 15px;
                border-radius: 19px;

                -webkit-backdrop-filter:
                  blur(24px)
                  saturate(120%);

                backdrop-filter:
                  blur(24px)
                  saturate(120%);
              }

              .RS_SoftLogo {
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
                max-width: none;
                max-height: calc(100dvh - 82px);
                padding: 10px;

                border-radius: 20px;

                -webkit-backdrop-filter:
                  blur(24px)
                  saturate(118%);

                backdrop-filter:
                  blur(24px)
                  saturate(118%);
              }

              .RS_SoftDropContent {
                padding: 5px 3px 3px;
              }

              .RS_SoftDropHeader {
                gap: 12px;
                padding: 7px 9px 11px;
              }

              .RS_SoftDropTitle {
                font-size: 16px;
              }

              .RS_SoftStatus {
                flex-shrink: 0;
                padding: 5px 8px;
                font-size: 9px;
              }

              .RS_SoftMobileNavLink {
                min-height: 44px;
                padding: 0 12px;
                font-size: 13px;
              }

              .RS_SoftDropRow {
                min-height: 46px;
                padding: 5px 7px;
                font-size: 13px;
              }

              .RS_SoftDropIcon {
                width: 32px;
                height: 32px;
                margin-right: 9px;
                border-radius: 10px;
              }

              .RS_SoftDropIcon svg {
                width: 18px;
                height: 18px;
              }
            }

            /* Small mobile */
            @media (max-width: 480px) {
              .RS_SoftHeaderRoot {
                top: 6px;
                --rs-logo-h: 24px;
              }

              .RS_SoftHeader {
                width: calc(100% - 12px);
                height: 52px;
                padding: 0 7px 0 12px;
                border-radius: 17px;
              }

              .RS_SoftLogo {
                max-width: 124px;
              }

              .RS_SoftMenuButton {
                width: 35px;
                height: 35px;
                border-radius: 11px;
              }

              .RS_SoftHamburger {
                width: 17px;
                height: 15px;
                gap: 3.5px;
              }

              .RS_SoftHamburgerLine {
                width: 17px;
              }

              .RS_SoftHamburgerLine:nth-child(2) {
                width: 12px;
              }

              .RS_SoftDropdown {
                top: 66px;
                right: 6px;
                left: 6px;
                max-height: calc(100dvh - 74px);
                padding: 8px;
                border-radius: 18px;
              }

              .RS_SoftMobileNavLink {
                min-height: 42px;
                padding: 0 11px;
                font-size: 12.5px;
              }

              .RS_SoftDropHeader {
                padding-right: 7px;
                padding-left: 7px;
              }

              .RS_SoftDropRow {
                min-height: 44px;
                padding: 4px 6px;
                font-size: 12.5px;
              }

              .RS_SoftDropIcon {
                width: 30px;
                height: 30px;
                margin-right: 8px;
              }
            }

            /* Extra-small mobile */
            @media (max-width: 360px) {
              .RS_SoftHeaderRoot {
                --rs-logo-h: 22px;
              }

              .RS_SoftHeader {
                width: calc(100% - 10px);
                height: 50px;
                padding: 0 6px 0 10px;
              }

              .RS_SoftLogo {
                max-width: 112px;
              }

              .RS_SoftMenuButton {
                width: 33px;
                height: 33px;
              }

              .RS_SoftDropdown {
                top: 62px;
                right: 5px;
                left: 5px;
                max-height: calc(100dvh - 68px);
                padding: 7px;
              }

              .RS_SoftDropTitle {
                font-size: 15px;
              }

              .RS_SoftStatus {
                gap: 5px;
                padding: 5px 7px;
                font-size: 8.5px;
              }

              .RS_SoftMobileNavLink,
              .RS_SoftDropRow {
                font-size: 12px;
              }
            }

            /* Short-height devices and landscape phones */
            @media (max-height: 560px) and (max-width: 900px) {
              .RS_SoftDropdown {
                max-height: calc(100dvh - 72px);
              }

              .RS_SoftMobileNavLink {
                min-height: 38px;
              }

              .RS_SoftDropRow {
                min-height: 40px;
              }

              .RS_SoftDropHeader {
                padding-top: 4px;
                padding-bottom: 7px;
              }

              .RS_SoftDivider {
                margin-top: 4px;
                margin-bottom: 4px;
              }
            }

            @supports not (
              (backdrop-filter: blur(33px)) or
              (-webkit-backdrop-filter: blur(33px))
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

            /* ================================================
               SCROLL-REACTIVE HEADER  (additive)
            ================================================ */

            // @keyframes RS_SoftHeaderDrop {
            //   from {
            //     transform: translate3d(0, -140%, 0);
            //     opacity: 0;
            //   }
            //   to {
            //     transform: translate3d(0, 0, 0);
            //     opacity: 1;
            //   }
            // }

            /* The entrance animation lives on the root so the pill's own
               transform stays free for the scroll condense below. */
            .RS_SoftHeaderRoot {
              animation: RS_SoftHeaderDrop 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
            }

            /* The pill narrows visually through clip-path rather than width.

               Animating the real width would resize the backdrop-filter
               region, forcing the browser to recompute a 13px blur of
               everything behind the pill on every frame — that is what was
               showing up as shaking. clip-path leaves the box, and so the
               filter region, completely untouched; it only masks what gets
               painted. No layout, no re-blur.

               clip-path also clips box-shadow, so the pill's outer shadow
               moves to .RS_SoftHeaderRoot::after below. The inset highlight
               stays here, since it paints inside the box and is correctly
               trimmed to the narrower silhouette. */
            /* One registered custom property drives every part of the
               condense. Transitioning clip-path, transform and width
               separately makes them drift apart: transform is cheap while
               clip-path has to repaint a backdrop-filter layer, so the logo
               and menu button arrive well before the pill narrows.

               Animating --rs-cut instead means all four consumers below
               recompute from the same value in the same style pass, so they
               are synchronised by construction rather than by matching
               durations. @property is what makes it interpolate as a
               length; without registration a custom property would jump. */
            @property --rs-cut {
              syntax: "<length>";
              inherits: true;
              initial-value: 0px;
            }

            .RS_SoftHeaderRoot {
              --rs-cut: 0px;

              transition: --rs-cut 1.8s cubic-bezier(0.22, 1, 0.36, 1);
            }

            .RS_SoftHeaderRoot--scrolled {
              --rs-cut: var(--rs-pill-cut);
            }

            .RS_SoftHeader {
              clip-path: inset(
                0px var(--rs-cut) 0px var(--rs-cut) round 50px
              );
              
            }

            /* The pill's width is set literally at seven breakpoints, so it
               is mirrored here once as a variable the shadow layer can
               follow. These values match .RS_SoftHeader exactly. */
            .RS_SoftHeaderRoot {
              --rs-pill-w: min(820px, calc(100% - 28px));
              --rs-pill-cut: 100px;
            }

            @media (min-width: 1600px) {
              .RS_SoftHeaderRoot {
                --rs-pill-w: min(1160px, calc(100% - 56px));
                --rs-pill-cut: 150px;
              }
            }

            @media (min-width: 1440px) and (max-width: 1599px) {
              .RS_SoftHeaderRoot {
                --rs-pill-w: min(1080px, calc(100% - 44px));
                --rs-pill-cut: 140px;
              }
            }

            @media (min-width: 1200px) and (max-width: 1439px) {
              .RS_SoftHeaderRoot {
                --rs-pill-w: min(960px, calc(100% - 34px));
                --rs-pill-cut: 120px;
              }
            }

            @media (min-width: 1024px) and (max-width: 1199px) {
              .RS_SoftHeaderRoot {
                --rs-pill-w: min(760px, calc(100% - 24px));
                --rs-pill-cut: 80px;
              }
            }

            @media (min-width: 901px) and (max-width: 1023px) {
              .RS_SoftHeaderRoot {
                --rs-pill-w: min(720px, calc(100% - 22px));
                --rs-pill-cut: 70px;
              }
            }

            /* Shadow-only layer sitting behind the pill, carrying the drop
               shadow that clip-path would otherwise cut away. It has no
               backdrop-filter, so resizing it is cheap and cannot shimmer.
               Its width is derived from --rs-cut too, so the shadow hugs
               the clipped silhouette on every frame. height:100% tracks the
               pill automatically, because the root's height is exactly the
               pill's height at every breakpoint. */
            .RS_SoftHeaderRoot::after {
              content: "";

              position: absolute;
              top: 0;
              left: 50%;

              width: calc(var(--rs-pill-w) - var(--rs-cut) * 2);
              height: 100%;

              border-radius: 50px;

              box-shadow:
                0 14px 28px rgba(15, 23, 42, 0.08),
                0 4px 10px rgba(15, 23, 42, 0.04);

              transform: translateX(-50%);
              -webkit-transform: translateX(-50%);

              transition: box-shadow 0.8s ease;

              pointer-events: none;
              z-index: -1;
            }

            /* Keeps the logo, centre nav and menu button on one optical
               centre line regardless of their differing box heights.

               Each also gets its own compositor layer (translateZ +
               will-change + hidden backface). While the pill's width
               animates, their offsets are recomputed by layout every frame
               and would otherwise be re-rounded to whole pixels
               independently of the pill's own offset — a ±1px wobble that
               reads as shaking. On their own layers the browser
               interpolates them on the GPU and the wobble disappears. */
            /* Both read --rs-cut directly instead of carrying their own
               transition, so they track the pill's clipped edge frame for
               frame rather than racing it. */
            .RS_SoftHeader > .RS_SoftBrand {
              align-self: center;

              transform: translateX(var(--rs-cut));
              -webkit-transform: translateX(var(--rs-cut));
            }

            .RS_SoftHeader > .RS_SoftRight {
              align-self: center;

              transform: translateX(calc(var(--rs-cut) * -1));
              -webkit-transform: translateX(calc(var(--rs-cut) * -1));
            }

            .RS_SoftBrand {
              height: auto;
            }

            /* Centre navigation pinned to the exact middle of the pill.
               The pill's box never resizes now, so this anchor is static
               and needs no layer promotion of its own. */
            .RS_SoftHeader > .RS_SoftNavigation {
              top: 50%;
              left: 50%;
              right: auto;
              bottom: auto;

              margin: 0;

              transform: translate(-50%, -50%);
              -webkit-transform: translate(-50%, -50%);
            }

            /* Condensed: the logo slides right and the menu button slides
               left, closing in on Home / Vehicle / Contact Us. Both are
               pure GPU transforms on their own layers — no layout, no
               repaint, and the glass behind them is never resampled.

               The two distances differ because the logo is far wider than
               the menu button, so equal travel would leave visibly unequal
               gaps around the centre nav. */
            /* Condensed: --rs-pill-cut is clipped off each side. The logo
               and menu button travel exactly that same distance, so they
               keep their original inset from the pill's visible edge and
               nothing appears to drift or re-space. */
            .RS_SoftHeaderRoot--scrolled::after {
              box-shadow:
                0 18px 40px rgba(15, 23, 42, 0.14),
                0 6px 14px rgba(15, 23, 42, 0.07);
            }

            /* Below 900px the centre nav is hidden and the pill is already
               tight, so nothing condenses. */
            @media (max-width: 900px) {
              .RS_SoftHeaderRoot {
                --rs-pill-cut: 0px;
              }
            }

            /* ================================================
               CART COUNT BADGE
            ================================================ */

            .RS_SoftMenuButton {
              position: relative;
            }

            .RS_SoftCartBadge {
              position: absolute;
              top: 1px;
              right: 1px;

              display: inline-flex;
              align-items: center;
              justify-content: center;

              min-width: 17px;
              height: 17px;

              padding: 0 4px;

              border-radius: 999px;

              font-size: 10px;
              font-weight: 700;
              line-height: 1;
              letter-spacing: 0.2px;

              color: #ffffff;
              background: linear-gradient(140deg, #ff3b30, #d70000);

              box-shadow:
                0 2px 6px rgba(215, 0, 0, 0.42),
                0 0 0 2px rgba(255, 255, 255, 0.9);

              pointer-events: none;
            }

            .RS_SoftDropCount {
              display: inline-flex;
              align-items: center;
              justify-content: center;

              min-width: 20px;
              height: 20px;

              margin-left: auto;
              padding: 0 6px;

              border-radius: 999px;

              font-size: 11px;
              font-weight: 700;
              line-height: 1;

              color: #ffffff;
              background: linear-gradient(140deg, #ff3b30, #d70000);
            }

            /* Visually hidden, still announced by screen readers */
            .RS_SoftSrOnly {
              position: absolute;
              width: 1px;
              height: 1px;
              padding: 0;
              margin: -1px;
              overflow: hidden;
              clip-path: inset(50%);
              white-space: nowrap;
              border: 0;
            }

            @media (prefers-reduced-motion: reduce) {
              .RS_SoftHeaderRoot,
              .RS_SoftHeader {
                transition: none;
                animation: none;
              }
            }
          `,
        }}
      />

      <div
        className={`RS_SoftHeaderRoot ${condensed ? "RS_SoftHeaderRoot--scrolled" : ""
          }`}
      >
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
                  onClick={(event) => handleNavLinkClick(event, href)}
                  aria-current={active ? "page" : undefined}
                >
                  <span className="RS_SoftNavIcon">
                    <Icon name={icon} size={15} />
                  </span>

                  {/* Two stacked copies of the label — the black one rolls
                      down out of view on hover while the red one rolls in
                      behind it, then both roll back. The duplicate is
                      hidden from screen readers so the name is read once. */}
                  <span className="RS_SoftNavLabel">
                    <span className="RS_SoftNavLabelText">
                      {label}
                    </span>

                    <span
                      className="RS_SoftNavLabelText RS_SoftNavLabelText--hover"
                      aria-hidden="true"
                    >
                      {label}
                    </span>
                  </span>
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

              <AnimatePresence initial={false}>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    className="RS_SoftCartBadge"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 520,
                      damping: 18,
                    }}
                  >
                    {cartCount > 9 ? "9+" : cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            <span className="RS_SoftSrOnly" aria-live="polite">
              {cartCount === 1
                ? "1 vehicle in your cart"
                : `${cartCount} vehicles in your cart`}
            </span>
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
                  onClick={(event) => handleNavLinkClick(event, href)}
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
              {user ? "Signed in" : "Guest"}
            </div>
          </div>

          <div className="RS_SoftMenuList">
            {user ? (
              <>
                <div
                  className="RS_SoftDropRow"
                  style={{ "--row-index": 0 }}
                >
                  <span className="RS_SoftDropIcon">
                    <Icon name="user" />
                  </span>

                  <span className="RS_SoftDropLabel">
                    {user.name}
                  </span>
                </div>

                <div
                  className="RS_SoftDropRow"
                  style={{ "--row-index": 1 }}
                >
                  <span className="RS_SoftDropIcon">
                    <Icon name="mail" />
                  </span>

                  <span className="RS_SoftDropLabel">
                    {user.email}
                  </span>
                </div>

                <div
                  className="RS_SoftDropRow"
                  style={{ "--row-index": 2 }}
                >
                  <span className="RS_SoftDropIcon">
                    <Icon name="phone" />
                  </span>

                  <span className="RS_SoftDropLabel">
                    {formatPhoneWithCode(user.phone)}
                  </span>
                </div>

                <div className="RS_SoftDivider" />

                <button
                  type="button"
                  role="menuitem"
                  tabIndex={open ? 0 : -1}
                  className="RS_SoftDropRow"
                  style={{ "--row-index": 3 }}
                  onClick={() => handleMenuItemClick("cart")}
                >
                  <span className="RS_SoftDropIcon">
                    <Icon name="cart" />
                  </span>

                  <span className="RS_SoftDropLabel">
                    My Cart
                  </span>

                  {cartCount > 0 && (
                    <motion.span
                      key={cartCount}
                      className="RS_SoftDropCount"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 520,
                        damping: 18,
                      }}
                    >
                      {cartCount}
                    </motion.span>
                  )}

                  <span className="RS_SoftDropArrow">
                    <ChevronIcon />
                  </span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  tabIndex={open ? 0 : -1}
                  className="RS_SoftDropRow"
                  style={{ "--row-index": 4 }}
                  onClick={() => handleMenuItemClick("orders")}
                >
                  <span className="RS_SoftDropIcon">
                    <Icon name="history" />
                  </span>

                  <span className="RS_SoftDropLabel">
                    Order History
                  </span>

                  <span className="RS_SoftDropArrow">
                    <ChevronIcon />
                  </span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  tabIndex={open ? 0 : -1}
                  className="RS_SoftDropRow"
                  style={{ "--row-index": 5 }}
                  onClick={() => handleMenuItemClick("signout")}
                >
                  <span className="RS_SoftDropIcon">
                    <Icon name="user" />
                  </span>

                  <span className="RS_SoftDropLabel">
                    Sign Out
                  </span>

                  <span className="RS_SoftDropArrow">
                    <ChevronIcon />
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  role="menuitem"
                  tabIndex={open ? 0 : -1}
                  className="RS_SoftDropRow"
                  style={{ "--row-index": 0 }}
                  onClick={() => handleMenuItemClick("signin")}
                >
                  <span className="RS_SoftDropIcon">
                    <Icon name="user" />
                  </span>

                  <span className="RS_SoftDropLabel">
                    Sign In
                  </span>

                  <span className="RS_SoftDropArrow">
                    <ChevronIcon />
                  </span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  tabIndex={open ? 0 : -1}
                  className="RS_SoftDropRow"
                  style={{ "--row-index": 1 }}
                  onClick={() => handleMenuItemClick("signup")}
                >
                  <span className="RS_SoftDropIcon">
                    <Icon name="user" />
                  </span>

                  <span className="RS_SoftDropLabel">
                    Sign Up
                  </span>

                  <span className="RS_SoftDropArrow">
                    <ChevronIcon />
                  </span>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>
    </>,
    document.body,
  );
}
