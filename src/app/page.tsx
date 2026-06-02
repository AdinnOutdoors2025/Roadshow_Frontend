import React from 'react';
import Navbar from '../components/Client/Reusable_Components/Navbar';
import Footer from '@/components/Client/Reusable_Components/Footer';
import HomeBanner from '@/components/Client/HomeBanner/HomeBanner';
export default function MainPage() {
    return (
        <div>
           <div  style={{background: 'linear-gradient(180deg, #D2D2FF 0%, #FFFFFF 100%)'}}>
             <Navbar />
             <HomeBanner />
            <div style={{height:'calc(100vh - 70px)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px'}}>
                Home content
            </div>
           </div>
            <Footer />
        </div>
    );
}