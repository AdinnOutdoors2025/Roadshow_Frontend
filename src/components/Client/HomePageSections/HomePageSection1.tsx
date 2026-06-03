/* eslint-disable */
// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import Image from "next/image";
import './HomePageSection1.css';



export default function HomePageSection1() {

    //OFFER SECTION CITY MARQUEE GRADIENT ANIMATION
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
    useEffect(() => {
        // The 3 gradients from your Figma exactly
        const gradients = [
            { a: '#00FFEB', b: '#0099FF' },  // teal → blue  (gradient 1)
            { a: '#9038F5', b: '#21378F' },  // purple        (gradient 2)
            { a: '#DF0B0B', b: '#330000' },  // red → dark    (gradient 3)
        ];

        const stopTop = document.getElementById('badgeStopTop');
        const stopBot = document.getElementById('badgeStopBot');
        if (!stopTop || !stopBot) return;

        const hex2rgb = (h: string) => [
            parseInt(h.slice(1, 3), 16),
            parseInt(h.slice(3, 5), 16),
            parseInt(h.slice(5, 7), 16),
        ];
        const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);
        const rgb2hex = (r: number, g: number, b: number) =>
            '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
        const mix = (c1: string, c2: string, t: number) => {
            const [r1, g1, b1] = hex2rgb(c1);
            const [r2, g2, b2] = hex2rgb(c2);
            return rgb2hex(lerp(r1, r2, t), lerp(g1, g2, t), lerp(b1, b2, t));
        };

        const STEP_MS = 1000; // time per gradient step
        let start: number | null = null;
        let raf: number;

        const tick = (ts: number) => {
            if (!start) start = ts;
            const elapsed = (ts - start) % (STEP_MS * gradients.length);
            const idx = Math.floor(elapsed / STEP_MS);
            const t = (elapsed % STEP_MS) / STEP_MS;
            // ease in-out for smooth transition
            const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            const from = gradients[idx];
            const to = gradients[(idx + 1) % gradients.length];
            stopTop.setAttribute('stop-color', mix(from.a, to.a, ease));
            stopBot.setAttribute('stop-color', mix(from.b, to.b, ease));
            raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, []);

    //OFFER SECTION CITY MARQUEE GRADIENT ANIMATION
    // Our Roadshow Vehicles data
    const ourRS_Vehicles = [
        // { name: 'Roadshow Main Img', image: './images/assets/BannerMainImg.png', rate: 25000, rating:'4.3', },
        { name: '19 Feet Single Side LED', image: './images/assets/BannerSubImg1.png', rate: 25000, rating: '4.3', },
        { name: '19 Feet Triple Side LED', image: './images/assets/BannerSubImg2.png', rate: 26000, rating: '4.4', },
        { name: 'Fabricated LED', image: './images/assets/BannerSubImg3.png', rate: 27000, rating: '4.5', },
        { name: 'L - Type Vehicle', image: './images/assets/BannerSubImg4.png', rate: 28000, rating: '4.2', },
        { name: 'L - Type Vehicle', image: './images/assets/BannerSubImg4.png', rate: 28000, rating: '4.2', },
        { name: 'L - Type Vehicle', image: './images/assets/BannerSubImg4.png', rate: 28000, rating: '4.2', },

    ];


    const [currentIndex, setCurrentIndex] = useState(0);
    const [visibleCount, setVisibleCount] = useState(4);

    useEffect(() => {
        const update = () => {
            const w = window.innerWidth;
            if (w < 640) setVisibleCount(1);
            else if (w < 768) setVisibleCount(2);
            else if (w < 1024) setVisibleCount(3);
            else setVisibleCount(4);
        };
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);
    return (
        <>
            {/* Offers Section */}
            <div>
                <section className="OffersSection flex">

                    {/* ── Header row: "Offers" + spinning % badge ── */}
                    {/* <div className='flex items-center justify-center gap-4  OffersHeadingMain'>
                <div className='OffersHeading'>Offers</div>
                <div className="OffersHeadImgContainer">
                  <img
                        src="/images/assets/OffersHeadImgFinal.svg"
                        alt="Offers"
                        className=" OffersHeadImg OffersBadgeText" style={{ color: 'blue' }} /> 
                    
                    <span className="OffersBadgeContent">%</span>
                </div>
            </div> */}

                    <div className="flex items-center justify-center gap-4 OffersHeadingMain">
                        <div className="OffersHeading">Offers</div>

                        <div className="OffersHeadImgContainer">
                            {/* SVG badge — spins via CSS */}
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="68" height="68"
                                viewBox="0 0 68 68"
                                fill="none"
                                className="OffersBadgeText"
                            >
                                <path
                                    d="M66.5567 30.2726L64.0219 26.5066C63.8046 26.0721 63.7322 25.6375 63.7322 25.1306L64.0219 20.5679C64.1668 17.9607 62.7907 15.5708 60.4732 14.412L56.4175 12.3842C55.983 12.1669 55.6933 11.8772 55.476 11.4427L53.3758 7.24214C52.217 4.92461 49.7546 3.54858 47.2198 3.69342L42.6572 3.98312C42.2227 3.98312 41.7157 3.91069 41.3536 3.621L37.4428 1.0862C35.2701 -0.362251 32.518 -0.362251 30.2729 1.0862L26.5069 3.621C26 3.83827 25.5654 3.91069 25.0585 3.91069L20.4958 3.621C17.8886 3.54858 15.4987 4.92461 14.2675 7.24214L12.2396 11.2978C12.0224 11.7324 11.7327 12.022 11.2981 12.2393L7.24245 14.2672C4.92493 15.4259 3.54889 17.8883 3.69374 20.4231L3.98343 24.9857C3.98343 25.4203 3.91101 25.9272 3.62132 26.2893L1.08652 30.2002C-0.361938 32.3728 -0.361938 35.1973 1.08652 37.37L3.62132 41.136C3.83858 41.643 3.91101 42.0775 3.91101 42.5845L3.62132 47.1471C3.54889 49.7543 4.92493 52.1443 7.24245 53.3754L11.2981 55.4033C11.7327 55.6206 12.0224 55.9827 12.2396 56.3448L14.2675 60.4005C15.4262 62.718 17.8886 64.094 20.4234 63.9492L24.986 63.6595C25.4206 63.6595 25.9275 63.7319 26.2896 64.0216L30.0556 66.484C31.142 67.2082 32.3732 67.5703 33.6043 67.5703C34.8355 67.5703 36.0667 67.2082 37.1531 66.484L40.919 63.9492C41.2812 63.7319 41.7881 63.5871 42.2227 63.5871L46.7853 63.8768C49.3925 64.0216 51.7825 62.6456 52.9412 60.328L54.9691 56.2724C55.1863 55.8378 55.476 55.5481 55.9106 55.3309L59.9662 53.303C62.2838 52.1443 63.6598 49.6819 63.515 47.1471L63.3701 42.6569C63.3701 42.2223 63.4425 41.7154 63.7322 41.3533L66.1946 37.5149C68.0052 35.1973 68.0052 32.3728 66.5567 30.2726Z"
                                    fill="url(#badgeGrad)"
                                />
                                <defs>
                                    <linearGradient id="badgeGrad" x1="33.8009" y1="0" x2="33.8009" y2="67.5703" gradientUnits="userSpaceOnUse">
                                        <stop id="badgeStopTop" stopColor="#00FFEB" />
                                        <stop id="badgeStopBot" offset="1" stopColor="#0099FF" />
                                    </linearGradient>
                                </defs>
                            </svg>

                            {/* % text — counter-rotates to stay upright */}
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
            </div>
            
            {/* Our Roadshow Vehicles List section */}
            <div className='px-20 mx-auto RS_OurRdwMainSection'>
                <div className="RS_OurRdwHeading">
                    <div className="RS_OurRdwHeadingContent1">Our Roadshow </div>
                    <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2">Vehicles</div>
                </div>
                <div className="RS_CarouselWrapper">
                    <div
                        className="RS_OurRdwVehicleList"
                        style={{ transform: `translateX(-${currentIndex * (100 / visibleCount)}%)` }}
                    >
                        {ourRS_Vehicles.map((veh, idx) => (
                            <div key={idx} className="RS_VehicleCardMain RS_VehicleCardFlex">
                                <div><img src={veh.image} alt={veh.name} className="RS_VehicleImg" /></div>
                                <div className="RS_VehicleDetailsMain">
                                    <div className="RS_VehicleName">{veh.name}</div>
                                    <div className="RS_VehicleRate">₹{veh.rate.toLocaleString()}/Per Day</div>
                                    <div className="RS_VehicleRatingMain flex items-center gap-1">
                                        <div className="RS_VehicleRatingValue">{veh.rating}</div>
                                        <div><img src='./images/assets/RS_VehicleRateStar.svg' className='RS_VehicleRatingImg' alt="Rating" /></div>
                                    </div>
                                    <div><button className="RS_VehicleButton">Book Now</button></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Carousel Nav Buttons - bottom right */}
                    <div className="RS_CarouselNavRow">
                        <button
                            className="RS_CarouselBtn"
                            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                            disabled={currentIndex === 0}
                            aria-label="Previous"
                        >
                            <i class="fa-solid fa-chevron-left"></i>
                        </button>
                        <button
                            className="RS_CarouselBtn"
                            onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, ourRS_Vehicles.length - visibleCount))}
                            disabled={currentIndex >= ourRS_Vehicles.length - visibleCount}
                            aria-label="Next"
                        >
                            <i class="fa-solid fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            </div>

        </>
    );
}