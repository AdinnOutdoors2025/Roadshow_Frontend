/* eslint-disable */
// @ts-nocheck
"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import gsap from "gsap";

import "./HomePageSection1.css";
import HomePageSection2 from "./HomePageSection2";
import {
  ButtonHover as ViewlAllClientsButton,
} from "../Reusable_Components/ButtonHover";
import {
  ButtonHover as VehicleBookNowButton,
} from "../Reusable_Components/ButtonHover";

export default function HomePageSection1() {
  /* =========================================================
     OFFERS
  ========================================================= */

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

    const interpolate = (
      start: number,
      end: number,
      progress: number,
    ) => Math.round(start + (end - start) * progress);

    const rgbToHex = (
      red: number,
      green: number,
      blue: number,
    ) =>
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
    let animationFrame: number;

    const animateGradient = (timestamp: number) => {
      if (!startTime) {
        startTime = timestamp;
      }

      const elapsed =
        (timestamp - startTime) %
        (stepDuration * gradients.length);

      const currentIndex = Math.floor(
        elapsed / stepDuration,
      );

      const progress =
        (elapsed % stepDuration) / stepDuration;

      const easedProgress =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;

      const currentGradient = gradients[currentIndex];

      const nextGradient =
        gradients[
          (currentIndex + 1) % gradients.length
        ];

      stopTop.setAttribute(
        "stop-color",
        mixColors(
          currentGradient.a,
          nextGradient.a,
          easedProgress,
        ),
      );

      stopBottom.setAttribute(
        "stop-color",
        mixColors(
          currentGradient.b,
          nextGradient.b,
          easedProgress,
        ),
      );

      animationFrame =
        requestAnimationFrame(animateGradient);
    };

    animationFrame =
      requestAnimationFrame(animateGradient);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, []);

  /* =========================================================
     ROADSHOW VEHICLES
  ========================================================= */

  const ourRoadshowVehicles = [
    {
      name: "19 Feet Single Side LED",
      image: "./images/assets/BannerSubImg1.png",
      rate: 25000,
      rating: "4.3",
    },
    {
      name: "19 Feet Triple Side LED",
      image: "./images/assets/BannerSubImg2.png",
      rate: 26000,
      rating: "4.4",
    },
    {
      name: "Fabricated LED",
      image: "./images/assets/BannerSubImg3.png",
      rate: 27000,
      rating: "4.5",
    },
    {
      name: "L - Type Vehicle",
      image: "./images/assets/BannerSubImg4.png",
      rate: 28000,
      rating: "4.2",
    },
    {
      name: "L - Type Vehicle",
      image: "./images/assets/BannerSubImg4.png",
      rate: 28000,
      rating: "4.2",
    },
    {
      name: "L - Type Vehicle",
      image: "./images/assets/BannerSubImg4.png",
      rate: 28000,
      rating: "4.2",
    },
  ];

  const [currentVehicleIndex, setCurrentVehicleIndex] =
    useState(0);

  const [visibleVehicleCount, setVisibleVehicleCount] =
    useState(4);

  useEffect(() => {
    const updateVisibleVehicleCount = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setVisibleVehicleCount(1);
      } else if (width < 768) {
        setVisibleVehicleCount(2);
      } else if (width < 1024) {
        setVisibleVehicleCount(3);
      } else {
        setVisibleVehicleCount(4);
      }
    };

    updateVisibleVehicleCount();

    window.addEventListener(
      "resize",
      updateVisibleVehicleCount,
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateVisibleVehicleCount,
      );
    };
  }, []);

  /* =========================================================
     WHY ADINN ROADSHOWS
  ========================================================= */

  const whyAdinnWorksBest = [
    {
      name: "GPS Support",
      description:
        "Live location tracking for vehicles with route visibility and movement updates throughout the campaign.",
      image:
        "./images/assets/HomeBanner_MainPageFinal.png",

      // Reduced right-side empty space
      collapsedWidth: 208,
    },
    {
      name: "RTO Certified",
      description:
        "Fully approved vehicles complying with road regulations for smooth and hassle-free campaign execution.",
      image: "./images/assets/tata ultra - 2.png",

      collapsedWidth: 218,
    },
    {
      name: "One-Stop Solution",
      description:
        "From planning to execution, everything is managed in one place for a roadshow campaign.",
      image: "./images/assets/full side LED.png",

      collapsedWidth: 266,
    },
    {
      name: "24/7 Support",
      description:
        "Dedicated team available anytime to monitor, coordinate, and assist throughout the campaign.",
      image:
        "./images/assets/HomeBanner_MainPageFinal.png",

      collapsedWidth: 208,
    },
  ];

  const [activeWhyIndex, setActiveWhyIndex] =
    useState<number | null>(0);

  const whySectionRef =
    useRef<HTMLDivElement | null>(null);

  const whyVehicleRefs = useRef<
    Array<HTMLDivElement | null>
  >([]);

  const whyTimelineRef =
    useRef<gsap.core.Timeline | null>(null);

  const displayedWhyVehicleIndexRef = useRef(0);

  useLayoutEffect(() => {
    const section = whySectionRef.current;

    if (!section) {
      return;
    }

    const context = gsap.context(() => {
      whyVehicleRefs.current.forEach(
        (vehicle, index) => {
          if (!vehicle) {
            return;
          }

          gsap.set(vehicle, {
            visibility:
              index === 0 ? "visible" : "hidden",
            xPercent: index === 0 ? 0 : 105,
            scale: index === 0 ? 1 : 0.42,
            zIndex: index === 0 ? 2 : 1,
            transformOrigin: "52% 68%",
            force3D: true,
          });
        },
      );
    }, section);

    return () => {
      whyTimelineRef.current?.kill();
      context.revert();
    };
  }, []);

  const showWhyVehicleImmediately = (
    nextIndex: number,
  ) => {
    whyTimelineRef.current?.kill();

    whyVehicleRefs.current.forEach(
      (vehicle, index) => {
        if (!vehicle) {
          return;
        }

        gsap.set(vehicle, {
          visibility:
            index === nextIndex
              ? "visible"
              : "hidden",
          xPercent:
            index === nextIndex ? 0 : 105,
          scale:
            index === nextIndex ? 1 : 0.42,
          zIndex:
            index === nextIndex ? 2 : 1,
        });
      },
    );

    displayedWhyVehicleIndexRef.current =
      nextIndex;
  };

  const animateWhyVehicle = (
    nextIndex: number,
  ) => {
    const currentIndex =
      displayedWhyVehicleIndexRef.current;

    if (currentIndex === nextIndex) {
      return;
    }

    const currentVehicle =
      whyVehicleRefs.current[currentIndex];

    const nextVehicle =
      whyVehicleRefs.current[nextIndex];

    if (!currentVehicle || !nextVehicle) {
      showWhyVehicleImmediately(nextIndex);
      return;
    }

    const prefersReducedMotion =
      window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

    if (prefersReducedMotion) {
      showWhyVehicleImmediately(nextIndex);
      return;
    }

    /*
      Do not block new clicks.

      When another button is clicked, kill the current timeline
      immediately and start the new animation from the current
      on-screen position.
    */
    whyTimelineRef.current?.kill();

    const allVehicles =
      whyVehicleRefs.current.filter(Boolean);

    gsap.killTweensOf(allVehicles);

    /*
      Hide vehicle layers that are unrelated to the new
      transition. Keep only current and next vehicle visible.
    */
    whyVehicleRefs.current.forEach(
      (vehicle, index) => {
        if (!vehicle) {
          return;
        }

        if (
          index !== currentIndex &&
          index !== nextIndex
        ) {
          gsap.set(vehicle, {
            visibility: "hidden",
            xPercent: 105,
            scale: 0.42,
            zIndex: 1,
          });
        }
      },
    );

    /*
      Keep the outgoing vehicle at its current interrupted
      position instead of resetting it. This prevents jerks.
    */
    gsap.set(currentVehicle, {
      visibility: "visible",
      zIndex: 2,
      force3D: true,
    });

    const nextVehicleIsAlreadyVisible =
      window.getComputedStyle(nextVehicle)
        .visibility !== "hidden";

    /*
      If this vehicle is already visible from an interrupted
      transition, continue from that position.

      Otherwise, start it smaller from the right side.
    */
    if (nextVehicleIsAlreadyVisible) {
      gsap.set(nextVehicle, {
        visibility: "visible",
        zIndex: 3,
        force3D: true,
      });
    } else {
      gsap.set(nextVehicle, {
        visibility: "visible",
        xPercent: 105,
        scale: 0.42,
        zIndex: 3,
        force3D: true,
      });
    }

    displayedWhyVehicleIndexRef.current =
      nextIndex;

    whyTimelineRef.current = gsap.timeline({
      defaults: {
        overwrite: "auto",
      },

      onComplete: () => {
        whyVehicleRefs.current.forEach(
          (vehicle, index) => {
            if (!vehicle) {
              return;
            }

            gsap.set(vehicle, {
              visibility:
                index === nextIndex
                  ? "visible"
                  : "hidden",
              xPercent:
                index === nextIndex ? 0 : 105,
              scale:
                index === nextIndex ? 1 : 0.42,
              zIndex:
                index === nextIndex ? 2 : 1,
            });
          },
        );
      },
    });

    whyTimelineRef.current
      .to(
        currentVehicle,
        {
          xPercent: -118,
          scale: 0.24,
          duration: 0.82,
          ease: "power3.inOut",
          force3D: true,
        },
        0,
      )
      .to(
        nextVehicle,
        {
          xPercent: 0,
          scale: 1,
          duration: 0.92,
          ease: "power3.out",
          force3D: true,
        },
        0.04,
      );
  };

  const handleWhyItemClick = (
    index: number,
  ) => {
    /*
      Clicking remains active even while GSAP is animating.
    */
    if (activeWhyIndex === index) {
      setActiveWhyIndex(null);
      return;
    }

    setActiveWhyIndex(index);
    animateWhyVehicle(index);
  };

  const handleWhyPrevious = () => {
    const currentIndex =
      displayedWhyVehicleIndexRef.current;

    /*
      Wrap from first item to last item.
      Arrow is always immediately clickable.
    */
    const previousIndex =
      (currentIndex -
        1 +
        whyAdinnWorksBest.length) %
      whyAdinnWorksBest.length;

    setActiveWhyIndex(previousIndex);
    animateWhyVehicle(previousIndex);
  };

  const handleWhyNext = () => {
    const currentIndex =
      displayedWhyVehicleIndexRef.current;

    /*
      Wrap from last item to first item.
      Arrow is always immediately clickable.
    */
    const nextIndex =
      (currentIndex + 1) %
      whyAdinnWorksBest.length;

    setActiveWhyIndex(nextIndex);
    animateWhyVehicle(nextIndex);
  };

  /* =========================================================
     CLIENTS
  ========================================================= */

  const ourClients = [
    {
      name: "Philips",
      logo:
        "./images/assets/RS_Client_philips_logo.png",
      size: "text",
    },
    {
      name: "Kelloggs",
      logo:
        "./images/assets/RS_Client_kelloggs_logo.png",
      size: "text-lg",
    },
    {
      name: "Kelloggs",
      logo:
        "./images/assets/RS_Client_kelloggs_logo.png",
      size: "text-lg",
    },
    {
      name: "Thangamayil",
      logo:
        "./images/assets/RS_Client_Thangamayil.png",
      size: "text",
    },
    {
      name: "Kelloggs",
      logo:
        "./images/assets/RS_Client_kelloggs_logo.png",
      size: "text-lg",
    },
    {
      name: "Thangamayil",
      logo:
        "./images/assets/RS_Client_Thangamayil.png",
      size: "text",
    },
    {
      name: "Airtel",
      logo:
        "./images/assets/RS_Client_Bharti_Airtel_Logo.png",
      size: "md",
    },
    {
      name: "Philips",
      logo:
        "./images/assets/RS_Client_philips_logo.png",
      size: "text",
    },
    {
      name: "Airtel",
      logo:
        "./images/assets/RS_Client_Bharti_Airtel_Logo.png",
      size: "md",
    },
    {
      name: "Kelloggs",
      logo:
        "./images/assets/RS_Client_kelloggs_logo.png",
      size: "text-lg",
    },
  ];

  return (
    <>
      {/* =====================================================
          OFFERS
      ===================================================== */}

      <section className="OffersSection flex">
        <div className="OffersHeadingMain flex items-center justify-center gap-4">
          <div className="OffersHeading">
            Offers
          </div>

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
                  <stop
                    id="badgeStopTop"
                    stopColor="#00FFEB"
                  />

                  <stop
                    id="badgeStopBot"
                    offset="1"
                    stopColor="#0099FF"
                  />
                </linearGradient>
              </defs>
            </svg>

            <span className="OffersBadgeContent">
              %
            </span>
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

                <span className="OffersPillName">
                  {city.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          ROADSHOW VEHICLES
      ===================================================== */}

      <div className="RS_OurRdwMainSection mx-auto px-20">
        <div className="RS_OurRdwHeading">
          <div className="RS_OurRdwHeadingContent1">
            Our Roadshow
          </div>

          <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2">
            Vehicles
          </div>
        </div>

        <div className="RS_CarouselWrapper">
          <div
            className="RS_OurRdwVehicleList"
            style={{
              transform: `translateX(-${
                currentVehicleIndex *
                (100 / visibleVehicleCount)
              }%)`,
            }}
          >
            {ourRoadshowVehicles.map(
              (vehicle, index) => (
                <div
                  key={`${vehicle.name}-${index}`}
                  className="RS_VehicleCardMain RS_VehicleCardFlex"
                >
                  <div>
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="RS_VehicleImg"
                    />
                  </div>

                  <div className="RS_VehicleDetailsMain">
                    <div className="RS_VehicleName">
                      {vehicle.name}
                    </div>

                    <div className="RS_VehicleRate">
                      ₹
                      {vehicle.rate.toLocaleString()}
                      /Per Day
                    </div>

                    <div className="RS_VehicleRatingMain flex items-center gap-1">
                      <div className="RS_VehicleRatingValue">
                        {vehicle.rating}
                      </div>

                      <img
                        src="./images/assets/RS_VehicleRateStar.svg"
                        className="RS_VehicleRatingImg"
                        alt="Rating"
                      />
                    </div>

                    <VehicleBookNowButton
                      label="Book Now"
                      className="RS_VehicleButton"
                    />
                  </div>
                </div>
              ),
            )}
          </div>

          <div className="RS_CarouselNavRow">
            <button
              type="button"
              className="RS_CarouselBtn"
              onClick={() =>
                setCurrentVehicleIndex(
                  (previous) =>
                    Math.max(previous - 1, 0),
                )
              }
              disabled={currentVehicleIndex === 0}
              aria-label="Previous vehicle"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>

            <button
              type="button"
              className="RS_CarouselBtn"
              onClick={() =>
                setCurrentVehicleIndex(
                  (previous) =>
                    Math.min(
                      previous + 1,
                      ourRoadshowVehicles.length -
                        visibleVehicleCount,
                    ),
                )
              }
              disabled={
                currentVehicleIndex >=
                ourRoadshowVehicles.length -
                  visibleVehicleCount
              }
              aria-label="Next vehicle"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          WHY ADINN ROADSHOWS
      ===================================================== */}

      <div className="mx-auto px-30">
        <div className="RS_OurRdwHeading">
          <div className="RS_OurRdwHeadingContent1">
            Why Adinn Roadshows
          </div>

          <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2">
            Works Best
          </div>
        </div>

        <div
          ref={whySectionRef}
          className="RS_WhyAdRSMain"
        >
          <div className="RS_WhyAdRS_Left">
            <div className="RS_WhyAdRSNavRow">
              <button
                type="button"
                className="RS_WhyAdRSNavButton"
                onClick={handleWhyPrevious}
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
                aria-label="Next feature"
              >
                <i
                  className="fa-solid fa-chevron-right"
                  aria-hidden="true"
                />
              </button>
            </div>

            <div className="RS_WhyAdRSList">
              {whyAdinnWorksBest.map(
                (feature, index) => {
                  const isActive =
                    activeWhyIndex === index;

                  return (
                    <button
                      key={feature.name}
                      type="button"
                      className={`RS_WhyAdRSItem ${
                        isActive ? "active" : ""
                      }`}
                      style={
                        {
                          "--collapsed-width": `${feature.collapsedWidth}px`,
                        } as React.CSSProperties
                      }
                      onClick={() =>
                        handleWhyItemClick(index)
                      }
                      aria-expanded={isActive}
                      aria-controls={`why-adinn-description-${index}`}
                    >
                      <span className="RS_WhyAdRSItemHeader">
                        <span
                          className="RS_WhyAdRSContentIcon"
                          aria-hidden="true"
                        >
                          <span
                            className={`RS_WhyAdRSIconMark ${
                              isActive
                                ? "is-open"
                                : ""
                            }`}
                          />
                        </span>

                        <span className="RS_WhyAdRS_ItemName">
                          {feature.name}
                        </span>
                      </span>

                      <span
                        id={`why-adinn-description-${index}`}
                        className="RS_WhyAdRS_CollapseWrapper"
                      >
                        <span className="RS_WhyAdRS_ItemDesc">
                          {feature.description}
                        </span>
                      </span>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          <div
            className="RS_WhyAdRS_Right"
            aria-live="polite"
          >
            {whyAdinnWorksBest.map(
              (feature, index) => (
                <div
                  key={`${feature.name}-vehicle`}
                  ref={(element) => {
                    whyVehicleRefs.current[index] =
                      element;
                  }}
                  className="RS_WhyAdRS_ImageLayer"
                  style={{
                    visibility:
                      index === 0
                        ? "visible"
                        : "hidden",
                  }}
                >
                  <img
                    src={feature.image}
                    alt={`${feature.name} roadshow vehicle`}
                    draggable={false}
                  />
                </div>
              ),
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          CLIENTS
      ===================================================== */}

      <div className="mx-auto px-30">
        <div className="RS_ClientsSection">
          <div className="RS_OurRdwHeading">
            <div className="RS_OurRdwHeadingContent1">
              Some of Our
            </div>

            <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2">
              Clients
            </div>
          </div>

          <div className="RS_ClientsOrbitArea">
            <div className="RS_ClientCenterBubble">
              <span>Clients</span>
            </div>

            {ourClients.map(
              (client, index) => (
                <div
                  key={`${client.name}-${index}`}
                  className={`RS_ClientBubble RS_Bubble_${index} ${
                    client.size === "text"
                      ? "RS_TextLogo"
                      : ""
                  } ${
                    client.size === "text-lg"
                      ? "RS_TextLgLogo"
                      : ""
                  }`}
                >
                  <img
                    src={client.logo}
                    alt={client.name}
                    className="RS_ClientLogo"
                  />
                </div>
              ),
            )}
          </div>

          <div className="RS_ClientsBtnRow">
            <ViewlAllClientsButton
              label="View All Clients"
              className="RS_ViewAllClientsBtn"
            />
          </div>
        </div>
      </div>

      <HomePageSection2 />
    </>
  );
}