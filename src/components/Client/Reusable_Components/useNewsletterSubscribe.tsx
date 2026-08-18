"use client";

/* -------------------------------------------------------------------------- */
/*                    SHARED NEWSLETTER / CONTACT CAPTURE FLOW                  */
/* -------------------------------------------------------------------------- */
/*  Email-or-phone capture + math captcha + EmailJS send, used by both the      */
/*  Footer newsletter field and the "Roadshow Advantages" section field on the  */
/*  homepage. Both need the identical validation/captcha/EmailJS behaviour, so   */
/*  it lives here once rather than being copy-pasted per call site — the two     */
/*  only differ in the `source` label sent to the EmailJS template and in how    */
/*  their own input row is laid out (each page still owns that markup).         */

import {
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import toast from "react-hot-toast";
import emailjs from "@emailjs/browser";

import { useScrollLock } from "@/hooks/useScrollLock";
import "./Footer.css";

type MathCaptcha = {
  firstNumber: number;
  secondNumber: number;
  answer: number;
};

const EMAILJS_SERVICE_ID = "service_109ond7";
const EMAILJS_PUBLIC_KEY = "hmRHPc3KZL8QoEtzw";
const NEWSLETTER_TEMPLATE_ID = "template_ke6dt9s";

function createMathCaptcha(): MathCaptcha {
  const firstNumber = Math.floor(Math.random() * 9) + 1;
  const secondNumber = Math.floor(Math.random() * 9) + 1;

  return {
    firstNumber,
    secondNumber,
    answer: firstNumber + secondNumber,
  };
}

function validateContact(value: string) {
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
}

export function useNewsletterSubscribe(source: string) {
  const [email, setEmail] = useState("");

  const [captchaOpen, setCaptchaOpen] = useState(false);

  const [captcha, setCaptcha] =
    useState<MathCaptcha>(createMathCaptcha);

  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [loading, setLoading] = useState(false);

  const captchaInputRef = useRef<HTMLInputElement | null>(null);

  const onEmailChange = (value: string) => {
    setEmail(value);
    toast.dismiss("newsletter-validation");
  };

  const refreshCaptcha = () => {
    setCaptcha((previousCaptcha) => {
      let newCaptcha = createMathCaptcha();

      // Make sure the refreshed question is different.
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
      toast.error(
        "Please enter your email address or phone number.",
        {
          id: "newsletter-validation",
        }
      );

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

    toast.dismiss("captcha-error");
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
        "The update request service is currently unavailable."
      );
    }

    const subscriberType =
      validation.type === "email" ? "Email" : "Phone";

    const subscribedAt = new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "full",
      timeStyle: "medium",
    }).format(new Date());

    /*
     * IMPORTANT:
     * Existing EmailJS parameter names are kept unchanged
     * so the current EmailJS template continues to work.
     */
    const templateParams = {
      contact_label: subscriberType,

      subscriber: validation.normalizedValue,

      subscriber_type: subscriberType,

      subscribed_at: subscribedAt,

      timezone: "Asia/Kolkata",

      source,

      page_url:
        typeof window !== "undefined"
          ? window.location.href
          : "Adinn Roadshows Website",

      verification_status:
        "Human verification completed",
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

      console.log(
        "EmailJS request sent successfully:",
        {
          status: result.status,
          text: result.text,
        }
      );

      return {
        success: true,

        message:
          validation.type === "email"
            ? "Your email has been registered for Roadshow updates."
            : "Your phone number has been registered for Roadshow updates.",
      };
    } catch (error) {
      console.error(
        "EmailJS update request error:",
        error
      );

      throw new Error(
        "Unable to process your request. Please try again."
      );
    }
  };

  const handleCaptchaVerification = async () => {
    if (loading) return;

    if (!captchaAnswer.trim()) {
      const message =
        "Please enter the answer to continue.";

      setCaptchaError(message);

      toast.error(message, {
        id: "captcha-error",
      });

      captchaInputRef.current?.focus();

      return;
    }

    const enteredAnswer = Number(
      captchaAnswer.trim()
    );

    if (
      Number.isNaN(enteredAnswer) ||
      enteredAnswer !== captcha.answer
    ) {
      const message =
        "The answer is incorrect. Please check the question and try again.";

      setCaptchaError(message);

      setCaptchaAnswer("");

      toast.error(
        "Incorrect answer. Please try again.",
        {
          id: "captcha-error",
        }
      );

      window.setTimeout(() => {
        captchaInputRef.current?.focus();
      }, 50);

      return;
    }

    const loadingToastId = toast.loading(
      "Verifying your request...",
      {
        id: "newsletter-submitting",
      }
    );

    try {
      setLoading(true);

      setCaptchaError("");

      const response =
        await sendNewsletterRequest();

      setEmail("");

      setCaptchaAnswer("");

      setCaptchaError("");

      setCaptchaOpen(false);

      toast.success(
        response.message ||
          "Your request has been completed successfully.",
        {
          id: loadingToastId,
          duration: 4500,
        }
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to process your request. Please try again.";

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
    if (
      event.key === "Enter" &&
      !loading
    ) {
      event.preventDefault();

      handleCaptchaVerification();
    }
  };

  const handleCaptchaOverlayClick = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    if (
      event.target === event.currentTarget
    ) {
      closeCaptchaPopup();
    }
  };

  useScrollLock(captchaOpen);

  useEffect(() => {
    if (!captchaOpen) return;

    const handleEscape = (
      event: globalThis.KeyboardEvent
    ) => {
      if (
        event.key === "Escape" &&
        !loading
      ) {
        closeCaptchaPopup();
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [captchaOpen, loading]);

  const [mounted] = useState(
    () => typeof document !== "undefined"
  );

  const isEmpty = email.trim().length === 0;

  const modal =
    captchaOpen && mounted
      ? createPortal(
          <div
            className="
              FooterCaptchaOverlay
              fixed inset-0 z-[200]
              flex overflow-y-auto
              bg-black/55
              px-4 py-6
              backdrop-blur-[5px]
            "
            onMouseDown={handleCaptchaOverlayClick}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="newsletter-captcha-title"
              aria-describedby="newsletter-captcha-description"
              className="
                FooterCaptchaModal
                relative
                w-full max-w-[430px]
                m-auto
                overflow-hidden
                rounded-[28px]
                bg-white
                p-7
                text-center
                text-black
                shadow-[0_30px_90px_rgba(0,0,0,0.32)]
                sm:p-9
              "
            >
              <button
                type="button"
                onClick={closeCaptchaPopup}
                disabled={loading}
                aria-label="Close verification popup"
                className="
                  absolute right-5 top-5
                  flex h-9 w-9
                  items-center justify-center
                  rounded-full
                  bg-[#f1f1f1]
                  text-[21px]
                  text-black
                  transition-all
                  duration-200
                  hover:bg-[#e5e5e5]
                  hover:rotate-90
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                ×
              </button>

              <div
                className="
                  FooterCaptchaShield
                  mx-auto
                  flex
                  h-[70px] w-[70px]
                  items-center justify-center
                  rounded-full
                  bg-[#fdeaea]
                "
              >
                <div
                  className="
                    FooterCaptchaShieldInner
                    flex
                    h-[50px] w-[50px]
                    items-center justify-center
                    rounded-full
                    bg-[#d70000]
                    text-white
                  "
                >
                  <i className="fa-solid fa-shield-halved text-[21px]"></i>
                </div>
              </div>

              <div className="FooterCaptchaContent">
                <h2
                  id="newsletter-captcha-title"
                  className="
                    mt-5
                    text-[24px]
                    font-bold
                    leading-tight
                  "
                >
                  Human Verification
                </h2>

                <p
                  id="newsletter-captcha-description"
                  className="
                    mx-auto
                    mt-2
                    max-w-[340px]
                    text-[14px]
                    leading-[1.6]
                    text-[#666666]
                  "
                >
                  Complete this quick security check
                  to submit your contact details for
                  Roadshow updates.
                </p>
              </div>

              <div
                className="
                  FooterCaptchaQuestion
                  relative
                  mt-6
                  rounded-[18px]
                  bg-[#f5f5f5]
                  px-5 py-5
                  transition-all
                  duration-300
                  hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)]
                "
              >
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  disabled={loading}
                  aria-label="Generate a new security question"
                  title="Generate new question"
                  className="
                    absolute right-3 top-3
                    flex h-9 w-9
                    items-center justify-center
                    rounded-full
                    bg-white
                    text-[#555555]
                    shadow-sm
                    transition-all
                    duration-300
                    hover:rotate-180
                    hover:text-[#d70000]
                    hover:shadow-md
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <i className="fa-solid fa-rotate-right text-[14px]"></i>
                </button>

                <p
                  className="
                    text-[12px]
                    font-semibold
                    uppercase
                    tracking-[0.1em]
                    text-[#888888]
                  "
                >
                  Security question
                </p>

                <p
                  className="
                    mt-2
                    text-[32px]
                    font-bold
                    text-black
                  "
                >
                  {captcha.firstNumber} +{" "}
                  {captcha.secondNumber} = ?
                </p>
              </div>

              <input
                ref={captchaInputRef}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                value={captchaAnswer}
                disabled={loading}
                placeholder="Enter the result"
                aria-label="Security question answer"
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
                className={`
                  FooterCaptchaInput
                  mt-5
                  w-full
                  rounded-[12px]
                  border
                  bg-white
                  px-4
                  py-3.5
                  text-center
                  text-[17px]
                  font-semibold
                  text-black
                  outline-none
                  transition-all
                  duration-200

                  ${
                    captchaError
                      ? "border-[#d70000] focus:border-[#d70000] focus:ring-2 focus:ring-[#d70000]/10"
                      : "border-[#d6d6d6] focus:border-black focus:ring-2 focus:ring-black/5"
                  }
                `}
              />

              {captchaError && (
                <p
                  role="alert"
                  className="
                    FooterCaptchaError
                    mt-2
                    text-[13px]
                    font-medium
                    text-[#d70000]
                  "
                >
                  {captchaError}
                </p>
              )}

              <button
                type="button"
                onClick={handleCaptchaVerification}
                disabled={loading}
                className="
                  FooterCaptchaAction
                  group
                  mt-5
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-black
                  px-6
                  py-3.5
                  text-[14px]
                  font-semibold
                  text-white
                  transition-all
                  duration-300
                  hover:bg-[#d70000]
                  hover:shadow-[0_8px_24px_rgba(215,0,0,0.18)]
                  disabled:cursor-not-allowed
                  disabled:opacity-70
                "
              >
                {loading ? (
                  <>
                    <span
                      className="
                        h-4 w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/40
                        border-t-white
                      "
                    />

                    <span>Verifying your request...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>

                    <i
                      className="
                        fa-solid
                        fa-arrow-right
                        text-[12px]
                        transition-transform
                        duration-300
                        group-hover:translate-x-1
                      "
                    ></i>
                  </>
                )}
              </button>

              <div
                className="
                  FooterCaptchaSecurityNote
                  mt-4
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[11px]
                  font-medium
                  text-[#8a8a8a]
                "
              >
                <i className="fa-solid fa-lock text-[10px]"></i>

                <span>
                  Verification helps prevent automated requests.
                </span>
              </div>
            </section>
          </div>,
          document.body
        )
      : null;

  return {
    email,
    onEmailChange,
    loading,
    isEmpty,
    openCaptchaPopup,
    handleNewsletterKeyDown,
    modal,
  };
}
