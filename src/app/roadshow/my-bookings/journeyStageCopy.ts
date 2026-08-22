import {
  FileText,
  BadgeCheck,
  PackageCheck,
  Truck,
  Flag,
  Ban,
  type LucideIcon,
} from "lucide-react";

/* Client-facing narrative copy for each real pipeline stage. The backend
   (Utils/clientJourneyStages.js) owns the factual stage keys/labels and
   translated activity lines — this file owns the longer "what does this
   mean / what's next" wording, so copy can be iterated without a backend
   deploy. Keys must stay in sync with JOURNEY_STEPS there. */

export type JourneyStageKey =
  | "submitted"
  | "confirmed"
  | "prepared"
  | "onRoad"
  | "completed"
  | "cancelled";

export type JourneyStageCopy = {
  label: string;
  shortLabel: string;
  icon: LucideIcon;
  className: string;
  whatThisMeans: string;
  whatsNext: string | null;
};

export const JOURNEY_STAGE_COPY: Record<JourneyStageKey, JourneyStageCopy> = {
  submitted: {
    label: "Request Submitted",
    shortLabel: "Submitted",
    icon: FileText,
    className: "RS_Journey--submitted",
    whatThisMeans:
      "We've received your campaign request and our team is reviewing it.",
    whatsNext: "Order Confirmed",
  },
  confirmed: {
    label: "Order Confirmed",
    shortLabel: "Confirmed",
    icon: BadgeCheck,
    className: "RS_Journey--confirmed",
    whatThisMeans:
      "Your booking is confirmed and your campaign is being scheduled.",
    whatsNext: "Prepared for Campaign",
  },
  prepared: {
    label: "Prepared for Campaign",
    shortLabel: "Preparing",
    icon: PackageCheck,
    className: "RS_Journey--prepared",
    whatThisMeans:
      "Your vehicle and campaign materials are being prepared for dispatch.",
    whatsNext: "On Road",
  },
  onRoad: {
    label: "On Road",
    shortLabel: "On Road",
    icon: Truck,
    className: "RS_Journey--onroad",
    whatThisMeans:
      "Your campaign vehicle is currently operating on the scheduled route.",
    whatsNext: "Campaign Completed",
  },
  completed: {
    label: "Campaign Completed",
    shortLabel: "Completed",
    icon: Flag,
    className: "RS_Journey--completed",
    whatThisMeans: "Your campaign has been completed. Thank you!",
    whatsNext: null,
  },
  cancelled: {
    label: "Cancelled",
    shortLabel: "Cancelled",
    icon: Ban,
    className: "RS_Journey--cancelled",
    whatThisMeans: "This booking was cancelled.",
    whatsNext: null,
  },
};
