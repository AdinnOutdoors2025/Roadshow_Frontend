"use client";

/* -------------------------------------------------------------------------- */
/*                      PUBLIC ROADSHOW VEHICLE LISTING                        */
/* -------------------------------------------------------------------------- */
/*  Reached from the "Vehicle" link in the navbar. Lists every onboarded       */
/*  vehicle, segregated into LED / Flex / Hybrid tabs driven by the            */
/*  techSpecs.screenType captured during admin onboarding (see                 */
/*  ./vehicleCategories). Clicking a card opens the spec popup; "Book Now"     */
/*  goes to the existing vehicle details page, which owns the booking flow.    */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import {
  FALLBACK_VEHICLE_IMAGE,
  fetchAllRoadshowVehicles,
  type RoadshowVehicle,
} from "@/lib/roadshowVehicles";
import { formatCurrency } from "@/app/utils/currency";
import { ButtonHover } from "@/components/Client/Reusable_Components/ButtonHover";

import VehicleSpecModal from "./VehicleSpecModal";
import {
  ALL_CATEGORY_ID,
  VEHICLE_CATEGORIES,
  categoryLabelOf,
  countByCategory,
  filterByCategory,
} from "./vehicleCategories";
import "./page.css";

export default function RoadshowVehiclesPage() {
  const router = useRouter();

  const [vehicles, setVehicles] = useState<
    RoadshowVehicle[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [activeCategory, setActiveCategory] = useState(
    ALL_CATEGORY_ID
  );

  const [specVehicle, setSpecVehicle] =
    useState<RoadshowVehicle | null>(null);

  const [openingVehicleId, setOpeningVehicleId] =
    useState<string | null>(null);

  useEffect(() => {
    let componentMounted = true;

    const loadVehicles = async () => {
      try {
        setLoading(true);

        const apiVehicles =
          await fetchAllRoadshowVehicles();

        if (!componentMounted) return;

        setVehicles(apiVehicles || []);
        setLoadError("");
      } catch (error) {
        console.error(
          "Roadshow vehicle listing error:",
          error
        );

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

  const openVehicleDetails = (vehicleId: string) => {
    if (!vehicleId || openingVehicleId) return;

    setOpeningVehicleId(vehicleId);

    window.setTimeout(() => {
      router.push(
        `/roadshow/VehicleDetails/${encodeURIComponent(
          vehicleId
        )}`
      );
    }, 250);
  };

  return (
    <main className="RS_VehListPage">
      <header className="RS_VehListHero">
        <h1 className="RS_VehListTitle">
          <span>Built to Move</span>
          <span className="RS_VehListTitleAccent">
            Brands
          </span>
        </h1>

        <p className="RS_VehListSubtitle">
          Every roadshow vehicle in our fleet, grouped by the
          kind of display it carries. Pick a category, open a
          vehicle to see its full specification, then book the
          dates you need.
        </p>
      </header>

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
          onClick={() =>
            setActiveCategory(ALL_CATEGORY_ID)
          }
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
            onClick={() => setActiveCategory(category.id)}
          >
            {category.label}
            <span className="RS_VehListTabCount">
              {counts[category.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {activeBlurb && (
        <p className="RS_VehListBlurb">{activeBlurb}</p>
      )}

      {loading ? (
        <div className="RS_VehListState">
          Loading vehicles...
        </div>
      ) : loadError ? (
        <div className="RS_VehListState">{loadError}</div>
      ) : shownVehicles.length === 0 ? (
        <div className="RS_VehListState">
          No vehicles in this category yet.
        </div>
      ) : (
        <div className="RS_VehListGrid">
          {shownVehicles.map((vehicle) => {
            const rate = Number(vehicle.rate ?? 0);

            return (
              <article
                key={vehicle.id}
                className="RS_VehListCard"
                onClick={() => setSpecVehicle(vehicle)}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" ||
                    event.key === " "
                  ) {
                    event.preventDefault();
                    setSpecVehicle(vehicle);
                  }
                }}
              >
                <div className="RS_VehListImgWrap">
                  <img
                    src={
                      vehicle.image ||
                      FALLBACK_VEHICLE_IMAGE
                    }
                    alt={vehicle.name}
                    className="RS_VehListImg"
                    onError={(event) => {
                      event.currentTarget.src =
                        FALLBACK_VEHICLE_IMAGE;
                    }}
                  />

                  <span className="RS_VehListBadge">
                    {categoryLabelOf(vehicle)}
                  </span>
                </div>

                <div className="RS_VehListCardBody">
                  <h2 className="RS_VehListName">
                    {vehicle.name}
                  </h2>

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

                    <div
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >
                      <ButtonHover
                        label="Book Now"
                        loadingLabel="Opening..."
                        className="RS_VehicleButton RS_VehListBookBtn"
                        loading={
                          openingVehicleId === vehicle.id
                        }
                        disabled={Boolean(openingVehicleId)}
                        onClick={() =>
                          openVehicleDetails(vehicle.id)
                        }
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
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
    </main>
  );
}
