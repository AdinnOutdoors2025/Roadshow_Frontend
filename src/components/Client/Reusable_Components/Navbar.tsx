/* eslint-disable */
// @ts-nocheck
"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/context/AuthContext";
import { useCartCount } from "@/hooks/useCartCount";
import { navigateAfterRoadshowLoader } from "@/components/GlobalRoadshowLoader";
import { HOME_VEHICLES_SECTION_ID } from "./scrollToSection";
import "./Navbar.css";
type NavLinkItem = {
  label: string;
  href: string;
  icon:
  | "home"
  | "spark"
  | "vehicle"
  | "contact";
};
const navLinks: NavLinkItem[] = [
  {
    label: "Home",
    href: "/",
    icon: "home",
  },
  {
    label: "Why Adinn",
    href: "/#why-adinn",
    icon: "spark",
  },
  {
    label: "Vehicle",
    href: `/#${HOME_VEHICLES_SECTION_ID}`,
    icon: "vehicle",
  },
  {
    label: "Contact Us",
    href: "/roadshow/Contact",
    icon: "contact",
  },
];
const PROFILE_PATH = "/roadshow/profile";
function NavGlyph({
  name,
}: {
  name: NavLinkItem["icon"];
}) {
  const props = {
    width: 21,
    height: 21,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "home") {
    return (
      <svg {...props}>
        <path d="m3.5 10.5 8.5-7 8.5 7" />
        <path d="M5.5 9.5V21h13V9.5" />
        <path d="M9.5 21v-6.5h5V21" />
      </svg>
    );
  }
  if (name === "spark") {
    return (
      <svg {...props}>
        <path d="M12 2.8 14 8l5.2 2-5.2 2-2 5.2-2-5.2-5.2-2L10 8l2-5.2Z" />
        <path d="m18.2 15.4.9 2.3 2.3.9-2.3.9-.9 2.3-.9-2.3-2.3-.9 2.3-.9.9-2.3Z" />
      </svg>
    );
  }
  if (name === "vehicle") {
    return (
      <svg {...props}>
        <path d="M3 7.5h11v9H3z" />
        <path d="M14 10h3.3l3.2 3.2V16.5H14z" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17.5" cy="18" r="2" />
        <path d="M3 13h11" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M21 4.5 3.5 11l7 2.7L13 21l8-16.5Z" />
      <path d="m10.5 13.7 5.2-5" />
    </svg>
  );
}
type MenuGlyphName =
  "user"
  |
  "mail"
  |
  "phone"
  |
  "cart"
  |
  "history"
  |
  "signin"
  |
  "signup"
  |
  "signout";
function MenuGlyph({
  name,
}: {
  name: MenuGlyphName;
}) {
  const props = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (name === "mail") {
    return (
      <svg {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2.5" />
        <path d="m4.5 7 7.5 5.6L19.5 7" />
      </svg>
    );
  }
  if (name === "phone") {
    return (
      <svg {...props}>
        <path d="M7.2 3H4.8A1.8 1.8 0 0 0 3 4.8C3 13.75 10.25 21 19.2 21a1.8 1.8 0 0 0 1.8-1.8v-2.4l-4.25-1.25-1.15 2.3a14.2 14.2 0 0 1-9.45-9.45l2.3-1.15L7.2 3Z" />
      </svg>
    );
  }
  if (name === "cart") {
    return (
      <svg {...props}>
        <circle cx="9" cy="20" r="1" />
        <circle cx="19" cy="20" r="1" />
        <path d="M3 4h2l2.3 10a2 2 0 0 0 2 1.55h8.8a2 2 0 0 0 1.95-1.55L22 7H6" />
      </svg>
    );
  }
  if (name === "history") {
    return (
      <svg {...props}>
        <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
        <path d="M3 3v5h5M12 7v5l3 2" />
      </svg>
    );
  }
  if (name === "signup") {
    return (
      <svg {...props}>
        <circle cx="9" cy="8" r="4" />
        <path d="M2.5 21a6.5 6.5 0 0 1 13 0M19 8v6M16 11h6" />
      </svg>
    );
  }
  return (
    <svg {...props}>
      <path d="M14 8l4 4-4 4M18 12H7" />
      <path d="M10 5V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1v-1" />
    </svg>
  );
}
function MenuIcon({
  close = false
}: {
  close?: boolean;
}) {
  return (
    <span className={`RS_MenuMorph ${close ? "RS_MenuMorph--open" : ""}`}>
      <span />
      <span />
      <span />
    </span>
  );
}
const formatPhoneWithCode = (phone?: string) => {
  const raw = String(phone ?? "").trim();
  if (!raw) return "";
  if (raw.startsWith("+"))
    return raw;
  const digits = raw.replace(/\D/g, "");
  if (!digits)
    return raw;
  return digits.length > 10 && digits.startsWith("91")
    ?
    `+${digits}`
    :
    `+91 ${digits}`;
};
export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    user,
    openAuth,
    logoutUser
  } = useAuth();
  const accountUser = user as any;
  const cartCount =
    useCartCount(accountUser?._id);
  const [
    mounted,
    setMounted
  ] = useState(false);
  const [
    open,
    setOpen
  ] = useState(false);
  const [
    activeHash,
    setActiveHash
  ] = useState("");
  const [
    scrollStage,
    setScrollStage
  ] = useState(0);
  const navbarRef =
    useRef<HTMLElement | null>(null);
  const dropdownRef =
    useRef<HTMLElement | null>(null);
  const scrollStageRef =
    useRef(0);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!mounted) return;
    const syncHash = () => {
      setActiveHash(
        window.location.hash
      );
    };
    syncHash();
    window.addEventListener(
      "hashchange",
      syncHash
    );
    return () => {
      window.removeEventListener(
        "hashchange",
        syncHash
      );
    };
  }, [mounted, pathname]);
  useEffect(() => {
    setOpen(false);
  }, [pathname]);
  /*
   Smooth stages:
   0 Normal
   1 Floating
   2 Compact width
   3 Reduced spacing
   4 Text collapse
   5 Icon pill
  */
  useEffect(() => {
    if (!mounted)
      return;
    let rafId: number | null = null;
    const updateNavbar = () => {
      const y = window.scrollY;
      let stage = 0;
      if (y > 100) stage = 1;
      if (y > 280) stage = 2;
      if (y > 500) stage = 3;
      if (y > 750) stage = 4;
      if (y > 1100) stage = 5;
      if (stage !== scrollStageRef.current) {
        scrollStageRef.current = stage;
        setScrollStage(stage);
      }
      rafId = null;
    };
    const handleScroll = () => {
      if (rafId !== null)
        return;
      rafId = requestAnimationFrame(
        updateNavbar
      );
    };
    updateNavbar();
    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true
      }
    );
    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
      if (rafId !== null) {
        cancelAnimationFrame(
          rafId
        );
      }
    };
  }, [mounted]);
  useEffect(() => {
    if (!open) return;
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideHeader =
        navbarRef.current?.contains(target);
      const insideMenu =
        dropdownRef.current?.contains(target);
      if (!insideHeader && !insideMenu) {
        setOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };
    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );
    document.addEventListener(
      "keydown",
      handleEscape
    );
    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [open]);
  const isActive = (href: string) => {
    const [
      path,
      hash
    ] = href.split("#");
    if (hash) {
      return pathname === (path || "/")
        &&
        activeHash === `#${hash}`;
    }
    if (href === "/") {
      return pathname === "/"
        &&
        !activeHash;
    }
    return pathname === href
      ||
      pathname?.startsWith(`${href}/`);
  };
  const handleNavLinkClick = () => {
    setOpen(false);
  };
  const handleMenuItemClick = (action: string) => {
    setOpen(false);
    if (action === "profile") {
      if (accountUser) {
        navigateAfterRoadshowLoader(
          () => router.push(PROFILE_PATH),
          "Opening profile..."
        );
      } else {
        openAuth("login");
      }
      return;
    }
    if (action === "cart") {
      navigateAfterRoadshowLoader(
        () => router.push("/roadshow/CampaignRequest"),
        "Loading campaign request..."
      );
      return;
    }
    if (action === "orders") {
      navigateAfterRoadshowLoader(
        () => router.push("/roadshow/my-bookings"),
        "Loading bookings..."
      );
      return;
    }
    if (action === "signin") {
      openAuth("login");
      return;
    }
    if (action === "signup") {
      openAuth("signup");
      return;
    }
    if (action === "signout") {
      logoutUser();
    }
  };
  if (!mounted)
    return null;
  const headerClasses =
    `RS_NewHeader RS_NewHeader--stage-${scrollStage}`;
  return createPortal(
    <>
      <header
        ref={navbarRef}
        className={headerClasses}
      >
        <div className="RS_NewHeaderShell">
          <Link
            href="/"
            className="RS_NewBrand"
            onClick={handleNavLinkClick}
          >
            <Image
              src="/images/assets/Roadshow_AdinnLogo.svg"
              alt="Adinn Roadshow"
              width={170}
              height={46}
              priority
              className="RS_NewLogo"
            />
          </Link>
          <nav
            className="RS_NewDesktopNav"
          >
            {
              navLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={handleNavLinkClick}
                  className={`RS_NewNavLink ${isActive(item.href)
                      ?
                      "RS_NewNavLink--active"
                      :
                      ""
                    }`}
                >
                  <span className="RS_NewNavIcon">
                    <NavGlyph
                      name={item.icon}
                    />
                  </span>
                  <span className="RS_NewNavText">
                    {item.label}
                  </span>
                </Link>
              ))
            }
          </nav>
          <div className="RS_NewRight">
            {/* <button
              type="button"
              className={`RS_NewCircleButton ${accountUser
                  ?
                  "RS_NewProfileButton--signedIn"
                  :
                  ""
                }`}
              onClick={() => handleMenuItemClick("profile")}
            >
              <Image
                src="/images/profile.svg"
                alt="Profile"
                width={30}
                height={30}
                className="RS_NewProfileIcon"
              />
              {
                accountUser &&
                <span className="RS_NewProfileName">
                  {accountUser.name || "Profile"}
                </span>
              }
            </button> */}
           <button
