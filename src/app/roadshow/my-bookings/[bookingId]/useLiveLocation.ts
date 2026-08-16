"use client";

import { useEffect, useRef, useState } from "react";

import { baseUrl } from "../../../../BaseUrl";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";

const POLL_INTERVAL_MS = 18000;

export type LiveVehicle = {
  registrationNumber: string;
  latitude: number;
  longitude: number;
  address: string;
  speedKmh: number;
  status: "Moving" | "Parked" | "Idle" | "Unknown";
  distanceCoveredKm: number;
  lastUpdatedAt: string | null;
  isStale: boolean;
};

/* Lightweight, frequently-polled live GPS lookup — separate from
   useCampaignTracking so a location refresh never pulls the whole booking.
   `enabled` should be false whenever the journey stage isn't On Road: no
   request is made at all in that case (the placeholder in the page covers
   that state instead). */
export function useLiveLocation(
  mongoId: string,
  token: string | null,
  enabled: boolean,
) {
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lastUpdatedRef = useRef<string>("");

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function fetchLocation(showLoading: boolean) {
      if (showLoading) setLoading(true);

      try {
        const response = await fetch(
          `${baseUrl}/client-requests/${mongoId}/live-location`,
          {
            cache: "no-store",
            headers: clientAuthHeaders(token),
          },
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.message || "Unable to load live location.",
          );
        }

        if (!active) return;

        const nextVehicles: LiveVehicle[] = result.data?.vehicles || [];
        const signature = nextVehicles
          .map((v) => `${v.registrationNumber}:${v.lastUpdatedAt}`)
          .join("|");

        if (signature !== lastUpdatedRef.current) {
          lastUpdatedRef.current = signature;
          setVehicles(nextVehicles);
        }

        setError("");
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load live location.",
        );
      } finally {
        if (active && showLoading) setLoading(false);
      }
    }

    function stopPolling() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    }

    function startPolling() {
      if (intervalId) return;
      intervalId = setInterval(() => fetchLocation(false), POLL_INTERVAL_MS);
    }

    function handleVisibility() {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchLocation(false);
        startPolling();
      }
    }

    fetchLocation(true);

    if (!document.hidden) startPolling();

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
      /* Runs on unmount and whenever `enabled` flips back to false (or
         mongoId/token change) — clears stale vehicles rather than leaving
         a stopped-being-on-road booking showing its last known position. */
      setVehicles([]);
      setError("");
      lastUpdatedRef.current = "";
    };
  }, [mongoId, token, enabled]);

  return { vehicles, loading, error };
}
