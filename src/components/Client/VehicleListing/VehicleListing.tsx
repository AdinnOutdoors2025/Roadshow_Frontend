"use client";

/* -------------------------------------------------------------------------- */
/*                       ROADSHOW VEHICLE LISTING (SHARED)                     */
/* -------------------------------------------------------------------------- */
/*  The category-segregated vehicle grid. Rendered in two places:              */
/*                                                                            */
/*    1. src/app/roadshow/vehicles/page.tsx — the dedicated listing, under     */
/*       its own hero.                                                        */
/*    2. HomePageSection1's "Our Roadshow Vehicles" section, under that        */
/*       section's gradient heading — this replaced the sliding carousel.      */
/*                                                                            */
/*  It owns its own fetch, so neither caller has to hold vehicle state. Tabs   */
/*  come from ./vehicleCategories (techSpecs.screenType, captured during admin */
/*  onboarding). A card opens the spec popup; "Book Now" / "Book This Vehicle" */
/*  goes to the existing vehicle details page, which still owns the booking    */
/*  flow through to the campaign request form.                                 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";

import {
  FALLBACK_VEHICLE_IMAGE,
  fetchAllRoadshowVehicles,
  type RoadshowVehicle,
} from "@/lib/roadshowVehicles";
import { formatCurrency } from "@/app/utils/currency";
import { ButtonHover } from "@/components/Client/Reusable_Components/ButtonHover";
import { useScrollReveal } from "@/components/motion/useScrollReveal";
import {
  DISTANCE,
  STAGGER,
} from "@/components/motion/motionTokens";

import VehicleSpecModal from "./VehicleSpecModal";
import {
  ALL_CATEGORY_ID,
  VEHICLE_CATEGORIES,
  categoryLabelOf,
  countByCategory,
  filterByCategory,
} from "./vehicleCategories";
import "./VehicleListing.css";

/* Narrowest a card is allowed to get. Deliberately the same 320px the grid's
   `repeat(auto-fill, minmax(320px, 1fr))` uses, so a row of carousel cards and
   a row of grid cards come out the same width and the two layouts do not jump
   when the list crosses the carousel threshold. */
const CARD_MIN_WIDTH = 320;

/* Track gap in px. Kept in JS as well as CSS because the paging maths needs
   it: one step is (100% + gap) / visibleCount, and a gap-less step would drift
   further out of alignment with every page. */
const trackGap = (width: number): number => (width < 768 ? 18 : 24);

/* How many cards actually fit the space the component has been given.
   Measured rather than mapped from viewport breakpoints: the section's own
   padding differs from the dedicated page's, and a 2560px monitor fits seven
   cards that a breakpoint table capped at four. This is what decides whether
   the arrows are needed at all. */
const cardsThatFit = (containerWidth: number, gap: number): number => {
  if (containerWidth <= 0) return 1;

  return Math.max(
    1,
    Math.floor((containerWidth + gap) / (CARD_MIN_WIDTH + gap))
  );
};

type VehicleListingProps = {
  /* "grid"     — every card at once, wrapping (the dedicated listing page).
     "carousel" — one row that pages, with prev/next buttons that appear ONLY
                  when there are more vehicles than fit in a single view. With
                  few enough vehicles it falls back to the grid, so a short
                  list is never squeezed into quarter-width cards beside a
                  stretch of empty track. */
  layout?: "grid" | "carousel";
  /* Section title, rendered on the LEFT of the tab row rather than above it —
     the host owns the markup (and its animation), this component only owns the
     row that puts the two side by side. Omit it and the tabs keep their own
     centred row, which is what the dedicated page wants under its hero. */
  heading?: React.ReactNode;
  /* Stagger the cards in on scroll (GSAP ScrollTrigger). Opt-in: the homepage
     section is animated throughout, the dedicated page is not — turning it on
     everywhere would change the dedicated page's current behaviour. */
  reveal?: boolean;
  /* Fired once the fetch settles, success or failure. The homepage uses it to
     time its /#our-roadshow-vehicles scroll: the grid's height is only final
     after the cards exist. */
  onLoaded?: () => void;
  className?: string;
};

