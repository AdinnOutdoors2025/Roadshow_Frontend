/* eslint-disable */
// @ts-nocheck
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./HomePageSection1.css";
import SplitHeading from "@/components/motion/SplitHeading";
import RevealText from "@/components/motion/RevealText";
import { useScrollReveal } from "@/components/motion/useScrollReveal";
import { playPopIn } from "@/components/motion/playPopIn";
import {
  DISTANCE,
  DURATION,
  STAGGER,
} from "@/components/motion/motionTokens";
import HomePageSection2 from "./HomePageSection2";
import {
  ButtonHover as ViewAllClientsButton,
} from "../Reusable_Components/ButtonHover";
import {
  HOME_VEHICLES_SECTION_ID,
  scrollToSection,
} from "../Reusable_Components/scrollToSection";
/* The vehicle grid, tabs, spec popup and its data fetch all live here now —
   this section used to hold its own carousel and fetch. */
import VehicleListing from "@/components/Client/VehicleListing/VehicleListing";
// ROADSHOW WEBSITE ABOUT SECTION 
import {About as RoadshowWebsiteAboutSection } from './About';
import {Process as RoadshowWebsiteStreetVisibilitySection } from './Process';
import ImpactCtaBanner from "./ImpactCtaBanner";
const cities = [
  {
    name: "Chennai",
    icon: "./images/assets/Offers_Chennai.png",
  },
  {
    name: "Madurai",
    icon: "./images/assets/Offers_Madurai.png",
  },
  {
    name: "Coimbatore",
    icon: "./images/assets/Offers_Cbe.png",
  },
  {
    name: "Thrissur",
    icon: "./images/assets/Offers_Thrissur.png",
  },
  {
    name: "Kollam",
    icon: "./images/assets/Offers_Kollam.png",
  },
  {
    name: "Bengaluru",
    icon: "./images/assets/Offers_Bglr.png",
  },
  {
    name: "Theni",
    icon: "./images/assets/Offers_Theni.png",
  },
  {
    name: "Vellore",
    icon: "./images/assets/Offers_Vellore.png",
  },
];

const marqueeItems = [...cities, ...cities, ...cities];

// collapsedWidth is the capsule's closed width in px, so each pill
// hugs its own title instead of every capsule sharing one width.
// It has to be an explicit number, not `max-content`: browsers
// cannot interpolate intrinsic sizes, so the 320 -> 400 width
// transition would jump instead of sliding.
// Value = 90px chrome (20 padding + 36 icon + 14 gap + 20 padding)
// + the rendered width of the title at 22px Outfit 500. Measured off
// the Figma frame; change the chrome in the .css and these must move
// with it.
const whyAdinnWorksBest = [
  {
    name: "GPS Support",
    description:
      "Live location tracking for vehicles with route visibility and movement updates throughout the campaign.",
    image: "./images/assets/HomeBanner_MainPageFinal.png",
    collapsedWidth: 219,
  },
  {
    name: "RTO Certified",
    description:
      "Fully approved vehicles complying with road regulations for smooth and hassle-free campaign execution.",
    image: "./images/assets/tata ultra - 2.png",
    collapsedWidth: 227,
  },
  {
    name: "One-Stop Solution",
    description:
      "From planning to execution, everything is managed in one place for a roadshow campaign.",
    image: "./images/assets/full side LED.png",
    collapsedWidth: 262,
  },
  {
    name: "24/7 Support",
    description:
      "Dedicated team available anytime to monitor, coordinate, and assist throughout the campaign.",
    image: "./images/assets/HomeBanner_MainPageFinal.png",
    collapsedWidth: 215,
  },
];

