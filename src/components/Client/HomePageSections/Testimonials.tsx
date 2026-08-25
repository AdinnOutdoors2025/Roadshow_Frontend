"use client";

import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import { Star } from "lucide-react";

import "./HomePageSection1.css";
import "./Testimonials.css";

import SplitHeading from "@/components/motion/SplitHeading";
import RevealText from "@/components/motion/RevealText";

type TestimonialItem = {
  q: string;
  n: string;
  role: string;
  c: string;
  avatar: string;
};

type LedLayout = {
  width: string;
  height: string;
  left: string;
  top: string;
};

const items: TestimonialItem[] = [
  {
    q: "ADINN executed our product launch roadshow across three cities flawlessly. The GPS tracking gave us complete confidence.",
    n: "Aishwarya R.",
    role: "Marketing Lead, Consumer Goods",
    c: "Product Launch",
    avatar: "/assets/girl-1.png",
  },
  {
    q: "Premium fleet, professional crew and on-time execution. Our retail footfall improved significantly during the campaign weeks.",
    n: "Karthik S.",
    role: "Brand Manager, Retail Chain",
    c: "Retail Promotion",
    avatar: "/assets/boy-1.png",
  },
  {
    q: "A genuinely corporate partner. Route planning, branding and reporting were handled end-to-end without us chasing anything.",
    n: "Meera P.",
    role: "Director, Real Estate Group",
    c: "Real Estate",
    avatar: "/assets/girl-2.png",
  },
  {
    q: "Excellent coordination across cities with real-time tracking and detailed reports. Great experience working with the ADINN team.",
    n: "Rohit M.",
    role: "Marketing Head, FMCG",
    c: "Brand Activation",
    avatar: "/assets/boy-2.png",
  },
  {
    q: "From permissions to execution, everything was handled professionally. Highly recommended for roadshows.",
    n: "Sneha T.",
    role: "Sr. Manager, Automobile",
    c: "Product Promo",
    avatar: "/assets/girl-3.png",
  },
  {
    q: "The LED vehicle helped us create strong visibility in high-footfall locations. The complete execution was very clean.",
    n: "Arjun V.",
    role: "Regional Manager, Retail",
    c: "LED Roadshow",
    avatar: "/assets/boy-3.png",
  },
];

const AUTO_CHANGE_TIME = 2000;

/* ============================================================
   ============================================================
   LED SCREEN ADJUSTMENT AREA
   ============================================================
   ============================================================

   THIS IS THE ONLY PLACE YOU NEED TO CHANGE.

   width  = LED width
   height = LED height

   left:
   increase = move RIGHT
   decrease = move LEFT

   top:
   increase = move DOWN
   decrease = move UP

============================================================ */


/* ============================================================
   DESKTOP
   1101px AND ABOVE

   IMPORTANT:
   THESE ARE YOUR ORIGINAL VALUES.
   DON'T CHANGE THESE.
============================================================ */

const DESKTOP_LED_LAYOUT: LedLayout = {
  width: "85.5%",
  height: "86%",
  left: "4%",
  top: "17.5%",
};


/* ============================================================
   TABLET
   768px - 1100px

   ✅ ADJUST TABLET LED HERE
============================================================ */

const TABLET_LED_LAYOUT: LedLayout = {
  width: "97%",
  height: "100%",
  left: "0%",
  top: "7%",
};


/* ============================================================
   MOBILE
   BELOW 768px

   ✅ ADJUST MOBILE LED HERE
============================================================ */

const MOBILE_LED_LAYOUT: LedLayout = {
  width: "69%",
  height: "54%",
  left: "27.5%",
  top: "17.5%",
};


/* ============================================================
   END OF LED ADJUSTMENT AREA
   YOU DON'T NEED TO CHANGE ANYTHING BELOW THIS
============================================================ */


function getNextIndex(index: number) {
  return (index + 1) % items.length;
}


/* ============================================================
   RESPONSIVE LED BREAKPOINT
============================================================ */

function getLedLayout(viewportWidth: number): LedLayout {
  /*
   * MOBILE
   */
  if (viewportWidth < 768) {
    return MOBILE_LED_LAYOUT;
  }

  /*
   * TABLET
   *
   * Includes:
   * 768
   * 800
   * 820
   * 834
   * 900
   * 1024
   * 1080
   */
  if (viewportWidth <= 1100) {
    return TABLET_LED_LAYOUT;
  }

  /*
   * DESKTOP
   *
   * No change to existing desktop LED values.
   */
  return DESKTOP_LED_LAYOUT;
}


/* ============================================================
   LED CONTENT ANIMATION
============================================================ */

