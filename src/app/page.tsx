import React from 'react';
import Navbar from '../components/Client/Reusable_Components/Navbar';
import Footer from '@/components/Client/Reusable_Components/Footer';
import HomeBanner from '@/components/Client/HomeBanner/HomeBanner';
import HomePageSection1 from '@/components/Client/HomePageSections/HomePageSection1';

export default function MainPage() {
    return (
        <div>
            <div style={{ background: 'linear-gradient(180deg, #D2D2FF 0%, #FFFFFF 100%)' }}>
                <Navbar />
                <HomeBanner />
            </div>
            {/* Offers section  */}
            <HomePageSection1 />
            <Footer />
        </div>
    );
}