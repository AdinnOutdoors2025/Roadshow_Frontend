/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState } from 'react';
import './Footer.css';

function Footer() {
    const [email, setEmail] = useState('');

    return (
        <footer className="FooterMain text-white">

            {/* ── Top CTA Banner ── */}
            {/* CHANGE: flex-col on mobile, flex-row from md up. gap tightened on small screens */}
            <div className="FooterCTAMain flex flex-col md:flex-row items-start md:items-center justify-around px-[5%] py-6 md:py-10 gap-4 md:gap-6">
                <div>
                    {/* CHANGE: font-size controlled by CSS class (your original 66px on desktop),
                        Tailwind overrides only on smaller screens via the CSS media queries we added */}
                    <div className="FooterCTAContent1 leading-tight">
                        Launch your campaign now.
                    </div>
                    <div className="FooterCTAContent2 mt-1">
                        Quick setup, instant visibility.
                    </div>
                </div>
                {/* CHANGE: w-full on mobile so button fills row; shrink-0 + auto width on md+ */}
                <a
                    href="/contact"
                    className="FooterCTAButton shrink-0 md:shrink-0 w-full md:w-auto text-center hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap block"
                >
                    Reach Us
                </a>
            </div>

            {/* ── Main Footer Content ── */}
            {/* CHANGE: 1 col on mobile, 2 cols on sm, 3 cols on md+. Tighter padding on mobile */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 px-[5%] md:px-[10%] lg:px-[15%] py-8 md:py-12">

                {/* Column 1 — Brand + Social + Contact + Newsletter */}
                {/* CHANGE: sm:col-span-2 so logo+social fills full width on 2-col layout */}
                <div className="flex flex-col gap-4 md:gap-5 sm:col-span-2 md:col-span-1 FooterMainContentCol1">
                    <img
                        src="./images/assets/Roadshow_AdinnLogo_WithoutBg.png"
                        alt="Roadshow Logo"
                        className="FooterCol1Logo"
                    />

                    {/* Social Icons */}
                    <div className="flex items-center FooterCol1Social">
                        {[
                            { src: './images/assets/RS_Footer_Insta.png', alt: 'Instagram' },
                            { src: './images/assets/RS_Footer_FB.png', alt: 'Facebook' },
                            { src: './images/assets/RS_Footer_Twitter.png', alt: 'Twitter' },
                            { src: './images/assets/RS_Footer_LinkedIn.png', alt: 'LinkedIn' },
                        ].map(({ src, alt }) => (
                            <a key={alt} href="#" aria-label={alt}>
                                <img src={src} alt={alt} className="FooterCol1SocialIcon" />
                            </a>
                        ))}
                    </div>

                    {/* Phone & Email */}
                    <div className="FooterCol1Contact">
                        {/* CHANGE: wrap numbers on very small screens */}
                        <div className="flex items-center gap-2 flex-wrap">
                            <span>7373785057</span>
                            <span>|</span>
                            <span>9626987861</span>
                        </div>
                        <div>ba@adinn.co.in</div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <p className="mb-2 FooterCol1Newsletter">Get notified upon new Updates</p>
                        {/* CHANGE: max-w-full on mobile so input fills available space */}
                        {/* <div className="flex items-center bg-white rounded-full overflow-hidden pr-1 pl-4 py-1 w-full max-w-xs">
                            <input
                                type="email"
                                placeholder="Your email or phone number"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 bg-transparent text-black text-sm outline-none placeholder-gray-400 min-w-0"
                            />
                            <button
                                className="bg-red-600 hover:bg-red-700 transition-colors duration-200 rounded-full p-2 flex items-center justify-center flex-shrink-0"
                                aria-label="Subscribe"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div> */}
                        <div className=" RA_RightContent2Main flex gap-5 items-center bg-white rounded-full overflow-hidden pr-1 pl-4 py-1 w-full max-w-xs">
                            <input
                                type="email"
                                placeholder="Your email or phone number"
                                className="RA_RightContent2Input  flex-1 bg-transparent text-black text-md outline-none placeholder-gray-400 min-w-0"
                            />
                            <button
                                className=" RA_RightContent2InpBtn transition-colors duration-200 rounded-full p-2 flex items-center justify-center flex-shrink-0"
                                aria-label="Subscribe">
                                <i className="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Column 2 — Services */}
                <div className="flex flex-col gap-2 md:gap-3">
                    <div className="mb-2 FooterCol23Heading">Services</div>
                    {['LED Screen Vehicle', 'L-Type LED Vehicle', '3-Side LED Truck', 'Customize Fabrication Vehicle'].map((service) => (
                        <div key={service} className="hover:text-white transition-colors duration-200 FooterCol23Contents">
                            {service}
                        </div>
                    ))}
                </div>

                {/* Column 3 — Addresses */}
                <div className="flex flex-col gap-3 md:gap-4">
                    <div className="mb-2 FooterCol23Heading">Address</div>
                    <div className="FooterCol23Contents">
                        29, 1st Cross Street, Vanamamalai Nagar, By-pass Road,{' '}
                        <span className="FooterCol3LocationSpan">Madurai-625010</span>
                    </div>
                    <div className="FooterCol23Contents">
                        Door No:3, 1st Floor, Vijayalakshmi Street, Mahalingapuram, Nungambakkam,{' '}
                        <span className="FooterCol3LocationSpan">Chennai - 600 034</span>
                    </div>
                    <div className="FooterCol23Contents">
                        Old No:76, New No:976, 7th Cross, Basaveswara Badavane, Bagegowda Layout, Rajarajeswari Nagar,{' '}
                        <span className="FooterCol3LocationSpan">Bangalore - 560 039.</span>
                    </div>
                </div>
            </div>

            {/* ── Bottom Bar ── */}
            <div className="FooterContentDivider"></div>
            {/* CHANGE: flex-col stacked on mobile, row on sm+. text centered always */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 px-[5%] py-4 md:py-5 FooterBottomContents">
                <a href="/cookies" className="hover:text-white transition-colors">Cookies Policy</a>
                <a href="/legal" className="hover:text-white transition-colors">Legal Terms</a>
                <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
            </div>
        </footer>
    );
}

export default Footer;