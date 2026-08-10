import React from 'react';
import Navbar from '../components/Client/Reusable_Components/Navbar';
import Footer from '@/components/Client/Reusable_Components/Footer';
import HomeBanner from '@/components/Client/HomeBanner/HomeBanner';
import HomePageSection1 from '@/components/Client/HomePageSections/HomePageSection1';
import GlobalSmoothScroll from '@/components/GlobalSmoothScroll';

/* The homepage lives at the app root, NOT under src/app/roadshow/layout.tsx,
   so it does not inherit that layout's GlobalSmoothScroll and has to mount
   its own. Navbar portals itself to document.body, so it escapes
   #smooth-content's transform regardless of where it sits here. */
export default function MainPage() {
    return (
        <GlobalSmoothScroll>
            <div>
                <div style={{ background: 'linear-gradient(180deg, #D2D2FF 0%, #FFFFFF 100%)' }}>
                    <Navbar />
                    <HomeBanner />
                </div>
                {/* Offers section  */}
                <HomePageSection1 />
                <Footer />
            </div>
        </GlobalSmoothScroll>
    );
}