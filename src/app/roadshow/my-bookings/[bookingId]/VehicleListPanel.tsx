"use client";

import { Radio } from "lucide-react";

import type { LiveVehicle } from "./useLiveLocation";

/* Flat "Vehicles on Road" list — reuses the same liveVehicles array, status
   classifier and image resolver page.tsx already computes; this component
   only renders them as list rows instead of the old tabbed carousel. */
export default function VehicleListPanel({
  vehicles,
  selectedReg,
  onSelect,
  resolveVehicleImage,
  statusClass,
  formatVehicleChain,
  loading,
}: {
  vehicles: LiveVehicle[];
  selectedReg: string;
  onSelect: (registrationNumber: string) => void;
  resolveVehicleImage: (registrationNumber?: string | null) => string;
  statusClass: (status?: string) => string;
  formatVehicleChain: (vehicle?: {
    registrationNumber?: string | null;
    registrationChain?: string[];
    wasReplaced?: boolean;
  }) => string;
  loading?: boolean;
}) {
  if (loading && !vehicles.length) {
    return (
      <div className="RST_MiniLoading">
        <Radio size={18} />
        Loading live vehicles...
      </div>
    );
  }

  if (!vehicles.length) {
    return (
      <div className="RST_EmptyMini">
        <Radio size={22} />
        <strong>No live vehicle returned yet</strong>
        <p>
          Tracking will appear automatically when the GPS feed becomes
          available.
        </p>
      </div>
    );
  }

  return (
    <div className="RST_VehicleListPanel">
      {vehicles.map((vehicle, index) => {
        const reg = vehicle.registrationNumber || `pending-${index}`;
        const active = reg === selectedReg;

        const stateClass = vehicle.pending
          ? "RST_VehicleState--pending"
          : vehicle.unavailable
            ? "RST_VehicleState--unavailable"
            : statusClass(vehicle.status);

        const stateLabel = vehicle.pending
          ? "Awaiting assignment"
          : vehicle.unavailable
            ? "Unavailable"
            : vehicle.isStale
              ? "GPS delayed"
              : vehicle.status;

        return (
          <button
            key={reg}
            type="button"
            className={`RST_VehicleListRow ${
              active ? "RST_VehicleListRow--active" : ""
            }`}
            onClick={() => onSelect(reg)}
          >
            <span className="RST_VehicleListThumb">
              <img src={resolveVehicleImage(vehicle.registrationNumber)} alt="" />
            </span>

            <span className="RST_VehicleListBody">
              <strong>
                {vehicle.pending
                  ? vehicle.vehicleName || "Vehicle"
                  : formatVehicleChain(vehicle)}
              </strong>

              <span className={`RST_VehicleState ${stateClass}`}>
                {stateLabel}
              </span>

              <small>
                {vehicle.pending
                  ? "Not yet assigned"
                  : vehicle.address || "Location not available"}
              </small>
            </span>

            <span className="RST_VehicleListSpeed">
              {vehicle.pending || vehicle.unavailable
                ? "—"
                : `${Number(vehicle.speedKmh || 0).toFixed(0)} km/h`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
