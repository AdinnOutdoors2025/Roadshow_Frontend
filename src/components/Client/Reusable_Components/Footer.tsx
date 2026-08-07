/* eslint-disable */
// @ts-nocheck
"use client";

import React, {
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "@/hooks/useScrollLock";
import "./Footer.css";
import '../HomePageSections/HomePageSection2.css';
import Image from "next/image";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";
import { useRouter } from "next/navigation";

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

  const [email, setEmail] = useState("");

  const [captchaOpen, setCaptchaOpen] = useState(false);
  const [captcha, setCaptcha] =
    useState<MathCaptcha>(createMathCaptcha);

  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [loading, setLoading] = useState(false);

  const captchaInputRef = useRef<HTMLInputElement | null>(null);

  const validateContact = (value: string) => {
    const trimmedValue = value.trim();

    const isValidEmail =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);

    const phoneDigits = trimmedValue.replace(/\D/g, "");
    const isValidPhone =
      phoneDigits.length === 10 ||
      (phoneDigits.length === 12 &&
        phoneDigits.startsWith("91"));

    return {
      isValid: isValidEmail || isValidPhone,
      type: isValidEmail ? "email" : "phone",
      normalizedValue: isValidEmail
        ? trimmedValue.toLowerCase()
        : phoneDigits.length === 12
          ? phoneDigits.slice(2)
          : phoneDigits,
    };
  };

  // const generateNewCaptcha = () => {
  //   setCaptcha(createMathCaptcha());
  //   setCaptchaAnswer("");
  //   setCaptchaError("");
  // };


  const refreshCaptcha = () => {
    setCaptcha((previousCaptcha) => {
      let newCaptcha = createMathCaptcha();

      // Ensure the refreshed question is different.
      while (
        newCaptcha.firstNumber === previousCaptcha.firstNumber &&
        newCaptcha.secondNumber === previousCaptcha.secondNumber
      ) {
        newCaptcha = createMathCaptcha();
      }

      return newCaptcha;
    });

    setCaptchaAnswer("");
    setCaptchaError("");

    toast.dismiss("captcha-error");

    window.setTimeout(() => {
      captchaInputRef.current?.focus();
    }, 50);
  };


  const openCaptchaPopup = () => {
    const validation = validateContact(email);

    if (!email.trim()) {
      toast.error("Please enter your email or phone number.", {
        id: "newsletter-validation",
      });
      return;
    }

    if (!validation.isValid) {
      toast.error(
        "Please enter a valid email address or 10-digit phone number.",
        {
          id: "newsletter-validation",
        }
      );
      return;
    }

    toast.dismiss("newsletter-validation");

    // Clear only the previous answer and error.
    // The question changes only when refresh is clicked.
    setCaptchaAnswer("");
    setCaptchaError("");
    setCaptchaOpen(true);

    window.setTimeout(() => {
      captchaInputRef.current?.focus();
    }, 100);
  };

  const closeCaptchaPopup = () => {
    if (loading) return;

    setCaptchaOpen(false);
    setCaptchaAnswer("");
    setCaptchaError("");
  };
  const sendNewsletterRequest = async () => {
    const validation = validateContact(email);

    if (!validation.isValid) {
      throw new Error(
        "Please enter a valid email address or 10-digit phone number."
      );
    }

    if (
      !EMAILJS_SERVICE_ID ||
      !EMAILJS_PUBLIC_KEY ||
      !NEWSLETTER_TEMPLATE_ID
    ) {
      console.error("EmailJS configuration is missing.");

      throw new Error(
        "Subscription service is not configured correctly."
      );
    }

    const subscriberType =
      validation.type === "email" ? "Email" : "Phone";

    const subscribedAt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium",
    }).format(new Date());

    const templateParams = {
      /*
       * Main contact information.
       * contact_label becomes either "Email" or "Phone".
       */
      contact_label: subscriberType,
      subscriber: validation.normalizedValue,

      // Can be used in the EmailJS subject.
      subscriber_type: subscriberType,

      // Date and time.
      subscribed_at: subscribedAt,
      timezone: "Asia/Kolkata",

      // Source information.
      source: "Adinn Roadshows Website Footer",

      page_url:
        typeof window !== "undefined"
          ? window.location.href
          : "Adinn Roadshows Website",

      verification_status: "Math CAPTCHA verified",
    };

    try {
      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        NEWSLETTER_TEMPLATE_ID,
        templateParams,
        {
          publicKey: EMAILJS_PUBLIC_KEY,
        }
      );

      console.log("EmailJS newsletter sent successfully:", {
        status: result.status,
        text: result.text,
      });

      return {
        success: true,
        message:
          validation.type === "email"
            ? "Your email has been subscribed successfully."
            : "Your phone number has been registered successfully.",
      };
    } catch (error) {
      console.error("EmailJS newsletter error:", error);

      throw new Error(
        "Subscription failed. Please try again."
      );
    }
  };

  const handleCaptchaVerification = async () => {
    if (loading) return;

    if (!captchaAnswer.trim()) {
      const message = "Please enter the CAPTCHA answer.";

      setCaptchaError(message);

      toast.error(message, {
        id: "captcha-error",
      });

      captchaInputRef.current?.focus();
      return;
    }

    const enteredAnswer = Number(captchaAnswer.trim());

    if (
      Number.isNaN(enteredAnswer) ||
      enteredAnswer !== captcha.answer
    ) {
      const message =
        "Incorrect answer. Please check the question and try again.";

      setCaptchaError(message);
      setCaptchaAnswer("");

      toast.error("Incorrect CAPTCHA answer. Please try again.", {
        id: "captcha-error",
      });

      window.setTimeout(() => {
        captchaInputRef.current?.focus();
      }, 50);

      return;
    }

    const loadingToastId = toast.loading(
      "Verifying and subscribing...",
      {
        id: "newsletter-submitting",
      }
    );

    try {
      setLoading(true);
      setCaptchaError("");

      const response = await sendNewsletterRequest();

      setEmail("");
      setCaptchaAnswer("");
      setCaptchaError("");
      setCaptchaOpen(false);

      toast.success(
        response.message ||
        "Thank you! You have subscribed successfully.",
        {
          id: loadingToastId,
          duration: 4500,
        }
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Subscription failed. Please try again.";

      toast.error(message, {
        id: loadingToastId,
        duration: 4500,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (!email.trim() || loading) {
        return;
      }
      openCaptchaPopup();
    }
  };

  const handleCaptchaKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter" && !loading) {
      event.preventDefault();
      handleCaptchaVerification();
    }
  };

  const handleCaptchaOverlayClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (event.target === event.currentTarget) {
      closeCaptchaPopup();
    }
  };

  useScrollLock(captchaOpen);

  useEffect(() => {
    if (!captchaOpen) return;

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        closeCaptchaPopup();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [captchaOpen, loading]);

  const [mounted] = useState(
    () => typeof document !== "undefined"
  );

  const isNewsletterEmpty = email.trim().length === 0;
  return (
    <>
      <footer className="FooterMain text-white" id="footer">
        {/* Top CTA Banner */}
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
            href="/roadshow/Contact"
            className="FooterCTAButton shrink-0 md:shrink-0 w-full md:w-auto text-center hover:bg-gray-100 transition-colors duration-200 whitespace-nowrap block"
          >
            Reach Us
          </a>
        </div>

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-10 px-[5%] md:px-[10%] lg:px-[15%] py-8 md:py-12">
          <div className="flex flex-col gap-4 md:gap-5 sm:col-span-2 md:col-span-1 FooterMainContentCol1">
            <Image
              src="/images/assets/Roadshow_AdinnLogo_WithoutBg.svg"
              alt="Roadshow Logo"
              className="FooterCol1Logo cursor-pointer"
              width={200}
              height={60}
              priority
              onClick={() => router.push("/")}
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
              ].map(({ src, alt, link }) => (
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
              ))}
            </div>

            {/* Phone and Email */}
            <div className="FooterCol1Contact">
              <div className="flex items-center gap-2 flex-wrap">
                <a
                  href="tel:7373785057"
                  style={{ textDecoration: "none" }}
                >
                  +91 73737 85057
                </a>

                <span>|</span>

                <a
                  href="tel:9626987861"
                  style={{ textDecoration: "none" }}
                >
                  +91 96269 87861
                </a>
              </div>

              <a
                href="mailto:ba@adinn.co.in"
                style={{ textDecoration: "none" }}
              >
                ba@adinn.co.in
              </a>
            </div>

            {/* Newsletter */}
            <div>
              <p className="mb-2 FooterCol1Newsletter">
                Get notified upon new Updates
              </p>

              <div className="RA_RightContent2Main flex gap-5 items-center bg-white rounded-full overflow-hidden pr-1 pl-4 py-1 w-full max-w-xs">
                <input
                  type="text"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="Your email or phone number"
                  value={email}
                  disabled={loading}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    toast.dismiss("newsletter-validation");
                  }}
                  onKeyDown={handleNewsletterKeyDown}
                  className="RA_RightContent2Input flex-1 bg-transparent text-black text-md outline-none placeholder-gray-400 min-w-0 disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={openCaptchaPopup}
                  disabled={loading || isNewsletterEmpty}
                  className={`
    RA_RightContent2InpBtn
    transition-all duration-200
    rounded-full p-2
    flex items-center justify-center flex-shrink-0
    ${loading || isNewsletterEmpty
                      ? "cursor-not-allowed opacity-40"
                      : "cursor-pointer opacity-100"
                    }
  `}
                  aria-label="Subscribe"
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

          {/* Column 2 — Services */}
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

          {/* Column 3 — Addresses */}
          <div className="flex flex-col gap-3 md:gap-4">
            <div className="mb-2 FooterCol23Heading">
              Address
            </div>

            <div className="FooterCol23Contents">
              29, 1st Cross Street, Vanamamalai Nagar,
              By-pass Road,{" "}
              <span className="FooterCol3LocationSpan">
                Madurai - 625 010.
              </span>
            </div>

            <div className="FooterCol23Contents">
              No. 19/43, MG Chakrapani Street, Sathya Garden,
              Saligramam,{" "}
              <span className="FooterCol3LocationSpan">
                Chennai - 600 092.
              </span>
            </div>

            <div className="FooterCol23Contents">
              No. 407/8, 4th Cross, Jayanagar 7th Block,
              Opp-Saraswat Cooperative Bank,{" "}
              <span className="FooterCol3LocationSpan">
                Bangalore - 560 070.
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="FooterContentDivider"></div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8 px-[5%] py-4 md:py-5 FooterBottomContents">
          <a
            href="/cookies"
            className="hover:text-white transition-colors"
          >
            Cookies Policy
          </a>

          <a
            href="/legal"
            className="hover:text-white transition-colors"
          >
            Legal Terms
          </a>

          <a
            href="/privacy"
            className="hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </footer>

      {/* Math CAPTCHA Popup */}
      {captchaOpen &&
        mounted &&
        createPortal(
        <div
          className="fixed inset-0 z-[200] flex overflow-y-auto bg-black/55 px-4 py-6 backdrop-blur-[5px]"
          onMouseDown={handleCaptchaOverlayClick}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="footer-captcha-title"
            className="relative w-full max-w-[430px] m-auto overflow-hidden rounded-[28px] bg-white p-7 text-center text-black shadow-[0_30px_90px_rgba(0,0,0,0.32)] sm:p-9"
          >
            {/* Close */}
            <button
              type="button"
              onClick={closeCaptchaPopup}
              disabled={loading}
              aria-label="Close CAPTCHA popup"
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#f1f1f1] text-[21px] text-black transition hover:bg-[#e5e5e5] disabled:cursor-not-allowed disabled:opacity-50"
            >
              ×
            </button>

            {/* Shield Icon */}
            <div className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#fdeaea]">
              <div className="flex h-[50px] w-[50px] items-center justify-center rounded-full bg-[#d70000] text-white">
                <i className="fa-solid fa-shield-halved text-[21px]"></i>
              </div>
            </div>

            <h2
              id="footer-captcha-title"
              className="mt-5 text-[24px] font-bold leading-tight"
            >
              Complete Verification
            </h2>

            <p className="mx-auto mt-2 max-w-[330px] text-[14px] leading-[1.6] text-[#666666]">
              Please solve this simple question before subscribing.
            </p>

            {/* Math Question */}
            <div className="relative mt-6 rounded-[18px] bg-[#f5f5f5] px-5 py-5">
              {/* Refresh CAPTCHA */}
              <button
                type="button"
                onClick={refreshCaptcha}
                disabled={loading}
                aria-label="Refresh CAPTCHA question"
                title="Refresh CAPTCHA"
                className="
      absolute right-3 top-3
      flex h-9 w-9 items-center justify-center
      rounded-full bg-white
      text-[#555555]
      shadow-sm
      transition-all duration-200
      hover:rotate-180 hover:text-[#d70000]
      disabled:cursor-not-allowed disabled:opacity-50
    "
              >
                <i className="fa-solid fa-rotate-right text-[14px]"></i>
              </button>

              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-[#888888]">
                What is
              </p>

              <p className="mt-2 text-[32px] font-bold text-black">
                {captcha.firstNumber} + {captcha.secondNumber} = ?
              </p>


            </div>

            <input
              ref={captchaInputRef}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={captchaAnswer}
              disabled={loading}
              placeholder="Enter your answer"
              onChange={(event) => {
                setCaptchaAnswer(
                  event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 3)
                );

                setCaptchaError("");
                toast.dismiss("captcha-error");
              }}
              onKeyDown={handleCaptchaKeyDown}
              className={`mt-5 w-full rounded-[12px] border bg-white px-4 py-3.5 text-center text-[17px] font-semibold text-black outline-none transition ${captchaError
                ? "border-[#d70000] focus:border-[#d70000]"
                : "border-[#d6d6d6] focus:border-black"
                }`}
            />

            {captchaError && (
              <p className="mt-2 text-[13px] font-medium text-[#d70000]">
                {captchaError}
              </p>
            )}

            <button
              type="button"
              onClick={handleCaptchaVerification}
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-[#d70000] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}

              {loading
                ? "Verifying & Subscribing..."
                : "Verify & Subscribe"}
            </button>

            {/* <button
              type="button"
              onClick={generateNewCaptcha}
              disabled={loading}
              className="mt-4 text-[13px] font-semibold text-[#666666] transition hover:text-[#d70000] disabled:cursor-not-allowed disabled:opacity-50"
            >
              Generate another question
            </button> */}
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}

export default Footer;