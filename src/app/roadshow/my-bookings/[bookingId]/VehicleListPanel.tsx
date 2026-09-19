"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ChevronLeft, ChevronRight, Radio } from "lucide-react";

import type { LiveVehicle } from "./useLiveLocation";

const CAROUSEL_DRAG_THRESHOLD = 48;

/* Model-tabbed, paged carousel — one tab per vehicle MODEL (booking line),
   so a 2-model x 2-quantity booking shows as 2 tabs of 2 cards each instead
   of one flat list of 4, with prev/next paging (and drag-to-swipe) through
   the units of whichever tab is active. Restores the pre-redesign UI; the
   flat "Vehicles on Road" list version this replaced lived directly here
   before commit f1bdfc1. */
export default function VehicleListPanel({
  vehicles,
  selectedReg,
  onSelect,
  resolveVehicleImage,
  statusClass,
  formatVehicleChain,
  loading,
}: {
  vehicles: LiveVehicle[];
  selectedReg: string;
  onSelect: (registrationNumber: string) => void;
  resolveVehicleImage: (registrationNumber?: string | null) => string;
  statusClass: (status?: string) => string;
  formatVehicleChain: (vehicle?: {
    registrationNumber?: string | null;
    registrationChain?: string[];
    wasReplaced?: boolean;
  }) => string;
  loading?: boolean;
}) {
  const vehicleGroups = useMemo(() => {
    const order: Array<number | undefined> = [];
    const byIndex = new Map<
      number | undefined,
      {
        vehicleIndex: number | undefined;
        vehicleName: string;
        vehicles: LiveVehicle[];
      }
    >();

    vehicles.forEach((vehicle) => {
      const key = vehicle.vehicleIndex;

      if (!byIndex.has(key)) {
        byIndex.set(key, {
          vehicleIndex: key,
          vehicleName: vehicle.vehicleName || "Roadshow Vehicle",
          vehicles: [],
        });
        order.push(key);
      }

      byIndex.get(key)!.vehicles.push(vehicle);
    });

    return order.map((key) => byIndex.get(key)!);
  }, [vehicles]);

  /* Explicit tab pick (from a click) if there is one and it still exists in
     the current grouping, otherwise the first group — derived during render
     instead of synced via an effect, so switching bookings/tabs never
     causes an extra render pass. */
  const [explicitVehicleGroup, setExplicitVehicleGroup] = useState<
    number | undefined
  >(undefined);

  const activeVehicleGroup = useMemo(() => {
    const stillValid =
      explicitVehicleGroup !== undefined &&
      vehicleGroups.some((group) => group.vehicleIndex === explicitVehicleGroup);

    return stillValid ? explicitVehicleGroup : vehicleGroups[0]?.vehicleIndex;
  }, [explicitVehicleGroup, vehicleGroups]);

  const activeGroup = useMemo(
    () =>
      vehicleGroups.find((group) => group.vehicleIndex === activeVehicleGroup),
    [vehicleGroups, activeVehicleGroup],
  );

  const activeGroupVehicles = activeGroup?.vehicles || vehicles;

  /* Position of the currently selected vehicle within the active tab —
     drives which single card the carousel shows, and what the prev/next
     buttons step relative to. Falls back to 0 rather than -1 so a stale
     selectedReg (about to be corrected by the effect below) never makes
     activeGroupVehicles[activeVehicleSlot] read as undefined. */
  const activeVehicleSlot = Math.max(
    0,
    activeGroupVehicles.findIndex(
      (vehicle) => vehicle.registrationNumber === selectedReg,
    ),
  );

  const goToVehicleOffset = (offset: number) => {
    if (activeGroupVehicles.length < 2) return;

    const nextIndex =
      (activeVehicleSlot + offset + activeGroupVehicles.length) %
      activeGroupVehicles.length;

    onSelect(activeGroupVehicles[nextIndex].registrationNumber || "");
  };

  /* Drag-to-page the carousel card, in addition to the prev/next buttons. */
  const carouselDragRef = useRef({ active: false, startX: 0 });
  const [carouselDragX, setCarouselDragX] = useState(0);
  const [carouselDragging, setCarouselDragging] = useState(false);

  function startCarouselDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (activeGroupVehicles.length < 2) return;

    carouselDragRef.current = { active: true, startX: event.clientX };
    setCarouselDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function moveCarouselDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (!carouselDragRef.current.active) return;

    setCarouselDragX(event.clientX - carouselDragRef.current.startX);
  }

  function endCarouselDrag() {
    if (!carouselDragRef.current.active) return;

    carouselDragRef.current.active = false;
    setCarouselDragging(false);

    if (carouselDragX <= -CAROUSEL_DRAG_THRESHOLD) {
      goToVehicleOffset(1);
    } else if (carouselDragX >= CAROUSEL_DRAG_THRESHOLD) {
      goToVehicleOffset(-1);
    }

    setCarouselDragX(0);
  }

  /* Drag-to-scroll the model tab strip. Touch already scrolls a
     horizontally-overflowing element natively, so this only handles mouse,
     which has no built-in click-drag-to-scroll. */
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const tabsDragRef = useRef({
    active: false,
    startX: 0,
    scrollLeft: 0,
    moved: false,
  });
  const [tabsDragging, setTabsDragging] = useState(false);

  function startTabsDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.pointerType === "touch") return;

    const element = tabsRef.current;
    if (!element) return;

    // Nothing to scroll means nothing to drag — never arm the drag/jitter
    // logic below, so an ordinary click on a tab is never mistaken for one.
    if (element.scrollWidth <= element.clientWidth) return;

    tabsDragRef.current = {
      active: true,
      startX: event.clientX,
      scrollLeft: element.scrollLeft,
      moved: false,
    };
    setTabsDragging(true);
  }

  function moveTabsDrag(event: ReactPointerEvent<HTMLDivElement>) {
    const element = tabsRef.current;
    if (!element || !tabsDragRef.current.active) return;

    const delta = event.clientX - tabsDragRef.current.startX;

    // A few px of jitter shouldn't count as "dragged" — only a real drag
    // should suppress the tab's own click below.
    if (Math.abs(delta) > 4 && !tabsDragRef.current.moved) {
      tabsDragRef.current.moved = true;
      element.setPointerCapture?.(event.pointerId);
    }

    element.scrollLeft = tabsDragRef.current.scrollLeft - delta;
  }

  function endTabsDrag() {
    tabsDragRef.current.active = false;
    setTabsDragging(false);

    // suppressTabClickAfterDrag normally consumes `moved` on the click that
    // ends a drag, but some browsers/gestures never fire that click at all
    // (release outside the element, pointer capture lost mid-drag, etc.).
    // Without this fallback, `moved` would stay stuck true and every later
    // genuine tab click would keep getting swallowed.
    if (tabsDragRef.current.moved) {
      window.setTimeout(() => {
        tabsDragRef.current.moved = false;
      }, 300);
    }
  }

  // Runs in the capture phase, before a tab button's own onClick — swallows
  // the click that would otherwise fire on whichever tab the pointer
  // happened to release over at the end of a drag.
  function suppressTabClickAfterDrag(event: ReactMouseEvent) {
    if (!tabsDragRef.current.moved) return;

    event.preventDefault();
    event.stopPropagation();
    tabsDragRef.current.moved = false;
  }

  /* Keeps `selectedReg` valid for whichever tab is active — prefers a
     vehicle that's actually trackable (live) over one that's merely
     unavailable, and prefers either of those over a "pending" placeholder
     (no registration/GPS data at all). This is the single place selection
     gets corrected; the parent page only owns the selectedReg state. */
  useEffect(() => {
    if (!activeGroupVehicles.length) {
      if (selectedReg) onSelect("");
      return;
    }

    const currentVehicle = activeGroupVehicles.find(
      (vehicle) => vehicle.registrationNumber === selectedReg,
    );

    if (currentVehicle && !currentVehicle.unavailable && !currentVehicle.pending) {
      return;
    }

    const firstAvailable = activeGroupVehicles.find(
      (vehicle) => !vehicle.unavailable && !vehicle.pending,
    );
    const firstUnavailable = activeGroupVehicles.find(
      (vehicle) => vehicle.unavailable,
    );

    const next = (
      firstAvailable || firstUnavailable || activeGroupVehicles[0]
    ).registrationNumber;

    if (next && next !== selectedReg) onSelect(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroupVehicles]);

  if (loading && !vehicles.length) {
    return (
      <div className="RST_MiniLoading">
        <Radio size={18} />
        Loading live vehicles...
      </div>
    );
  }

  if (!vehicles.length) {
    return (
      <div className="RST_EmptyMini">
        <Radio size={22} />
        <strong>No live vehicle returned yet</strong>
        <p>
          Tracking will appear automatically when the GPS feed becomes
          available.
        </p>
      </div>
    );
  }

  const activeVehicle = activeGroupVehicles[activeVehicleSlot];

  return (
    <>
      {vehicleGroups.length > 1 && (
        <div
          ref={tabsRef}
          className={`RST_VehicleTabs ${
            tabsDragging ? "RST_VehicleTabs--dragging" : ""
          }`}
          role="tablist"
          aria-label="Vehicle models in this booking"
          onPointerDown={startTabsDrag}
          onPointerMove={moveTabsDrag}
          onPointerUp={endTabsDrag}
          onPointerCancel={endTabsDrag}
          onLostPointerCapture={endTabsDrag}
          onClickCapture={suppressTabClickAfterDrag}
        >
          {vehicleGroups.map((group) => (
            <button
              key={group.vehicleIndex ?? group.vehicleName}
              type="button"
              role="tab"
              aria-selected={activeVehicleGroup === group.vehicleIndex}
              className={`RST_VehicleTab ${
                activeVehicleGroup === group.vehicleIndex
                  ? "RST_VehicleTab--active"
                  : ""
              }`}
              onClick={() => setExplicitVehicleGroup(group.vehicleIndex)}
            >
              {group.vehicleName}
              <span className="RST_VehicleTabCount">
                {group.vehicles.length}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="RST_VehicleCarousel">
        {/* Only shown when the active tab has more than one unit — a
            single-vehicle tab renders its one card with no paging controls
            at all. Paging (not a stacked list) keeps this section's height
            constant regardless of how many units a model line has. */}
        {activeGroupVehicles.length > 1 && (
          <div className="RST_VehicleCarouselNav">
            <button
              type="button"
              aria-label="Previous vehicle"
              onClick={() => goToVehicleOffset(-1)}
            >
              <ChevronLeft size={16} />
            </button>

            <span>
              {activeVehicleSlot + 1} / {activeGroupVehicles.length}
            </span>

            <button
              type="button"
              aria-label="Next vehicle"
              onClick={() => goToVehicleOffset(1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {activeVehicle && (
          <div
            className={`RST_VehicleCard RST_VehicleCard--current ${
              activeGroupVehicles.length > 1 ? "RST_VehicleCard--draggable" : ""
            } ${carouselDragging ? "RST_VehicleCard--dragging" : ""}`}
            style={
              activeGroupVehicles.length > 1
                ? {
                    transform: `translateX(${carouselDragX}px)`,
                    transition: carouselDragging
                      ? "none"
                      : "transform 200ms ease",
                  }
                : undefined
            }
            onPointerDown={startCarouselDrag}
            onPointerMove={moveCarouselDrag}
            onPointerUp={endCarouselDrag}
            onPointerCancel={endCarouselDrag}
            onLostPointerCapture={endCarouselDrag}
          >
            <span className="RST_VehicleThumb">
              <img src={resolveVehicleImage(activeVehicle.registrationNumber)} alt="" />
            </span>

            <span className="RST_VehicleCopy">
              <strong>
                {activeGroupVehicles.length > 1
                  ? `${activeGroup?.vehicleName || activeVehicle.vehicleName || "Vehicle"} #${activeVehicleSlot + 1}`
                  : activeGroup?.vehicleName || activeVehicle.vehicleName || "Vehicle"}
              </strong>
              <small>
                {activeVehicle.pending
                  ? "Not yet assigned"
                  : formatVehicleChain(activeVehicle)}
              </small>
              {activeVehicle.pending ? (
                <span className="RST_VehicleState RST_VehicleState--pending">
                  Awaiting assignment
                </span>
              ) : activeVehicle.unavailable ? (
                <span className="RST_VehicleState RST_VehicleState--unavailable">
                  Unavailable
                </span>
              ) : (
                <span
                  className={`RST_VehicleState ${statusClass(activeVehicle.status)}`}
                >
                  {activeVehicle.isStale
                    ? "GPS delayed"
                    : /* The backend only merges speedKmh (and the rest of
                         its live-location fields) onto a vehicle when this
                         registration was actually found in the Vamosys GPS
                         feed — see toClientSafeLocation() in the backend's
                         vamosysClient.js. If it's missing entirely, this
                         vehicle simply isn't reporting to Vamosys right now
                         (offline device, not yet paired, etc.) — a
                         different, more actionable situation than the
                         backend's own "Unknown" status label, which means
                         "found, but its movement state wasn't classified". */
                      activeVehicle.speedKmh === undefined
                        ? "GPS not connected"
                        : activeVehicle.status || "Unknown"}
                </span>
              )}
            </span>

            {activeVehicle.pending ? (
              <span className="RST_VehicleKm">
                <small>Status</small>
                <strong>Pending</strong>
              </span>
            ) : activeVehicle.unavailable ? (
              <span className="RST_VehicleKm">
                <small>Status</small>
                <strong>Not tracked</strong>
              </span>
            ) : (
              <span className="RST_VehicleKm">
                <small>KM covered</small>
                <strong>
                  {Number(activeVehicle.distanceCoveredKm || 0).toFixed(2)} km
                </strong>
              </span>
            )}
          </div>
        )}
      </div>
    </>
  );
}
