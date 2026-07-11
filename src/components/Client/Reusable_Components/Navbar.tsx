/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import Image from 'next/image';
// Login authentication 
import { useAuth } from "@/context/AuthContext";
// Login authentication
import { useRouter } from "next/navigation";
const navLinks = [
  { label: "Home", href: "/" },
  { label: "Vehicle", href: "/roadshow/VehicleDetails" },
  { label: "Contact Us", href: "/contact" },
];

const menuItems = [
  { label: "Sign In" },
  { label: "Name" },
  { label: "Email" },
  { label: "Phone Number" },
  { label: "My Cart" },
  { label: "Order History" },
];

function AnimatedNavLink({ label, href }) {

  const router = useRouter();

  const [animState, setAnimState] = useState("idle");
  const timerRef = useRef<any>(null);


  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setAnimState("hover");
  };


  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);

    setAnimState("leave");

    timerRef.current = setTimeout(() => {
      setAnimState("idle");
    },420);
  };


  return (

    <button
      type="button"

      onClick={()=>{
        router.push(href);
      }}

      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}

      className={`RS_NavContents RS_NavLink RS_NavLink--${animState}`}

    >

      <span className="RS_NavText RS_NavText--black">
        {label}
      </span>


      <span className="RS_NavText RS_NavText--red">
        {label}
      </span>


    </button>

  );
}
export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropVisible, setDropVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef(null);
  const router = useRouter();

  const toggleDropdown = () => {
    clearTimeout(closeTimerRef.current);

    if (open) {
      setOpen(false);

      closeTimerRef.current = setTimeout(() => {
        setDropVisible(false);
      }, 520);
    } else {
      setDropVisible(true);

      requestAnimationFrame(() => {
        setOpen(true);
      });
    }
  };

  const closeDropdown = () => {
    if (!open) return;

    clearTimeout(closeTimerRef.current);
    setOpen(false);

    closeTimerRef.current = setTimeout(() => {
      setDropVisible(false);
    }, 520);
  };

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        closeDropdown();
      }
    };

    document.addEventListener("mousedown", fn);

    return () => {
      document.removeEventListener("mousedown", fn);
      clearTimeout(closeTimerRef.current);
    };
  }, [open]);
  // Login authentication 
  const { openAuth } = useAuth();
  // Login authentication 

  return (
    <nav className="RS_Navbar w-full">
      <div className="flex items-center justify-between px-[5%] py-3">
        {/* Logo */}
        <Image
          src="/images/assets/Roadshow_AdinnLogo.svg"
          alt="Roadshow Logo"
          width={180}
          height={48}
          className="h-12 w-auto object-contain cursor-pointer"  onClick={() => router.push("/")}
          priority 
        />

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-12 lg:gap-16">
          {navLinks.map(({ label, href }) => (
            <AnimatedNavLink key={label} label={label} href={href} />
          ))}
        </div>

        {/* Hamburger + dropdown */}
        <div className="relative" ref={ref}>
          <button
            className="RS_HamBtn focus:outline-none"
            onClick={toggleDropdown}
            aria-label="Menu"
            aria-expanded={open}
            type="button"
          >
            <span className={`RS_L ${open ? "RS_L1o" : ""}`} />
            <span className={`RS_L ${open ? "RS_L2o" : ""}`} />
            <span className={`RS_L ${open ? "RS_L3o" : ""}`} />
          </button>

          {dropVisible && (
            <div
              className={`RS_Drop ${open ? "RS_Drop--open" : "RS_Drop--closing"
                }`}
            >
              {menuItems.map(({ label }, i) => (
                <a
                  key={label}
                  href="#"
                  className="RS_DropRow"
                  style={{
                    transitionDelay: open
                      ? `${i * 65}ms`
                      : `${i * 45}ms`,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    if (label === "Sign In") {
                      openAuth();
                      closeDropdown();
                    }
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile links */}
      <div className="md:hidden flex flex-col items-center gap-2 pb-3">
        {navLinks.map(({ label, href }) => (
          <AnimatedNavLink key={label} label={label} href={href} />
        ))}
      </div>
    </nav>
  );
}