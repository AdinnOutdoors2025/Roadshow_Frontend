/* eslint-disable */
// @ts-nocheck
"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import Image from "next/image";
import { baseUrl, mailImageUrl } from "../../../BaseUrl";
import toast, { Toaster } from "react-hot-toast";
import { withRoadshowLoader } from "@/components/GlobalRoadshowLoader";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import {
  faCalendarDays,
  faClock,
  faEnvelope,
  faLocationDot,
  faMapLocationDot,
  faMessage,
  faPhone,
  faRoute,
  faUser,
} from "@fortawesome/free-solid-svg-icons";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  ArrowRight,
  Check,
  Headphones,
  MapPinned,
  MonitorCheck,
} from "lucide-react";

import "./page.css";

gsap.registerPlugin(ScrollTrigger);

/* =========================================================
   TYPES
========================================================= */

type ServiceOption =
  | "2 Sided Fabricated LED"
  | "Single Side Led Vehicle"
  | "19 Feet Triple Side LED"
  | "17 Feet Triple Side LED";

type ContactFormState = {
  name: string;
  contact: string;
  email: string;
  preferredLocation: string;
  startDate: string;
  endDate: string;
  message: string;
};

type ServiceDetails = {
  image: string;
  /** Small (~10-16KB) JPEG copy used only for the email notification — the
   *  full-res `image` above is fine on-page (Next/Image optimizes it), but
   *  a multi-MB remote image is unreliable for a mail client to fetch. */
  mailImage: string;
  alt: string;
  title: string;
  description: string;
  highlights: {
    icon: IconDefinition;
    label: string;
    value: string;
  }[];
};

/* =========================================================
   SERVICES
========================================================= */

const SERVICE_OPTIONS: ServiceOption[] = [
  "2 Sided Fabricated LED",
  "Single Side Led Vehicle",
  "19 Feet Triple Side LED",
  "17 Feet Triple Side LED",
];

const SERVICE_DETAILS: Record<ServiceOption, ServiceDetails> = {
  "2 Sided Fabricated LED": {
    image: "/images/assets/HomeBanner_MainPageFinal.png",
    mailImage: "/images/assets/mail/HomeBanner_MainPageFinal.jpg",
    alt: "2 sided fabricated LED roadshow vehicle",
    title: "2 Sided Fabricated LED",
    description:
      "A high-impact mobile display with visibility on both sides, suitable for city routes, launches and promotional roadshows.",
    highlights: [
      {
        icon: faClock,
        label: "Campaign support",
        value: "8 hours / day",
      },
      {
        icon: faRoute,
        label: "Route coverage",
        value: "Up to 60 km / day",
      },
      {
        icon: faMapLocationDot,
        label: "Tracking",
        value: "GPS & photo proof",
      },
    ],
  },

  "Single Side Led Vehicle": {
    image: "/images/assets/single side edited (1)_NEW.png",
    mailImage: "/images/assets/mail/single-side-edited-1-_NEW.jpg",
    alt: "single side LED roadshow vehicle",
    title: "Single Side LED Vehicle",
    description:
      "A large single-facing LED display designed for focused visibility along high-traffic routes and event locations.",
    highlights: [
      {
        icon: faClock,
        label: "Campaign support",
        value: "8 hours / day",
      },
      {
        icon: faRoute,
        label: "Best suited for",
        value: "Focused route visibility",
      },
      {
        icon: faMapLocationDot,
        label: "Tracking",
        value: "GPS & photo proof",
      },
    ],
  },

  "19 Feet Triple Side LED": {
    image: "/images/assets/full_side_LED_edited-1_new.png",
    mailImage: "/images/assets/mail/full_side_LED_edited-1_new.jpg",
    alt: "19 feet triple side LED roadshow vehicle",
    title: "19 Feet Triple Side LED",
    description:
      "A premium three-sided LED format that delivers strong visibility from multiple directions during moving and static campaigns.",
    highlights: [
      {
        icon: faClock,
        label: "Campaign support",
        value: "8 hours / day",
      },
      {
        icon: faRoute,
        label: "Display format",
        value: "Three-side visibility",
      },
      {
        icon: faMapLocationDot,
        label: "Tracking",
        value: "GPS & photo proof",
      },
    ],
  },

  "17 Feet Triple Side LED": {
    image: "/images/assets/tata ultra - 2.png",
    mailImage: "/images/assets/mail/tata-ultra-2.jpg",
    alt: "17 feet triple side LED roadshow vehicle",
    title: "17 Feet Triple Side LED",
    description:
      "A compact triple-side LED roadshow vehicle offering broad visibility with easier movement across busy urban routes.",
    highlights: [
      {
        icon: faClock,
        label: "Campaign support",
        value: "8 hours / day",
      },
      {
        icon: faRoute,
        label: "Best suited for",
        value: "Urban roadshows",
      },
      {
        icon: faMapLocationDot,
        label: "Tracking",
        value: "GPS & photo proof",
      },
    ],
  },
};

