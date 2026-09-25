/* eslint-disable */
// @ts-nocheck
"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useCartCount } from "@/hooks/useCartCount";
import { navigateAfterRoadshowLoader } from "@/components/GlobalRoadshowLoader";
import { HOME_VEHICLES_SECTION_ID } from "./scrollToSection";
import "./Navbar.css";
type NavLinkItem = {
  label: string;
  href: string;
  icon: | "home" | "spark" | "vehicle" | "contact";
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
// Navbar skin toggle: true = light/frosted pill, false = dark glass pill.
// Same markup and behavior either way — this only switches which CSS theme
// attribute the header renders with (see [data-theme] rules in Navbar.css).
// const NAV_LIGHT_THEME = true; // for white theme
const NAV_LIGHT_THEME = false; // for black theme

// Scroll positions (px) at which the header steps to stage 1 and stage 2 —
// two discrete thresholds, not a continuous scrub range (see the effect
// below for why).
const DOCK_THRESHOLD_1 = 100;
const DOCK_THRESHOLD_2 = 280;
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}
const menuPanelVariants = {
  hidden: {
    opacity: 0,
    scale: 0.85,
    y: -14,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 320,
      damping: 26,
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: { duration: 0.15, ease: "easeIn" },
  },
};
const menuItemVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.92 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 380, damping: 24 },
  },
};
function NavGlyph({
  name,
}: {
  name: NavLinkItem["icon"];
}) {
  const props = {
    width: 18,
    height: 18,
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
type MenuGlyphName = "user" | "mail" | "phone" | "cart" | "history" |"signin" | "signup" | "signout";
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
function SearchGlyph() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20.5 20.5-4-4" />
    </svg>
  );
}
function ProfileGlyph() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8.2" r="3.4" />
      <path d="M4.8 20c1.1-4 4-6 7.2-6s6.1 2 7.2 6" />
    </svg>
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
  /* Measured from the account button's real on-screen position rather than
     a fixed/percentage CSS value — a static right:X% can only ever be
     correct for one header width, and the header's width itself changes
     both per breakpoint AND continuously while scrolling (the GSAP
     hero->docked stage animation). Measuring the button directly is the
     only way this tracks correctly through both axes at once. */
  const [menuPos, setMenuPos] = useState<{ top: number; right: number } | null>(null);
  // Fade the pill out while the user is stationary on a section (so it
  // doesn't sit on top of section content) and bring it back the moment
  // they scroll again. Suppressed while the account dropdown is open or the
  // pointer is resting on the header itself, so it never vanishes out from
  // under an in-progress interaction.
  const [isNavIdle, setIsNavIdle] = useState(false);
  const openRef = useRef(false);
  const hoveredRef = useRef(false);
  const idleTimerRef = useRef<number | undefined>(undefined);
  const navbarRef =
    useRef<HTMLElement | null>(null);
  const dropdownRef =
    useRef<HTMLElement | null>(null);
  const logoRef =
    useRef<HTMLImageElement | null>(null);
  const accountBtnRef =
    useRef<HTMLButtonElement | null>(null);
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
    setIsNavIdle(false);
  }, [pathname]);
  // Idle-fade is home-page-only: every other roadshow page keeps the pill
  // permanently sticky/visible.
  const isHomePage = pathname === "/";
  // Idle-fade: hides the pill after IDLE_HIDE_DELAY of no scroll, brings it
  // back on the next scroll event. openRef mirrors `open` into a ref so the
  // scroll listener (bound once) always reads the current dropdown state
  // without needing to rebind on every toggle.
  useEffect(() => {
    openRef.current = open;
    if (open) {
      if (idleTimerRef.current !== undefined) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = undefined;
      }
      setIsNavIdle(false);
    }
  }, [open]);
  useEffect(() => {
    if (!mounted || !isHomePage) return;
    const IDLE_HIDE_DELAY = 1500;
    // Never fade while still on the first screen (the hero) — only once the
    // user has scrolled down into the sections below it.
    const isPastFirstScreen = () => window.scrollY > window.innerHeight;
    const clearIdleTimer = () => {
      if (idleTimerRef.current !== undefined) {
        window.clearTimeout(idleTimerRef.current);
        idleTimerRef.current = undefined;
      }
    };
    const scheduleIdle = () => {
      clearIdleTimer();
      if (!isPastFirstScreen()) return;
      idleTimerRef.current = window.setTimeout(() => {
        if (!openRef.current && !hoveredRef.current) {
          setIsNavIdle(true);
        }
      }, IDLE_HIDE_DELAY);
    };
    const handleScroll = () => {
      setIsNavIdle(false);
      scheduleIdle();
    };
    scheduleIdle();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      clearIdleTimer();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [mounted, isHomePage]);
  const handleHeaderMouseEnter = () => {
    hoveredRef.current = true;
    if (idleTimerRef.current !== undefined) {
      window.clearTimeout(idleTimerRef.current);
      idleTimerRef.current = undefined;
    }
    setIsNavIdle(false);
  };
  const handleHeaderMouseLeave = () => {
    hoveredRef.current = false;
    if (!isHomePage || openRef.current) return;
    if (window.scrollY <= window.innerHeight) return;
    idleTimerRef.current = window.setTimeout(() => {
      if (!openRef.current && !hoveredRef.current) {
        setIsNavIdle(true);
      }
    }, 1500);
  };
  // First-paint entrance: logo + tabs flip in from a 3D tilt with a
  // staggered bounce, instead of just sitting there static until hover.
  useEffect(() => {
    if (!mounted) return;
    const items = gsap.utils.toArray<HTMLElement>(".RS_TabItem");
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "back.out(1.8)" },
      });
      tl.from(".RS_NewBrand", {
        opacity: 0,
        y: -18,
        scale: 0.75,
        duration: 0.55,
      })
        .from(
          items,
          {
            opacity: 0,
            y: -26,
            scale: 0.4,
            rotateX: -70,
            stagger: 0.08,
            duration: 0.55,
          },
          "-=0.3"
        )
        .from(
          ".RS_IconBtn",
          {
            opacity: 0,
            scale: 0.4,
            rotate: -120,
            stagger: 0.06,
            duration: 0.5,
          },
          "-=0.35"
        );
      // Idle float on the logo so the resting header stays alive.
      gsap.to(".RS_NewBrand", {
        y: -4,
        duration: 2.4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: tl.duration(),
      });
    });
    return () => ctx.revert();
  }, [mounted]);
  // Three-stage dock: triggered once at each of two scroll thresholds,
  // rather than scrubbed continuously. Continuously tweening width/height/top
  // on every scroll frame forces a layout reflow 60x/sec on top of whatever
  // ScrollSmoother is already doing each frame — that's what read as
  // "shaking" earlier. Each onEnter/onLeaveBack-triggered tween only touches
  // layout for its own ~0.5s, not for the whole scroll range. Horizontal
  // centering stays owned entirely by the CSS `left: 50%` +
  // `transform: translate(-50%, 0)` on .RS_NewHeader — this never touches
  // `transform`, so it can't fight that.
  //   Stage 0 (top of page):        60% wide,  82px tall, 26px radius
  //   Stage 1 (past DOCK_THRESHOLD_1): 58% wide, 82px tall, 30px radius
  //   Stage 2 (past DOCK_THRESHOLD_2): 50% wide, 64px tall, 30px radius
  // Scrolling back up reverses through the same stages; scrolling further
  // past stage 2 does nothing more — there is no third threshold.
  useLayoutEffect(() => {
    if (!mounted) return;
    const header = navbarRef.current;
    if (!header) return;
    // Below this width the header is a small fixed pill defined entirely by
    // CSS (see the max-width:767px block in Navbar.css) — there's no room
    // for a full hero-sized nav to shrink from, so skip this entirely.
    if (window.innerWidth < 768) return;
    const shadowStage0 = NAV_LIGHT_THEME
      ? "0 12px 30px rgba(15, 23, 42, .1)"
      : "0 16px 40px rgba(0, 0, 0, .28)";
    const shadowStage1 = NAV_LIGHT_THEME
      ? "0 16px 40px rgba(15, 23, 42, .13)"
      : "0 18px 46px rgba(0, 0, 0, .32)";
    const shadowStage2 = NAV_LIGHT_THEME
      ? "0 20px 50px rgba(15, 23, 42, .16)"
      : "0 20px 55px rgba(0, 0, 0, .38)";
    // Below 1440px, 60/58/50% leaves too little room for the logo + 4 tabs +
    // icons at that narrower absolute pixel width (e.g. 50% of 1024px is only
    // ~512px) — the pill isn't actually broken, it's just too cramped for its
    // own content. Widen the percentages in that band only; >=1440px keeps
    // the exact 60/58/50% from before, untouched. Recomputed from
    // window.innerWidth on every resize (not just once at mount) so it stays
    // correct if the viewport is resized live (e.g. dragging the browser
    // window or a DevTools responsive-mode resize) rather than reloaded.
    const buildStages = (vw: number) => {
      const isNarrowDesktop = vw < 1440;
      return {
        stage0: {
          top: 14,
          width: isNarrowDesktop ? vw * 0.7 : Math.min(1180, vw * 0.6),
          height: 82,
          borderRadius: 26,
          boxShadow: shadowStage0,
        },
        stage1: {
          top: 15,
          width: isNarrowDesktop ? vw * 0.66 : Math.min(1140, vw * 0.58),
          height: 82,
          borderRadius: 30,
          boxShadow: shadowStage1,
        },
        stage2: {
          top: 16,
          width: isNarrowDesktop ? vw * 0.6 : Math.min(980, vw * 0.5),
          height: 64,
          borderRadius: 30,
          boxShadow: shadowStage2,
        },
      };
    };
    const stage0Logo = { width: 150, height: 42 };
    const stage2Logo = { width: 118, height: 33 };
    let stages = buildStages(window.innerWidth);
    let currentStage: 0 | 1 | 2 = 0;
    const ctx = gsap.context(() => {
      // Slower, gentler than a snappy power3.out: power2.inOut eases in and
      // out symmetrically (no sudden start/stop), and a longer duration
      // makes the width/border-radius change read as a smooth glide instead
      // of a quick snap.
      const animateHeader = (state: object) =>
        gsap.to(header, { ...state, duration: 1.1, ease: "power2.inOut", overwrite: "auto" });
      const animateLogo = (state: object) => {
        if (logoRef.current) {
          gsap.to(logoRef.current, { ...state, duration: 1.1, ease: "power2.inOut", overwrite: "auto" });
        }
      };
      ScrollTrigger.create({
        trigger: document.body,
        start: `${DOCK_THRESHOLD_1} top`,
        onEnter: () => {
          currentStage = 1;
          animateHeader(stages.stage1);
        },
        onLeaveBack: () => {
          currentStage = 0;
          animateHeader(stages.stage0);
          animateLogo(stage0Logo);
        },
      });
      ScrollTrigger.create({
        trigger: document.body,
        start: `${DOCK_THRESHOLD_2} top`,
        onEnter: () => {
          currentStage = 2;
          animateHeader(stages.stage2);
          animateLogo(stage2Logo);
        },
        onLeaveBack: () => {
          currentStage = 1;
          animateHeader(stages.stage1);
          animateLogo(stage0Logo);
        },
      });
    });
    // Kept outside gsap.context deliberately — a value returned from the
    // context callback is not treated as a cleanup hook (that's a React
    // convention, not something gsap.context does), so the listener is
    // attached/removed directly on the effect's own lifecycle instead.
    let resizeTimer: number | undefined;
    const handleResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (window.innerWidth < 768) return;
        stages = buildStages(window.innerWidth);
        const stageKey = (["stage0", "stage1", "stage2"] as const)[currentStage];
        gsap.set(header, stages[stageKey]);
      }, 150);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", handleResize);
      ctx.revert();
    };
  }, [mounted]);
  useLayoutEffect(() => {
    if (!open) return;
    const MENU_GAP = 45; // value increase top gap decrease 
    const updateMenuPosition = () => {
      // Below 768px the menu uses its own deliberate full-width mobile
      // layout (left/right/width all set in CSS) — a measured `right`
      // here would fight that, so leave menuPos null and let the CSS
      // media query own positioning entirely on small screens.
      if (window.innerWidth < 768) {
        setMenuPos(null);
        return;
      }
      const btn = accountBtnRef.current;
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      // +20% on both: the exact button-flush values read as too tight/
      // congested against the header (menu nearly touching it, sitting
      // hard against the header's right edge) — a uniform 20% bump on
      // each gives it breathing room on both axes, same formula at every
      // screen size since both are derived from the button's own measured
      // position rather than a per-breakpoint constant.
      const SPACING_SCALE = 0.9; // value decrease top gap decrease
      setMenuPos({
        top: (rect.bottom + MENU_GAP) * SPACING_SCALE,
        right: (window.innerWidth - rect.right) * SPACING_SCALE,
      });
    };
    updateMenuPosition();
    // Covers both a window resize and the GSAP dock animation shrinking/
    // moving the header while the menu happens to still be open — neither
    // fires a "resize" event, so re-measure on a plain scroll too.
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, { passive: true });
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition);
    };
  }, [open]);
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
  /* Pages where inactive tabs should read as gradient-bordered glass instead
     of the default flat border — every roadshow page except the marketing
     homepage and the Contact Us page. */
  const FLAT_BORDER_PREFIXES = [
    "/roadshow/Contact",
  ];
  const isInnerPage =
    pathname !== "/" &&
    !FLAT_BORDER_PREFIXES.some((prefix) => pathname?.startsWith(prefix));
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
      const RESTRICTED_BOOKING_PREFIXES = [
        "/roadshow/CampaignRequest",
        "/roadshow/campaign-details",
        "/roadshow/review-order",
        "/roadshow/my-bookings",
        "/roadshow/booking-request-submitted",
      ];
      const onRestrictedPage = RESTRICTED_BOOKING_PREFIXES.some((prefix) =>
        pathname?.startsWith(prefix)
      );

      logoutUser(
        onRestrictedPage
          ? "You have been signed out successfully. Please login to continue booking."
          : undefined
      );
    }
  };
  if (!mounted)
    return null;
  return createPortal(
    <>
      <div className="RS_HeaderStage">
        <header
          ref={navbarRef}
          data-theme={NAV_LIGHT_THEME ? "light" : "dark"}
          data-innerpage={isInnerPage ? "true" : undefined}
          className={`RS_NewHeader ${isNavIdle ? "RS_NewHeader--idle" : ""}`}
          onMouseEnter={handleHeaderMouseEnter}
          onMouseLeave={handleHeaderMouseLeave}
        >
          <div className="RS_NewHeaderShell">
            <Link
              href="/"
              className="RS_NewBrand"
              onClick={handleNavLinkClick}
            >
              <Image
                src={
                  NAV_LIGHT_THEME
                    ? "/images/assets/Roadshow_AdinnLogo.svg"
                    : "/images/assets/Roadshow_AdinnLogo_WithoutBg.svg"
                }
                alt="Adinn Roadshow"
                width={170}
                height={46}
                priority
                ref={logoRef}
                className="RS_NewLogo"
              />
            </Link>
            <nav className="RS_TabBar">
              {
                navLinks.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={handleNavLinkClick}
                    className={`RS_TabItem ${isActive(item.href)
                      ?
                      "RS_TabItem--active"
                      :
                      ""
                      } ${isInnerPage ? "RS_TabItem--inner" : ""}`}
                  >
                    {
                      isActive(item.href) &&
                      <motion.span
                        className="RS_TabPillWrap"
                        layoutId="RS_TabPill"
                        transition={{ type: "spring", stiffness: 480, damping: 34 }}
                        aria-hidden="true"
                      >
                        <span className="RS_TabPill" />
                      </motion.span>
                    }
                    <span className="RS_TabIcon">
                      <NavGlyph
                        name={item.icon}
                      />
                    </span>
                    <span className="RS_TabLabel">
                      {item.label}
                    </span>
                    {
                      isActive(item.href) &&
                      <>
                        <span className="RS_Bubble RS_Bubble--1" aria-hidden="true" />
                        <span className="RS_Bubble RS_Bubble--2" aria-hidden="true" />
                        <span className="RS_Bubble RS_Bubble--3" aria-hidden="true" />
                      </>
                    }
                  </Link>
                ))
              }
            </nav>
            <div className="RS_NewRight">
              {/* <button
                type="button"
                className="RS_IconBtn"
                aria-label="Search"
              >
                <SearchGlyph />
              </button> */}
              <button
                type="button"
                className="RS_IconBtn"
                onClick={() => handleMenuItemClick("cart")}
                aria-label="My cart"
              >
                <MenuGlyph name="cart" />
                {
                  cartCount > 0 &&
                  <b className="RS_CartBadge RS_CartBadge--dark">
                    {cartCount}
                  </b>
                }
              </button>
              <button
                type="button"
                ref={accountBtnRef}
                className={`RS_IconBtn RS_ProfileBtn ${open ? "active" : ""}`}
                onClick={() => setOpen(prev => !prev)}
                aria-expanded={open}
                aria-label="Account menu"
              >
                <ProfileGlyph />
              </button>
            </div>
          </div>
        </header>
      </div>
      <AnimatePresence>
        {
          open &&
          <motion.aside
            ref={dropdownRef}
            className="RS_NewMenu"
            data-theme={NAV_LIGHT_THEME ? "light" : "dark"}
            style={
              menuPos
                ? { top: menuPos.top, right: menuPos.right }
                : undefined
            }
            variants={menuPanelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {
              accountUser ? (
                <>
                  <motion.div
                    className="RS_ProfileTop"
                    variants={menuItemVariants}
                  >
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
                  </motion.div>
                  {
                    accountUser.phone &&
                    <motion.div
                      className="RS_ProfilePhone"
                      variants={menuItemVariants}
                    >
                      <MenuGlyph name="phone" />
                      <span>
                        {formatPhoneWithCode(accountUser.phone)}
                      </span>
                    </motion.div>
                  }
                  <motion.div
                    className="RS_MenuDivider"
                    variants={menuItemVariants}
                  />
                  <motion.button
                    className="RS_MenuAction"
                    variants={menuItemVariants}
                    onClick={() => handleMenuItemClick("orders")}
                  >
                    <MenuGlyph name="history" />
                    <span>
                      Order History
                    </span>
                  </motion.button>
                  <motion.div
                    className="RS_MenuDivider"
                    variants={menuItemVariants}
                  />

                  <motion.button
                    className="RS_MenuAction RS_MenuLogout"
                    variants={menuItemVariants}
                    onClick={() => handleMenuItemClick("signout")}
                  >
                    <MenuGlyph name="signout" />
                    <span>
                      Logout
                    </span>
                  </motion.button>
                </>
              )
                :
                (
                  <>
                    <motion.button
                      className="RS_MenuAction"
                      variants={menuItemVariants}
                      onClick={() => handleMenuItemClick("signin")}
                    >
                      <MenuGlyph name="signin" />
                      <span>
                        Sign In
                      </span>
                    </motion.button>
                    <motion.button
                      className="RS_MenuAction"
                      variants={menuItemVariants}
                      onClick={() => handleMenuItemClick("signup")}
                    >
                      <MenuGlyph name="signup" />
                      <span>
                        Sign Up
                      </span>
                    </motion.button>
                  </>
                )
            }
          </motion.aside>
        }
      </AnimatePresence>
    </>,
    document.body
  );
}
