/*eslint-disable*/
//@ts-nocheck
"use client";
import { History, User, Car, PlusCircle, MinusCircle, PencilLine } from "lucide-react";
import { SalesOrder } from "./page";

interface Props {
  order: SalesOrder;
  getVehicleTypeName: (id: string) => string;
}

const fmtDatetime = (s?: string) =>
  s ? new Date(s).toLocaleString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }) : "—";

export default function OrderEditHistoryTab({ order, getVehicleTypeName }: Props) {
  const history = [...(order.orderEditHistory || [])].sort(
    (a, b) => new Date(b.editedAt).getTime() - new Date(a.editedAt).getTime()
  );

  // ── Resolve display value; special-case "Vehicle Type" → resolve ID to name ──
  const displayVal = (field: string, v: any) => {
    if (v === null || v === undefined || v === "") return "—";
    if (typeof v === "boolean") return v ? "Yes" : "No";
    if (field === "Vehicle Type") {
      return getVehicleTypeName(String(v)) || String(v);
    }
    return String(v);
  };

  // ── Build a richer header label using resolved vehicle type name ──
  const resolveHeaderLabel = (vc: SalesOrder["orderEditHistory"][number]["vehicleChanges"][number]) => {
    const typeChange = vc.changes.find((c) => c.field === "Vehicle Type");
    const rawTypeId =
      (vc.action === "removed" ? typeChange?.oldValue : typeChange?.newValue) ||
      (vc as any).vehicleTypeId;
    const typeName = rawTypeId ? getVehicleTypeName(String(rawTypeId)) : "";
    const parts = [typeName, vc.vehicleLabel].filter(Boolean);
    return parts.join(" · ");
  };

  if (history.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400">
        <History size={32} className="mx-auto mb-2 opacity-30" />
        <p className="text-sm">No edits made to this order yet</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {history.map((h) => (
        <div key={h._id} className="rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <History size={14} className="text-blue-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Edited by {h.editedBy || "Admin"}
              </span>
            </div>
            <span className="text-xs text-gray-400">{fmtDatetime(h.editedAt)}</span>
          </div>

          <div className="p-4 space-y-4">
            {/* Customer field changes */}
            {h.customerChanges?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <User size={12} /> Customer Details
                </p>
                <div className="space-y-1.5">
                  {h.customerChanges.map((c, i) => (
                    <div key={i} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-gray-800/40 rounded-lg px-3 py-2">
                      <span className="text-gray-500">{c.field}</span>
                      <span className="text-right">
                        <span className="text-red-500 line-through mr-2">{displayVal(c.field, c.oldValue)}</span>
                        <span className="text-green-600 font-medium">{displayVal(c.field, c.newValue)}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vehicle changes */}
            {h.vehicleChanges?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Car size={12} /> Vehicle Changes
                </p>
                <div className="space-y-2">
                  {h.vehicleChanges.map((vc, i) => {
                    const headerLabel = resolveHeaderLabel(vc);
                    return (
                      <div key={i} className="rounded-lg border border-gray-100 dark:border-gray-700 overflow-hidden">

                        {/* Header per vehicle */}
                        <div className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold
                          ${vc.action === "added" ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
                            vc.action === "removed" ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" :
                            "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"}`}>
                          {vc.action === "added" && <PlusCircle size={12} />}
                          {vc.action === "removed" && <MinusCircle size={12} />}
                          {vc.action === "modified" && <PencilLine size={12} />}
                          <span>
                            Vehicle {vc.vehicleIndex + 1}
                            {headerLabel ? ` · ${headerLabel}` : ""}
                          </span>
                          <span className="ml-auto uppercase tracking-wide">
                            {vc.action === "added" ? "Added" : vc.action === "removed" ? "Removed" : "Modified"}
                          </span>
                        </div>

                        {/* Field list */}
                        <div className="p-3 space-y-1">
                          {vc.changes.length === 0 ? (
                            <p className="text-xs text-gray-400">No field details available</p>
                          ) : vc.action === "removed" ? (
                            vc.changes.map((c, j) => (
                              <div key={j} className="flex items-center justify-between text-sm py-0.5">
                                <span className="text-gray-500">{c.field}</span>
                                <span className="text-red-500 line-through">{displayVal(c.field, c.oldValue)}</span>
                              </div>
                            ))
                          ) : vc.action === "added" ? (
                            vc.changes.map((c, j) => (
                              <div key={j} className="flex items-center justify-between text-sm py-0.5">
                                <span className="text-gray-500">{c.field}</span>
                                <span className="text-green-600 font-medium">{displayVal(c.field, c.newValue)}</span>
                              </div>
                            ))
                          ) : (
                            vc.changes.map((c, j) => (
                              <div key={j} className="flex items-center justify-between text-sm py-0.5">
                                <span className="text-gray-500">{c.field}</span>
                                <span className="text-right">
                                  <span className="text-red-500 line-through mr-2">{displayVal(c.field, c.oldValue)}</span>
                                  <span className="text-green-600 font-medium">{displayVal(c.field, c.newValue)}</span>
                                </span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}