const screenVariants: Variants = {
  enter: {
    opacity: 0,
    x: 34,
    scale: 0.985,
    filter: "blur(10px)",
  },

  center: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",

    transition: {
      duration: 0.58,
      ease: [0.22, 1, 0.36, 1],
      when: "beforeChildren",
      staggerChildren: 0.055,
    },
  },

  exit: {
    opacity: 0,
    x: -28,
    scale: 0.99,
    filter: "blur(8px)",

    transition: {
      duration: 0.32,
      ease: [0.4, 0, 1, 1],
    },
  },
};


const childVariants: Variants = {
  enter: {
    opacity: 0,
    y: 12,
  },

  center: {
    opacity: 1,
    y: 0,

    transition: {
      duration: 0.46,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,
    y: -8,

    transition: {
      duration: 0.22,
    },
  },
};


export function Testimonials() {
  const shouldReduceMotion = useReducedMotion();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [videoReady, setVideoReady] = useState(false);

  const ledScreenRef = useRef<HTMLDivElement>(null);

  const selectedItem = items[selectedIndex];


  /* ============================================================
     RESPONSIVE LED POSITION + SIZE

     ONLY THE LED OVERLAY IS CHANGED.

     Truck
     Heading
     Section
     Video
     Dots
     Desktop layout

     ARE NOT CHANGED.
  ============================================================ */

  useEffect(() => {
    const ledScreen = ledScreenRef.current;

    if (!ledScreen) return;

    const applyLedLayout = () => {
      const viewportWidth = window.innerWidth;

      const layout = getLedLayout(viewportWidth);

      /*
       * !important is intentional.
       *
       * Your existing CSS can contain responsive
       * !important rules for this LED screen.
       *
       * This guarantees these exact LED values win
       * without changing any other section.
       */

      ledScreen.style.setProperty(
        "width",
        layout.width,
        "important"
      );

      ledScreen.style.setProperty(
        "height",
        layout.height,
        "important"
      );

      ledScreen.style.setProperty(
        "left",
        layout.left,
        "important"
      );

      ledScreen.style.setProperty(
        "top",
        layout.top,
        "important"
      );

      ledScreen.style.setProperty(
        "right",
        "auto",
        "important"
      );

      ledScreen.style.setProperty(
        "bottom",
        "auto",
        "important"
      );

      ledScreen.style.setProperty(
        "min-width",
        "0",
        "important"
      );

      ledScreen.style.setProperty(
        "min-height",
        "0",
        "important"
      );

      ledScreen.style.setProperty(
        "max-width",
        "none",
        "important"
      );

      ledScreen.style.setProperty(
        "max-height",
        "none",
        "important"
      );
    };


    /* Apply when page loads */
    applyLedLayout();


    /* Apply when browser/tablet size changes */
    window.addEventListener(
      "resize",
      applyLedLayout
    );


    /* Apply when tablet/mobile rotates */
    window.addEventListener(
      "orientationchange",
      applyLedLayout
    );


    return () => {
      window.removeEventListener(
        "resize",
        applyLedLayout
      );

      window.removeEventListener(
        "orientationchange",
        applyLedLayout
      );
    };
  }, []);


  /* ============================================================
     TESTIMONIAL AUTOPLAY
  ============================================================ */

  useEffect(() => {
    if (shouldReduceMotion || isPaused) return;

    const timer = window.setInterval(() => {
      setSelectedIndex((prev) => getNextIndex(prev));
    }, AUTO_CHANGE_TIME);

    return () => window.clearInterval(timer);
  }, [shouldReduceMotion, isPaused]);


  return (
    <section
      className="adinn-testimonial-section"
      id="testimonials"
    >
      <div className="adinn-testimonial-bg-layer" />

      <div className="adinn-testimonial-shell">
        <div className="adinn-testimonial-container">

          {/* ==================================================
              HEADING
          ================================================== */}

          <div className="adinn-testimonial-heading">
            <div className="RS_OurRdwHeading">

              <SplitHeading className="RS_OurRdwHeadingContent1">
                Trusted by Brands Across
              </SplitHeading>

              <RevealText
                className="
                  RS_OurRdwHeadingContent1
                  RS_OurRdwHeadingContent2
                "
                effect="wipe"
                delay={0.18}
              >
                Industries
              </RevealText>

            </div>
          </div>


          {/* ==================================================
              VEHICLE / TESTIMONIAL AREA
          ================================================== */}

          <motion.div
            className="adinn-testimonial-hero"

            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}

            initial={{
              opacity: 0,
              y: 34,
            }}

            whileInView={{
              opacity: 1,
              y: 0,
            }}

            viewport={{
              once: true,
              margin: "-80px",
            }}

            transition={{
              duration: 0.72,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1,
            }}
          >

            {/* ==================================================
                BACKGROUND VIDEO
            ================================================== */}

            <video
              className={`adinn-testimonial-bg-video ${
                videoReady ? "" : "adinn-testimonial-bg-video--loading"
              }`}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              aria-hidden="true"
              onCanPlay={() => setVideoReady(true)}
            >
              <source
                src="./images/assets/Rdsw_Testimonials_BgVideoCopy.mp4"
                type="video/webm"
              />
            </video>


            {/* ==================================================
                TRUCK STAGE
            ================================================== */}

            <div className="adinn-testimonial-truck-stage">


              {/* =================================================
                  LED SCREEN

                  ONLY THIS ELEMENT GETS RESPONSIVE POSITION/SIZE.
              ================================================= */}

              <div
                ref={ledScreenRef}
                className="adinn-led-screen-overlay"
                aria-live="polite"
              >

                {/* ==============================================
                    LED PROGRESS
                ============================================== */}

                {!shouldReduceMotion && !isPaused && (
                  <motion.div
                    key={`progress-${selectedIndex}`}
                    className="adinn-led-progress"

                    initial={{
                      scaleX: 0,
                    }}

                    animate={{
                      scaleX: 1,
                    }}

                    transition={{
                      duration: AUTO_CHANGE_TIME / 1000,
                      ease: "linear",
                    }}
                  />
                )}


                {/* ==============================================
                    TESTIMONIAL CONTENT
                ============================================== */}

                <AnimatePresence
                  mode="wait"
                  initial={false}
                >

                  <motion.div
                    key={selectedItem.n}
                    className="adinn-led-screen-content"

                    variants={screenVariants}

                    initial={
                      shouldReduceMotion
                        ? false
                        : "enter"
                    }

                    animate="center"

                    exit="exit"
                  >

                    <div className="adinn-led-screen-inner">


                      {/* ==========================================
                          CATEGORY TAG
                      ========================================== */}

                      <motion.div
                        className="adinn-led-screen-tag"
                        variants={childVariants}
                      >
                        {selectedItem.c}
                      </motion.div>


                      {/* ==========================================
                          QUOTE
                      ========================================== */}

                      <motion.p
                        className="adinn-led-screen-quote"
                        variants={childVariants}
                      >
                        “{selectedItem.q}”
                      </motion.p>


                      {/* ==========================================
                          BOTTOM INFORMATION
                      ========================================== */}

                      <motion.div
                        className="adinn-led-screen-bottom"
                        variants={childVariants}
                      >

                        <div>


                          {/* ======================================
                              STARS
                          ====================================== */}

                          <div className="adinn-led-screen-stars">

                            {Array.from({
                              length: 5,
                            }).map(
                              (_, starIndex) => (

                                <motion.span
                                  key={starIndex}

                                  initial={
                                    shouldReduceMotion
                                      ? false
                                      : {
                                          opacity: 0,
                                          scale: 0.45,
                                          y: 6,
                                        }
                                  }

                                  animate={{
                                    opacity: 1,
                                    scale: 1,
                                    y: 0,
                                  }}

                                  transition={{
                                    duration: 0.34,

                                    delay:
                                      0.16 +
                                      starIndex * 0.045,

                                    ease: [
                                      0.22,
                                      1,
                                      0.36,
                                      1,
                                    ],
                                  }}
                                >

                                  <Star
                                    size={18}
                                    fill="currentColor"
                                  />

                                </motion.span>
                              )
                            )}

                          </div>


                          {/* ======================================
                              NAME
                          ====================================== */}

                          <strong>
                            {selectedItem.n}
                          </strong>


                          {/* ======================================
                              ROLE
                          ====================================== */}

                          <span>
                            {selectedItem.role}
                          </span>

                        </div>


                        {/* ========================================
                            LIVE LED BADGE
                        ======================================== */}

                        <motion.div
                          className="adinn-led-live-badge"

                          initial={
                            shouldReduceMotion
                              ? false
                              : {
                                  opacity: 0,
                                  scale: 0.92,
                                }
                          }

                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}

                          transition={{
                            delay: 0.28,
                            duration: 0.34,
                          }}
                        >
                          LIVE LED DISPLAY
                        </motion.div>

                      </motion.div>

                    </div>

                  </motion.div>

                </AnimatePresence>

              </div>

            </div>

          </motion.div>


          <div
            className="adinn-testimonial-carousel"
            aria-hidden="true"
          />


          {/* ==================================================
              SLIDER DOTS
          ================================================== */}

          <div
            className="adinn-testimonial-dots"
            aria-label="Testimonials"
          >

            {items.map((item, index) => (

              <button
                key={item.n}
                type="button"

                className={
                  selectedIndex === index
                    ? "active"
                    : ""
                }

                onClick={() =>
                  setSelectedIndex(index)
                }

                aria-label={`Show testimonial ${
                  index + 1
                }`}
              />

            ))}

          </div>

        </div>
      </div>
    </section>
  );
}