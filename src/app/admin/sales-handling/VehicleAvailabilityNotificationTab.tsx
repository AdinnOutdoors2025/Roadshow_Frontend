/* eslint-disable */
// @ts-nocheck

"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Bell,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  XCircle,
} from "lucide-react";

import API_BASE from "../../../../baseurl";
import { useVehicle } from "../../../context/vehicletypecontext";
import { SalesOrder } from "./page";

interface AvailabilityInfo {
  available: boolean;
  availableCount: number;
  requiredQuantity: number;
  totalFleet: number;
  error?: string;
}

interface AvailabilityGroup {
  key: string;
  vehicleType: string;
  fromDate: string;
  toDate: string;
  quantity: number;
  availability?: AvailabilityInfo;
}

const fmtDate = (value?: string) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const normalizeId = (value: any) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return String(value?._id || value?.$oid || value);
};

export default function VehicleAvailabilityNotificationTab({
  order,
}: {
  order: SalesOrder;
}) {
  const { vehicleTypes, fetchVehicleTypes } = useVehicle();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<AvailabilityGroup[]>([]);
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  const requestedGroups = useMemo(() => {
    const map = new Map<string, AvailabilityGroup>();

    (order.bookingItems || []).forEach((item: any, index: number) => {
      const vehicleType = normalizeId(item.vehicleType);
      const fromDate = item.fromDate || "";
      const toDate = item.toDate || "";
      const quantity = Number(item.quantity || 0);

      if (!vehicleType || !fromDate || !toDate) return;

      const key = `${vehicleType}|${fromDate}|${toDate}`;
      const existing = map.get(key);

      if (existing) {
        existing.quantity += quantity;
      } else {
        map.set(key, {
          key: `${key}|${index}`,
          vehicleType,
          fromDate,
          toDate,
          quantity,
        });
      }
    });

    return Array.from(map.values());
  }, [order.bookingItems]);

  useEffect(() => {
    fetchVehicleTypes();
  }, []);

  useEffect(() => {
    fetchAvailability();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order._id, requestedGroups.length, refreshKey]);

  useEffect(() => {
    setActiveVehicleIndex(0);
  }, [order._id]);

  useEffect(() => {
    if (activeVehicleIndex >= groups.length) {
      setActiveVehicleIndex(0);
    }
  }, [groups.length, activeVehicleIndex]);

  const fetchAvailability = async () => {
    setLoading(true);

    try {
      if (requestedGroups.length === 0) {
        setGroups([]);
        return;
      }

      const results = await Promise.all(
        requestedGroups.map(async (group) => {
          try {
            const { data } = await axios.post(
              `${API_BASE}api/checkAvailability`,
              {
                vehicleType: group.vehicleType,
                quantity: group.quantity,
                fromDate: group.fromDate,
                toDate: group.toDate,
              }
            );

            const result = data?.data || {};
            let totalFleet = Number(result.totalFleet ?? 0);

            if (!Number.isFinite(totalFleet) || totalFleet <= 0) {
              try {
                const inventoryRes = await axios.get(
                  `${API_BASE}api/getNewVehicles?vehicleType=${encodeURIComponent(
                    group.vehicleType
                  )}`
                );

                const rawGroups = inventoryRes?.data?.data || [];

                totalFleet = rawGroups.reduce(
                  (sum: number, vehicleGroup: any) =>
                    sum + (vehicleGroup?.registrationVehicles?.length || 0),
                  0
                );
              } catch {
                totalFleet = 0;
              }
            }

            const availableCount = Number(result.availableCount ?? 0);
            const requiredQuantity = Number(
              result.requiredQuantity ?? group.quantity
            );

            return {
              ...group,
              availability: {
                available:
                  typeof result.available === "boolean"
                    ? result.available
                    : availableCount >= requiredQuantity,
                availableCount,
                requiredQuantity,
                totalFleet,
              },
            };
          } catch (err: any) {
            return {
              ...group,
              availability: {
                available: false,
                availableCount: 0,
                requiredQuantity: group.quantity,
                totalFleet: 0,
                error:
                  err?.response?.data?.message ||
                  "Vehicle inventory data is unavailable.",
              },
            };
          }
        })
      );

      setGroups(results);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleTypeName = (vehicleTypeId: string) => {
    if (!vehicleTypeId || !vehicleTypes) {
      return vehicleTypeId || "Vehicle";
    }

    const vehicle = vehicleTypes.find(
      (item: any) =>
        normalizeId(item?._id) === normalizeId(vehicleTypeId)
    );

    return vehicle?.typeName || vehicleTypeId;
  };

  const activeGroup = groups[activeVehicleIndex];

  const scrollTabs = (direction: "left" | "right") => {
    const container = document.getElementById(
      "vehicle-availability-tabs"
    );

    if (!container) return;

    container.scrollBy({
      left: direction === "left" ? -220 : 220,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="p-4">
        <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-14 text-center">
          <Bell size={34} className="mx-auto mb-3 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
            Vehicle inventory data is unavailable.
          </p>
          <p className="text-xs text-gray-400 mt-1">
            This order does not contain a valid vehicle type and campaign date
            range.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      <div className="rounded-xl border border-blue-200 dark:border-blue-800/50 bg-blue-50 dark:bg-blue-900/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Bell size={17} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-800 dark:text-blue-300">
                Vehicle Availability
              </h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Live inventory availability for this order&apos;s vehicle types
                and campaign dates.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-white/70 dark:bg-gray-900 text-blue-600 dark:text-blue-400 text-xs font-semibold hover:bg-white transition-all"
          >
            <RefreshCw size={12} />
            Refresh
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="relative flex items-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={() => scrollTabs("left")}
            className="w-9 h-12 flex items-center justify-center border-r border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
          >
            <ChevronLeft size={16} />
          </button>

          <div
            id="vehicle-availability-tabs"
            className="flex-1 min-w-0 overflow-x-auto overflow-y-hidden"
            style={{
              scrollbarWidth: "thin",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <div className="flex w-max min-w-full">
              {groups.map((group, index) => {
                const active = activeVehicleIndex === index;
                const availability = group.availability;

                const isAvailable =
                  !availability?.error &&
                  (availability?.availableCount ?? 0) >=
                    (availability?.requiredQuantity ?? group.quantity);

                return (
                  <button
                    type="button"
                    key={group.key}
                    onClick={() => setActiveVehicleIndex(index)}
                    className={`relative flex-shrink-0 w-[220px] px-4 py-3 text-left border-r border-gray-200 dark:border-gray-700 transition-all ${
                      active
                        ? "bg-white dark:bg-gray-900"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          active
                            ? "bg-blue-100 dark:bg-blue-900/30"
                            : "bg-gray-100 dark:bg-gray-800"
                        }`}
                      >
                        <Car
                          size={14}
                          className={
                            active
                              ? "text-blue-600"
                              : "text-gray-400"
                          }
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-xs font-bold truncate ${
                            active
                              ? "text-blue-600 dark:text-blue-400"
                              : "text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {getVehicleTypeName(group.vehicleType)}
                        </p>

                        <p className="text-[10px] text-gray-400 mt-0.5">
                          Qty {group.quantity}
                        </p>
                      </div>

                      <span
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          availability?.error
                            ? "bg-amber-400"
                            : isAvailable
                              ? "bg-emerald-500"
                              : "bg-red-500"
                        }`}
                      />
                    </div>

                    {active && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => scrollTabs("right")}
            className="w-9 h-12 flex items-center justify-center border-l border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {activeGroup &&
          (() => {
            const availability = activeGroup.availability;

            if (!availability) return null;

            const isAvailable =
              !availability.error &&
              availability.availableCount >= availability.requiredQuantity;

            return (
              <div>
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        availability.error
                          ? "bg-amber-100 dark:bg-amber-900/30"
                          : isAvailable
                            ? "bg-emerald-100 dark:bg-emerald-900/30"
                            : "bg-red-100 dark:bg-red-900/30"
                      }`}
                    >
                      <Car
                        size={20}
                        className={
                          availability.error
                            ? "text-amber-600"
                            : isAvailable
                              ? "text-emerald-600"
                              : "text-red-600"
                        }
                      />
                    </div>

                    <div className="min-w-0">
                      <p className="text-base font-bold text-gray-900 dark:text-white truncate">
                        {getVehicleTypeName(activeGroup.vehicleType)}
                      </p>

                      <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                        <CalendarDays size={13} />
                        <span>
                          {fmtDate(activeGroup.fromDate)} →{" "}
                          {fmtDate(activeGroup.toDate)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {!availability.error && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
                        isAvailable
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                      }`}
                    >
                      {isAvailable ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <XCircle size={14} />
                      )}
                      {isAvailable ? "Available" : "Not Available"}
                    </span>
                  )}
                </div>

                <div className="p-5">
                  {availability.error ? (
                    <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-4">
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                        Vehicle inventory data is unavailable.
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        {availability.error}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div
                        className={`rounded-xl border p-3.5 mb-4 ${
                          isAvailable
                            ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/50"
                            : "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-800/50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {isAvailable ? (
                            <CheckCircle2
                              size={18}
                              className="text-emerald-600 flex-shrink-0"
                            />
                          ) : (
                            <XCircle
                              size={18}
                              className="text-red-600 flex-shrink-0"
                            />
                          )}

                          <p
                            className={`text-sm font-semibold ${
                              isAvailable
                                ? "text-emerald-700 dark:text-emerald-300"
                                : "text-red-700 dark:text-red-300"
                            }`}
                          >
                            {isAvailable
                              ? "The vehicle is available for the selected date range."
                              : "The vehicle is not available for the selected date range."}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <AvailabilityCard
                          label="Total Vehicle"
                          value={availability.totalFleet}
                          type="normal"
                        />
                        <AvailabilityCard
                          label="Available Vehicle"
                          value={availability.availableCount}
                          type={isAvailable ? "success" : "danger"}
                        />
                        <AvailabilityCard
                          label="This Order Vehicle Count"
                          value={availability.requiredQuantity}
                          type="primary"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}

function AvailabilityCard({
  label,
  value,
  type,
}: {
  label: string;
  value?: number;
  type: "normal" | "success" | "danger" | "primary";
}) {
  const valueClass =
    type === "success"
      ? "text-emerald-600 dark:text-emerald-400"
      : type === "danger"
        ? "text-red-600 dark:text-red-400"
        : type === "primary"
          ? "text-blue-600 dark:text-blue-400"
          : "text-gray-900 dark:text-white";

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-800/40 p-5 text-center">
      <p className={`text-3xl font-extrabold ${valueClass}`}>
        {value ?? "—"}
      </p>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-1.5">
        {label}
      </p>
    </div>
  );
}