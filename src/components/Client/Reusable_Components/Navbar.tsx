/* eslint-disable */
// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef } from 'react';
import './Navbar.css';

const navLinks = [
  { label: 'Home',       href: '/' },
  { label: 'Vehicle',    href: '/vehicle' },
  { label: 'Contact Us', href: '/contact' },
];

const menuItems = [
  { label: 'Name' },
  { label: 'Email' },
  { label: 'Phone Number' },
  { label: 'My Cart' },
  { label: 'Order History' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const ref  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <nav className="RS_Navbar w-full">
      <div className="flex items-center justify-between px-[5%] py-3">

        {/* Logo */}
        <img src="./images/assets/Roadshow_AdinnLogo.png" alt="Roadshow Logo" className="h-12 w-auto" />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-12 lg:gap-16">
          {navLinks.map(({ label, href }) => (
            <a key={label} href={href} className="RS_NavContents RS_NavLink" data-text={label}>
              {label}
            </a>
          ))}
        </div>

        {/* Hamburger + dropdown */}
        <div className="relative" ref={ref}>
          <button
            className="RS_HamBtn focus:outline-none"
            onClick={() => setOpen(v => !v)}
            aria-label="Menu"
          >
            <span className={`RS_L ${open ? 'RS_L1o' : ''}`} />
            <span className={`RS_L ${open ? 'RS_L2o' : ''}`} />
            <span className={`RS_L ${open ? 'RS_L3o' : ''}`} />
          </button>

          {/* Dropdown — slides from right */}
          <div className={`RS_Drop ${open ? 'RS_Drop--open' : ''}`}>
            {menuItems.map(({ label }, i) => (
              <a
                key={label}
                href="#"
                className="RS_DropRow"
                style={{ transitionDelay: open ? `${i * 50}ms` : '0ms' }}
                onClick={() => setOpen(false)}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

      </div>

      {/* Mobile links */}
      <div className="md:hidden flex flex-col items-center gap-2 pb-3">
        {navLinks.map(({ label, href }) => (
          <a key={label} href={href} className="RS_NavContents RS_NavLink" data-text={label}>{label}</a>
        ))}
      </div>
    </nav>
  );
}