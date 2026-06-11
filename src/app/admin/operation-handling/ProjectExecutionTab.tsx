


/* eslint-disable */
// @ts-nocheck
"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import {
  Truck, User, Phone, Car, Upload, Eye,
  Plus, History, XCircle, AlertCircle,
  CheckCircle, Clock, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import API_BASE from "../../../../baseurl";
import { getToken } from "../../utils/auth";
import { useVehicle } from '../../../context/vehicletypecontext';
import DriverForm from "./DriverForm";

interface Order {
  _id: string;
  orderId: string;
  name: string;
  bookingItems: any[];
  onRoadExecutionArray?: any[];
  pipelineStatus: string;
  handlerName?: string;
}

const fmtDate = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
};

const fmtDatetime = (s?: string) => {
  if (!s) return "—";
  return new Date(s).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
};


// ─── Vehicle Execution Card ───────────────────────────────────────────────────
function VehicleExecutionCard({
  vehicle,
  vehicleIndex,
  order,
  onRefresh,
}) {
  const [open, setOpen] = useState(false);
  const [toggling, setToggling] = useState(false);
   const { vehicleTypes, fetchVehicleTypes } = useVehicle();


  
      useEffect(() => {
          fetchVehicleTypes()
      }, [])

        const getVehicleTypeName = (vehicleTypeId: string) => {
        if (!vehicleTypeId || !vehicleTypes) return "";
        const vehicle = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
        return vehicle?.typeName || vehicleTypeId;
    };


  const vehicleEntries = (order.onRoadExecutionArray || []).filter(
    (e) => e.vehicleIndex === vehicleIndex
  );

  const quantity = vehicle.quantity || 1;
  const savedCount = vehicleEntries.length;


  const allDriversSaved = savedCount >= quantity;

 
  const isVehicleOnRoad = vehicleEntries.some((e) => e.onRoadStatus === 1);

 
  const handleVehicleToggle = async () => {
    if (!allDriversSaved) return;
    setToggling(true);
    try {
      const token = getToken();
      const newStatus = isVehicleOnRoad ? 0 : 1;

    
      for (const entry of vehicleEntries) {
        await axios.patch(
          `${API_BASE}admin/pipeline/${order._id}/onroad-status/${entry._id}`,
          { onRoadStatus: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      toast.success(
        newStatus === 1
          ? `${quantity} vehicle${quantity > 1 ? "s" : ""} marked On Road!`
          : `Vehicle${quantity > 1 ? "s" : ""} marked Off Road`
      );
      onRefresh();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Failed to update status");
    } finally {
      setToggling(false);
    }
  };  

  

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-md transition-all">
      {/* Card Header */}
      <div
        className="flex items-center gap-4 p-4 bg-white dark:bg-gray-900 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
        onClick={() => setOpen(!open)}
      >
        {/* Vehicle Badge */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm bg-gradient-to-br ${
          isVehicleOnRoad
            ? "from-green-400 to-green-600"
            : allDriversSaved
            ? "from-teal-400 to-teal-600"
            : "from-gray-400 to-gray-500"
        }`}>
          V{vehicleIndex + 1}
        </div>

   
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="text-md font-bold text-gray-800 dark:text-gray-100">
               {getVehicleTypeName(vehicle.vehicleType)}
          
            </p>
            <span className="text-[13px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 font-medium border border-teal-200 dark:border-teal-800">
              {vehicle.campaignType || "—"}
            </span>
            {isVehicleOnRoad && (
              <span className="text-[13px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-bold border border-green-200 animate-pulse">
                On Road
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {fmtDate(vehicle.fromDate)} → {fmtDate(vehicle.toDate)}
            </span>
            <span className="font-medium text-gray-600 dark:text-gray-400">
              ({vehicle.totalDays}D)
            </span>
            <span className="flex items-center gap-1">
              <Truck size={15} />
              {quantity} {quantity === 1 ? "vehicle" : "vehicles"}
            </span>
          </div>
          {vehicle.campaignName && (
            <p className="text-sm text-gray-400 mt-0.5">{vehicle.campaignName}</p>
          )}
        </div>

      
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
            allDriversSaved
              ? "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
              : "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
          }`}>
            {savedCount}/{quantity} drivers
          </span>
          {open
            ? <ChevronUp size={16} className="text-gray-400" />
            : <ChevronDown size={16} className="text-gray-400" />
          }
        </div>
      </div>

      {/* Expanded Section */}
      {open && (
        <div className="border-t border-gray-100 dark:border-gray-800 p-4 space-y-3 bg-gray-50/30 dark:bg-gray-900/30">

         
          {Array.from({ length: quantity }).map((_, slotIdx) => {
            const existingEntry = vehicleEntries[slotIdx] || null;
            return (
              <DriverForm
                key={slotIdx}
                vehicleIndex={vehicleIndex}
                slotIndex={slotIdx}
                orderId={order._id}
                existingEntry={existingEntry}
                onSaved={onRefresh}
              />
            );
          })}

        
          {allDriversSaved && (
            <div className="mt-2 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                isVehicleOnRoad
                  ? "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700"
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
              }`}>
                <div>
                  <p className="text-md font-bold text-gray-800 dark:text-gray-200">
                    On Road Status
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {quantity} vehicle{quantity > 1 ? "s" : ""} will be marked {isVehicleOnRoad ? "on road" : "off road"}
                  </p>
                  {isVehicleOnRoad && (
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1 flex items-center gap-1">
                      <CheckCircle size={11} />
                      Currently active on road
                    </p>
                  )}
                </div>

                <button
                  onClick={handleVehicleToggle}
                  disabled={toggling}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60 ${
                    isVehicleOnRoad
                      ? "bg-green-500 hover:bg-green-600 text-white shadow-lg shadow-green-500/30"
                      : "bg-gray-200 hover:bg-teal-100 text-gray-700 hover:text-teal-700 dark:bg-gray-700 dark:hover:bg-teal-900/30 dark:text-gray-300"
                  }`}
                >
                  {toggling ? (
                    <>
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      Updating...
                    </>
                  ) : isVehicleOnRoad ? (
                    <>
                      <ToggleRight size={25} />
                      On Road
                    </>
                  ) : (
                    <>
                      <ToggleLeft size={25} />
                      Off Road
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

        
          {!allDriversSaved && savedCount > 0 && (
            <div className="mt-2 pt-4 border-t-2 border-dashed border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between p-4 rounded-xl border-2 border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 opacity-50">
                <div>
                  <p className="text-sm font-bold text-gray-500">On Road Status</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Add {quantity - savedCount} more driver{quantity - savedCount > 1 ? "s" : ""} to unlock
                  </p>
                </div>
                <button
                  disabled
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-700"
                >
                  <ToggleLeft size={18} />
                  Locked
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}



// ─── Main Export ──────────────────────────────────────────────────────────────
export default function ProjectExecutionTab({ order, onRefresh }) {
  const vehicles = order.bookingItems || [];
  const allEntries = order.onRoadExecutionArray || [];
  const totalOnRoad = allEntries.filter((e) => e.onRoadStatus === 1).length;

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4">
        <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Truck className="w-9 h-9 text-gray-400" />
        </div>
        <p className="text-base font-semibold text-gray-600 dark:text-gray-400">No vehicles found</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center shadow-sm">
          <Truck size={18} className="text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-900 dark:text-white">Project Execution</h3>
          <p className="text-md text-gray-500">
            {vehicles.length} booking item{vehicles.length > 1 ? "s" : ""} · Add driver details per vehicle
          </p>
        </div>
      
      </div>

  
      <div className="space-y-3">
        {vehicles.map((vehicle, idx) => (
          <VehicleExecutionCard
            key={idx}
            vehicle={vehicle}
            vehicleIndex={idx}
            order={order}
            onRefresh={onRefresh}
          />
        ))}
      </div>

     
    </div>
  );
}