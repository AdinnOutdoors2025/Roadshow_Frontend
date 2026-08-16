"use client";

import { useEffect, useRef, useState } from "react";

import { baseUrl } from "../../../../BaseUrl";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";

/* Much slower poll than useLiveLocation — this hits a server-cached, heavy
   (multi-MB upstream) Vamosys history call. Polling faster than the
   server's own cache TTL would just be wasted requests. */
const POLL_INTERVAL_MS = 90000;

export type DrivingSummary = {
  movingTimeMs: number;
  parkedTimeMs: number;
  idleTimeMs: number;
  noDataTimeMs: number;
  tripDistanceKm: number;
  avgSpeedKmh: number;
  topSpeedKmh: number;
  overSpeedInstances: number;
  overSpeedLimitKmh: number;
  startAddress: string;
  endAddress: string;
  vehicleMode: string;
};

export type DrivingSummaryVehicle = {
  registrationNumber: string;
  drivingSummary: DrivingSummary | null;
};

export function useDrivingSummary(
  mongoId: string,
  token: string | null,
  enabled: boolean,
) {
  const [vehicles, setVehicles] = useState<DrivingSummaryVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const signatureRef = useRef("");

  useEffect(() => {
    if (!enabled) return;

    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function fetchSummary(showLoading: boolean) {
      if (showLoading) setLoading(true);

      try {
        const response = await fetch(
          `${baseUrl}/client-requests/${mongoId}/driving-summary`,
          {
            cache: "no-store",
            headers: clientAuthHeaders(token),
          },
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success || !active) return;

        const next: DrivingSummaryVehicle[] = result.data?.vehicles || [];
        const signature = JSON.stringify(next);

        if (signature !== signatureRef.current) {
          signatureRef.current = signature;
          setVehicles(next);
        }
      } catch {
        // Best-effort — the live-location panel already covers connectivity
        // errors; this section just quietly keeps its last known values.
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
      intervalId = setInterval(() => fetchSummary(false), POLL_INTERVAL_MS);
    }

    function handleVisibility() {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchSummary(false);
        startPolling();
      }
    }

    fetchSummary(true);

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

  return { vehicles, loading };
}