export default function VehicleListing({
  layout = "grid",
  heading,
  reveal = false,
  onLoaded,
  className = "",
}: VehicleListingProps) {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<RoadshowVehicle[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY_ID);

  /* The cards animate in on a TAB SWITCH only. The very first set is left
     alone: on the homepage the GSAP scroll reveal owns that entrance, and
     running both would fight over the same opacity. */
  const [hasSwitchedCategory, setHasSwitchedCategory] = useState(false);

  const [specVehicle, setSpecVehicle] =
    useState<RoadshowVehicle | null>(null);

  const [openingVehicleId, setOpeningVehicleId] =
    useState<string | null>(null);

  /* Carousel paging. Both values are recomputed on resize, so a phone that is
     turned sideways re-pages instead of leaving a half-card hanging off the
     edge. Ignored entirely in grid layout. */
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(4);
  const [cardGap, setCardGap] = useState(24);

  /* Held in a ref so a caller passing an inline arrow cannot re-trigger the
     fetch effect below, which must run exactly once. Synced in an effect
     rather than during render — a render-phase ref write is not safe under
     concurrent rendering. The initialiser already covers the first value,
     and the fetch only resolves long after this effect has run. */
  const onLoadedRef = useRef(onLoaded);

  useEffect(() => {
    onLoadedRef.current = onLoaded;
  }, [onLoaded]);

  /* The element the cards sit in. Doubles as the scroll-reveal container and
     as the box the carousel measures itself against. */
  const viewportRef = useRef<HTMLDivElement | null>(null);

  /* A second, permanently empty ref for the reveal-off case. useScrollReveal
     bails on a null container, and keeping the ref object stable stops the
     hook's effect re-running on every render. */
  const noRevealRef = useRef<HTMLDivElement | null>(null);

  /* Cards are fetched after mount, so they do not exist when the hook first
     runs — the list length is a dep so the trigger is rebuilt once they do. */
  useScrollReveal(reveal ? viewportRef : noRevealRef, {
    selector: ".RS_VehListCard",
    distance: DISTANCE.lg,
    stagger: STAGGER.base,
    deps: [vehicles.length, loading],
  });

  useEffect(() => {
    let componentMounted = true;

    const loadVehicles = async () => {
      try {
        setLoading(true);

        const apiVehicles = await fetchAllRoadshowVehicles();

        if (!componentMounted) return;

        setVehicles(apiVehicles || []);
        setLoadError("");
      } catch (error) {
        console.error("Roadshow vehicle listing error:", error);

        if (!componentMounted) return;

        setLoadError(
          error instanceof Error
            ? error.message
            : "Unable to load vehicles."
        );

        toast.error("Unable to load vehicles.");
      } finally {
        if (componentMounted) {
          setLoading(false);
          onLoadedRef.current?.();
        }
      }
    };

    loadVehicles();

    return () => {
      componentMounted = false;
    };
  }, []);

  const counts = useMemo(
    () => countByCategory(vehicles),
    [vehicles]
  );

  /* Only offer a tab that actually has vehicles behind it */
  const visibleCategories = useMemo(
    () =>
      VEHICLE_CATEGORIES.filter(
        (category) => (counts[category.id] || 0) > 0
      ),
    [counts]
  );

  const shownVehicles = useMemo(
    () => filterByCategory(vehicles, activeCategory),
    [vehicles, activeCategory]
  );

  const activeBlurb = VEHICLE_CATEGORIES.find(
    (category) => category.id === activeCategory
  )?.blurb;

  /* Measure the row the cards actually sit in, not the window — and re-measure
     on any size change, so a sidebar, a zoom or a rotated phone all re-page
     correctly. Re-runs when `loading` flips because the element below only
     exists once the cards have rendered. */
  useEffect(() => {
    const element = viewportRef.current;

    if (!element) return;

    const measure = () => {
      const gap = trackGap(window.innerWidth);

      setCardGap(gap);
      setVisibleCount(cardsThatFit(element.clientWidth, gap));
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => observer.disconnect();
    /* Runs in grid layout too — the skeleton count is one row's worth, so it
       needs the same measurement even when there will never be a carousel. */
  }, [loading]);

  /* Arrows only earn their place once the list is longer than one view —
     that is the whole "show them when there are a lot of vehicles" rule, and
     it is re-evaluated per tab, because LED may overflow while Hybrid does
     not. */
  const maxIndex = Math.max(0, shownVehicles.length - visibleCount);

  const isCarousel =
    layout === "carousel" && shownVehicles.length > visibleCount;

  /* Clamped during render rather than corrected in an effect: widening the
     window (or a shorter tab) shrinks maxIndex, and a stored index would
     briefly page past the end before the effect could pull it back. */
  const pageIndex = Math.min(currentIndex, maxIndex);

  /* Every tab starts at the first card, so two equally long categories do not
     leave the row sitting mid-scroll after a switch. */
  const selectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    setCurrentIndex(0);
    setHasSwitchedCategory(true);
  };

  const openVehicleDetails = (vehicleId: string) => {
    if (!vehicleId || openingVehicleId) return;

    setOpeningVehicleId(vehicleId);

    window.setTimeout(() => {
      router.push(
        `/roadshow/VehicleDetails/${encodeURIComponent(vehicleId)}`
      );
    }, 250);
  };

  /* One row's worth of placeholders, so the skeleton occupies roughly the
     space the real cards are about to take rather than a line of text that
     the grid then shoves aside. */
  const skeletonCards = Array.from(
    { length: Math.max(1, visibleCount) },
    (_unused, index) => index
  );

  return (
    <div className={`RS_VehListRoot ${className}`}>
      {/* Heading and tabs share one row when a heading is supplied; the
          heading stays put through the fetch while the tabs fill in beside it
          — they are meaningless until the counts exist, and showing them
          during the fetch put a lone "All Vehicles 0" pill on screen. */}
      <div
        className={
          heading ? "RS_VehListHeader" : "RS_VehListHeader--tabsOnly"
        }
      >
        {heading && (
          <div className="RS_VehListHeaderTitle">{heading}</div>
        )}

        {!loading && !loadError && vehicles.length > 0 && (
      <div className="RS_VehListTabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeCategory === ALL_CATEGORY_ID}
          className={`RS_VehListTab ${
            activeCategory === ALL_CATEGORY_ID
              ? "RS_VehListTab--active"
              : ""
          }`}
          onClick={() => selectCategory(ALL_CATEGORY_ID)}
        >
          All Vehicles
          <span className="RS_VehListTabCount">
            {counts[ALL_CATEGORY_ID] || 0}
          </span>
        </button>

        {visibleCategories.map((category) => (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={activeCategory === category.id}
            className={`RS_VehListTab ${
              activeCategory === category.id
                ? "RS_VehListTab--active"
                : ""
            }`}
            onClick={() => selectCategory(category.id)}
          >
            {category.label}
            <span className="RS_VehListTabCount">
              {counts[category.id] || 0}
            </span>
          </button>
        ))}
      </div>
        )}
      </div>

      {!loading && activeBlurb && (
        <p className="RS_VehListBlurb">{activeBlurb}</p>
      )}

      {loadError ? (
        <div className="RS_VehListState">{loadError}</div>
      ) : (
        /* viewportRef stays on this wrapper in EVERY state, so the scroll
           reveal finds the cards either way and the carousel can measure the
           row's real width from the first paint — including while the
           skeletons are up, which is what sizes them. */
        <div ref={viewportRef}>
        {loading ? (
          <>
            <div className="RS_VehListGrid" aria-hidden="true">
              {skeletonCards.map((index) => (
                <div key={index} className="RS_VehListSkeleton">
                  <div className="RS_VehListSkelImg" />

                  <div className="RS_VehListSkelBody">
                    <span className="RS_VehListSkelLine RS_VehListSkelLine--wide" />
                    <span className="RS_VehListSkelLine RS_VehListSkelLine--mid" />
                    <span className="RS_VehListSkelChip" />
                    <span className="RS_VehListSkelBtn" />
                  </div>
                </div>
              ))}
            </div>

            {/* The visual skeleton is aria-hidden, so announce the wait */}
            <span className="RS_VehListSrOnly" role="status">
              Loading vehicles...
            </span>
          </>
        ) : shownVehicles.length === 0 ? (
          <div className="RS_VehListState">
            No vehicles in this category yet.
          </div>
        ) : (
          <>
          {/* Keyed on the category so the cards REMOUNT on a tab switch, which
              is what replays their CSS entrance animation. The wrapper carries
              the clipping frame in carousel mode and nothing at all in grid
              mode — the cards must stay DIRECT children of .RS_VehListGrid, or
              the grid lays out one wrapper instead of N cards and they all
              stack in a single column. */}
          <div
            key={activeCategory}
            className={isCarousel ? "RS_VehListTrackWrap" : ""}
          >
            <div
              className={isCarousel ? "RS_VehListTrack" : "RS_VehListGrid"}
              style={
                isCarousel
                  ? ({
                      "--rs-vl-visible": visibleCount,
                      "--rs-vl-gap": `${cardGap}px`,
                      /* One step is a card plus a gap. Card width is
                         (100% - (n-1)*gap)/n, so the step simplifies to
                         (100% + gap)/n — stepping by a plain 100%/n would
                         drift by a gap on every page. */
                      transform: `translateX(calc(${-pageIndex} * (100% + ${cardGap}px) / ${visibleCount}))`,
                    } as React.CSSProperties)
                  : undefined
              }
            >
              {shownVehicles.map((vehicle, index) => {
                const rate = Number(vehicle.rate ?? 0);

                return (
                  <article
                    key={vehicle.id}
                    /* The entrance is a CSS animation with fill-mode
                       `backwards`, not an inline transform: once it finishes
                       the element goes back to plain stylesheet control, so
                       the hover lift still works. --rs-vl-i staggers it. */
                    className={`RS_VehListCard ${
                      hasSwitchedCategory ? "RS_VehListCard--enter" : ""
                    }`}
                    style={
                      { "--rs-vl-i": index } as React.CSSProperties
                    }
                    onClick={() => setSpecVehicle(vehicle)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSpecVehicle(vehicle);
                      }
                    }}
                  >
                    <div className="RS_VehListImgWrap">
                      <img
                        src={vehicle.image || FALLBACK_VEHICLE_IMAGE}
                        alt={vehicle.name}
                        className="RS_VehListImg"
                        onError={(event) => {
                          event.currentTarget.src = FALLBACK_VEHICLE_IMAGE;
                        }}
                      />

                      <span className="RS_VehListBadge">
                        {categoryLabelOf(vehicle)}
                      </span>
                    </div>

                    <div className="RS_VehListCardBody">
                      <h2 className="RS_VehListName">{vehicle.name}</h2>

                      <div className="RS_VehListRate">
                        {rate > 0
                          ? `${formatCurrency(rate)} /Per Day`
                          : "Contact for price"}
                      </div>

                      <div className="RS_VehListMeta">
                        <span className="RS_VehListRating">
                          {vehicle.rating ?? "--"}
                          <img
                            src="/images/assets/RS_VehicleRateStar.svg"
                            alt=""
                            className="RS_VehListStar"
                          />
                        </span>

                        <span className="RS_VehListAvail">
                          {vehicle.availableVehicles > 0
                            ? `${vehicle.availableVehicles} available`
                            : "Check availability"}
                        </span>
                      </div>

                      <div className="RS_VehListActions">
                        <button
                          type="button"
                          className="RS_VehListSpecBtn"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSpecVehicle(vehicle);
                          }}
                        >
                          View Details
                        </button>

                        <div onClick={(event) => event.stopPropagation()}>
                          <ButtonHover
                            label="Book Now"
                            loadingLabel="Opening..."
                            className="RS_VehicleButton RS_VehListBookBtn"
                            loading={openingVehicleId === vehicle.id}
                            disabled={Boolean(openingVehicleId)}
                            onClick={() => openVehicleDetails(vehicle.id)}
                          />
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Only rendered when the list actually overflows one view — a
              short list keeps the plain grid and no arrows at all. */}
          {isCarousel && (
            <div className="RS_VehListNavRow">
              <button
                type="button"
                className="RS_VehListNavBtn"
                onClick={() =>
                  setCurrentIndex(Math.max(pageIndex - 1, 0))
                }
                disabled={pageIndex === 0}
                aria-label="Previous vehicles"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                type="button"
                className="RS_VehListNavBtn"
                onClick={() =>
                  setCurrentIndex(Math.min(pageIndex + 1, maxIndex))
                }
                disabled={pageIndex >= maxIndex}
                aria-label="Next vehicles"
              >
                <ChevronRight size={22} />
              </button>
            </div>
          )}
          </>
        )}
        </div>
      )}

      <VehicleSpecModal
        vehicle={specVehicle}
        onClose={() => setSpecVehicle(null)}
        onBook={(vehicleId) => {
          setSpecVehicle(null);
          openVehicleDetails(vehicleId);
        }}
        booking={Boolean(openingVehicleId)}
      />
    </div>
  );
}
