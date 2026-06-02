"use client";

import React, { useState } from 'react';
import './Footer.css';
function Footer() {
    const [email, setEmail] = useState('');

    return (
        <footer className=" FooterMain bg-#000000 text-white">

            {/* Top CTA Banner */}
            <div className="FooterCTAMain flex flex-col md:flex-row items-start md:items-center justify-around px-[5%] py-10 gap-6">
                <div>
                    <div className="FooterCTAContent1 text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
                        Launch your campaign now.
                    </div>
                    <div className="FooterCTAContent2 text-lg md:text-xl text-gray-300 mt-1">
                        Quick setup, instant visibility.
                    </div>
                </div>
                <a
                    href="/contact"
                    className=" FooterCTAButton shrink-0 bg-white text-black font-semibold text-lg px-10 py-4 rounded-full hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap"
                >
                    Reach Us
                </a>
            </div>

            {/* Divider */}
            {/* <div className="border-t border-gray-800 mx-[5%]"></div> */}

            {/* Main Footer Content */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-[15%] py-12 FooterMainContent">

                {/* Column 1 — Brand + Social + Contact + Newsletter */}
                <div className="flex flex-col gap-5 align-items-start FooterMainContentCol1">
                    <img
                        src="./images/assets/Roadshow_AdinnLogo_WithoutBg.png"
                        alt="Roadshow Logo"
                        className="FooterCol1Logo"
                    />

                    {/* Social Icons */}
                    <div className="flex items-center FooterCol1Social">
                        <a href="#" aria-label="Instagram" className="">
                            <img
                                src="./images/assets/RS_Footer_Insta.png"
                                alt="Instagram"
                                className="FooterCol1SocialIcon"
                            />
                        </a>
                        <a href="#" aria-label="Facebook" className="">
                            <img
                                src="./images/assets/RS_Footer_FB.png"
                                alt="Facebook"
                                className="FooterCol1SocialIcon"
                            />
                        </a>
                        <a href="#" aria-label="Twitter / X" className="">
                            <img
                                src="./images/assets/RS_Footer_Twitter.png"
                                alt="Twitter"
                                className="FooterCol1SocialIcon"
                            />
                        </a>
                        <a href="#" aria-label="LinkedIn" className="">
                            <img
                                src="./images/assets/RS_Footer_LinkedIn.png"
                                alt="LinkedIn"
                                className="FooterCol1SocialIcon"
                            />
                        </a>
                    </div>

                    {/* Phone & Email */}
                    <div className="space-y-1 FooterCol1Contact">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div>7373785057</div>
                            <div>|</div>
                            <div>9626987861</div>
                        </div>
                        <div>ba@adinn.co.in</div>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <p className="text-sm font-semibold mb-2 FooterCol1Newsletter">Get notified upon new Updates</p>
                        <div className="flex items-center bg-white rounded-full overflow-hidden pr-1 pl-4 py-1 max-w-xs">
                            <input
                                type="email"
                                placeholder="Your email or phone number"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="flex-1 bg-transparent text-black text-sm outline-none placeholder-gray-400"
                            />
                            <button
                                className="bg-red-600 hover:bg-red-700 transition-colors duration-200 rounded-full p-2 flex items-center justify-center"
                                aria-label="Subscribe"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Column 2 — Services */}
                <div className="flex flex-col gap-3">
                    <div className="text-base font-bold mb-2 FooterCol23Heading">Services</div>
                    {['LED Screen Vehicle', 'L-Type LED Vehicle', '3-Side LED Truck', 'Customize Fabrication Vehicle'].map((service) => (
                        <div
                            key={service}
                            className="text-sm text-gray-300 hover:text-white transition-colors duration-200 FooterCol23Contents"
                        >
                            {service}
                        </div>
                    ))}
                </div>

                {/* Column 3 — Addresses */}
                <div className="flex flex-col gap-4">
                    <div className="text-base font-bold mb-2 FooterCol23Heading">Address</div>
                    <div className=" FooterCol23Contents">
                        29, 1st Cross Street, Vanamamalai Nagar, By-pass Road,{' '}
                        <span className="FooterCol3LocationSpan">Madurai-625010</span>
                    </div>
                    <div className=" FooterCol23Contents">
                        Door No:3, 1st Floor, Vijayalakshmi Street, Mahalingapuram, Nungambakkam,{' '}
                        <span className="FooterCol3LocationSpan">Chennai - 600 034</span>
                    </div>
                    <div className=" FooterCol23Contents">
                        Old No:76, New No:976, 7th Cross, Basaveswara Badavane, Bagegowda Layout, Rajarajeswari Nagar,{' '}
                        <span className="FooterCol3LocationSpan">Bangalore - 560 039.</span>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="FooterContentDivider "></div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 px-[5%] py-5 text-sm text-gray-400 FooterBottomContents">
                <a href="/cookies">Cookies Policy</a>
                <a href="/legal">Legal Terms</a>
                <a href="/privacy">Privacy Policy</a>
            </div>
        </footer>
    );
}

export default Footer;