/* Every logo in public/images/assets/Client-logos, one entry per BRAND.

   Each name appears exactly once on purpose — the previous list repeated
   Kelloggs four times and Thangamayil twice, so the same logo showed up in
   several bubbles at once. With CLIENT_BUBBLE_SLOTS below dividing this list
   evenly, no brand can ever appear twice on screen.

   The folder also holds DRA_Homes2.png and DRA_Homes3.png; both are the same
   brand as DRA_Homes.png (and ~800KB each against its 27KB), so only the one
   entry is listed.

   To add a client: drop the file in that folder and add a line here.

   `w` is the rendered width of the <img> in PIXELS — deliberately absolute, not
   a percentage of the bubble.

   That is what makes a logo overhang a small disc and sit inside a large one,
   the way PHILIPS does in the design. Sizing logos as a share of their bubble
   instead made every one of them scale down with its disc, so nothing ever
   broke out and the whole orbit looked like logos dumped inside circles.

   The values are NOT eyeballed and are not uniform on purpose. These PNGs are
   exported with wildly different amounts of transparent padding — actual ink
   covers anywhere from 32% (ITC) to 98% (Kellogg's) of the canvas width — so
   one shared width makes some logos look huge and others tiny even though the
   boxes are identical. That was the "ACC/Ambuja/Dalmia are big but
   GRT/Casagrand/Bajaj are small" problem. Each number here was computed by
   measuring the real ink bounding box of the file and solving for the width
   that gives every logo the same visual mass.

   ORDER MATTERS: the first CLIENT_BUBBLE_SLOTS entries are what shows before
   anyone touches "View All Clients", so the best-known brands lead.

   To add a client: drop the file in public/images/assets/Client-logos, add a
   line here, and start from w: 140 — then nudge until it sits right. */
const ourClients = [
  /* Lead with the flagship brands — these are the ones on screen by default.
     Philips sits first and Thangamayil eighth so they land on slots 0 and 7,
     the two 88px discs: a wide wordmark over the smallest circle is what
     produces the big overhang those two have in the design. */
  { name: "Philips", logo: "./images/assets/Client-logos/Philips.png", w: 140 },
  { name: "Hero", logo: "./images/assets/Client-logos/Hero.png", w: 150 },
  { name: "Airtel", logo: "./images/assets/Client-logos/Airtel.png", w: 210 },
  // Kellogg's has no file in Client-logos, so it keeps its original asset path.
  { name: "Kellogg's", logo: "./images/assets/RS_Client_kelloggs_logo.png", w: 175 },
  { name: "ACC", logo: "./images/assets/Client-logos/ACC.png", w: 170 },
  { name: "Bajaj", logo: "./images/assets/Client-logos/Bajaj.png", w:250 },
  { name: "Domino's", logo: "./images/assets/Client-logos/Dominos.png", w: 260 },
  { name: "Thangamayil Jewellery", logo: "./images/assets/Client-logos/Thangamayil_Jewellery.png", w: 230 },
  { name: "Casagrand", logo: "./images/assets/Client-logos/Casagrand.png", w: 270 },
  { name: "GRT Jewellers", logo: "./images/assets/Client-logos/GRT_Jewellers.png", w: 300 },

  { name: "Ambuja Cement", logo: "./images/assets/Client-logos/Ambuja_Cement.png", w: 110 },
  { name: "Dalmia Cement", logo: "./images/assets/Client-logos/Dalmia_Cement.png", w: 151 },
  { name: "DRA Homes", logo: "./images/assets/Client-logos/DRA_Homes.png", w: 160 },
  { name: "G Square", logo: "./images/assets/Client-logos/G_Square.png", w: 180 },
  { name: "Havells", logo: "./images/assets/Client-logos/Havells.png", w: 400 },
  { name: "Impex", logo: "./images/assets/Client-logos/Impex.png", w: 250 },
  { name: "ITC", logo: "./images/assets/Client-logos/ITC.png", w: 280 },
  { name: "KFC", logo: "./images/assets/Client-logos/KFC.png", w: 220 },
  { name: "Lalithaa Jewellery", logo: "./images/assets/Client-logos/Lalithaa_Jewellery.png", w: 300 },
  { name: "Maruti Suzuki", logo: "./images/assets/Client-logos/Maruti_Suzuki.png", w: 200 },

  { name: "Milky Mist", logo: "./images/assets/Client-logos/Milky_Mist.png", w: 145 },
  { name: "Nippon Paint", logo: "./images/assets/Client-logos/Nippon_Paint.png", w: 170 },
  { name: "Poorvika", logo: "./images/assets/Client-logos/Poorvika.png", w: 290 },
  { name: "Royal Enfield", logo: "./images/assets/Client-logos/Royal_Enfield.png", w: 250 },
  { name: "Sree Kumaran Thangamaligai", logo: "./images/assets/Client-logos/Sree_Kumaran_Thangamaligai.png", w: 300 },
  { name: "The Chennai Mobiles", logo: "./images/assets/Client-logos/The_Chennai_Mobiles.png", w: 230 },
  { name: "TVS", logo: "./images/assets/Client-logos/TVS.png", w: 220 },
];

