"use client";
import React, { useState, useEffect } from 'react';
import './Navbar.css';

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <nav className="w-full">
            <div className="flex items-center justify-between px-[5%] py-3 cursor-pointer">
                {/* Logo */}
                <img
                    src="./images/assets/Roadshow_AdinnLogo.png"
                    alt="Roadshow Logo"
                    className="h-12 w-auto"
                />

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-12 lg:gap-16">
                    <a href="/" className="RS_NavContents">Home</a>
                    <a href="/vehicle" className="RS_NavContents">Vehicle</a>
                    <a href="/contact" className="RS_NavContents">Contact Us</a>
                </div>
                <div>
                    <img src='./images/assets/RS_Nav_Icon.png' alt="Nav_icon" className='RS_NavIcon cursor-pointer' />
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden flex flex-col items-center gap-4 pb-4 bg-white/80 backdrop-blur-sm">
                    <a href="/" className="text-black text-base font-medium hover:text-[#7B61FF]">Home</a>
                    <a href="/vehicle" className="text-black text-base font-medium hover:text-[#7B61FF]">Vehicle</a>
                    <a href="/contact" className="text-black text-base font-medium hover:text-[#7B61FF]">Contact Us</a>
                </div>
            )}
        </nav>
    );
}

export default Navbar;