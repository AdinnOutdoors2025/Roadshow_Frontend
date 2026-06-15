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
            <div className="FooterCTAMain flex flex-col md:flex-row items-start md:items-center justify-around px-[5%] py-6 md:py-10 gap-4 md:gap-6">
                <div>
                    <div className="FooterCTAContent1 leading-tight">
                        Launch your campaign now.
                    </div>
                    <div className="FooterCTAContent2 mt-1">
                        Quick setup, instant visibility.
                    </div>
                </div>
                <a
                    href="/contact"
                    className="FooterCTAButton shrink-0 md:shrink-0 w-full md:w-auto text-center hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap block"
                >
                    Reach Us
                </a>
            </div>

            {/* ── Main Footer Content ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 px-[5%] md:px-[10%] lg:px-[15%] py-8 md:py-12">
                <div className="flex flex-col gap-4 md:gap-5 sm:col-span-2 md:col-span-1 FooterMainContentCol1">
                    <img
                        src="./images/assets/Roadshow_AdinnLogo_WithoutBg.png"
                        alt="Roadshow Logo"
                        className="FooterCol1Logo"
                    />

                    {/* Social Icons */}
                    <div className="flex items-center FooterCol1Social">
                        {[
                            { src: './images/assets/RS_Footer_Insta.png', alt: 'Instagram', link :'https://www.instagram.com/adinnroadshows_/' },
                            { src: './images/assets/RS_Footer_FB.png', alt: 'Facebook', link : "https://www.facebook.com/adinnroadshow" },
                            { src: './images/assets/RS_Footer_Twitter.png', alt: 'Twitter', link : "https://x.com/AdinnRoadshow" },
                            { src: './images/assets/RS_Footer_LinkedIn.png', alt: 'LinkedIn', link : "https://www.linkedin.com/company/adinn-roadshows/" },
                        ].map(({ src, alt, link }) => (
                            <a key={alt} href={link} aria-label={alt} target='_blank'>
                                <img src={src} alt={alt} className="FooterCol1SocialIcon" />
                            </a>
                        ))}
                    </div>

                    {/* Phone & Email */}
                    <div className="FooterCol1Contact">
                        <div className="flex items-center gap-2 flex-wrap">

                            <a href='tel:7373785057' style={{ textDecoration: 'none' }}>
                                        +91 73737 85057
                                    </a>
                            <span>|</span>
                            <a href='tel:9626987861' style={{ textDecoration: 'none' }}>
                                        +91 96269 87861
                                    </a>
                        </div>
                       
                        <a href='mailto:ba@adinn.co.in' style={{ textDecoration: 'none' }}>
                                    ba@adinn.co.in
                                </a>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <p className="mb-2 FooterCol1Newsletter">Get notified upon new Updates</p>
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
                        <span className="FooterCol3LocationSpan">Madurai - 625 010.</span>
                    </div>
                    <div className="FooterCol23Contents">
                        {/* Door No:3, 1st Floor, Vijayalakshmi Street, Mahalingapuram, Nungambakkam,{' '}
                        <span className="FooterCol3LocationSpan">Chennai - 600 034.</span> */}
                        No. 19/43, MG Chakrapani Street,
                        Sathya Garden, Saligramam, {' '} <span className="FooterCol3LocationSpan">Chennai - 600 092.</span>
                    </div>
                    <div className="FooterCol23Contents">
                        {/* Old No:76, New No:976, 7th Cross, Basaveswara Badavane, Bagegowda Layout, Rajarajeswari Nagar,{' '}
                        <span className="FooterCol3LocationSpan">Bangalore - 560 039.</span> */}
                        No. 407/8, 4th Cross, Jayanagar 7th Block, Opp-Saraswat Cooperative Bank, {' '}
                        <span className="FooterCol3LocationSpan">Bangalore - 560 070.</span>
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