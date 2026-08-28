"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { baseUrl } from "../../../../BaseUrl";
import { clientAuthHeaders } from "@/lib/roadshowAuthToken";

export type VehicleHistoryPreset =
  | "6h"
  | "12h"
  | "today"
  | "yesterday"
  | "custom";

export type VehicleHistoryPoint = {
  id: string;
  at: string | null;
  date: string;
  time: string;
  latitude: number | null;
  longitude: number | null;
  maxSpeedKmh: number | null;
  out: string;
  address: string;
  direction: string;
  googleMapUrl: string | null;
  cumulativeDistanceKm: number | null;
  odometerKm: number | null;
  fuelLitres: number | null;
  ignitionStatus: string;
  movementStatus: string;
};

export type VehicleHistorySummary = {
  pointCount: number;
  distanceKm: number;
  maxSpeedKmh: number;
  movingCount: number;
  parkedCount: number;
  idleCount: number;
  ignitionOnCount: number;
  startAddress: string;
  endAddress: string;
};

export type VehicleHistoryVehicle = {
  registrationNumber: string;
  unavailable: boolean;
  message?: string;
  rows: VehicleHistoryPoint[];
  summary: VehicleHistorySummary;
  /* Replacement chain for this slot, oldest → current (e.g. ["2345",
     "7852"]) — present whenever this row's vehicle replaced an earlier one. */
  originalVehicle?: string;
  registrationChain?: string[];
  wasReplaced?: boolean;
};

type VehicleHistoryResponse = {
  range: {
    preset: VehicleHistoryPreset;
    fromDate: string;
    fromTime: string;
    toDate: string;
    toTime: string;
    fromDateUTC: number;
    toDateUTC: number;
  };
  vehicles: VehicleHistoryVehicle[];
};

export function useVehicleHistory({
  mongoId,
  token,
  enabled,
  vehicle,
  preset,
  fromDate,
  fromTime,
  toDate,
  toTime,
}: {
  mongoId: string;
  token: string | null;
  enabled: boolean;
  vehicle?: string;
  preset: VehicleHistoryPreset;
  fromDate?: string;
  fromTime?: string;
  toDate?: string;
  toTime?: string;
}) {
  const [data, setData] = useState<VehicleHistoryResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("preset", preset);

    if (vehicle) params.set("vehicle", vehicle);

    if (preset === "custom") {
      if (fromDate) params.set("fromDate", fromDate);
      if (fromTime) params.set("fromTime", fromTime);
      if (toDate) params.set("toDate", toDate);
      if (toTime) params.set("toTime", toTime);
    }

    return params.toString();
  }, [vehicle, preset, fromDate, fromTime, toDate, toTime]);

  const fetchHistory = useCallback(
    async (mode: "initial" | "refresh" = "initial") => {
      if (!enabled || !mongoId) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (mode === "initial") setLoading(true);
      if (mode === "refresh") setRefreshing(true);

      try {
        const response = await fetch(
          `${baseUrl}/client-requests/${mongoId}/vehicle-history?${query}`,
          {
            cache: "no-store",
            headers: clientAuthHeaders(token),
            signal: controller.signal,
          },
        );

        const result = await response.json().catch(() => null);

        if (!response.ok || !result?.success) {
          throw new Error(
            result?.message || "Unable to load vehicle history.",
          );
        }

        setData(result.data);
        setError("");
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load vehicle history.",
        );
      } finally {
        if (!controller.signal.aborted) {
          if (mode === "initial") setLoading(false);
          if (mode === "refresh") setRefreshing(false);
        }
      }
    },
    [enabled, mongoId, query, token],
  );

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setError("");
      return;
    }

    void fetchHistory("initial");

    return () => {
      abortRef.current?.abort();
    };
  }, [enabled, fetchHistory]);

  const refresh = useCallback(
    async () => fetchHistory("refresh"),
    [fetchHistory],
  );

  return {
    data,
    loading,
    refreshing,
    error,
    refresh,
  };
}
