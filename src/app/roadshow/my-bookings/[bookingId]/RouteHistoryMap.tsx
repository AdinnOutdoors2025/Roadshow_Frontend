/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

import type { VehicleHistoryPoint } from "./useVehicleHistory";

const INDIA_CENTER = [20.5937, 78.9629];

/* Keeps intermediate waypoint markers from ballooning into hundreds of DOM
   nodes on a full-day/multi-day filter — the polyline already shows every
   point's exact path, these dots are just visual "crossed through here"
   breadcrumbs like Vamosys's own history view. */
const MAX_WAYPOINT_MARKERS = 250;

/* Direction arrows are purely visual (like Vamosys's "Directions" overlay),
   so they're sampled to a fixed target count rather than the denser
   waypoint-dot step — a full day's worth of points would otherwise draw an
   arrow every few metres. */
const ARROW_COUNT_TARGET = 40;

function escapeHtml(value: unknown) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) =>
    ch === "&"
      ? "&amp;"
      : ch === "<"
        ? "&lt;"
        : ch === ">"
          ? "&gt;"
          : ch === '"'
            ? "&quot;"
            : "&#39;",
  );
}

function buildFlagIcon(L: any, variant: "start" | "end") {
  return L.divIcon({
    className: "",
    html: `<div class="RST_RouteFlag RST_RouteFlag--${variant}"></div>`,
    iconSize: [22, 28],
    iconAnchor: [3, 26],
  });
}

