"use client";

/* -------------------------------------------------------------------------- */
/*                      PUBLIC ROADSHOW VEHICLE LISTING                        */
/* -------------------------------------------------------------------------- */
/*  The listing itself lives in VehicleListing — the homepage's "Our Roadshow  */
/*  Vehicles" section renders the same component, so the two surfaces can      */
/*  never drift apart. This page only adds the hero above it.                  */
/*                                                                            */
/*  The hero's styles live in VehicleListing.css (moved here from this         */
/*  folder's old page.css), which the component imports — so they load with    */
/*  the component rather than needing a second import here.                    */

import VehicleListing from "@/components/Client/VehicleListing/VehicleListing";

export default function RoadshowVehiclesPage() {
  return (
    <main className="RS_VehListPage">
      <header className="RS_VehListHero">
        <h1 className="RS_VehListTitle">
          <span>Built to Move</span>
          <span className="RS_VehListTitleAccent">
            Brands
          </span>
        </h1>

        <p className="RS_VehListSubtitle">
          Every roadshow vehicle in our fleet, grouped by the
          kind of display it carries. Pick a category, open a
          vehicle to see its full specification, then book the
          dates you need.
        </p>
      </header>

      <VehicleListing />
    </main>
  );
}
