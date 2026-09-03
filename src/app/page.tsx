"use client";

import Navbar from "@/components/Client/Reusable_Components/Navbar";
import Footer from "@/components/Client/Reusable_Components/Footer";
import HomeBanner from "@/components/Client/HomeBanner/HomeBanner";
import HomePageSection1 from "@/components/Client/HomePageSections/HomePageSection1";
import GlobalSmoothScroll from "@/components/GlobalSmoothScroll";

/* The root GlobalRoadshowLoader owns both loader modes:
   - MAIN MP4: first hard page load only
   - MINI WebM: navigation between public pages

   Do not add another loader here. A page-local loader remounts whenever the
   user returns from Contact and causes the unwanted MINI -> MAIN sequence. */
export default function MainPage() {
  return (
    <GlobalSmoothScroll>
      <div>
        <div
          style={{
            background:
              "linear-gradient(180deg, #D2D2FF 0%, #FFFFFF 100%)",
          }}
        >
          <Navbar />
          <HomeBanner />
        </div>

        <HomePageSection1 />
        <Footer />
      </div>
    </GlobalSmoothScroll>
  );
}