function buildArrowIcon(L: any, bearingDeg: number) {
  return L.divIcon({
    className: "",
    html: `<div class="RST_RouteArrow" style="transform: rotate(${bearingDeg}deg)"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

/* Compass bearing (0 = north, clockwise), matching how CSS transform:
   rotate() turns an upward-pointing arrow icon clockwise from its default
   orientation — no unit conversion needed between the two. */
function bearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaLambda = toRad(lon2 - lon1);

  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function popupRow(label: string, value: string | null | undefined) {
  if (value == null || value === "") return "";

  return `<div class="RST_RouteMapPopupRow"><span>${label}</span><strong>${value}</strong></div>`;
}

/* Mirrors the fields Vamosys's own point/vehicle cards show (LocTime,
   Speed, DistCov, Odo, Fuel) plus a G-Map link — the same data already
   rendered as table columns further down this panel, just surfaced where
   the user clicked on the map itself. */
function buildPopupHtml(point: VehicleHistoryPoint, title: string) {
  const rows = [
    popupRow("Time", escapeHtml(point.time || "")),
    popupRow("Address", escapeHtml(point.address || "Location unavailable")),
    popupRow(
      "Speed",
      point.maxSpeedKmh != null ? `${point.maxSpeedKmh} km/h` : null,
    ),
    popupRow(
      "Distance covered",
      point.cumulativeDistanceKm != null
        ? `${point.cumulativeDistanceKm.toFixed(2)} km`
        : null,
    ),
    popupRow(
      "Odometer",
      point.odometerKm != null ? `${point.odometerKm.toFixed(2)} km` : null,
    ),
    popupRow(
      "Fuel",
      point.fuelLitres != null ? `${point.fuelLitres} L` : null,
    ),
    popupRow(
      "Ignition",
      point.ignitionStatus ? escapeHtml(point.ignitionStatus) : null,
    ),
  ].join("");

  const mapLink = point.googleMapUrl
    ? `<a class="RST_RouteMapPopupLink" href="${point.googleMapUrl}" target="_blank" rel="noreferrer">Open in Google Maps ↗</a>`
    : "";

  return `<div class="RST_RouteMapPopup"><strong class="RST_RouteMapPopupTitle">${escapeHtml(
    title,
  )}</strong>${rows}${mapLink}</div>`;
}

function drawRoute(
  L: any,
  map: any,
  layerRef: { current: any },
  rows: VehicleHistoryPoint[],
) {
  layerRef.current?.remove();

  const group = L.layerGroup().addTo(map);
  layerRef.current = group;

  const points = rows.filter(
    (row) =>
      Number.isFinite(row.latitude) && Number.isFinite(row.longitude),
  );

  if (!points.length) {
    map.setView(INDIA_CENTER, 5);
    return;
  }

  const latlngs = points.map((point) => [point.latitude, point.longitude]);

  L.polyline(latlngs, {
    color: "#179b61",
    weight: 4,
    opacity: 0.85,
    lineJoin: "round",
  }).addTo(group);

  /* Direction-of-travel arrows along the route, like Vamosys's own
     "Directions" overlay — skipped for a segment where the vehicle didn't
     actually move (identical consecutive coordinates), which would
     otherwise produce an arrow pointing nowhere. */
  const arrowStep = Math.max(
    1,
    Math.floor(points.length / ARROW_COUNT_TARGET),
  );

  for (let i = 0; i < points.length - 1; i += arrowStep) {
    const a = points[i];
    const b = points[i + 1];

    if (a.latitude === b.latitude && a.longitude === b.longitude) continue;

    const angle = bearing(a.latitude, a.longitude, b.latitude, b.longitude);
    const midpoint = [
      (a.latitude + b.latitude) / 2,
      (a.longitude + b.longitude) / 2,
    ];

    L.marker(midpoint, {
      icon: buildArrowIcon(L, angle),
      interactive: false,
      keyboard: false,
    }).addTo(group);
  }

  const step = Math.max(1, Math.ceil(points.length / MAX_WAYPOINT_MARKERS));

  points.forEach((point, index) => {
    if (index === 0 || index === points.length - 1) return;
    if (index % step !== 0) return;

    L.circleMarker([point.latitude, point.longitude], {
      radius: 3,
      color: "#179b61",
      weight: 2,
      fillColor: "#ffffff",
      fillOpacity: 1,
    })
      .bindPopup(buildPopupHtml(point, "Waypoint"))
      .addTo(group);
  });

  const start = points[0];
  const end = points[points.length - 1];

  L.marker([start.latitude, start.longitude], {
    icon: buildFlagIcon(L, "start"),
  })
    .bindPopup(buildPopupHtml(start, "Start"))
    .addTo(group);

  if (end !== start) {
    L.marker([end.latitude, end.longitude], {
      icon: buildFlagIcon(L, "end"),
    })
      .bindPopup(buildPopupHtml(end, "End"))
      .addTo(group);
  }

  if (latlngs.length === 1) {
    map.setView(latlngs[0], 14);
  } else {
    map.fitBounds(latlngs, { padding: [30, 30] });
  }
}

/* Historical route map for the vehicle-history date/time filter — plots the
   GPS points already returned by useVehicleHistory as a route (green
   polyline) with start/end flag markers, direction arrows and detailed
   popups, the same data the table below renders as rows. Follows the same
   Leaflet dynamic-import pattern as LiveTrackingMap.tsx so there's no
   SSR/webpack default-icon-path issue. */
export default function RouteHistoryMap({
  rows,
}: {
  rows: VehicleHistoryPoint[];
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const rowsRef = useRef<VehicleHistoryPoint[]>(rows);
  rowsRef.current = rows;

  useEffect(() => {
    let destroyed = false;
    let resizeObserver: ResizeObserver | null = null;

    async function initMap() {
      const L = await import("leaflet");

      if (destroyed || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
        /* Unlike the live map, this route card isn't full-page and doesn't
           need to guard against hijacking page-scroll, so scroll/pinch and
           box-zoom (shift+drag) are left on for a proper zoom-in/out feel. */
        scrollWheelZoom: true,
        boxZoom: true,
        doubleClickZoom: true,
      });

      leafletRef.current = L;
      mapInstanceRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      resizeObserver = new ResizeObserver(() => map.invalidateSize(false));
      resizeObserver.observe(mapContainerRef.current);

      drawRoute(L, map, layerRef, rowsRef.current);
    }

    initMap();

    return () => {
      destroyed = true;
      resizeObserver?.disconnect();
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      leafletRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef.current) return;
    drawRoute(leafletRef.current, mapInstanceRef.current, layerRef, rows);
  }, [rows]);

  return <div ref={mapContainerRef} className="RST_RouteMapCanvas" />;
}