/* =========================================================
   FORM
========================================================= */

const INITIAL_FORM: ContactFormState = {
  name: "",
  contact: "",
  email: "",
  preferredLocation: "",
  startDate: "",
  endDate: "",
  message: "",
};

const FIELD_LIMITS = {
  name: 80,
  contact: 15,
  email: 120,
  preferredLocation: 120,
  message: 1000,
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_PATTERN = /^[0-9+\-\s()]{8,15}$/;

/* =========================================================
   HELPERS
========================================================= */

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/* =========================================================
   FORM FIELD
========================================================= */

type FormFieldProps = {
  label: string;
  name: keyof ContactFormState;
  value: string;
  type?: string;
  placeholder: string;
  required?: boolean;
  min?: string;
  maxLength?: number;
  inputMode?: "text" | "email" | "tel" | "numeric";
  autoComplete?: string;
  icon: IconDefinition;

  onChange: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
};

function FormField({
  label,
  name,
  value,
  type = "text",
  placeholder,
  required = false,
  min,
  maxLength,
  inputMode,
  autoComplete,
  icon,
  onChange,
}: FormFieldProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isDateField = type === "date";

  const openDatePicker = () => {
    if (!isDateField || !inputRef.current) {
      return;
    }

    inputRef.current.focus();

    try {
      inputRef.current.showPicker?.();
    } catch {
      // Browsers without showPicker open the picker on focus.
    }
  };

  return (
    <label className="contact-field">
      <span className="contact-field__label">
        {label}

        {required && (
          <span
            className="contact-field__required"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </span>

      <span
        className={`contact-field__control ${isDateField
            ? "contact-field__control--date"
            : ""
          }`}
      >
        {isDateField ? (
          <button
            type="button"
            className="contact-field__date-button"
            aria-label={`Open ${label.toLowerCase()} calendar`}
            onClick={openDatePicker}
          >
            <FontAwesomeIcon
              icon={icon}
              aria-hidden="true"
            />
          </button>
        ) : (
          <FontAwesomeIcon
            icon={icon}
            className="contact-field__icon"
            aria-hidden="true"
          />
        )}

        <input
          ref={inputRef}
          className="contact-field__input"
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          required={required}
          min={min}
          maxLength={maxLength}
          inputMode={inputMode}
          autoComplete={autoComplete}
          onChange={onChange}
          onClick={
            isDateField ? openDatePicker : undefined
          }
        />
      </span>
    </label>
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function ContactPage() {
  const pageRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLDivElement | null>(null);

  const descriptionRef =
    useRef<HTMLParagraphElement | null>(null);

  const benefitsRef = useRef<HTMLDivElement | null>(null);

  const vehicleTrackRef =
    useRef<HTMLDivElement | null>(null);

  const vehicleRef = useRef<HTMLDivElement | null>(null);

  const formRef = useRef<HTMLFormElement | null>(null);

  const shouldReduceMotion = useReducedMotion();

  const [service, setService] =
    useState<ServiceOption>("2 Sided Fabricated LED");

  const [form, setForm] =
    useState<ContactFormState>(INITIAL_FORM);

  const [submitting, setSubmitting] = useState(false);

  const selectedService = SERVICE_DETAILS[service];

  const today = formatDate(new Date());

  /* =========================================================
     GSAP ANIMATIONS
  ========================================================= */

  useLayoutEffect(() => {
    if (!pageRef.current || shouldReduceMotion) {
      return;
    }

    const responsiveMotion = gsap.matchMedia();

    const context = gsap.context(() => {
      const titleLines =
        titleRef.current?.querySelectorAll(
          ".contact-hero__title-line",
        );

      const benefitItems =
        benefitsRef.current?.querySelectorAll(
          ".contact-benefit",
        );

      if (titleLines?.length) {
        gsap.fromTo(
          titleLines,
          {
            yPercent: 115,
            opacity: 0,
          },
          {
            yPercent: 0,
            opacity: 1,
            duration: 1.05,
            stagger: 0.12,
            ease: "power4.out",
            delay: 0.08,
          },
        );
      }

      if (descriptionRef.current) {
        gsap.fromTo(
          descriptionRef.current,
          {
            y: 24,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            delay: 0.42,
          },
        );
      }

      if (benefitItems?.length) {
        gsap.fromTo(
          benefitItems,
          {
            y: 22,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
            delay: 0.56,
          },
        );
      }

      if (formRef.current) {
        gsap.fromTo(
          formRef.current,
          {
            x: 55,
            opacity: 0,
          },
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            delay: 0.2,
          },
        );
      }

      if (
        heroRef.current &&
        vehicleTrackRef.current &&
        vehicleRef.current
      ) {
        /*
         * Vehicle initial entrance animation.
         */
        gsap.fromTo(
          vehicleRef.current,
          {
            xPercent: -22,
            opacity: 0,
            scale: 0.92,
          },
          {
            xPercent: 0,
            opacity: 1,
            scale: 1,
            duration: 1.3,
            delay: 0.32,
            ease: "power4.out",
          },
        );

        /*
         * Gentle floating animation remains on all screen sizes.
         */
        gsap.to(vehicleRef.current, {
          y: -7,
          duration: 2.3,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });

        /*
         * Desktop and tablet:
         * Vehicle moves horizontally while scrolling.
         */
        responsiveMotion.add(
          "(min-width: 721px)",
          () => {
            const vehicleScrollTween = gsap.to(
              vehicleRef.current,
              {
                xPercent: 10,
                ease: "none",

                scrollTrigger: {
                  trigger: heroRef.current,
                  start: "top 78%",
                  end: "bottom 20%",
                  scrub: 1.1,
                  invalidateOnRefresh: true,
                },
              },
            );

            const trackScrollTween = gsap.to(
              vehicleTrackRef.current,
              {
                backgroundPositionX: "75%",
                ease: "none",

                scrollTrigger: {
                  trigger: heroRef.current,
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 1.2,
                  invalidateOnRefresh: true,
                },
              },
            );

            return () => {
              vehicleScrollTween.scrollTrigger?.kill();
              vehicleScrollTween.kill();

              trackScrollTween.scrollTrigger?.kill();
              trackScrollTween.kill();
            };
          },
        );

        /*
         * Mobile:
         * Vehicle remains in place while page scrolls.
         */
        responsiveMotion.add(
          "(max-width: 720px)",
          () => {
            gsap.set(vehicleRef.current, {
              xPercent: 0,
            });

            gsap.set(vehicleTrackRef.current, {
              backgroundPositionX: "0%",
            });

            return () => {
              gsap.set(vehicleRef.current, {
                clearProps: "xPercent",
              });

              gsap.set(vehicleTrackRef.current, {
                clearProps: "backgroundPositionX",
              });
            };
          },
        );
      }
    }, pageRef);

    ScrollTrigger.refresh();

    return () => {
      responsiveMotion.revert();
      context.revert();
    };
  }, [shouldReduceMotion]);

  /* =========================================================
     SERVICE CHANGE
  ========================================================= */

  const handleServiceChange = (
    option: ServiceOption,
  ) => {
    setService(option);
  };

  /* =========================================================
     FORM CHANGE
  ========================================================= */

  const handleChange =
    (field: keyof ContactFormState) =>
      (
        event: ChangeEvent<
          HTMLInputElement | HTMLTextAreaElement
        >,
      ) => {
        let value = event.target.value;

        if (field === "contact") {
          value = value.replace(
            /[^0-9+\-\s()]/g,
            "",
          );
        }

        setForm((previous) => {
          const nextForm = {
            ...previous,
            [field]: value,
          };

          if (
            field === "startDate" &&
            previous.endDate &&
            value &&
            previous.endDate < value
          ) {
            nextForm.endDate = "";
          }

          return nextForm;
        });
      };

  /* =========================================================
     VALIDATION
  ========================================================= */

  const validateForm = (): string | null => {
    if (!form.name.trim()) {
      return "Please enter your name.";
    }

    if (!form.contact.trim()) {
      return "Please enter your contact number.";
    }

    if (!CONTACT_PATTERN.test(form.contact.trim())) {
      return "Please enter a valid contact number.";
    }

    if (!form.email.trim()) {
      return "Please enter your email address.";
    }

    if (!EMAIL_PATTERN.test(form.email.trim())) {
      return "Please enter a valid email address.";
    }

    if (!form.startDate) {
      return "Please select a campaign start date.";
    }

    if (!form.endDate) {
      return "Please select a campaign end date.";
    }

    if (form.endDate < form.startDate) {
      return "End date cannot be earlier than the start date.";
    }

    return null;
  };

  /* =========================================================
     ENQUIRY ID
  ========================================================= */

  const getFormattedDateKey = (): string => {
    const currentDate = new Date();

    const day = String(
      currentDate.getDate(),
    ).padStart(2, "0");

    const month = String(
      currentDate.getMonth() + 1,
    ).padStart(2, "0");

    const year = currentDate.getFullYear();

    return `${day}${month}${year}`;
  };

  const generateEnquiryId = (): string => {
    const dateKey = getFormattedDateKey();

    if (typeof window === "undefined") {
      return `${dateKey}#01`;
    }

    const storageKey =
      `roadshow-enquiry-count-${dateKey}`;

    const storedCount = Number(
      window.localStorage.getItem(storageKey) || "0",
    );

    const nextCount = storedCount + 1;

    window.localStorage.setItem(
      storageKey,
      String(nextCount),
    );

    const formattedCount = String(
      nextCount,
    ).padStart(2, "0");

    return `${dateKey}#${formattedCount}`;
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (submitting) {
      return;
    }

    const validationMessage = validateForm();

    if (validationMessage) {
      toast.error(validationMessage, {
        id: "contact-form-toast",
      });

      return;
    }

    const enquiryId = generateEnquiryId();

    /* Using the full-res `image` (not the smaller `mailImage`) for now —
       mailImage's /images/assets/mail/*.jpg files aren't deployed to
       Netlify yet (still local/uncommitted), so that URL would 404 in the
       actual sent mail. `image` is already live. Switch this back to
       `selectedService.mailImage` once those files are pushed/deployed. */
    const selectedVehicleImageUrl = new URL(
      selectedService.image,
      `${mailImageUrl}/`,
    ).href;

    setSubmitting(true);

    toast.dismiss("contact-form-toast");

    await withRoadshowLoader(async () => {
      try {
        const response = await fetch(`${baseUrl}/contact-enquiry`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userName: form.name.trim(),
            userContactNumber: form.contact.trim(),
            userEnquiryEmail: form.email.trim(),
            userPreferredLocation: form.preferredLocation.trim(),
            userStartDate: form.startDate,
            userEndDate: form.endDate,
            userPreferredVehicle: service,
            userPreferredVehicleImage: selectedVehicleImageUrl,
            userEnquiryMessage: form.message.trim(),
            source:"roadshow_contact_page",
          }),
        });

        let data: { status?: string; message?: string } = {};

        try {
          data = await response.json();
        } catch (error) {
          // Non-JSON response — leave data empty.
        }

        // 409 = already enquired today. Surface the professional message.
        if (response.status === 409) {
          throw new Error(
            data.message ||
            "You have already submitted an enquiry today. Please try again tomorrow."
          );
        }

        if (!response.ok) {
          throw new Error(
            data.message || "We could not send your enquiry. Please try again shortly."
          );
        }

        setForm(INITIAL_FORM);

        setService("2 Sided Fabricated LED");

        /* Delayed on purpose — the GlobalRoadshowLoader overlay this
           submit runs under (see the withRoadshowLoader wrapper below)
           uses z-[2147483647], the maximum valid CSS z-index, so nothing
           can out-stack it. A toast fired immediately gets painted
           underneath it and is invisible until the loader's own
           minimum-visible + fade-out timers finish (~200ms after
           hideRoadshowLoader() is dispatched in withRoadshowLoader's
           finally block). This delay just waits that window out instead
           of fighting an unwinnable z-index battle. */
        window.setTimeout(() => {
          toast.success(
            `Thank you! Your campaign enquiry ${enquiryId} has been sent successfully.`,
            {
              id: "contact-form-toast",
            },
          );
        }, 500);
      } catch (error) {
        console.error(
          "Enquiry submission failed:",
          error,
        );

        const message =
          error instanceof Error
            ? error.message
            : "We could not send your enquiry. Please try again shortly.";

        // See the success-path comment above — same loader-overlay timing issue.
        window.setTimeout(() => {
          toast.error(message, {
            id: "contact-form-toast",
          });
        }, 500);
      } finally {
        setSubmitting(false);
      }
    }, "Sending your enquiry...");
  };

  return (
    <main
      ref={pageRef}
      className="contact-page"
    >
      <Toaster
        position="top-center"
        containerClassName="contact-toast-container"
        toastOptions={{
          duration: 4200,

          className: "contact-toast",

          success: {
            iconTheme: {
              primary: "#16784a",
              secondary: "#ffffff",
            },
          },

          error: {
            iconTheme: {
              primary: "#a52b2b",
              secondary: "#ffffff",
            },
          },
        }}
      />

      <section className="contact-section">
        <div className="contact-layout">
          <div
            ref={heroRef}
            className="contact-hero"
          >
            <div className="contact-hero__content">
              <div
                ref={titleRef}
                className="contact-hero__title"
                aria-label="Let's make it happen"
              >
                <div className="contact-hero__title-mask">
                  <span className="contact-hero__title-line">
                    Let&rsquo;s make it
                  </span>
                </div>

                <div className="contact-hero__title-mask">
                  <span className="contact-hero__title-line">
                    Happen
                  </span>
                </div>
              </div>

              <p
                ref={descriptionRef}
                className="contact-hero__description"
              >
                Share your roadshow requirements and our
                team will take care of everything for you.
              </p>

              <div
                ref={benefitsRef}
                className="contact-benefits"
              >
                <div className="contact-benefit">
                  <span className="contact-benefit__icon">
                    <MonitorCheck
                      size={19}
                      strokeWidth={1.6}
                    />
                  </span>

                  <span>Modern LED Fleet</span>
                </div>

                <div className="contact-benefit">
                  <span className="contact-benefit__icon">
                    <MapPinned
                      size={19}
                      strokeWidth={1.6}
                    />
                  </span>

                  <span>All India Network</span>
                </div>

                <div className="contact-benefit">
                  <span className="contact-benefit__icon">
                    <Headphones
                      size={19}
                      strokeWidth={1.6}
                    />
                  </span>

                  <span>Reliable Support</span>
                </div>
              </div>
            </div>

            <div className="contact-vehicle-area">
              <div
                ref={vehicleTrackRef}
                className="contact-vehicle-track"
              >
                <div
                  ref={vehicleRef}
                  className="contact-vehicle"
                >
                  <AnimatePresence
                    mode="wait"
                    initial={false}
                  >
                    <motion.div
                      key={service}
                      className="contact-vehicle__image-wrapper"
                      initial={
                        shouldReduceMotion
                          ? {
                            opacity: 0,
                          }
                          : {
                            opacity: 0,
                            x: -35,
                            scale: 0.96,
                          }
                      }
                      animate={{
                        opacity: 1,
                        x: 0,
                        scale: 1,
                      }}
                      exit={
                        shouldReduceMotion
                          ? {
                            opacity: 0,
                          }
                          : {
                            opacity: 0,
                            x: 30,
                            scale: 0.96,
                          }
                      }
                      transition={{
                        duration: shouldReduceMotion
                          ? 0.2
                          : 0.55,

                        ease: [0.22, 1, 0.36, 1],
                      }}
                    >
                      <Image
                        key={`${service}-${selectedService.image}`}
                        src={selectedService.image}
                        alt={selectedService.alt}
                        width={1172}
                        height={1200}
                        priority
                        unoptimized
                        sizes="
                          (max-width: 480px) 96vw,
                          (max-width: 720px) 92vw,
                          (max-width: 1024px) 80vw,
                          (max-width: 1440px) 48vw,
                          (max-width: 1920px) 44vw,
                          960px
                        "
                        className="contact-vehicle__image"
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <AnimatePresence
                mode="wait"
                initial={false}
              >
                <motion.div
                  key={`details-${service}`}
                  className="contact-vehicle-details"
                  initial={{
                    opacity: 0,
                    y: 14,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -10,
                  }}
                  transition={{
                    duration: 0.35,
                  }}
                >
                  <p className="contact-vehicle-details__eyebrow">
                    Selected roadshow vehicle
                  </p>

                  <h3 className="contact-vehicle-details__title">
                    {selectedService.title}
                  </h3>

                  <p className="contact-vehicle-details__description">
                    {selectedService.description}
                  </p>

                  <div className="contact-vehicle-details__list">
                    {selectedService.highlights.map(
                      (item) => (
                        <div
                          className="contact-vehicle-detail"
                          key={`${service}-${item.label}`}
                        >
                          <span className="contact-vehicle-detail__icon">
                            <FontAwesomeIcon
                              icon={item.icon}
                            />
                          </span>

                          <span>
                            <small>
                              {item.label}
                            </small>

                            <strong>
                              {item.value}
                            </strong>
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <motion.form
            ref={formRef}
            className="contact-form"
            onSubmit={handleSubmit}
            noValidate
            initial={false}
          >
            <div className="contact-form__header">
              <div>
                <p className="contact-form__eyebrow">
                  Start your campaign
                </p>

                <h2 className="contact-form__title">
                  Tell us what you need
                </h2>
              </div>

              <span className="contact-form__step">
                01
              </span>
            </div>

            <fieldset className="contact-form__section">
              <legend className="contact-form__section-title">
                Service
              </legend>

              <div className="contact-services">
                {SERVICE_OPTIONS.map((option) => {
                  const active = option === service;

                  return (
                    <motion.button
                      key={option}
                      type="button"
                      aria-pressed={active}
                      className={`contact-service ${active
                          ? "contact-service--active"
                          : ""
                        }`}
                      onClick={() =>
                        handleServiceChange(option)
                      }
                      whileHover={
                        shouldReduceMotion
                          ? undefined
                          : {
                            y: -2,
                          }
                      }
                      whileTap={
                        shouldReduceMotion
                          ? undefined
                          : {
                            scale: 0.97,
                          }
                      }
                    >
                      <AnimatePresence initial={false}>
                        {active && (
                          <motion.span
                            className="contact-service__check"
                            initial={{
                              opacity: 0,
                              scale: 0.5,
                              width: 0,
                            }}
                            animate={{
                              opacity: 1,
                              scale: 1,
                              width: 17,
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.5,
                              width: 0,
                            }}
                          >
                            <Check
                              size={13}
                              strokeWidth={2.5}
                            />
                          </motion.span>
                        )}
                      </AnimatePresence>

                      <span>{option}</span>
                    </motion.button>
                  );
                })}
              </div>
            </fieldset>

            <div className="contact-form__grid">
              <FormField
                label="Your Name"
                name="name"
                value={form.name}
                placeholder="Enter your name"
                required
                maxLength={FIELD_LIMITS.name}
                autoComplete="name"
                icon={faUser}
                onChange={handleChange("name")}
              />

              <FormField
                label="Contact"
                name="contact"
                value={form.contact}
                type="tel"
                placeholder="Enter contact number"
                required
                maxLength={FIELD_LIMITS.contact}
                inputMode="tel"
                autoComplete="tel"
                icon={faPhone}
                onChange={handleChange("contact")}
              />

              <FormField
                label="Email"
                name="email"
                value={form.email}
                type="email"
                placeholder="Enter email address"
                required
                maxLength={FIELD_LIMITS.email}
                inputMode="email"
                autoComplete="email"
                icon={faEnvelope}
                onChange={handleChange("email")}
              />

              <FormField
                label="Preferred Location"
                name="preferredLocation"
                value={form.preferredLocation}
                placeholder="Enter preferred location"
                maxLength={
                  FIELD_LIMITS.preferredLocation
                }
                autoComplete="address-level2"
                icon={faLocationDot}
                onChange={handleChange(
                  "preferredLocation",
                )}
              />
            </div>

            <fieldset className="contact-form__section contact-form__section--dates">
              <legend className="contact-form__section-title">
                Campaign Dates
              </legend>

              <div className="contact-form__grid">
                <FormField
                  label="Start Date"
                  name="startDate"
                  value={form.startDate}
                  type="date"
                  placeholder="Select start date"
                  required
                  min={today}
                  icon={faCalendarDays}
                  onChange={handleChange("startDate")}
                />

                <FormField
                  label="End Date"
                  name="endDate"
                  value={form.endDate}
                  type="date"
                  placeholder="Select end date"
                  required
                  min={form.startDate || today}
                  icon={faCalendarDays}
                  onChange={handleChange("endDate")}
                />
              </div>
            </fieldset>

            <label className="contact-message">
              <span className="contact-form__section-title">
                Your Message
              </span>

              <span className="contact-message__control">
                <FontAwesomeIcon
                  icon={faMessage}
                  className="contact-message__icon"
                  aria-hidden="true"
                />

                <textarea
                  className="contact-message__textarea"
                  name="message"
                  value={form.message}
                  rows={5}
                  maxLength={FIELD_LIMITS.message}
                  placeholder="Tell us about your campaign, locations, duration and requirements..."
                  onChange={handleChange("message")}
                />

                <span className="contact-message__count">
                  {form.message.length}/
                  {FIELD_LIMITS.message}
                </span>
              </span>
            </label>

            <div className="contact-form__footer">
              <motion.button
                className="contact-submit"
                type="submit"
                disabled={submitting}
                data-loader="false"
                whileHover={
                  shouldReduceMotion || submitting
                    ? undefined
                    : {
                      y: -2,
                    }
                }
                whileTap={
                  shouldReduceMotion || submitting
                    ? undefined
                    : {
                      scale: 0.98,
                    }
                }
              >
                <span>
                  {submitting
                    ? "Sending enquiry..."
                    : "Submit enquiry"}
                </span>

                <span className="contact-submit__arrow">
                  <ArrowRight
                    size={19}
                    strokeWidth={1.8}
                  />
                </span>
              </motion.button>
            </div>
          </motion.form>
        </div>
      </section>
    </main>
  );
}