"use client";

import { useEffect, useRef, useState } from "react";

import { baseUrl } from "../../../../BaseUrl";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";

/* Track ids are cached 5 minutes server-side (see Utils/vamosysClient.js
   getRouteTrackId), so polling faster than that would just repeat the same
   cached value. */
const POLL_INTERVAL_MS = 120000;

export type RouteTrackVehicle = {
  registrationNumber: string;
  trackId: string | null;
};

export function useRouteTrack(
  mongoId: string,
  token: string | null,
  enabled: boolean,
) {
  const [vehicles, setVehicles] = useState<RouteTrackVehicle[]>([]);
  const signatureRef = useRef("");

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function fetchRouteTrack() {
      try {
        const response = await fetch(
          `${baseUrl}/client-requests/${mongoId}/route-track`,
          {
            cache: "no-store",
            headers: clientAuthHeaders(token),
          },
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success || !active) return;

        const next: RouteTrackVehicle[] = result.data?.vehicles || [];
        const signature = JSON.stringify(next);

        if (signature !== signatureRef.current) {
          signatureRef.current = signature;
          setVehicles(next);
        }
      } catch {
        // Best-effort — the live-location panel already covers connectivity
        // errors; this just quietly falls back to the Leaflet map.
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
      intervalId = setInterval(fetchRouteTrack, POLL_INTERVAL_MS);
    }

    function handleVisibility() {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchRouteTrack();
        startPolling();
      }
    }

    fetchRouteTrack();

    if (!document.hidden) startPolling();

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
      setVehicles([]);
      signatureRef.current = "";
    };
  }, [mongoId, token, enabled]);

  return { vehicles };
}
