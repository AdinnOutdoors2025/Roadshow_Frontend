"use client";

import { CalendarDays, MapPin, ShieldCheck, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* Dashboard-style greeting banner for the top of a single booking's
   tracking page. Every value is passed in already-computed by the parent
   (page.tsx) from the existing useCampaignTracking/useAuth data — this
   component only arranges markup, it fetches nothing and owns no state. */
export default function HeroBanner({
  userName,
  campaignName,
  clientOrderId,
  location,
  vehicleCount,
  stageLabel,
  StageIcon,
  stageClassName,
  dayLabel,
  vehicleImage,
  periodLabel,
  periodDaysLabel,
}: {
  userName: string;
  campaignName: string;
  clientOrderId: string;
  location: string;
  vehicleCount: number;
  stageLabel?: string;
  StageIcon?: LucideIcon;
  stageClassName?: string;
  dayLabel?: string | null;
  vehicleImage: string;
  periodLabel: string;
  periodDaysLabel: string;
}) {
  return (
    <section className="RST_Hero">
      <div className="RST_HeroIdentity">
        <div className="RST_HeroCopy">
          <h1 className="RST_HeroGreeting">
            Good Afternoon, <span>{userName || "there"}!</span>{" "}
            <span aria-hidden="true">👋</span>
          </h1>
          <p className="RST_HeroSub">Let&apos;s keep your brand on the move.</p>

          <div className="RST_HeroBadges">
            {stageLabel && (
              <span className={`RS_StageBadge ${stageClassName || ""}`}>
                {StageIcon && <StageIcon size={14} />}
                {stageLabel}
              </span>
            )}

            {dayLabel && <span className="RS_DayBadge">{dayLabel}</span>}
          </div>

          <h2 className="RST_HeroCampaignName">{campaignName}</h2>

          <div className="RST_HeroMeta">
            <span>
              <ShieldCheck size={15} />
              {clientOrderId}
            </span>

            <span>
              <MapPin size={15} />
              {location || "Location not available"}
            </span>

            <span>
              <Truck size={15} />
              {vehicleCount} {vehicleCount === 1 ? "Vehicle" : "Vehicles"}
            </span>
          </div>
        </div>
      </div>

      <div className="RST_HeroRight">
        <div className="RST_HeroVehicle">
          <img src={vehicleImage} alt="Campaign vehicle" />
        </div>

        <div className="RST_HeroPeriod">
          <span className="RST_HeroPeriodIcon">
            <CalendarDays size={18} />
          </span>
          <div>
            <span>Campaign Period</span>
            <strong>{periodLabel}</strong>
            <small>{periodDaysLabel}</small>
          </div>
        </div>
      </div>
    </section>
  );
}
