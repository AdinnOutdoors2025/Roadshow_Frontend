// "use client";
// import React, { useState, useEffect } from 'react';
// import './HomePageSectio1.css';
// import Image from "next/image";

// function Offers_WhyAdinn() {
//     const [menuOpen, setMenuOpen] = useState(false);

//     return (
//         <>
//             {/* Offer section  */}
//             <div className='flex items-center '>
// <div className='flex items-center justify-center gap-4  OffersHeadingMain'>
//     <div className='OffersHeading'>Offers</div>
//     <div>
//         <Image
//             src="/images/assets/OffersHeadImg.png"
//             alt="Offers"
//             width={90}
//             height={90}
//             className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] md:w-[50px] md:h-[50px] lg:w-[70px] lg:h-[70px]"
//         />
//     </div>
// </div>

//                 <div className='flex items-center justify-around OffersCardsMain'>
//                     <div style={{ background: 'black', borderRadius: '40px', border: '2px solid white', width: 'max-content', padding: '2px 3%', color: 'white' }}>
//                         <Image
//                             src="/images/assets/Offers_Chennai.png"
//                             alt="Offers"
//                             width={90}
//                             height={90}
//                             className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] md:w-[50px] md:h-[50px] lg:w-[70px] lg:h-[70px]"
//                         />
//                         <div>Chennai </div>

//                     </div>
//                     <div style={{ background: 'black', borderRadius: '40px', border: '2px solid white', width: 'max-content', padding: '2px 3%', color: 'white' }}>
//                         <Image
//                             src="/images/assets/Offers_Chennai.png"
//                             alt="Offers"
//                             width={90}
//                             height={90}
//                             className="w-[30px] h-[30px] sm:w-[40px] sm:h-[40px] md:w-[50px] md:h-[50px] lg:w-[70px] lg:h-[70px]"
//                         />
//                         <div>Chennai </div>

//                     </div>

//                 </div>
//             </div>

//         </>
//     );
// }

// export default Offers_WhyAdinn;



"use client";
import React from 'react';
import Image from "next/image";
import './HomePageSection1.css';

// City data — replace icons with your actual image paths
const cities = [
    { name: 'Chennai', icon: './images/assets/Offers_Chennai.png' },
    { name: 'Madurai', icon: './images/assets/Offers_Madurai.png' },
    { name: 'Coimbatore', icon: './images/assets/Offers_Cbe.png' },
    { name: 'Thrissur', icon: './images/assets/Offers_Thrissur.png' },
    { name: 'Kollam', icon: './images/assets/Offers_Kollam.png' },
    { name: 'Bengaluru', icon: './images/assets/Offers_Bglr.png' },
    { name: 'Theni', icon: './images/assets/Offers_Theni.png' },
    { name: 'Vellore', icon: './images/assets/Offers_Vellore.png' },
];

// Duplicate for seamless infinite loop
const marqueeItems = [...cities, ...cities, ...cities];

export default function OffersSection() {
    return (
        <section className="OffersSection flex">

            {/* ── Header row: "Offers" + spinning % badge ── */}
            <div className='flex items-center justify-center gap-4  OffersHeadingMain'>
                <div className='OffersHeading'>Offers</div>
                <div className="OffersHeadImgContainer">
                  <img
                        src="/images/assets/OffersHeadImgFinal.svg"
                        alt="Offers"
                        className=" OffersHeadImg OffersBadgeText" style={{ color: 'blue' }} /> 
                    
                    <span className="OffersBadgeContent">%</span>
                </div>
            </div>

            {/* ── Infinite horizontal marquee strip ── */}
            <div className="OffersStrip">
                <div className="OffersMarquee">
                    {marqueeItems.map((city, i) => (
                        <div key={`${city.name}-${i}`} className="OffersPill">
                            <img
                                src={city.icon}
                                alt={city.name}
                                className="OffersPillIcon"
                            />
                            <span className="OffersPillName">{city.name}</span>
                        </div>
                    ))}
                </div>
            </div>

        </section>
    );
}