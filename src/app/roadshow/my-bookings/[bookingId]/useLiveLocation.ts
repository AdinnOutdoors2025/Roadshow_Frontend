"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { baseUrl } from "../../../../BaseUrl";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";

const POLL_INTERVAL_MS = 18000;

export type LiveVehicle = {
  registrationNumber: string;
  latitude?: number;
  longitude?: number;
  address?: string;
  speedKmh?: number;
  status?: "Moving" | "Parked" | "Idle" | "Unknown";
  distanceCoveredKm?: number;
  lastUpdatedAt?: string | null;
  isStale?: boolean;
  unavailable: boolean;
};

export function useLiveLocation(
  mongoId: string,
  token: string | null,
  enabled: boolean,
) {
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const mountedRef = useRef(true);
  const lastUpdatedRef = useRef<string>("");

  const fetchLocation = useCallback(
    async (mode: "initial" | "refresh" | "poll" = "poll") => {
      if (!enabled || !mongoId) return;

      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);

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

        if (!mountedRef.current) return;

        const nextVehicles: LiveVehicle[] = result.data?.vehicles || [];
        const signature = JSON.stringify(
          nextVehicles.map((vehicle) => ({
            registrationNumber: vehicle.registrationNumber,
            latitude: vehicle.latitude,
            longitude: vehicle.longitude,
            speedKmh: vehicle.speedKmh,
            status: vehicle.status,
            distanceCoveredKm: vehicle.distanceCoveredKm,
            lastUpdatedAt: vehicle.lastUpdatedAt,
            isStale: vehicle.isStale,
            unavailable: vehicle.unavailable,
          })),
        );

        if (signature !== lastUpdatedRef.current) {
          lastUpdatedRef.current = signature;
          setVehicles(nextVehicles);
        }

        setError("");
      } catch (err) {
        if (!mountedRef.current) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load live location.",
        );
      } finally {
        if (!mountedRef.current) return;
        if (mode === "initial") setLoading(false);
        if (mode === "refresh") setRefreshing(false);
      }
    },
    [mongoId, token, enabled],
  );

  useEffect(() => {
    mountedRef.current = true;

    if (!enabled) {
      setVehicles([]);
      setError("");
      lastUpdatedRef.current = "";
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;

    const stopPolling = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const startPolling = () => {
      if (intervalId) return;
      intervalId = setInterval(
        () => void fetchLocation("poll"),
        POLL_INTERVAL_MS,
      );
    };

    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        void fetchLocation("poll");
        startPolling();
      }
    };

    void fetchLocation("initial");
    if (!document.hidden) startPolling();

    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      mountedRef.current = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [enabled, fetchLocation]);

  const refresh = useCallback(async () => {
    await fetchLocation("refresh");
  }, [fetchLocation]);

  return {
    vehicles,
    loading,
    refreshing,
    error,
    refresh,
  };
}
