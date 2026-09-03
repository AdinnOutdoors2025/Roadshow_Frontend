import { useState } from "react";
import { Download } from "lucide-react";
import FilePreviewModal from "@/components/ui/FilePreviewModal";

const fmtDatetime = (s?: string) =>
    s ? new Date(s).toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    }) : "—";

const getImageUrl = (url: string) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    return `${process.env.NEXT_PUBLIC_API_BASE?.replace("/api", "") || "http://localhost:3001"}${url}`;
};

export default function UnavailableHistoryTab({ order, vehicleTypes }: { order: any; vehicleTypes: any[] }) {
    const [activeVehicleIdx, setActiveVehicleIdx] = useState(0);

    const getVehicleTypeName = (vehicleTypeId: string) => {
        if (!vehicleTypeId || !vehicleTypes) return "Vehicle";
        const v = vehicleTypes.find((vt: any) => vt._id === vehicleTypeId);
        return v?.typeName || "Vehicle";
    };


    const vehiclesWithHistory = (order.bookingItems || [])
        .map((item: any, idx: number) => ({ item, idx }))
        .filter(({ idx }: any) =>
            (order.onRoadUnavailableHistory || []).some((h: any) => h.vehicleIndex === idx)
        );

    const activeVehicle = vehiclesWithHistory[activeVehicleIdx];


    const [activeRegNo, setActiveRegNo] = useState<string | null>(null);
    const [preview, setPreview] = useState<{ url: string; label: string } | null>(null);

    const regNosForVehicle = activeVehicle
        ? [...new Set(
            (order.onRoadUnavailableHistory || [])
                .filter((h: any) => h.vehicleIndex === activeVehicle.idx)
                .map((h: any) => h.vehicleRegNo)
        )] as string[]
        : [];

    const currentRegNo = activeRegNo || regNosForVehicle[0] || null;

    const filteredHistory = (order.onRoadUnavailableHistory || [])
        .filter((h: any) =>
            h.vehicleIndex === activeVehicle?.idx &&
            h.vehicleRegNo === currentRegNo
        )
        .slice()
        .reverse();

    if (vehiclesWithHistory.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 px-4">
                <p className="text-sm text-gray-400">No unavailable history found</p>
            </div>
        );
    }

    return (
        <>
        <div className="p-4 space-y-4">

            <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">
                    Unavailable History
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                    {(order.onRoadUnavailableHistory || []).length} total records
                </span>
            </div>


            {vehiclesWithHistory.length > 1 && (
                <div className="flex gap-2 flex-wrap">
                    {vehiclesWithHistory.map(({ item, idx }: any, i: number) => (
                        <button
                            key={idx}
                            onClick={() => {
                                setActiveVehicleIdx(i);
                                setActiveRegNo(null);
                            }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-semibold transition-all ${activeVehicleIdx === i
                                    ? "border-red-300 bg-red-50 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
                                    : "border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400"
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs font-bold ${activeVehicleIdx === i ? "bg-red-500" : "bg-gray-400"
                                }`}>
                                V{idx + 1}
                            </div>
                            <div className="text-left">
                                <p className="text-xs font-bold">{getVehicleTypeName(item.vehicleType)}</p>
                                <p className="text-xs text-gray-400">{item.campaignName} · {item.campaignType}</p>
                            </div>
                        </button>
                    ))}
                </div>
            )}


            {vehiclesWithHistory.length === 1 && activeVehicle && (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                    <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        V{activeVehicle.idx + 1}
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                            {getVehicleTypeName(activeVehicle.item.vehicleType)}
                        </p>
                        <p className="text-xs text-gray-400">
                            {activeVehicle.item.campaignName} · {activeVehicle.item.campaignType}
                        </p>
                    </div>
                </div>
            )}


            {regNosForVehicle.length > 1 && (
                <div className="flex gap-1 flex-wrap border-b border-gray-100 dark:border-gray-800 pb-0">
                    {regNosForVehicle.map((regNo: string, i: number) => (
                        <button
                            key={regNo}
                            onClick={() => setActiveRegNo(regNo)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition-all ${currentRegNo === regNo
                                    ? "border-red-500 text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
                                    : "border-transparent text-gray-400 hover:text-gray-600"
                                }`}
                        >
                            <div className="w-4 h-4 rounded-full bg-red-400 flex items-center justify-center text-white" style={{ fontSize: "9px" }}>
                                {i + 1}
                            </div>
                            <span className="font-mono">{regNo}</span>
                        </button>
                    ))}
                </div>
            )}


            {regNosForVehicle.length === 1 && currentRegNo && (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-800/40 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">{currentRegNo}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">
                        {filteredHistory.length} records
                    </span>
                </div>
            )}


            <div className="space-y-3">
                {filteredHistory.length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">No records found</p>
                )}
                {filteredHistory.map((h: any, i: number) => (
                    <div
                        key={h._id || i}
                        className={`rounded-xl border p-4 space-y-2 ${h.status === "unavailable"
                                ? "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10"
                                : "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10"
                            }`}
                    >

                        <div className="flex items-center justify-between">
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                {h.driverName} — <span className="font-mono">{h.vehicleRegNo}</span>
                            </p>
                            <div className="flex items-center gap-1.5">
                                {h.eventType === "replaced" ? (
                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                                        Replaced
                                    </span>
                                ) : (
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${h.status === "unavailable"
                                            ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                                            : "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                                        }`}>
                                        {h.status === "unavailable" ? "Unavailable" : "Available"}
                                    </span>
                                )}
                            </div>
                        </div>


                        <div className="space-y-1">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                <span className="font-medium">Reason:</span> {h.reason}
                            </p>
                            {h.photo && (
                                <div className="flex items-start gap-2 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => setPreview({ url: getImageUrl(h.photo) || "", label: "Unavailable Photo" })}
                                        className="flex-shrink-0"
                                    >
                                        <img
                                            src={getImageUrl(h.photo) || ""}
                                            className="w-16 h-14 rounded-lg object-cover border hover:opacity-80"
                                            alt="unavailable"
                                        />
                                    </button>
                                    <a
                                        href={getImageUrl(h.photo) || ""}
                                        download
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Download"
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-50 transition-all"
                                    >
                                        <Download size={14} />
                                    </a>
                                </div>
                            )}
                            <p className="text-xs text-gray-400">
                                Reported by <span className="font-medium text-gray-600 dark:text-gray-300">{h.reportedBy}</span> · {fmtDatetime(h.reportedAt)}
                            </p>
                        </div>

                        {h.eventType === "replaced" && (
                            <div className="mt-2 pt-2 border-t border-indigo-200 dark:border-indigo-800 space-y-1">
                                <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Replacement Vehicle</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                    <span className="font-mono font-semibold">{h.replacementVehicleRegNo || "—"}</span>
                                    {h.replacementDriverName && <> — {h.replacementDriverName}</>}
                                    {h.replacementDriverPhone && <span className="text-gray-400"> ({h.replacementDriverPhone})</span>}
                                </p>
                                {h.replacedAt && (
                                    <p className="text-xs text-gray-400">Replaced at {fmtDatetime(h.replacedAt)}</p>
                                )}
                            </div>
                        )}


                        {h.status === "available" && (
                            <div className="mt-2 pt-2 border-t border-emerald-200 dark:border-emerald-800 space-y-1">
                                {h.resolveDescription && (
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <span className="font-medium">Resolution:</span> {h.resolveDescription}
                                    </p>
                                )}
                                {h.resolvePhoto && (
                                    <div className="flex items-start gap-2 mt-1">
                                        <button
                                            type="button"
                                            onClick={() => setPreview({ url: getImageUrl(h.resolvePhoto) || "", label: "Resolution Photo" })}
                                            className="flex-shrink-0"
                                        >
                                            <img
                                                src={getImageUrl(h.resolvePhoto) || ""}
                                                className="w-16 h-14 rounded-lg object-cover border border-emerald-200 hover:opacity-80"
                                                alt="resolve"
                                            />
                                        </button>
                                        <a
                                            href={getImageUrl(h.resolvePhoto) || ""}
                                            download
                                            target="_blank"
                                            rel="noreferrer"
                                            title="Download"
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-green-500 hover:bg-green-50 transition-all"
                                        >
                                            <Download size={14} />
                                        </a>
                                    </div>
                                )}
                                <p className="text-xs text-gray-400">
                                    Available by <span className="font-medium text-emerald-600 dark:text-emerald-400">{h.resolvedBy}</span> · {fmtDatetime(h.resolvedAt)}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
        {preview && (
            <FilePreviewModal
                url={preview.url}
                label={preview.label}
                onClose={() => setPreview(null)}
            />
        )}
        </>
    );
}

