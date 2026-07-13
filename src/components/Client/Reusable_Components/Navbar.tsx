/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from 'next/image';

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Vehicle", href: "/vehicle" },
  { label: "Contact Us", href: "/contact" },
];

const menuItems = [
  { label: "Name" },
  { label: "Email" },
  { label: "Phone Number" },
  { label: "My Cart" },
  { label: "Order History" },
];

function AnimatedNavLink({ label, href }) {
  const [animState, setAnimState] = useState("idle");
  const timerRef = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    setAnimState("hover");
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    setAnimState("leave");

    timerRef.current = setTimeout(() => {
      setAnimState("idle");
    }, 420);
  };

  return (
    <a
      href={href}
      className={`RS_NavLink RS_NavLink--${animState}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={label}
    >
      <span className="RS_NavText RS_NavText--white">{label}</span>
      <span className="RS_NavText RS_NavText--active">{label}</span>
    </a>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropVisible, setDropVisible] = useState(false);
  const rootRef = useRef(null);
  const navRef = useRef(null);
  const dropdownRef = useRef(null);
  const closeTimerRef = useRef(null);
  const lgInstanceRef = useRef(null);

  // Initialize WebGL Shaders on Mount
  useEffect(() => {
    let active = true;

    async function initShader() {
      try {
        const { LiquidGlass } = await import("@ybouane/liquidglass");
        
        if (!active || !rootRef.current) return;

        lgInstanceRef.current = await LiquidGlass.init({
          root: rootRef.current,
          glassElements: rootRef.current.querySelectorAll(".glass-shader-target"),
        });
      } catch (err) {
        console.error("LiquidGlass Shader Init Failed:", err);
      }
    }

    initShader();

    return () => {
      active = false;
      if (lgInstanceRef.current && typeof lgInstanceRef.current.destroy === "function") {
        lgInstanceRef.current.destroy();
      }
    };
  }, [dropVisible]);

  const toggleDropdown = () => {
    clearTimeout(closeTimerRef.current);

    if (open) {
      setOpen(false);
      closeTimerRef.current = setTimeout(() => {
        setDropVisible(false);
      }, 650);
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
    }, 650);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const fn = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, [open]);

  // Notify shader engine to re-render layout shifts
  useEffect(() => {
    if (lgInstanceRef.current && typeof lgInstanceRef.current.markChanged === "function") {
      lgInstanceRef.current.markChanged();
    }
  }, [open, dropVisible]);

  // Raycast Shader Config Settings
  const navBarConfig = JSON.stringify({
    blurAmount: 0.25,
    refraction: 0.69,
    chromAberration: 0.05,
    edgeHighlight: 0.05,
    cornerRadius: 0, 
    brightness: -0.2,
    saturation: 0,
  });

  const dropDownConfig = JSON.stringify({
    blurAmount: 0.35,
    refraction: 0.85,
    chromAberration: 0.08,
    edgeHighlight: 0.08,
    cornerRadius: 20,
    brightness: -0.3,
    saturation: -0.1,
  });

  return (
    <>
      {/* Liquid Refraction CSS Engine Configuration */}
      <style dangerouslySetInnerHTML={{ __html: `
        .RS_LiquidRoot {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: auto;
          z-index: 9999;
          pointer-events: none;
        }

        .glass-shader-target {
          pointer-events: auto;
          position: relative;
        }

        .RS_Navbar {
          width: 100%;
          padding: 14px 5%;
          transition: all 0.5s cubic-bezier(0.25, 1, 0.5, 1);
        }

        .RS_Navbar:not(:has(canvas)) {
          background: rgba(15, 15, 18, 0.75);
          backdrop-filter: blur(20px);
        }

        .RS_Drop {
          position: absolute;
          right: 5%;
          top: calc(100% + 12px);
          width: 280px;
          padding: 16px 12px;
          overflow: hidden;
          transform-origin: 92% 0%;
          transition: 
            transform 0.65s cubic-bezier(0.175, 0.885, 0.32, 1.28),
            opacity 0.45s ease;
          z-index: 10000;
        }

        .RS_Drop:not(:has(canvas)) {
          background: rgba(12, 12, 15, 0.85);
          border-radius: 20px;
        }

        .RS_Drop--closing {
          opacity: 0;
          transform: scale3d(0.65, 0.45, 1) translate3d(30px, -20px, 0);
        }

        .RS_Drop--open {
          opacity: 1;
          transform: scale3d(1, 1, 1) translate3d(0, 0, 0);
        }

        .RS_NavLink {
          position: relative;
          display: inline-block;
          overflow: hidden;
          padding: 6px 0;
          font-weight: 500;
          font-size: 14px;
          letter-spacing: -0.01em;
          text-decoration: none;
        }

        .RS_NavText {
          display: block;
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        .RS_NavText--white { color: rgba(235, 235, 245, 0.6); }
        .RS_NavText--active {
          position: absolute;
          top: 100%;
          left: 0;
          color: #ffffff;
        }

        .RS_NavLink--hover .RS_NavText--white { transform: translateY(-100%); }
        .RS_NavLink--hover .RS_NavText--active { transform: translateY(-100%); }

        .RS_DropRow {
          display: block;
          padding: 11px 16px;
          margin: 4px 0;
          color: rgba(235, 235, 245, 0.65);
          font-weight: 500;
          font-size: 14px;
          text-decoration: none;
          border-radius: 10px;
          background: transparent;
          transform: translateY(15px);
          opacity: 0;
          transition: transform 0.5s ease, opacity 0.4s ease, background 0.25s, color 0.25s;
        }

        .RS_Drop--open .RS_DropRow {
          transform: translateY(0);
          opacity: 1;
        }

        .RS_DropRow:hover {
          background: rgba(255, 255, 255, 0.06);
          color: #ffffff;
          transform: translateX(4px);
        }

        .RS_HamBtn {
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          width: 22px;
          height: 13px;
          background: transparent;
          border: none;
          cursor: pointer;
        }

        .RS_L {
          width: 100%;
          height: 1.5px;
          background-color: rgba(235, 235, 245, 0.6);
          border-radius: 4px;
          transition: transform 0.45s ease, opacity 0.3s ease;
        }

        .RS_HamBtn:hover .RS_L { background-color: #ffffff; }
        .RS_L1o { transform: translateY(5.5px) rotate(45deg); background-color: #ffffff; }
        .RS_L2o { opacity: 0; transform: scale(0); }
        .RS_L3o { transform: translateY(-6px) rotate(-45deg); background-color: #ffffff; }
      ` }} />

      <div className="RS_LiquidRoot" ref={rootRef}>
        <nav 
          ref={navRef}
          className="RS_Navbar glass-shader-target flex items-center justify-between"
          data-config={navBarConfig}
        >
          <Image
            src="/images/assets/Roadshow_AdinnLogo.svg"
            alt="Roadshow Logo"
            width={160}
            height={44}
            className="h-9 w-auto object-contain brightness-0 invert"
            priority
          />

          <div className="hidden md:flex items-center gap-12 lg:gap-14">
            {navLinks.map(({ label, href }) => (
              <AnimatedNavLink key={label} label={label} href={href} />
            ))}
          </div>

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
        </nav>

        {dropVisible && (
          <div 
            ref={dropdownRef}
            className={`RS_Drop glass-shader-target ${open ? "RS_Drop--open" : "RS_Drop--closing"}`}
            data-config={dropDownConfig}
          >
            {menuItems.map(({ label }, i) => (
              <a
                key={label}
                href="#"
                className="RS_DropRow"
                style={{
                  transitionDelay: open
                    ? `${i * 50}ms`
                    : `${(menuItems.length - 1 - i) * 30}ms`,
                }}
                onClick={(e) => {
                  e.preventDefault();
                  closeDropdown();
                }}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
