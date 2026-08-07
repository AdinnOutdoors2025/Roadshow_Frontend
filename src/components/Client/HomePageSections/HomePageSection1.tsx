/* eslint-disable */
// @ts-nocheck
"use client";

import React, {
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import "./HomePageSection1.css";
import HomePageSection2 from "./HomePageSection2";
import {
  ButtonHover as ViewAllClientsButton,
} from "../Reusable_Components/ButtonHover";
import {
  ButtonHover as VehicleBookNowButton,
} from "../Reusable_Components/ButtonHover";
import {
  FALLBACK_VEHICLE_IMAGE,
  fetchAllRoadshowVehicles,
  type RoadshowVehicle,
} from "@/lib/roadshowVehicles";

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

const ourClients = [
  {
    name: "Philips",
    logo: "./images/assets/RS_Client_philips_logo.png",
    size: "text",
  },
  {
    name: "Kelloggs",
    logo: "./images/assets/RS_Client_kelloggs_logo.png",
    size: "text-lg",
  },
  {
    name: "Kelloggs",
    logo: "./images/assets/RS_Client_kelloggs_logo.png",
    size: "text-lg",
  },
  {
    name: "Thangamayil",
    logo: "./images/assets/RS_Client_Thangamayil.png",
    size: "text",
  },
  {
    name: "Kelloggs",
    logo: "./images/assets/RS_Client_kelloggs_logo.png",
    size: "text-lg",
  },
  {
    name: "Thangamayil",
    logo: "./images/assets/RS_Client_Thangamayil.png",
    size: "text",
  },
  {
    name: "Airtel",
    logo: "./images/assets/RS_Client_Bharti_Airtel_Logo.png",
    size: "md",
  },
  {
    name: "Philips",
    logo: "./images/assets/RS_Client_philips_logo.png",
    size: "text",
  },
  {
    name: "Airtel",
    logo: "./images/assets/RS_Client_Bharti_Airtel_Logo.png",
    size: "md",
  },
  {
    name: "Kelloggs",
    logo: "./images/assets/RS_Client_kelloggs_logo.png",
    size: "text-lg",
  },
];

type WhyExitDirection = "exit-left" | "exit-right";

// Must stay >= the longest .RS_WhyAdRS_ImageLayer animation in
// HomePageSection1.css (--rs-img-enter-time: 1.45s).
const WHY_IMAGE_ANIMATION_MS = 1500;

export default function HomePageSection1() {
  const router = useRouter();

  const [ourRSVehicles, setOurRSVehicles] = useState<RoadshowVehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [vehicleLoadError, setVehicleLoadError] = useState("");
  const [openingVehicleId, setOpeningVehicleId] = useState<string | null>(null);
  const [currentVehicleIndex, setCurrentVehicleIndex] = useState(0);
  const [visibleVehicleCount, setVisibleVehicleCount] = useState(4);

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

  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setLoadingVehicles(true);
        setVehicleLoadError("");

        const vehicles = await fetchAllRoadshowVehicles();

        setOurRSVehicles(vehicles);
        setCurrentVehicleIndex(0);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to load vehicles.";

        setVehicleLoadError(message);
        setOurRSVehicles([]);
        toast.error(message);
      } finally {
        setLoadingVehicles(false);
      }
    };

    void loadVehicles();
  }, []);

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
    window.addEventListener("resize", updateVisibleVehicleCount);

    return () => {
      window.removeEventListener("resize", updateVisibleVehicleCount);
    };
  }, []);

  const maxVehicleIndex = Math.max(
    0,
    ourRSVehicles.length - visibleVehicleCount,
  );

  useEffect(() => {
    setCurrentVehicleIndex((previousIndex) =>
      Math.min(previousIndex, maxVehicleIndex),
    );
  }, [maxVehicleIndex]);

  const openVehicleDetails = (vehicleId: string) => {
    if (!vehicleId || openingVehicleId) {
      return;
    }

    setOpeningVehicleId(vehicleId);

    window.setTimeout(() => {
      router.push(
        `/roadshow/VehicleDetails/${encodeURIComponent(vehicleId)}`,
      );
    }, 250);
  };

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

      <div
        id="our-roadshow-vehicles"
        className="RS_OurRdwMainSection mx-auto px-20"
      >
        <div className="RS_OurRdwHeading">
          <div className="RS_OurRdwHeadingContent1">Our Roadshow</div>
          <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2">
            Vehicles
          </div>
        </div>

        <div className="RS_CarouselWrapper">
          {loadingVehicles ? (
            <div className="RS_VehicleState">Loading vehicles...</div>
          ) : vehicleLoadError ? (
            <div className="RS_VehicleState">{vehicleLoadError}</div>
          ) : (
            <div
              className="RS_OurRdwVehicleList"
              style={{
                transform: `translateX(-${
                  currentVehicleIndex * (100 / visibleVehicleCount)
                }%)`,
              }}
            >
              {ourRSVehicles.map((vehicle, index) => {
                const vehicleRate = Number(vehicle.rate ?? 0);

                return (
                  <div
                    key={vehicle.id || `${vehicle.name}-${index}`}
                    className="RS_VehicleCardMain RS_VehicleCardFlex cursor-pointer"
                    onClick={() => openVehicleDetails(vehicle.id)}
                  >
                    <div>
                      <img
                        src={vehicle.image || FALLBACK_VEHICLE_IMAGE}
                        alt={vehicle.name}
                        className="RS_VehicleImg"
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_VEHICLE_IMAGE;
                        }}
                      />
                    </div>

                    <div className="RS_VehicleDetailsMain">
                      <div className="RS_VehicleName">{vehicle.name}</div>

                      <div className="RS_VehicleRate">
                        {vehicleRate > 0
                          ? `₹${vehicleRate.toLocaleString("en-IN")} /Per Day`
                          : "Contact for price"}
                      </div>

                      <div className="RS_VehicleRatingMain flex items-center gap-1">
                        <div className="RS_VehicleRatingValue">
                          {vehicle.rating ?? "--"}
                        </div>

                        <img
                          src="./images/assets/RS_VehicleRateStar.svg"
                          className="RS_VehicleRatingImg"
                          alt="Rating"
                        />
                      </div>

                      <div onClick={(event) => event.stopPropagation()}>
                        <VehicleBookNowButton
                          label="Book Now"
                          loadingLabel="Opening..."
                          className="RS_VehicleButton"
                          loading={openingVehicleId === vehicle.id}
                          disabled={Boolean(openingVehicleId)}
                          onClick={() => openVehicleDetails(vehicle.id)}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="RS_CarouselNavRow">
            <button
              type="button"
              className="RS_CarouselBtn"
              onClick={() =>
                setCurrentVehicleIndex((previousIndex) =>
                  Math.max(previousIndex - 1, 0),
                )
              }
              disabled={currentVehicleIndex === 0 || loadingVehicles}
              aria-label="Previous vehicle"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>

            <button
              type="button"
              className="RS_CarouselBtn"
              onClick={() =>
                setCurrentVehicleIndex((previousIndex) =>
                  Math.min(previousIndex + 1, maxVehicleIndex),
                )
              }
              disabled={
                currentVehicleIndex >= maxVehicleIndex || loadingVehicles
              }
              aria-label="Next vehicle"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto px-30 RS_WhyAdRSSectionWrap">
        <div className="RS_OurRdwHeading">
          <div className="RS_OurRdwHeadingContent1">
            Why Adinn Roadshows
          </div>
          <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2">
            Works Best
          </div>
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

            <div className="RS_WhyAdRSList">
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
            <div className="RS_OurRdwHeadingContent1">Some of Our</div>
            <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2">
              Clients
            </div>
          </div>

          <div className="RS_ClientsOrbitArea">
            <div className="RS_ClientCenterBubble">
              <span>Clients</span>
            </div>

            {ourClients.map((client, index) => (
              <div
                key={`${client.name}-${index}`}
                className={`RS_ClientBubble RS_Bubble_${index} ${
                  client.size === "text" ? "RS_TextLogo" : ""
                } ${client.size === "text-lg" ? "RS_TextLgLogo" : ""}`}
              >
                <img
                  src={client.logo}
                  alt={client.name}
                  className="RS_ClientLogo"
                />
              </div>
            ))}
          </div>

          <div className="RS_ClientsBtnRow">
            <ViewAllClientsButton
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
