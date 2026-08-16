/* eslint-disable */
// @ts-nocheck
"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

import type { LiveVehicle } from "./useLiveLocation";

const INDIA_CENTER: [number, number] = [20.5937, 78.9629];

function syncMarkers(L: any, map: any, markersRef: { current: any[] }, vehicles: LiveVehicle[]) {
  markersRef.current.forEach((marker) => marker.remove());
  markersRef.current = [];

  const points: [number, number][] = [];

  vehicles.forEach((vehicle) => {
    if (!Number.isFinite(vehicle.latitude) || !Number.isFinite(vehicle.longitude)) return;

    const point: [number, number] = [vehicle.latitude, vehicle.longitude];
    points.push(point);

    const icon = L.divIcon({
      className: "",
      html: `<div class="RS_MapMarker RS_MapMarker--${vehicle.isStale ? "stale" : "live"}"></div>`,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    const marker = L.marker(point, { icon }).addTo(map);
    marker.bindPopup(
      `<strong>${vehicle.registrationNumber}</strong><br/>${vehicle.address || "Location unavailable"}<br/>${vehicle.status} · ${vehicle.speedKmh} km/h`,
    );

    markersRef.current.push(marker);
  });

  if (points.length === 1) {
    map.setView(points[0], 13);
  } else if (points.length > 1) {
    map.fitBounds(points, { padding: [30, 30] });
  } else {
    map.setView(INDIA_CENTER, 5);
  }
}

/* Real live-vehicle map — Leaflet + OpenStreetMap, following the same
   dynamic-import pattern already used for the marketing map at
   src/components/Client/HomePageSections/GPSTracking.tsx. Uses a plain
   divIcon (no external marker image asset) so there's no webpack/Leaflet
   default-icon-path issue to work around. */
export default function LiveTrackingMap({
  vehicles,
}: {
  vehicles: LiveVehicle[];
}) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const vehiclesRef = useRef<LiveVehicle[]>(vehicles);
  vehiclesRef.current = vehicles;

  useEffect(() => {
    let destroyed = false;
    let resizeObserver: ResizeObserver | null = null;

    async function initMap() {
      const L = await import("leaflet");

      if (destroyed || !mapContainerRef.current) return;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false,
        scrollWheelZoom: false,
      });

      leafletRef.current = L;
      mapInstanceRef.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
      }).addTo(map);

      resizeObserver = new ResizeObserver(() => map.invalidateSize(false));
      resizeObserver.observe(mapContainerRef.current);

      syncMarkers(L, map, markersRef, vehiclesRef.current);
    }

    initMap();

    return () => {
      destroyed = true;
      resizeObserver?.disconnect();
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
      leafletRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef.current) return;
    syncMarkers(leafletRef.current, mapInstanceRef.current, markersRef, vehicles);
  }, [vehicles]);

  return <div ref={mapContainerRef} className="RS_LiveMapCanvas" />;
}
