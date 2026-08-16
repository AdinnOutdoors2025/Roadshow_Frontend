"use client";

import { useEffect, useRef, useState } from "react";

import { baseUrl } from "../../../BaseUrl";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";

import type { JourneyStep } from "./JourneyTimeline";

const POLL_INTERVAL_MS = 25000;

export type TrackingActivity = {
  label: string;
  at: string;
};

export type DayWiseReportRow = {
  day: string;
  status: "upcoming" | "ongoing" | "completed" | "not_reported";
  distanceCoveredKm: number;
  activationsCount: number;
  leadsCollected: number;
  peopleEngaged: number;
  routeNote: string;
  photos: string[];
  isAbsentDay: boolean;
};

export type TrackingPhoto = { url: string; day: string };

export type TrackingData = {
  clientOrderId: string;
  bookingSummary: {
    campaignName: string;
    location: string;
    startDate: string | null;
    endDate: string | null;
    totalDays: number | null;
    vehicleTypeCount: number;
    vehicleCount: number;
  };
  journeyStage: { index: number; key: string };
  isCancelled: boolean;
  vehicleUnavailable: boolean;
  onRoad: { day: number; totalDays: number } | null;
  steps: JourneyStep[];
  activity: TrackingActivity[];
  dayWiseReport: DayWiseReportRow[];
  photos: TrackingPhoto[];
  lastUpdatedAt: string;
};

/* Fetches the client-safe tracking payload for one booking and polls for
   updates only while a mongoId is supplied (i.e. only while the tracking
   console is open — the caller un-sets mongoId on close, which tears this
   hook's effect down and stops the interval). Pauses while the tab is
   hidden and refetches immediately on refocus, per the "don't hammer the
   server" / "client should never need to manually refresh" requirements. */
export function useCampaignTracking(
  mongoId: string,
  token: string | null,
) {
  const [data, setData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lastUpdatedRef = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    async function fetchTracking(showLoading: boolean) {
      if (showLoading) setLoading(true);

      try {
        const response = await fetch(
          `${baseUrl}/client-requests/${mongoId}/tracking`,
          {
            cache: "no-store",
            headers: clientAuthHeaders(token),
          },
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.message || "Unable to load campaign tracking.",
          );
        }

        if (!active) return;

        const next: TrackingData = result.data;

        if (next.lastUpdatedAt !== lastUpdatedRef.current) {
          lastUpdatedRef.current = next.lastUpdatedAt;
          setData(next);
        }

        setError("");
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load campaign tracking.",
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
      intervalId = setInterval(() => fetchTracking(false), POLL_INTERVAL_MS);
    }

    function handleVisibility() {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchTracking(false);
        startPolling();
      }
    }

    fetchTracking(true);

    if (!document.hidden) startPolling();

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [mongoId, token]);

  return { data, loading, error };
}
