import { useState } from "react";
import PipelineHistoryTab from "./PipelineHistoryTab";
import ProjectExecutionHistoryTab from "./ProjectExecutionHistoryTab";
import UnavailableHistoryTab from "./UnavailableHistoryTab";
import DayByDayHistoryTab from "./DayByDayHistoryTab";

interface Order {
    _id: string;
    orderId: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    customerType?: number;
    pipelineStatus: string;
    handlerName?: string;
    updatedAt: string;
    createdAt: string;
    grandTotal: number;
    grandGst?: number;
    grandNegotiationTotal?: number;
    bookingItems: any[];
    negotiationLogs?: any[];
    pipelineLogs: any[];
    projectCodeArray?: any[];
    projectExecutionArray?: any[];
    todoArray?: any[];
    todoUploadedBy?: string;
    projectMailLogs?: any[];
    OnRoadTab?: any[];
    isAdminCreated?: boolean;
    companyName?: string;
    clientName?: string;
    designation?: string;
    gstNumber?: string;
    customerCategory?: string;
    onRoadUnavailableHistory?:any;
}

export default function CombinedHistoryTab({ order ,vehicleTypes }: { order: Order , vehicleTypes:string[]}) {
    const [activeHistoryTab, setActiveHistoryTab] = useState<"pipeline" | "execution" | "unavailable" | "dayByDay">("pipeline");

   const showExecution =
        order.pipelineStatus === "projectExecution" || order.pipelineStatus === "onRoad";

    const showUnavailable = (order.onRoadUnavailableHistory || []).length > 0;

    const showDayByDay =
        order.pipelineStatus === "projectExecution" ||
        order.pipelineStatus === "onRoad" ||
        order.pipelineStatus === "clientClosure" ||
        order.pipelineStatus === "closedWon" ||
        order.pipelineStatus === "closedLost";

    return (
        <div className="flex flex-col h-full">
         
            <div className="flex items-center gap-1 px-4 pt-3 pb-0 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
                <button
                    onClick={() => setActiveHistoryTab("pipeline")}
                    className={`px-4 py-2 text-md font-medium border-b-2 transition-all -mb-px ${
                        activeHistoryTab === "pipeline"
                            ? "border-violet-500 text-violet-600 dark:text-violet-400"
                            : "border-transparent text-gray-400 hover:text-gray-600"
                    }`}
                >
                    Pipeline History
                </button>
                {/* {showExecution && (
                    <button
                        onClick={() => setActiveHistoryTab("execution")}
                        className={`px-4 py-2 text-md font-medium border-b-2 transition-all -mb-px ${
                            activeHistoryTab === "execution"
                                ? "border-sky-500 text-sky-600 dark:text-sky-400"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        Execution History
                    </button>
                )} */}

                {showUnavailable && (
                    <button
                        onClick={() => setActiveHistoryTab("unavailable")}
                        className={`px-4 py-2 text-md font-medium border-b-2 transition-all -mb-px ${
                            activeHistoryTab === "unavailable"
                                ? "border-red-500 text-red-600 dark:text-red-400"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                        Unavailable History
                    </button>
                )}

                {showDayByDay && (
                    <button
                        onClick={() => setActiveHistoryTab("dayByDay")}
                        className={`px-4 py-2 text-md font-medium border-b-2 transition-all -mb-px ${
                            activeHistoryTab === "dayByDay"
                                ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                                : "border-transparent text-gray-400 hover:text-gray-600"
                        }`}
                    >
                       TimeLine
                    </button>
                )}
            </div>

         
    
            <div className="flex-1 overflow-y-auto">
                {activeHistoryTab === "pipeline" && <PipelineHistoryTab order={order} />}
                {activeHistoryTab === "execution" && showExecution && (
                    <ProjectExecutionHistoryTab order={order} vehicleTypes={vehicleTypes} />
                )}
                {activeHistoryTab === "unavailable" && showUnavailable && (
                    <UnavailableHistoryTab order={order} vehicleTypes={vehicleTypes} />
                )}
                {activeHistoryTab === "dayByDay" && showDayByDay && (
                    <DayByDayHistoryTab order={order}  vehicleTypes={vehicleTypes}/>
                )}
            </div>
        </div>
    );
}