type="button"
className={`RS_NewCircleButton RS_MenuButton ${open?"active":""}`}
onClick={()=>setOpen(prev=>!prev)}
aria-expanded={open}
aria-label="Account menu"
>
<MenuIcon close={open}/>
</button>
          </div>
        </div>
      </header>
     {
open &&
<aside
ref={dropdownRef}
className={`RS_NewMenu ${open?"RS_NewMenu--open":""}`}
>
{
accountUser ? (
<>
<div className="RS_ProfileTop">
<div className="RS_ProfileAvatar">
<Image
src="/images/profile.svg"
alt="Profile"
width={42}
height={42}
/>
</div>
<div className="RS_ProfileInfo">
<div className="RS_ProfileName">
{accountUser.name || "Profile"}
</div>
<div className="RS_ProfileEmail">
{accountUser.email}
</div>
</div>
</div>
{
accountUser.phone &&
<div className="RS_ProfilePhone">
<MenuGlyph name="phone"/>
<span>
{formatPhoneWithCode(accountUser.phone)}
</span>
</div>
}
<div className="RS_MenuDivider"/>
<button
className="RS_MenuAction"
onClick={()=>handleMenuItemClick("cart")}
>
<MenuGlyph name="cart"/>
<span>
My Cart
</span>
{
cartCount>0 &&
<b className="RS_CartBadge">
{cartCount}
</b>
}
</button>
<button
className="RS_MenuAction"
onClick={()=>handleMenuItemClick("orders")}
>
<MenuGlyph name="history"/>
<span>
Order History
</span>
</button>
<div className="RS_MenuDivider"/>
<button
className="RS_MenuAction RS_MenuLogout"
onClick={()=>handleMenuItemClick("signout")}
>
<MenuGlyph name="signout"/>
<span>
Logout
</span>
</button>
</>
)
:
(
<>
<button
className="RS_MenuAction"
onClick={()=>handleMenuItemClick("signin")}
>
<MenuGlyph name="signin"/>
<span>
Sign In
</span>
</button>
<button
className="RS_MenuAction"
onClick={()=>handleMenuItemClick("signup")}
>
<MenuGlyph name="signup"/>
<span>
Sign Up
</span>
</button>
</>
)
}
</aside>
}
    </>,
    document.body
  );
}
