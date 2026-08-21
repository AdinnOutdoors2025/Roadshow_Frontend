"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { useCartCount } from "@/hooks/useCartCount";
import {
  HOME_VEHICLES_SECTION_ID,
  scrollToSection,
} from "./scrollToSection";

type NavLinkItem = {
  label: string;
  href: string;
};

/*
 * Keep the IDs below equal to the IDs used by your homepage sections.
 * Example: <section id="why-adinn">...</section>
 */
const navLinks: NavLinkItem[] = [
  { label: "Home", href: "/" },
  { label: "Why Adinn", href: "/#why-adinn" },
  {
    label: "Vehicle",
    href: `/#${HOME_VEHICLES_SECTION_ID}`,
  },
  {
    label: "Contact Us",
    href: "/roadshow/Contact",
  },
];

type MenuGlyphName =
  | "user"
  | "mail"
  | "phone"
  | "cart"
  | "history"
  | "signin"
  | "signup"
  | "signout";

function MenuGlyph({ name }: { name: MenuGlyphName }) {
  const commonProps = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "mail") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m4.5 7 7.5 5.6L19.5 7" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg {...commonProps}>
        <path d="M7.2 3H4.8A1.8 1.8 0 0 0 3 4.8C3 13.75 10.25 21 19.2 21a1.8 1.8 0 0 0 1.8-1.8v-2.4l-4.25-1.25-1.15 2.3a14.2 14.2 0 0 1-9.45-9.45l2.3-1.15L7.2 3Z" />
      </svg>
    );
  }

  if (name === "cart") {
    return (
      <svg {...commonProps}>
        <circle cx="9" cy="20" r="1" />
        <circle cx="19" cy="20" r="1" />
        <path d="M3 4h2l2.3 10a2 2 0 0 0 2 1.55h8.8a2 2 0 0 0 1.95-1.55L22 7H6" />
      </svg>
    );
  }

  if (name === "history") {
    return (
      <svg {...commonProps}>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5M12 7v5l3 2" />
      </svg>
    );
  }

  if (name === "signup") {
    return (
      <svg {...commonProps}>
        <circle cx="9" cy="8" r="4" />
        <path d="M2.5 21a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6" />
      </svg>
    );
  }

  if (name === "signin" || name === "signout") {
    return (
      <svg {...commonProps}>
        <path d="M14 8l4 4-4 4M18 12H7" />
        <path d="M10 5V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-1" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <circle cx="12" cy="7" r="4" />
      <path d="M4.5 21a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
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

function MenuIcon({ close = false }: { close?: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      {close ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, openAuth, logoutUser } = useAuth();

  const accountUser = user as
    | {
        _id?: string;
        name?: string;
        email?: string;
        phone?: string;
      }
    | null
    | undefined;

  const cartCount = useCartCount(accountUser?._id);

  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");

  const navbarRef = useRef<HTMLElement | null>(null);
  const dropdownRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const syncHash = () => setActiveHash(window.location.hash);

    syncHash();
    window.addEventListener("hashchange", syncHash);

    return () => window.removeEventListener("hashchange", syncHash);
  }, [mounted, pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedHeader = navbarRef.current?.contains(target);
      const clickedDropdown = dropdownRef.current?.contains(target);

      if (!clickedHeader && !clickedDropdown) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  const isActive = (href: string) => {
    const [path, hash] = href.split("#");

    if (hash) {
      return pathname === (path || "/") && activeHash === `#${hash}`;
    }

    if (href === "/") {
      return pathname === "/" && !activeHash;
    }

    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const handleNavLinkClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    setOpen(false);

    if (href === "/" && pathname === "/") {
      event.preventDefault();
      window.history.replaceState(null, "", "/");
      setActiveHash("");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const [path, hash] = href.split("#");

    if (!hash || pathname !== (path || "/")) return;

    event.preventDefault();

    if (scrollToSection(hash)) {
      window.history.replaceState(null, "", href);
      setActiveHash(`#${hash}`);
    }
  };

  const handleMenuItemClick = (
    action: "cart" | "orders" | "signin" | "signup" | "signout",
  ) => {
    setOpen(false);

    if (action === "cart") router.push("/roadshow/CampaignRequest");
    if (action === "orders") router.push("/roadshow/my-bookings");
    if (action === "signin") openAuth("login");
    if (action === "signup") openAuth("signup");
    if (action === "signout") logoutUser();
  };

  if (!mounted) return null;

  return createPortal(
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .RS_RefHeader,
            .RS_RefHeader *,
            .RS_RefMenu,
            .RS_RefMenu * {
              box-sizing: border-box;
            }

            .RS_RefHeader {
              position: fixed;
              top: 0;
              left: 0;
              z-index: 9999;
              width: 100%;
              height: 90px;
              background: #ffffff;
              border: 0;
              box-shadow: none;
              background: rgba(255, 255, 255, 0.78);
backdrop-filter: blur(10px);
-webkit-backdrop-filter: blur(10px);
            }

            .RS_RefHeaderShell {
              position: relative;
              width: 100%;
              max-width: 1920px;
              height: 100%;
              margin: 0 auto;
              padding: 0 100px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }

            .RS_RefBrand {
              display: inline-flex;
              align-items: center;
              flex: 0 0 auto;
              text-decoration: none;
            }

            .RS_RefLogo {
              display: block;
              width: 125px;
              height: 47px;
              object-fit: contain;
              user-select: none;
            }

            .RS_RefDesktopNav {
              position: absolute;
              top: 0;
              left: 50%;
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 64px;
              transform: translateX(-50%);
            }

            .RS_RefNavLink {
              position: relative;
              min-width: 0;
              height: auto;
              padding: 0;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #000000;
              font-family: "Outfit", sans-serif;
              font-size: 30px;
              font-weight: 300;
              line-height: normal;
              letter-spacing: 0;
              text-decoration: none;
              white-space: nowrap;
              transition: opacity 180ms ease;
            }

            .RS_RefNavLink:hover {
              opacity: 0.58;
            }

            .RS_RefNavLink--active,
            .RS_RefNavLink--active:hover {
              color: #000000;
              opacity: 1;
              font-weight: 300;
            }

            .RS_RefRight {
              display: flex;
              align-items: center;
              gap: 8px;
            }

            .RS_RefContactButton {
              min-height: 42px;
              padding: 0 20px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              background: #171717;
              border: 1px solid #171717;
              border-radius: 999px;
              font-family: inherit;
              font-size: 14px;
              font-weight: 650;
              line-height: 1;
              text-decoration: none;
              white-space: nowrap;
              box-shadow: 0 5px 14px rgba(17, 24, 39, 0.12);
              transition: background-color 180ms ease, border-color 180ms ease,
                box-shadow 180ms ease, transform 180ms ease;
            }

            .RS_RefContactButton:hover,
            .RS_RefContactButton--active {
              background: #ed1c2e;
              border-color: #ed1c2e;
              box-shadow: 0 7px 18px rgba(237, 28, 46, 0.2);
              transform: translateY(-1px);
            }

            .RS_RefCircleButton {
              width: 48px;
              height: 48px;
              padding: 0;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #282828;
              background: #f5f5f5;
              border: 0;
              border-radius: 999px;
              cursor: pointer;
              transition: background-color 180ms ease, box-shadow 180ms ease,
                transform 180ms ease;
            }

            .RS_RefCircleButton:hover {
              background: #ededed;
              transform: translateY(-1px);
            }

            .RS_RefCircleButton:focus-visible,
            .RS_RefContactButton:focus-visible,
            .RS_RefMenuRowButton:focus-visible,
            .RS_RefNavLink:focus-visible,
            .RS_RefMobileLink:focus-visible {
              outline: 3px solid rgba(237, 28, 46, 0.22);
              outline-offset: 2px;
            }

            .RS_RefCircleButton--menuOpen {
              background: #eaeaea;
              box-shadow: 0 3px 12px rgba(17, 24, 39, 0.1);
            }

            .RS_RefMenu {
              position: fixed;
              top: 108px;
              right: 100px;
              z-index: 10000;
              width: 326px;
              padding: 8px;
              overflow: hidden;
              color: #222222;
              background: #ffffff;
              border: 1px solid #e5e5e5;
              border-radius: 20px;
              box-shadow: 0 20px 55px rgba(15, 23, 42, 0.18);
              animation: RS_RefMenuEnter 180ms cubic-bezier(0.16, 1, 0.3, 1)
                both;
            }

            @keyframes RS_RefMenuEnter {
              from {
                opacity: 0;
                transform: translateY(-8px) scale(0.98);
              }
              to {
                opacity: 1;
                transform: translateY(0) scale(1);
              }
            }

            .RS_RefMobileNav {
              display: none;
              padding-bottom: 8px;
              border-bottom: 1px solid #eeeeee;
            }

            .RS_RefMobileLink {
              width: 100%;
              min-height: 44px;
              padding: 0 14px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              gap: 12px;
              color: #555555;
              border-radius: 12px;
              font-family: inherit;
              font-size: 14px;
              font-weight: 500;
              text-decoration: none;
              transition: color 180ms ease, background-color 180ms ease;
            }

            .RS_RefMobileLink:hover {
              color: #202020;
              background: #f6f6f6;
            }

            .RS_RefMobileLink--active {
              color: #202020;
              font-weight: 650;
            }

            .RS_RefMobileDot {
              width: 7px;
              height: 7px;
              flex: 0 0 auto;
              background: #ed1c2e;
              border-radius: 999px;
            }

            .RS_RefMenuList {
              display: flex;
              flex-direction: column;
            }

            .RS_RefMenuRow {
              width: 100%;
              min-height: 50px;
              padding: 10px 12px;
              display: grid;
              grid-template-columns: 28px minmax(0, 1fr) auto;
              align-items: center;
              gap: 10px;
              color: #333333;
              background: transparent;
              border: 0;
              border-radius: 12px;
              font-family: inherit;
              font-size: 14px;
              line-height: 1.3;
              text-align: left;
            }

            .RS_RefMenuRowButton {
              cursor: pointer;
              transition: color 160ms ease, background-color 160ms ease;
            }

            .RS_RefMenuRowButton:hover {
              color: #171717;
              background: #f5f5f5;
            }

            .RS_RefMenuRow--strong {
              color: #171717;
              font-weight: 650;
            }

            .RS_RefMenuRow--danger:hover {
              color: #d91426;
              background: rgba(237, 28, 46, 0.06);
            }

            .RS_RefMenuIcon {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #555555;
            }

            .RS_RefMenuLabel {
              min-width: 0;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .RS_RefMenuArrow {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #999999;
              transition: transform 160ms ease;
            }

            .RS_RefMenuRowButton:hover .RS_RefMenuArrow {
              transform: translateX(2px);
            }

            .RS_RefMenuCount {
              min-width: 23px;
              height: 23px;
              padding: 0 7px;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              color: #ffffff;
              background: #ed1c2e;
              border-radius: 999px;
              font-size: 11px;
              font-weight: 700;
            }

            .RS_RefMenuDivider {
              height: 1px;
              margin: 4px 12px;
              background: #e8e8e8;
            }

            @media (max-width: 1180px) {
              .RS_RefHeaderShell {
                padding: 0 48px;
              }

              .RS_RefDesktopNav {
                gap: 36px;
              }

              .RS_RefNavLink {
                font-size: 28px;
              }

              .RS_RefMenu {
                right: 48px;
              }
            }

            @media (max-width: 940px) {
              .RS_RefHeader {
                height: 96px;
              }

              .RS_RefHeaderShell {
                padding: 0 28px;
              }

              .RS_RefLogo {
                width: 100px;
                height: 38px;
              }

              .RS_RefDesktopNav {
                display: none;
              }

              .RS_RefMobileNav {
                display: block;
              }

              .RS_RefMenu {
                top: 82px;
                right: 28px;
              }
            }

            @media (max-width: 520px) {
              .RS_RefHeader {
                height: 82px;
              }

              .RS_RefHeaderShell {
                padding: 0 14px;
              }

              .RS_RefLogo {
                width: 90px;
                height: 34px;
              }

              .RS_RefRight {
                gap: 6px;
              }

              .RS_RefCircleButton {
                width: 40px;
                height: 40px;
              }

              .RS_RefContactButton {
                min-height: 39px;
                padding: 0 14px;
                font-size: 12px;
              }

              .RS_RefMenu {
                top: 72px;
                right: 12px;
                width: calc(100vw - 24px);
                max-height: calc(100vh - 74px);
                overflow-y: auto;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              .RS_RefHeader *,
              .RS_RefMenu * {
                scroll-behavior: auto !important;
                transition-duration: 0.01ms !important;
                animation-duration: 0.01ms !important;
              }
            }
          `,
        }}
      />

      <header ref={navbarRef} className="RS_RefHeader">
        <div className="RS_RefHeaderShell">
          <Link
            href="/"
            onClick={(event) => handleNavLinkClick(event, "/")}
            className="RS_RefBrand"
            aria-label="Adinn Roadshow home"
          >
            <Image
              src="/images/assets/Roadshow_AdinnLogo.svg"
              alt="Adinn Roadshow"
              width={170}
              height={46}
              priority
              className="RS_RefLogo"
            />
          </Link>

          <nav className="RS_RefDesktopNav" aria-label="Main navigation">
            {navLinks
              .filter((item) => item.label !== "Contact Us")
              .map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(event) => handleNavLinkClick(event, item.href)}
                    className={`RS_RefNavLink ${
                      active ? "RS_RefNavLink--active" : ""
                    }`}
                    aria-current={active ? "page" : undefined}
                  >
                    {item.label}
                  </Link>
                );
              })}
          </nav>

          <div className="RS_RefRight">
            <Link
              href="/roadshow/Contact"
              onClick={(event) =>
                handleNavLinkClick(event, "/roadshow/Contact")
              }
              className={`RS_RefContactButton ${
                isActive("/roadshow/Contact")
                  ? "RS_RefContactButton--active"
                  : ""
              }`}
              aria-current={
                isActive("/roadshow/Contact") ? "page" : undefined
              }
            >
              Contact Us
            </Link>

            <button
              type="button"
              onClick={() => setOpen((current) => !current)}
              className={`RS_RefCircleButton ${
                open ? "RS_RefCircleButton--menuOpen" : ""
              }`}
              aria-label={open ? "Close account menu" : "Open account menu"}
              aria-expanded={open}
              aria-haspopup="menu"
            >
              <MenuIcon close={open} />
            </button>
          </div>
        </div>
      </header>

      {open && (
        <aside
          ref={dropdownRef}
          className="RS_RefMenu"
          role="menu"
          aria-label="Account menu"
        >
          <nav className="RS_RefMobileNav" aria-label="Mobile navigation">
            {navLinks
              .filter((item) => item.label !== "Contact Us")
              .map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={(event) => handleNavLinkClick(event, item.href)}
                    className={`RS_RefMobileLink ${
                      active ? "RS_RefMobileLink--active" : ""
                    }`}
                    role="menuitem"
                    aria-current={active ? "page" : undefined}
                  >
                    <span>{item.label}</span>
                    {active && <span className="RS_RefMobileDot" />}
                  </Link>
                );
              })}
          </nav>

          <div className="RS_RefMenuList">
            {accountUser ? (
              <>
                {accountUser.name && (
                  <div className="RS_RefMenuRow RS_RefMenuRow--strong">
                    <span className="RS_RefMenuIcon">
                      <MenuGlyph name="user" />
                    </span>
                    <span className="RS_RefMenuLabel">
                      {accountUser.name}
                    </span>
                  </div>
                )}

                {accountUser.email && (
                  <div className="RS_RefMenuRow">
                    <span className="RS_RefMenuIcon">
                      <MenuGlyph name="mail" />
                    </span>
                    <span className="RS_RefMenuLabel">
                      {accountUser.email}
                    </span>
                  </div>
                )}

                {accountUser.phone && (
                  <div className="RS_RefMenuRow">
                    <span className="RS_RefMenuIcon">
                      <MenuGlyph name="phone" />
                    </span>
                    <span className="RS_RefMenuLabel">
                      {formatPhoneWithCode(accountUser.phone)}
                    </span>
                  </div>
                )}

                <div className="RS_RefMenuDivider" />

                <button
                  type="button"
                  onClick={() => handleMenuItemClick("cart")}
                  className="RS_RefMenuRow RS_RefMenuRowButton"
                  role="menuitem"
                >
                  <span className="RS_RefMenuIcon">
                    <MenuGlyph name="cart" />
                  </span>
                  <span className="RS_RefMenuLabel">My Cart</span>
                  {cartCount > 0 ? (
                    <span className="RS_RefMenuCount">{cartCount}</span>
                  ) : (
                    <span className="RS_RefMenuArrow">
                      <ChevronIcon />
                    </span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleMenuItemClick("orders")}
                  className="RS_RefMenuRow RS_RefMenuRowButton"
                  role="menuitem"
                >
                  <span className="RS_RefMenuIcon">
                    <MenuGlyph name="history" />
                  </span>
                  <span className="RS_RefMenuLabel">Order History</span>
                  <span className="RS_RefMenuArrow">
                    <ChevronIcon />
                  </span>
                </button>

                <div className="RS_RefMenuDivider" />

                <button
                  type="button"
                  onClick={() => handleMenuItemClick("signout")}
                  className="RS_RefMenuRow RS_RefMenuRowButton RS_RefMenuRow--danger"
                  role="menuitem"
                >
                  <span className="RS_RefMenuIcon">
                    <MenuGlyph name="signout" />
                  </span>
                  <span className="RS_RefMenuLabel">Sign Out</span>
                  <span className="RS_RefMenuArrow">
                    <ChevronIcon />
                  </span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleMenuItemClick("signin")}
                  className="RS_RefMenuRow RS_RefMenuRowButton RS_RefMenuRow--strong"
                  role="menuitem"
                >
                  <span className="RS_RefMenuIcon">
                    <MenuGlyph name="signin" />
                  </span>
                  <span className="RS_RefMenuLabel">Sign In</span>
                  <span className="RS_RefMenuArrow">
                    <ChevronIcon />
                  </span>
                </button>

                <div className="RS_RefMenuDivider" />

                <button
                  type="button"
                  onClick={() => handleMenuItemClick("signup")}
                  className="RS_RefMenuRow RS_RefMenuRowButton"
                  role="menuitem"
                >
                  <span className="RS_RefMenuIcon">
                    <MenuGlyph name="signup" />
                  </span>
                  <span className="RS_RefMenuLabel">Sign Up</span>
                  <span className="RS_RefMenuArrow">
                    <ChevronIcon />
                  </span>
                </button>
              </>
            )}
          </div>
        </aside>
      )}
    </>,
    document.body,
  );
}