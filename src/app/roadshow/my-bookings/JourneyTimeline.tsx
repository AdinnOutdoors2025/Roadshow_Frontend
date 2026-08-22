"use client";

import { CheckCircle2 } from "lucide-react";

import {
  JOURNEY_STAGE_COPY,
  type JourneyStageKey,
} from "./journeyStageCopy";

export type JourneyStep = {
  key: string;
  label: string;
  status: "done" | "current" | "upcoming";
  completedAt: string | null;
};

function formatStepDate(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/* Pure presentational stepper — renders whatever steps[] the tracking API
   returns. Never assumes a fixed step count or hardcodes a "done" state. */
export default function JourneyTimeline({ steps }: { steps: JourneyStep[] }) {
  return (
    <ol className="RS_JourneyTimeline">
      {steps.map((step) => {
        const meta = JOURNEY_STAGE_COPY[step.key as JourneyStageKey];
        const Icon = meta?.icon ?? CheckCircle2;

        return (
          <li
            key={step.key}
            className={`RS_JourneyStep RS_JourneyStep--${step.status}`}
          >
            <span className="RS_JourneyDot">
              <Icon size={14} strokeWidth={2.2} />
            </span>

            <div className="RS_JourneyStepBody">
              <strong>{meta?.label ?? step.label}</strong>

              {step.status === "current" && (
                <span className="RS_JourneyCurrentTag">Current Stage</span>
              )}

              {step.completedAt && (
                <span className="RS_JourneyDate">
                  {formatStepDate(step.completedAt)}
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
