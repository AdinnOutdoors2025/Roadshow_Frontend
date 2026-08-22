"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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
  const [refreshing, setRefreshing] = useState(false);
  const signatureRef = useRef("");
  const activeRef = useRef(true);
  /* Bridges the polling effect's local fetch function out to the manual
     refresh() below — kept as a ref (not a useCallback dependency) so the
     effect's own direct call stays a plain local-function invocation, the
     same shape it had before "Refresh" needed to reach it. */
  const fetchRef = useRef<() => Promise<void>>(async () => {});

  useEffect(() => {
    activeRef.current = true;

    if (!enabled) return;

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

        if (!response.ok || !result?.success || !activeRef.current) return;

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

    fetchRef.current = fetchRouteTrack;

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
      activeRef.current = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
      setVehicles([]);
      signatureRef.current = "";
    };
  }, [mongoId, token, enabled]);

  /* Extracted so the "Refresh" button on the map card (page.tsx) can force a
     re-check of the cached trackId instead of only refreshing the sidebar
     GPS stats via useLiveLocation — otherwise clicking Refresh never
     touched the actual embedded route map. */
  const refresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await fetchRef.current();
    } finally {
      if (activeRef.current) setRefreshing(false);
    }
  }, []);

  return { vehicles, refreshing, refresh };
}
