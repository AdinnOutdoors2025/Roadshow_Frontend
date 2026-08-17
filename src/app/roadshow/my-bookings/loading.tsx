import { MapPinned } from "lucide-react";

import "./page.css";

/*
  Route-segment override of the shared roadshow/loading.tsx (one generic
  centered spinner). Without this, a hard refresh on /roadshow/my-bookings
  briefly shows that single full-page spinner instead of this page's own
  two-panel section states (bookings list loading independently from the
  selected-campaign pane), which is what the client component renders once
  it mounts.
*/
export default function MyBookingsLoading() {
  return (
    <main className="RS_MyBookingsRoot">
      <div className="RS_MyBookingsContainer">
        <section className="RS_DashboardShell">
          <div className="RS_BookingsPane">
            <section className="RS_BookingsArea">
              <div className="RS_StateCard">
                <div className="RS_LoadingRing" />
                <strong>Loading your bookings...</strong>
                <p>Please wait while we fetch your booking requests.</p>
              </div>
            </section>
          </div>

          <aside className="RS_TrackingPane RS_TrackingPane--empty">
            <MapPinned size={45} strokeWidth={1.5} />
            <strong>Select a booking</strong>
            <p>
              Choose a booking from the list to see campaign progress,
              vehicles and tracking access.
            </p>
          </aside>
        </section>
      </div>
    </main>
  );
}
