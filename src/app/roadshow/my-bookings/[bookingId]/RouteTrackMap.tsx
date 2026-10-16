"use client";

import type { RouteTrackVehicle } from "./useRouteTrack";
import { VAMOSYS_TRACK_USER_ID } from "@/BaseUrl";

/* Vamosys's own public embed — the same widget the admin OnRoadTab iframes
   in (see OnRoadTab.tsx), showing the live speedometer and an animated
   marker moving along today's route. Rendered per vehicle since each
   trackId maps to exactly one registration. */
export default function RouteTrackMap({
  vehicles,
}: {
  vehicles: RouteTrackVehicle[];
}) {
  const withTrack = vehicles.filter((v) => v.trackId);

  if (!withTrack.length) return null;

  return (
    <div className="RS_RouteTrackList">
      {withTrack.map((vehicle) => (
        <div key={vehicle.registrationNumber} className="RS_RouteTrackCard">
          <div className="RS_RouteTrackHeader">
            <strong>{vehicle.registrationNumber}</strong>
            <span>Live Route</span>
          </div>

          <iframe
            key={vehicle.trackId}
            src={`https://gpsvts.vamosys.com/gps/public/track?vehicleId=${vehicle.trackId}&maps=track&userID=${VAMOSYS_TRACK_USER_ID}`}
            className="RS_RouteTrackFrame"
            title={`Live route for ${vehicle.registrationNumber}`}
            allowFullScreen
          />
        </div>
      ))}
    </div>
  );
}