/* The orbit has exactly this many positioned slots in the stylesheet
   (.RS_Bubble_0 … .RS_Bubble_14). `ourClients` above is a POOL, not the set of
   bubbles: only this many are on screen at a time and "Explore More Brands"
   advances which slice of the pool is shown.

   15 is chosen against the 27-brand pool, not picked for looks. The last page
   has to be padded with repeats to fill the board, and how many depends
   entirely on this number: 15 slots needs 3 repeats, 16 needs 5, 13 needs 12.
   Change one without the other and the second press turns into mostly
   duplicates.

   To add clients, just append to `ourClients` above. To add a bubble, add a
   matching .RS_Bubble_<n> rule in HomePageSection1.css and bump this number —
   then re-check the repeat count above. */
const CLIENT_BUBBLE_SLOTS = 15;

type WhyExitDirection = "exit-left" | "exit-right";

// Must stay >= the longest .RS_WhyAdRS_ImageLayer animation in
// HomePageSection1.css (--rs-img-enter-time: 1.45s).
const WHY_IMAGE_ANIMATION_MS = 1500;

export default function HomePageSection1() {
  /* The vehicle grid owns its own fetch, its own category tabs and its own
     spec popup (see VehicleListing). All this section keeps is the signal
     that the fetch has finished, used to time the hash scroll below. */
  const [vehiclesReady, setVehiclesReady] = useState(false);

  // Why Adinn vehicle: pure-CSS directional in/out animation.
  // -1 means every capsule is closed and no vehicle is shown.
  const [activeWhyIndex, setActiveWhyIndex] = useState<number>(0);
  const [whyExitIndex, setWhyExitIndex] = useState<number | null>(null);
  const [whyExitDirection, setWhyExitDirection] =
    useState<WhyExitDirection>("exit-left");
  const [whyEnterFromLeft, setWhyEnterFromLeft] = useState(false);
  const [isWhyFirstRender, setIsWhyFirstRender] = useState(true);
  const [isWhyAnimating, setIsWhyAnimating] = useState(false);

  const whyAnimationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const clientsOrbitRef = useRef<HTMLDivElement | null>(null);
  const whyListRef = useRef<HTMLDivElement | null>(null);

  /* How many presses of "Explore More Brands" it takes to show the whole pool.
     27 clients across 15 slots -> 2 pages. */
  const CLIENT_PAGE_COUNT = Math.max(
    1,
    Math.ceil(
      ourClients.length / CLIENT_BUBBLE_SLOTS,
    ),
  );

  /* Which page of the client pool the bubbles are currently showing. */
  const [clientPage, setClientPage] = useState(0);

  /* One entry per bubble slot. Wrapping keeps every slot filled when the pool
     is not an exact multiple of the slot count — only the final page repeats,
     and only for its remainder. Derived from the page rather than shuffled at
     random: a random order would differ between the server and client render
     and trip hydration. */
  const visibleClients = useMemo(() => {
    if (!ourClients.length) return [];

    return Array.from(
      { length: CLIENT_BUBBLE_SLOTS },
      (_unused, slot) => {
        const index =
          (clientPage * CLIENT_BUBBLE_SLOTS + slot) %
          ourClients.length;

        return { ...ourClients[index], slot };
      },
    );
  }, [clientPage]);

  const showMoreClients = () => {
    if (!ourClients.length) return;

    /* Cycle whole pages: 0 -> 1 -> 2 -> 0.

       This replaces a rolling offset that advanced by 10 and wrapped on the
       pool length. With 27 clients that produced 0, 10, 20, 3, 13, 23, 6 ... —
       from the fourth press onwards each set overlapped most of a set shown two
       presses earlier, so the same logos kept reappearing and the sequence
       never returned to a clean start. Paging visits all 27 in three presses
       and repeats only the 3 needed to fill out the last page. */
    setClientPage(
      (current) => (current + 1) % CLIENT_PAGE_COUNT,
    );
  };

  /* Replay the pop when the visible set changes, so the swap reads as the group
     re-forming rather than the images silently changing. Skipped on the first
     render — the scroll reveal below already owns that one. */
  const hasSwappedClientsRef = useRef(false);

  useEffect(() => {
    if (!hasSwappedClientsRef.current) {
      hasSwappedClientsRef.current = true;
      return;
    }

    const orbit = clientsOrbitRef.current;

    if (!orbit) return;

    /* Rise, rather than a pop in place: the new set drifts up from just below
       its resting position, which reads as the board refilling instead of the
       images blinking over.

       No overshoot and only a slight scale change — this fires on every press
       and repeats, so anything springy gets tiring and reads as a snap. */
    playPopIn(
      orbit.querySelectorAll(".RS_ClientBubble"),
      {
        rise: 26,
        scaleFrom: 0.9,
        duration: 0.95,
      },
    );
  }, [clientPage]);

  /* Bubbles ease in radiating out from the middle of the orbit rather than
     running in DOM order — they are arranged around a centre, so a left-to-
     right cascade reads as arbitrary.

     No overshoot, and the scale starts close to 1. A `back` ease sends every
     bubble past its resting size and back again; across fifteen staggered
     elements that lands as a ripple of snaps rather than one settle. */
  useScrollReveal(clientsOrbitRef, {
    selector: ".RS_ClientBubble",
    direction: "up",
    distance: DISTANCE.sm,
    scaleFrom: 0.9,
    ease: "power3.out",
    staggerFrom: "center",
    stagger: STAGGER.tight,
    duration: DURATION.slow,
  });

  useScrollReveal(whyListRef, {
    selector: ".RS_WhyAdRSItem",
    direction: "right",
    distance: DISTANCE.base,
    stagger: STAGGER.base,
  });

  useEffect(() => {
    const gradients = [
      { a: "#00FFEB", b: "#0099FF" },
      { a: "#9038F5", b: "#21378F" },
      { a: "#DF0B0B", b: "#330000" },
    ];

    const stopTop = document.getElementById("badgeStopTop");
    const stopBottom = document.getElementById("badgeStopBot");

    if (!stopTop || !stopBottom) {
      return;
    }

    const hexToRgb = (hex: string) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];

    const interpolate = (start: number, end: number, progress: number) =>
      Math.round(start + (end - start) * progress);

    const rgbToHex = (red: number, green: number, blue: number) =>
      `#${[red, green, blue]
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("")}`;

    const mixColors = (
      firstColor: string,
      secondColor: string,
      progress: number,
    ) => {
      const [red1, green1, blue1] = hexToRgb(firstColor);
      const [red2, green2, blue2] = hexToRgb(secondColor);

      return rgbToHex(
        interpolate(red1, red2, progress),
        interpolate(green1, green2, progress),
        interpolate(blue1, blue2, progress),
      );
    };

    const stepDuration = 1000;
    let startTime: number | null = null;
    let animationFrame = 0;

    const animateGradient = (timestamp: number) => {
      if (startTime === null) {
        startTime = timestamp;
      }

      const elapsed =
        (timestamp - startTime) % (stepDuration * gradients.length);
      const currentIndex = Math.floor(elapsed / stepDuration);
      const progress = (elapsed % stepDuration) / stepDuration;
      const easedProgress =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      const currentGradient = gradients[currentIndex];
      const nextGradient = gradients[(currentIndex + 1) % gradients.length];

      stopTop.setAttribute(
        "stop-color",
        mixColors(currentGradient.a, nextGradient.a, easedProgress),
      );
      stopBottom.setAttribute(
        "stop-color",
        mixColors(currentGradient.b, nextGradient.b, easedProgress),
      );

      animationFrame = requestAnimationFrame(animateGradient);
    };

    animationFrame = requestAnimationFrame(animateGradient);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  /* Landing on /#our-roadshow-vehicles from another page (navbar "Vehicle"
     link, or a pasted URL). Two reasons the browser cannot do this itself:
     ScrollSmoother transforms #smooth-content so the native hash jump is
     measured against the wrong scrollport, and the grid only reaches its
     real height once the vehicles come back from the API — a scroll fired
     before that lands short. So wait for VehicleListing to report the fetch
     settled, give the cards a moment to lay out, then scroll. */
  useEffect(() => {
    if (!vehiclesReady) return;
    if (window.location.hash !== `#${HOME_VEHICLES_SECTION_ID}`) return;

    /* 250ms clears GlobalSmoothScroll's debounced ScrollTrigger.refresh()
       (150ms) that fires when the grid changes the page height. */
    const timerId = window.setTimeout(() => {
      scrollToSection(HOME_VEHICLES_SECTION_ID);
    }, 250);

    return () => window.clearTimeout(timerId);
  }, [vehiclesReady]);

  useEffect(() => {
    return () => {
      if (whyAnimationTimerRef.current) {
        clearTimeout(whyAnimationTimerRef.current);
      }
    };
  }, []);

  // The CSS animation drives the motion; this timer only clears the
  // outgoing layer once it has finished sliding off.
  const finishWhyImageAnimation = () => {
    if (whyAnimationTimerRef.current) {
      clearTimeout(whyAnimationTimerRef.current);
    }

    whyAnimationTimerRef.current = setTimeout(() => {
      setWhyExitIndex(null);
      setIsWhyAnimating(false);
    }, WHY_IMAGE_ANIMATION_MS);
  };

  const triggerWhyTransition = (
    nextIndex: number,
    direction: "forward" | "backward",
  ) => {
    if (isWhyAnimating || nextIndex === activeWhyIndex) {
      return;
    }

    setIsWhyFirstRender(false);

    if (activeWhyIndex >= 0) {
      setWhyExitIndex(activeWhyIndex);
      setWhyExitDirection(direction === "forward" ? "exit-left" : "exit-right");
    } else {
      setWhyExitIndex(null);
    }

    setWhyEnterFromLeft(direction === "backward");
    setActiveWhyIndex(nextIndex);
    setIsWhyAnimating(true);

    finishWhyImageAnimation();
  };

  const handleWhyPrevious = () => {
    if (isWhyAnimating || activeWhyIndex <= 0) {
      return;
    }

    triggerWhyTransition(activeWhyIndex - 1, "backward");
  };

  const handleWhyNext = () => {
    if (isWhyAnimating || activeWhyIndex >= whyAdinnWorksBest.length - 1) {
      return;
    }

    triggerWhyTransition(activeWhyIndex + 1, "forward");
  };

  const handleWhyItemClick = (index: number) => {
    if (isWhyAnimating) {
      return;
    }

    // Clicking the open capsule closes it and sends the vehicle out.
    if (index === activeWhyIndex) {
      setIsWhyFirstRender(false);
      setWhyExitIndex(activeWhyIndex);
      setWhyExitDirection("exit-left");
      setActiveWhyIndex(-1);
      setIsWhyAnimating(true);
      finishWhyImageAnimation();
      return;
    }

    const direction = index > activeWhyIndex ? "forward" : "backward";

    triggerWhyTransition(index, direction);
  };

  const getWhyImageClass = (index: number) => {
    if (index === whyExitIndex) {
      return whyExitDirection;
    }

    if (index === activeWhyIndex) {
      if (isWhyFirstRender) {
        return "enter-from-right";
      }

      return whyEnterFromLeft ? "enter-from-left" : "enter-from-right";
    }

    return "";
  };

  return (
    <>
    {/* OFFERS SECTION  */}
      <section className="OffersSection flex">
        <div className="OffersHeadingMain flex items-center justify-center gap-4">
          <div className="OffersHeading">Offers</div>

          <div className="OffersHeadImgContainer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="68"
              height="68"
              viewBox="0 0 68 68"
              fill="none"
              className="OffersBadgeText"
            >
              <path
                d="M66.5567 30.2726L64.0219 26.5066C63.8046 26.0721 63.7322 25.6375 63.7322 25.1306L64.0219 20.5679C64.1668 17.9607 62.7907 15.5708 60.4732 14.412L56.4175 12.3842C55.983 12.1669 55.6933 11.8772 55.476 11.4427L53.3758 7.24214C52.217 4.92461 49.7546 3.54858 47.2198 3.69342L42.6572 3.98312C42.2227 3.98312 41.7157 3.91069 41.3536 3.621L37.4428 1.0862C35.2701 -0.362251 32.518 -0.362251 30.2729 1.0862L26.5069 3.621C26 3.83827 25.5654 3.91069 25.0585 3.91069L20.4958 3.621C17.8886 3.54858 15.4987 4.92461 14.2675 7.24214L12.2396 11.2978C12.0224 11.7324 11.7327 12.022 11.2981 12.2393L7.24245 14.2672C4.92493 15.4259 3.54889 17.8883 3.69374 20.4231L3.98343 24.9857C3.98343 25.4203 3.91101 25.9272 3.62132 26.2893L1.08652 30.2002C-0.361938 32.3728 -0.361938 35.1973 1.08652 37.37L3.62132 41.136C3.83858 41.643 3.91101 42.0775 3.91101 42.5845L3.62132 47.1471C3.54889 49.7543 4.92493 52.1443 7.24245 53.3754L11.2981 55.4033C11.7327 55.6206 12.0224 55.9827 12.2396 56.3448L14.2675 60.4005C15.4262 62.718 17.8886 64.094 20.4234 63.9492L24.986 63.6595C25.4206 63.6595 25.9275 63.7319 26.2896 64.0216L30.0556 66.484C31.142 67.2082 32.3732 67.5703 33.6043 67.5703C34.8355 67.5703 36.0667 67.2082 37.1531 66.484L40.919 63.9492C41.2812 63.7319 41.7881 63.5871 42.2227 63.5871L46.7853 63.8768C49.3925 64.0216 51.7825 62.6456 52.9412 60.328L54.9691 56.2724C55.1863 55.8378 55.476 55.5481 55.9106 55.3309L59.9662 53.303C62.2838 52.1443 63.6598 49.6819 63.515 47.1471L63.3701 42.6569C63.3701 42.2223 63.4425 41.7154 63.7322 41.3533L66.1946 37.5149C68.0052 35.1973 68.0052 32.3728 66.5567 30.2726Z"
                fill="url(#badgeGrad)"
              />

              <defs>
                <linearGradient
                  id="badgeGrad"
                  x1="33.8009"
                  y1="0"
                  x2="33.8009"
                  y2="67.5703"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop id="badgeStopTop" stopColor="#00FFEB" />
                  <stop id="badgeStopBot" offset="1" stopColor="#0099FF" />
                </linearGradient>
              </defs>
            </svg>

            <span className="OffersBadgeContent">%</span>
          </div>
        </div>

        <div className="OffersStrip">
          <div className="OffersMarquee">
            {marqueeItems.map((city, index) => (
              <div
                key={`${city.name}-${index}`}
                className="OffersPill"
              >
                <img
                  src={city.icon}
                  alt={city.name}
                  className="OffersPillIcon"
                />

                <span className="OffersPillName">{city.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
{/* CTA BANNER FOR 250+ ROADSHOW VEHICLE 10L+ IMPRESSION HIGHLIGHTS ADDED  */}

<ImpactCtaBanner ctaHref="/roadshow/Contact" />
{/* RoadshowWebsiteAboutSection  */}
<RoadshowWebsiteAboutSection/>
{/* RoadshowWebsiteStreetVisibilitySection  */}
<RoadshowWebsiteStreetVisibilitySection/>


{/* OUR ROADSHOW VEHICLES LISTING SECTION  */}
      <div
        id="our-roadshow-vehicles"
        className="RS_OurRdwMainSection mx-auto px-20"
      >
        {/* The category-segregated grid — the very same component the
            dedicated /roadshow/vehicles page renders under its hero, so the
            two surfaces can never drift apart. This replaced the sliding
            carousel; `reveal` keeps the GSAP card stagger the section had
            before. Card click opens the spec popup, and "Book This Vehicle"
            still goes to /roadshow/VehicleDetails/[id] and on into the
            campaign request form — that flow is untouched.

            The heading is handed over as a prop rather than rendered above,
            so the category tabs can sit opposite it on the same row. The
            markup and its animations are unchanged — only its parent is. */}
        <VehicleListing
          layout="carousel"
          reveal
          onLoaded={() => setVehiclesReady(true)}
          heading={
            /* Line 1 is plain black text, so it can be split into words.
               Line 2 carries the gradient (.RS_OurRdwHeadingContent2) and must
               NOT be split — see RevealText for why. It wipes open instead,
               which also gives the two lines distinct movement rather than one
               flat effect. */
            <div className="RS_OurRdwHeading">
              <SplitHeading className="RS_OurRdwHeadingContent1">
                Our Roadshow
              </SplitHeading>
              <RevealText
                className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2"
                effect="wipe"
                delay={0.18}
              >
                Vehicles
              </RevealText>
            </div>
          }
        />
      </div>

      <div className="mx-auto px-30 RS_WhyAdRSSectionWrap">
        {/* Different character from the vehicles section: this one focuses in
            from a blur rather than splitting, so the two sections do not read
            as the same effect repeated. */}
        <div className="RS_OurRdwHeading">
          <RevealText
            className="RS_OurRdwHeadingContent1"
            effect="blur"
          >
            Why Adinn Roadshows
          </RevealText>
          <RevealText
            className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2"
            effect="wipe"
            delay={0.18}
          >
            Works Best
          </RevealText>
        </div>

        <div className="RS_WhyAdRSMain">
          <div className="RS_WhyAdRS_Left">
            <div className="RS_WhyAdRSNavRow">
              <button
                type="button"
                className="RS_WhyAdRSNavButton"
                onClick={handleWhyPrevious}
                disabled={isWhyAnimating || activeWhyIndex <= 0}
                aria-label="Previous feature"
              >
                <i
                  className="fa-solid fa-chevron-left"
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                className="RS_WhyAdRSNavButton"
                onClick={handleWhyNext}
                disabled={
                  isWhyAnimating ||
                  activeWhyIndex >= whyAdinnWorksBest.length - 1
                }
                aria-label="Next feature"
              >
                <i
                  className="fa-solid fa-chevron-right"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="RS_WhyAdRSList" ref={whyListRef}>
              {whyAdinnWorksBest.map((feature, index) => {
                const isActive = activeWhyIndex === index;

                return (
                  <button
                    key={feature.name}
                    type="button"
                    className={`RS_WhyAdRSItem ${isActive ? "active" : ""}`}
                    style={
                      {
                        "--collapsed-width": `${feature.collapsedWidth}px`,
                      } as React.CSSProperties
                    }
                    onClick={() => handleWhyItemClick(index)}
                    aria-expanded={isActive}
                    aria-controls={`why-adinn-description-${index}`}
                  >
                    <span className="RS_WhyAdRS_ItemInner">
                      <span
                        className="RS_WhyAdRSContentIcon"
                        aria-hidden="true"
                      >
                        <i className="fa-solid fa-plus" />
                      </span>

                      <span className="RS_WhyAdRS_ItemText">
                        <span className="RS_WhyAdRS_ItemName">
                          {feature.name}
                        </span>

                        <span
                          id={`why-adinn-description-${index}`}
                          className={`RS_WhyAdRS_CollapseWrapper ${
                            isActive ? "open" : ""
                          }`}
                        >
                          <span className="RS_WhyAdRS_ItemDesc">
                            {feature.description}
                          </span>
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="RS_WhyAdRS_Right" aria-live="polite">
            {whyAdinnWorksBest.map((feature, index) => (
              <div
                key={`${feature.name}-vehicle`}
                className={`RS_WhyAdRS_ImageLayer ${getWhyImageClass(index)}`}
              >
                <img
                  src={feature.image}
                  alt={`${feature.name} roadshow vehicle`}
                  draggable={false}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto px-30 RS_ClientsSectionWrap">
        <div className="RS_ClientsSection">
          <div className="RS_OurRdwHeading">
            <SplitHeading
              className="RS_OurRdwHeadingContent1"
              type="chars"
            >
              Some of Our
            </SplitHeading>
            <RevealText
              className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2"
              effect="wipe"
              delay={0.25}
            >
              Clients
            </RevealText>
          </div>

          <div className="RS_ClientsOrbitArea" ref={clientsOrbitRef}>
            <div className="RS_ClientCenterBubble">
              <span>Clients</span>
            </div>

            {visibleClients.map((client) => (
              /* Keyed by SLOT, not by client: the slot is the stable thing on
                 screen (its position comes from .RS_Bubble_<n>). Keying by the
                 client name would remount every bubble on each swap, throwing
                 away the elements the pop animation is running on.

                 Reveal handled by useScrollReveal on .RS_ClientsOrbitArea. Safe
                 to animate `transform` on these: .RS_ClientBubble positions
                 itself with top/left, and only .RS_ClientLogo inside it uses a
                 transform (the -50%/-50% centring), which is untouched. */
              /* Widths are a share of the bubble, so a logo keeps the same
                 visual weight in whichever slot it lands in. */
              <div
                key={client.slot}
                className={`RS_ClientBubble RS_Bubble_${client.slot}`}
              >
                <img
                  src={client.logo}
                  alt={client.name}
                  className="RS_ClientLogo"
                  /* Fed in as a custom property rather than `width` directly so
                     the stylesheet can multiply it by --rs-orbit-f. An inline
                     `width` would beat every breakpoint rule and leave logos at
                     full size while their discs shrank. */
                  style={
                    {
                      "--rs-logo-w": `${client.w}px`,
                    } as React.CSSProperties
                  }
                />
              </div>
            ))}
          </div>

          <div className="RS_ClientsBtnRow">
            {/* Not "View All Clients": the button does not open a full list,
                it rotates the board to the next set of brands. Labelling it
                "all" promised a page that does not exist. */}
            <ViewAllClientsButton
              label="Explore More Brands"
              className="RS_ViewAllClientsBtn"
              onClick={showMoreClients}
              /* Nothing to swap to when there is only one logo. */
              disabled={ourClients.length <= 1}
            />
          </div>
        </div>
      </div>

      <HomePageSection2 />
    </>
  );
}
