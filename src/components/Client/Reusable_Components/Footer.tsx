/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useState } from "react";
import "./Footer.css";
import "../HomePageSections/HomePageSection2.css";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ButtonHover } from "./ButtonHover";
import { useNewsletterSubscribe } from "./useNewsletterSubscribe";
import TermsAndConditionsModal from "./TermsAndConditionsModal";
import { navigateAfterRoadshowLoader } from "@/components/GlobalRoadshowLoader";

type MathCaptcha = {
  firstNumber: number;
  secondNumber: number;
  answer: number;
};

const EMAILJS_SERVICE_ID = "service_109ond7";
const EMAILJS_PUBLIC_KEY = "hmRHPc3KZL8QoEtzw";
const NEWSLETTER_TEMPLATE_ID = "template_ke6dt9s"; //adinndigitalservices account


function createMathCaptcha(): MathCaptcha {
  const firstNumber = Math.floor(Math.random() * 9) + 1;
  const secondNumber = Math.floor(Math.random() * 9) + 1;

  return {
    firstNumber,
    secondNumber,
    answer: firstNumber + secondNumber,
  };
}

function Footer() {
  const router = useRouter();

  const [termsOpen, setTermsOpen] = useState(false);

  const {
    email,
    onEmailChange,
    loading,
    isEmpty: isNewsletterEmpty,
    openCaptchaPopup,
    handleNewsletterKeyDown,
    modal: newsletterCaptchaModal,
  } = useNewsletterSubscribe("Adinn Roadshows Website Footer");

  return (
    <>
      <footer
        className="FooterMain text-white"
        id="footer"
      >
        {/* =====================================================
            TOP CTA
        ====================================================== */}

        <div className="FooterCTAMain flex flex-col md:flex-row items-start md:items-center justify-around px-[5%] py-6 md:py-10 gap-4 md:gap-6">
          <div>
            <div className="FooterCTAContent1 leading-tight">
              Launch your campaign now.
            </div>

            <div className="FooterCTAContent2 mt-1">
              Quick setup, instant visibility.
            </div>
          </div>

          <ButtonHover
            href="/roadshow/Contact"
            label="Reach Us"
            className="FooterCTAButton shrink-0 md:shrink-0 w-full md:w-auto text-center whitespace-nowrap"
          />
        </div>

        {/* =====================================================
            MAIN FOOTER
        ====================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 px-[5%] md:px-[10%] lg:px-[15%] py-8 md:py-12">
          {/* ===================================================
              COLUMN 1
          ==================================================== */}

          <div className="flex flex-col gap-4 md:gap-5 sm:col-span-2 md:col-span-1 FooterMainContentCol1">
            <Image
              src="/images/assets/Roadshow_AdinnLogo_WithoutBg.svg"
              alt="Roadshow Logo"
              className="FooterCol1Logo cursor-pointer"
              width={200}
              height={60}
              priority
              role="button"
              tabIndex={0}
              data-loader="false"
              onClick={() =>
                navigateAfterRoadshowLoader(
                  () => router.push("/"),
                  "Loading home...",
                )
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigateAfterRoadshowLoader(
                    () => router.push("/"),
                    "Loading home...",
                  );
                }
              }}
            />

            {/* Social Icons */}

            <div className="flex items-center FooterCol1Social">
              {[
                {
                  src: "/images/assets/RS_Footer_Insta.svg",
                  alt: "Instagram",
                  link: "https://www.instagram.com/adinnroadshows_/",
                },
                {
                  src: "/images/assets/RS_Footer_FB.svg",
                  alt: "Facebook",
                  link: "https://www.facebook.com/adinnroadshow",
                },
                {
                  src: "/images/assets/RS_Footer_Twitter.svg",
                  alt: "Twitter",
                  link: "https://x.com/AdinnRoadshow",
                },
                {
                  src: "/images/assets/RS_Footer_LinkedIn.svg",
                  alt: "LinkedIn",
                  link: "https://www.linkedin.com/company/adinn-roadshows/",
                },
              ].map(
                ({
                  src,
                  alt,
                  link,
                }) => (
                  <a
                    key={alt}
                    href={link}
                    aria-label={alt}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Image
                      src={src}
                      alt={alt}
                      className="FooterCol1SocialIcon"
                      width={0}
                      height={0}
                    />
                  </a>
                )
              )}
            </div>

            {/* Phone and Email */}

            <div className="FooterCol1Contact">
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="tel:7373785057"
                  style={{
                    textDecoration:
                      "none",
                  }}
                >
                  +91 73737 85057
                </a>

                <span>|</span>

                <a
                  href="tel:9626987861"
                  style={{
                    textDecoration:
                      "none",
                  }}
                >
                  +91 96269 87861
                </a>
              </div>

              <a
                href="mailto:roadshowsales@adinn.co.in"
                style={{
                  textDecoration: "none",
                }}
              >
                roadshowsales@adinn.co.in
              </a>
            </div>

            {/* Updates Field */}

            <div>
              <p className="mb-2 FooterCol1Newsletter">
                Stay informed with Roadshow updates
              </p>

              <div className="RA_RightContent2Main flex gap-5 items-center bg-white rounded-full overflow-hidden pr-1 pl-4 py-1 w-full max-w-xs">
                <input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Your email or phone number"
                  value={email}
                  disabled={loading}
                  onChange={(event) =>
                    onEmailChange(event.target.value)
                  }
                  onKeyDown={
                    handleNewsletterKeyDown
                  }
                  className="RA_RightContent2Input flex-1 bg-transparent text-black text-md outline-none placeholder-gray-400 min-w-0 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={openCaptchaPopup}
                  disabled={loading || isNewsletterEmpty}
                  data-loader="false"
                  className={`
                    RA_RightContent2InpBtn
                    transition-all duration-200
                    rounded-full p-2
                    flex items-center justify-center flex-shrink-0
                    ${
                      loading ||
                      isNewsletterEmpty
                        ? "cursor-not-allowed opacity-40"
                        : "cursor-pointer opacity-100"
                    }
                  `}
                  aria-label="Continue with contact verification"
                >
                  {loading ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  ) : (
                    <i className="fa-solid fa-chevron-right"></i>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ===================================================
              COLUMN 2 — SERVICES
          ==================================================== */}

          <div className="flex flex-col gap-2 md:gap-3">
            <div className="mb-2 FooterCol23Heading">
              Services
            </div>

            {[
              "LED Screen Vehicle",
              "L-Type LED Vehicle",
              "3-Side LED Truck",
              "Customize Fabrication Vehicle",
            ].map((service) => (
              <div
                key={service}
                className="hover:text-white transition-colors duration-200 FooterCol23Contents"
              >
                {service}
              </div>
            ))}
          </div>

          {/* ===================================================
              COLUMN 3 — ADDRESS
          ==================================================== */}

          <div className="flex flex-col gap-3 md:gap-4">
            <div className="mb-2 FooterCol23Heading">
              Address
            </div>

            <div className="FooterCol23Contents">
              29, 1st Cross Street,
              Vanamamalai Nagar, By-pass
              Road,{" "}
              <span className="FooterCol3LocationSpan">
                Madurai - 625 010.
              </span>
            </div>

            <div className="FooterCol23Contents">
              No. 19/43, MG Chakrapani
              Street, Sathya Garden,
              Saligramam,{" "}
              <span className="FooterCol3LocationSpan">
                Chennai - 600 092.
              </span>
            </div>

            <div className="FooterCol23Contents">
              No. 407/8, 4th Cross,
              Jayanagar 7th Block,
              Opp-Saraswat Cooperative
              Bank,{" "}
              <span className="FooterCol3LocationSpan">
                Bangalore - 560 070.
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM BAR
        ====================================================== */}

        <div className="FooterContentDivider"></div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 px-[5%] py-4 md:py-5 FooterBottomContents">
          <a
            href="/cookies"
            className="hover:text-white transition-colors"
          >
            Cookies Policy
          </a>

          {/* Was a dead link to a /legal route that doesn't exist — now
              opens the actual Terms & Conditions content in a popup. */}
          <button
            type="button"
            onClick={() => setTermsOpen(true)}
            className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 font-inherit text-inherit"
          >
            Terms &amp; Conditions
          </button>

          <a
            href="/privacy"
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </footer>

      {newsletterCaptchaModal}

      <TermsAndConditionsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
      />
    </>
  );
}

export default Footer;