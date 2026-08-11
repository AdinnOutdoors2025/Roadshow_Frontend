import { History } from "lucide-react";


import { SALES_STAGE_MAP, SalesOrder } from "./page";

export default function PipelineHistoryTab({ order }: { order: SalesOrder }) {
    const logs = [...(order.salesPipelineLogs || [])]
        .filter((log: any) =>
            log.logType !== "edit" &&
            !(log.notes || "").startsWith("Order details edited by")
        )
        .reverse();

    const fmtDatetime = (s?: string) =>
        s
            ? new Date(s).toLocaleString("en-IN", {
                day: "2-digit", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
            })
            : "—";

    return (
        <div className="p-4 space-y-3">
            {/* Header badge */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800/50">
                <History size={19} className="text-violet-500" />
                <span className="text-md font-bold text-violet-700 dark:text-violet-300">
                    Pipeline History
                </span>
                <span className="ml-auto px-2 py-0.5 rounded-full text-[13px] font-semibold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300">
                    {logs.length} events
                </span>
            </div>

            {/* Timeline */}
            {logs.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                    No pipeline history yet
                </div>
            ) : (
                <div className="space-y-0 pt-2">
                    {logs.map((log, i) => {
                        const toS = SALES_STAGE_MAP[log.toStage];
                        const fromLabel = log.fromStage
                            ? SALES_STAGE_MAP[log.fromStage]?.label || log.fromStage
                            : "Start";
                        const dotColor = toS?.headerGrad || "from-gray-400 to-gray-500";

                        return (
                            <TimelineItem
                                key={i}
                                dotColor={dotColor}
                                isLast={i === logs.length - 1}
                            >
                                <div className="bg-gray-50 dark:bg-gray-800/40 rounded-xl p-3 border border-gray-100 dark:border-gray-700/50 hover:shadow-sm transition-all">
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {log.fromStage
                                            ? `${fromLabel} → ${toS?.label || log.toStage}`
                                            : `Started at ${toS?.label || log.toStage}`}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-1 text-sm text-gray-400 flex-wrap">
                                        <span>By {log.movedBy}</span>
                                        {log.handlerName && (
                                            <>
                                                <span>·</span>
                                                <span>Assigned By: {log.handlerName}</span>
                                            </>
                                        )}
                                        <span>·</span>
                                        <span>{fmtDatetime(log.movedAt)}</span>

                                        {log.notes && (
                                            <p className="text-sm text-blue-600  mt-1">
                                                {log.notes}
                                            </p>
                                        )}

                                    </div>
                                </div>
                            </TimelineItem>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function TimelineItem({
    children,
    dotColor,
    isLast,
}: {
    children: React.ReactNode;
    dotColor: string;
    isLast: boolean;
}) {
    return (
        <div className="flex items-start gap-3 relative">

            {!isLast && (
                <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-700" />
            )}

            <div
                className={`w-8 h-8 rounded-full bg-gradient-to-br ${dotColor} flex-shrink-0 flex items-center justify-center mt-0.5 relative z-10`}
            >
                <div className="w-2.5 h-2.5 rounded-full bg-white/70" />
            </div>

            <div className="flex-1 pb-4">{children}</div>
        </div>
    );
}