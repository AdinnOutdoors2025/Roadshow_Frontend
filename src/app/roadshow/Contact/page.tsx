// "use client";

// import { useState, type ChangeEvent, type FormEvent } from "react";
// import { ArrowRight } from "lucide-react";

// /* =========================================================
//    Contact Us page — implements Figma "Road-Show-2" file,
//    frame "Desktop - 4" (node-id 3108:14056).

//    Navbar and Footer are rendered globally by the root layout
//    (src/app/layout.tsx), so this file only implements the page
//    content between them: hero heading, service selector,
//    contact details form, campaign dates and message.
// ========================================================= */

// type ServiceOption =
//   | "Led Vehicle"
//   | "Fabricated LED"
//   | "19 Feet Triple Side LED"
//   | "19 Feet Single Side LED";

// const SERVICE_OPTIONS: ServiceOption[] = [
//   "Led Vehicle",
//   "Fabricated LED",
//   "19 Feet Triple Side LED",
//   "19 Feet Single Side LED",
// ];

// type ContactFormState = {
//   name: string;
//   contact: string;
//   email: string;
//   preferredLocation: string;
//   startDate: string;
//   endDate: string;
//   message: string;
// };

// const INITIAL_FORM: ContactFormState = {
//   name: "",
//   contact: "",
//   email: "",
//   preferredLocation: "",
//   startDate: "",
//   endDate: "",
//   message: "",
// };

// function FormField({
//   label,
//   name,
//   value,
//   onChange,
//   placeholder,
//   type = "text",
//   required,
//   maxWidth = 220,
// }: {
//   label: string;
//   name: string;
//   value: string;
//   onChange: (e: ChangeEvent<HTMLInputElement>) => void;
//   placeholder?: string;
//   type?: string;
//   required?: boolean;
//   maxWidth?: number;
// }) {
//   return (
//     <label className="block">
//       <span className="block text-[16px] font-normal text-[#625656] sm:text-[18px]">
//         {label}
//       </span>
//       <input
//         name={name}
//         type={type}
//         value={value}
//         onChange={onChange}
//         placeholder={placeholder}
//         required={required}
//         style={{ maxWidth }}
//         className="mt-3 w-full border-0 border-b border-[#c9c9c9] bg-transparent pb-2 text-[15px] text-black outline-none transition-colors placeholder:text-[#9a9a9a] focus:border-black"
//       />
//     </label>
//   );
// }

// export default function ContactPage() {
//   const [service, setService] = useState<ServiceOption>("Led Vehicle");
//   const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);
//   const [submitting, setSubmitting] = useState(false);
//   const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

//   const handleChange =
//     (field: keyof ContactFormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//       setForm((prev) => ({ ...prev, [field]: e.target.value }));
//       if (status !== "idle") setStatus("idle");
//     };

//   const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     if (!form.name.trim() || !form.contact.trim() || !form.email.trim()) {
//       setStatus("error");
//       return;
//     }

//     setSubmitting(true);

//     // No backend endpoint exists yet for the public contact form (public
//     // site is presentation-only — see CLAUDE.md §12/§13), so this only
//     // simulates submission locally.
//     window.setTimeout(() => {
//       setSubmitting(false);
//       setStatus("success");
//       setForm(INITIAL_FORM);
//       setService("Led Vehicle");
//     }, 500);
//   };

//   return (
//     <main className="min-h-screen bg-white text-black">
//       <section className="mx-auto grid max-w-[1420px] grid-cols-1 gap-16 px-4 pb-24 pt-36 sm:pt-40 lg:grid-cols-2 lg:items-start lg:gap-10">
//         {/* Left — Hero */}
//         <div className="lg:sticky lg:top-40">
//           <h1 className="max-w-[560px] text-[48px] font-normal leading-[1.05] text-black sm:text-[64px] lg:text-[76px] xl:text-[92px]">
//             Let&rsquo;s make it Happen
//           </h1>
//         </div>

//         {/* Right — Contact form */}
//         <form
//           onSubmit={handleSubmit}
//           className="w-full max-w-[620px] lg:justify-self-end"
//           noValidate
//         >
//           {/* Service */}
//           <div>
//             <h2 className="text-[26px] font-normal text-black sm:text-[32px] lg:text-[38px]">
//               Service
//             </h2>
//             <div className="mt-6 flex flex-wrap gap-3">
//               {SERVICE_OPTIONS.map((option) => {
//                 const active = option === service;
//                 return (
//                   <button
//                     key={option}
//                     type="button"
//                     onClick={() => setService(option)}
//                     aria-pressed={active}
//                     className={`rounded-[30px] px-6 py-3 text-[14px] font-medium whitespace-nowrap transition-colors sm:text-[16px] ${
//                       active
//                         ? "bg-[#e4e4e4] text-black"
//                         : "border border-[#625656] text-black hover:bg-[#f5f5f5]"
//                     }`}
//                   >
//                     {option}
//                   </button>
//                 );
//               })}
//             </div>
//           </div>

//           {/* Name / Contact / Email / Preferred Location */}
//           <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
//             <FormField
//               label="Your Name"
//               name="name"
//               value={form.name}
//               onChange={handleChange("name")}
//               required
//             />
//             <FormField
//               label="Contact"
//               name="contact"
//               value={form.contact}
//               onChange={handleChange("contact")}
//               required
//             />
//             <FormField
//               label="Email"
//               name="email"
//               type="email"
//               value={form.email}
//               onChange={handleChange("email")}
//               required
//             />
//             <FormField
//               label="Preferred  Location"
//               name="preferredLocation"
//               value={form.preferredLocation}
//               onChange={handleChange("preferredLocation")}
//             />
//           </div>

//           {/* Campaign Dates */}
//           <div className="mt-12">
//             <h2 className="text-[26px] font-normal text-black sm:text-[32px] lg:text-[38px]">
//               Campaign Dates
//             </h2>
//             <div className="mt-6 grid max-w-[420px] grid-cols-2 gap-x-10 gap-y-8">
//               <FormField
//                 label="Start Date"
//                 name="startDate"
//                 type="date"
//                 value={form.startDate}
//                 onChange={handleChange("startDate")}
//                 maxWidth={150}
//               />
//               <FormField
//                 label="End Date"
//                 name="endDate"
//                 type="date"
//                 value={form.endDate}
//                 onChange={handleChange("endDate")}
//                 maxWidth={150}
//               />
//             </div>
//           </div>

//           {/* Message */}
//           <div className="mt-12">
//             <h2 className="text-[26px] font-normal text-black sm:text-[32px] lg:text-[38px]">
//               Your Message
//             </h2>
//             <textarea
//               name="message"
//               value={form.message}
//               onChange={handleChange("message")}
//               rows={5}
//               className="mt-6 w-full max-w-[560px] rounded-[10px] border border-[#625656] p-4 text-[15px] text-black outline-none placeholder:text-[#9a9a9a]"
//             />
//           </div>

//           {/* Submit */}
//           <div className="mt-10 flex flex-wrap items-center gap-5">
//             <button
//               type="submit"
//               disabled={submitting}
//               className="group flex items-center gap-4 disabled:opacity-60"
//             >
//               <span className="bg-gradient-to-l from-[#7d0008] to-[#e3000f] bg-clip-text text-[20px] font-medium text-transparent sm:text-[22px]">
//                 {submitting ? "Sending..." : "Submit"}
//               </span>
//               <span className="flex h-[52px] w-[110px] items-center justify-center rounded-full border-[0.5px] border-black transition-colors group-hover:bg-black sm:h-[58px] sm:w-[126px]">
//                 <ArrowRight
//                   size={20}
//                   className="text-black transition-colors group-hover:text-white"
//                 />
//               </span>
//             </button>

//             {status === "success" && (
//               <span className="text-[14px] font-medium text-[#0a8f3c]">
//                 Thanks! We&rsquo;ll get back to you shortly.
//               </span>
//             )}
//             {status === "error" && (
//               <span className="text-[14px] font-medium text-[#e3000f]">
//                 Please fill in your name, contact and email.
//               </span>
//             )}
//           </div>
//         </form>
//       </section>
//     </main>
//   );
// }



// /* eslint-disable */
// // @ts-nocheck
// "use client";

// import {
//   useLayoutEffect,
//   useRef,
//   useState,
//   type ChangeEvent,
//   type FormEvent,
// } from "react";
// import Image from "next/image";
// import emailjs from "@emailjs/browser";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import {
//   AnimatePresence,
//   motion,
//   useReducedMotion,
// } from "framer-motion";
// import {
//   ArrowRight,
//   Check,
//   Headphones,
//   MapPinned,
//   MonitorCheck,
// } from "lucide-react";

// import "./page.css";

// gsap.registerPlugin(ScrollTrigger);

// type ServiceOption =
//   "2 Sided Fabricated LED";
//   "Single Side Led Vehicle";
//   "19 Feet Triple Side LED";
//   "17 Feet Triple Side LED";

// type ContactFormState = {
//   name: string;
//   contact: string;
//   email: string;
//   preferredLocation: string;
//   startDate: string;
//   endDate: string;
//   message: string;
// };

// type SubmissionStatus = "idle" | "success" | "error";

// type ServiceDetails = {
//   image: string;
//   alt: string;
// };

// const SERVICE_OPTIONS: ServiceOption[] = [
//   "2 Sided Fabricated LED",
//   "Single Side Led Vehicle",
//   "19 Feet Triple Side LED",
//   "17 Feet Triple Side LED",

// ];

// const SERVICE_DETAILS: Record<ServiceOption, ServiceDetails> = {
//   "2 Sided Fabricated LED": {
//     image: "/images/assets/LED4_9ft2Sided.png",
//     alt: "19 feet single side LED roadshow vehicle",
//   },
//   "Single Side Led Vehicle": {
//     image: "/images/assets/LED1_19ftSingleSide.png",
//     alt: "LED roadshow advertising vehicle",
//   },
//   "19 Feet Triple Side LED": {
//     image: "/images/assets/LED2_19ft3Sided.png",
//     alt: "Fabricated LED roadshow vehicle",
//   },
//   "17 Feet Triple Side LED": {
//     image: "/images/assets/LED3_17ft3Sided.png",
//     alt: "19 feet triple side LED roadshow vehicle",
//   },

// };

// const INITIAL_FORM: ContactFormState = {
//   name: "",
//   contact: "",
//   email: "",
//   preferredLocation: "",
//   startDate: "",
//   endDate: "",
//   message: "",
// };

// const FIELD_LIMITS = {
//   name: 80,
//   contact: 15,
//   email: 120,
//   preferredLocation: 120,
//   message: 1000,
// };

// const formatDate = (date: Date): string => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// };

// const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const CONTACT_PATTERN = /^[0-9+\-\s()]{8,15}$/;

// type FormFieldProps = {
//   label: string;
//   name: keyof ContactFormState;
//   value: string;
//   type?: string;
//   placeholder: string;
//   required?: boolean;
//   min?: string;
//   maxLength?: number;
//   inputMode?: "text" | "email" | "tel" | "numeric";
//   autoComplete?: string;
//   onChange: (
//     event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
//   ) => void;
// };

// function FormField({
//   label,
//   name,
//   value,
//   type = "text",
//   placeholder,
//   required = false,
//   min,
//   maxLength,
//   inputMode,
//   autoComplete,
//   onChange,
// }: FormFieldProps) {
//   return (
//     <label className="contact-field">
//       <span className="contact-field__label">
//         {label}

//         {required && (
//           <span className="contact-field__required" aria-hidden="true">
//             *
//           </span>
//         )}
//       </span>

//       <input
//         className="contact-field__input"
//         name={name}
//         type={type}
//         value={value}
//         placeholder={placeholder}
//         required={required}
//         min={min}
//         maxLength={maxLength}
//         inputMode={inputMode}
//         autoComplete={autoComplete}
//         onChange={onChange}
//       />
//     </label>
//   );
// }

// export default function ContactPage() {
//   const pageRef = useRef<HTMLElement | null>(null);
//   const heroRef = useRef<HTMLDivElement | null>(null);
//   const titleRef = useRef<HTMLDivElement | null>(null);
//   const descriptionRef = useRef<HTMLParagraphElement | null>(null);
//   const benefitsRef = useRef<HTMLDivElement | null>(null);
//   const vehicleTrackRef = useRef<HTMLDivElement | null>(null);
//   const vehicleRef = useRef<HTMLDivElement | null>(null);
//   const formRef = useRef<HTMLFormElement | null>(null);

//   const shouldReduceMotion = useReducedMotion();

//   const [service, setService] =
//     useState<ServiceOption>("2 Sided Fabricated LED");

//   const [form, setForm] =
//     useState<ContactFormState>(INITIAL_FORM);

//   const [submitting, setSubmitting] = useState(false);
//   const [status, setStatus] =
//     useState<SubmissionStatus>("idle");

//   const [statusMessage, setStatusMessage] = useState("");

//   const selectedService = SERVICE_DETAILS[service];
//   const today = formatDate(new Date());

//   useLayoutEffect(() => {
//     if (!pageRef.current || shouldReduceMotion) {
//       return;
//     }

//     const context = gsap.context(() => {
//       const titleLines =
//         titleRef.current?.querySelectorAll(".contact-hero__title-line");

//       const benefitItems =
//         benefitsRef.current?.querySelectorAll(".contact-benefit");

//       if (titleLines?.length) {
//         gsap.fromTo(
//           titleLines,
//           {
//             yPercent: 115,
//             opacity: 0,
//           },
//           {
//             yPercent: 0,
//             opacity: 1,
//             duration: 1.05,
//             stagger: 0.12,
//             ease: "power4.out",
//             delay: 0.08,
//           },
//         );
//       }

//       if (descriptionRef.current) {
//         gsap.fromTo(
//           descriptionRef.current,
//           {
//             y: 24,
//             opacity: 0,
//           },
//           {
//             y: 0,
//             opacity: 1,
//             duration: 0.8,
//             ease: "power3.out",
//             delay: 0.42,
//           },
//         );
//       }

//       if (benefitItems?.length) {
//         gsap.fromTo(
//           benefitItems,
//           {
//             y: 22,
//             opacity: 0,
//           },
//           {
//             y: 0,
//             opacity: 1,
//             duration: 0.75,
//             stagger: 0.1,
//             ease: "power3.out",
//             delay: 0.56,
//           },
//         );
//       }

//       if (formRef.current) {
//         gsap.fromTo(
//           formRef.current,
//           {
//             x: 55,
//             opacity: 0,
//           },
//           {
//             x: 0,
//             opacity: 1,
//             duration: 1,
//             ease: "power3.out",
//             delay: 0.2,
//           },
//         );
//       }

//       if (
//         heroRef.current &&
//         vehicleTrackRef.current &&
//         vehicleRef.current
//       ) {
//         gsap.fromTo(
//           vehicleRef.current,
//           {
//             xPercent: -22,
//             opacity: 0,
//             scale: 0.92,
//           },
//           {
//             xPercent: 0,
//             opacity: 1,
//             scale: 1,
//             duration: 1.3,
//             delay: 0.32,
//             ease: "power4.out",
//           },
//         );

//         gsap.to(vehicleRef.current, {
//           y: -7,
//           duration: 2.3,
//           repeat: -1,
//           yoyo: true,
//           ease: "sine.inOut",
//         });

//         gsap.to(vehicleRef.current, {
//           xPercent: 10,
//           ease: "none",
//           scrollTrigger: {
//             trigger: heroRef.current,
//             start: "top 78%",
//             end: "bottom 20%",
//             scrub: 1.1,
//           },
//         });

//         gsap.to(vehicleTrackRef.current, {
//           backgroundPositionX: "75%",
//           ease: "none",
//           scrollTrigger: {
//             trigger: heroRef.current,
//             start: "top bottom",
//             end: "bottom top",
//             scrub: 1.2,
//           },
//         });
//       }
//     }, pageRef);

//     return () => {
//       context.revert();
//     };
//   }, [shouldReduceMotion]);

//   const handleChange =
//     (field: keyof ContactFormState) =>
//       (
//         event: ChangeEvent<
//           HTMLInputElement | HTMLTextAreaElement
//         >,
//       ) => {
//         let value = event.target.value;

//         if (field === "contact") {
//           value = value.replace(/[^0-9+\-\s()]/g, "");
//         }

//         setForm((previous) => ({
//           ...previous,
//           [field]: value,
//         }));

//         if (status !== "idle") {
//           setStatus("idle");
//           setStatusMessage("");
//         }
//       };

//   const validateForm = (): string | null => {
//     if (!form.name.trim()) {
//       return "Please enter your name.";
//     }

//     if (!form.contact.trim()) {
//       return "Please enter your contact number.";
//     }

//     if (!CONTACT_PATTERN.test(form.contact.trim())) {
//       return "Please enter a valid contact number.";
//     }

//     if (!form.email.trim()) {
//       return "Please enter your email address.";
//     }

//     if (!EMAIL_PATTERN.test(form.email.trim())) {
//       return "Please enter a valid email address.";
//     }

//     if (
//       form.startDate &&
//       form.endDate &&
//       new Date(form.endDate) < new Date(form.startDate)
//     ) {
//       return "End date cannot be earlier than the start date.";
//     }

//     return null;
//   };

//   const handleSubmit = async (
//     event: FormEvent<HTMLFormElement>,
//   ) => {
//     event.preventDefault();

//     if (submitting) {
//       return;
//     }

//     const validationMessage = validateForm();

//     if (validationMessage) {
//       setStatus("error");
//       setStatusMessage(validationMessage);
//       return;
//     }

//     const serviceId =
//       process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;

//     const templateId =
//       process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;

//     const publicKey =
//       process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

//     if (!serviceId || !templateId || !publicKey) {
//       setStatus("error");
//       setStatusMessage(
//         "Email service is not configured. Please check the EmailJS environment variables.",
//       );
//       return;
//     }

//     setSubmitting(true);
//     setStatus("idle");
//     setStatusMessage("");

//     try {
//       await emailjs.send(
//         serviceId,
//         templateId,
//         {
//           from_name: form.name.trim(),
//           contact_number: form.contact.trim(),
//           reply_to: form.email.trim(),
//           preferred_location:
//             form.preferredLocation.trim() || "Not specified",
//           selected_service: service,
//           campaign_start_date:
//             form.startDate || "Not specified",
//           campaign_end_date:
//             form.endDate || "Not specified",
//           message:
//             form.message.trim() || "No additional message",
//           submitted_at: new Date().toLocaleString("en-IN", {
//             dateStyle: "medium",
//             timeStyle: "short",
//           }),
//         },
//         {
//           publicKey,
//         },
//       );

//       setStatus("success");
//       setStatusMessage(
//         "Thank you! Your campaign enquiry has been sent successfully.",
//       );

//       setForm(INITIAL_FORM);
//       setService("Led Vehicle");
//     } catch (error) {
//       console.error("EmailJS submission failed:", error);

//       setStatus("error");
//       setStatusMessage(
//         "We could not send your enquiry. Please try again shortly.",
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <main ref={pageRef} className="contact-page">
//       <section className="contact-section">
//         <div className="contact-layout">
//           {/* Left hero area */}
//           <div ref={heroRef} className="contact-hero">
//             <div className="contact-hero__content">
//               <div
//                 ref={titleRef}
//                 className="contact-hero__title"
//                 aria-label="Let's make it happen"
//               >
//                 <div className="contact-hero__title-mask">
//                   <span className="contact-hero__title-line">
//                     Let&rsquo;s make it
//                   </span>
//                 </div>

//                 <div className="contact-hero__title-mask">
//                   <span className="contact-hero__title-line">
//                     Happen
//                   </span>
//                 </div>
//               </div>

//               <p
//                 ref={descriptionRef}
//                 className="contact-hero__description"
//               >
//                 Share your roadshow requirements and our team
//                 will take care of everything for you.
//               </p>

//               <div
//                 ref={benefitsRef}
//                 className="contact-benefits"
//               >
//                 <div className="contact-benefit">
//                   <span className="contact-benefit__icon">
//                     <MonitorCheck size={19} strokeWidth={1.6} />
//                   </span>

//                   <span>Modern LED Fleet</span>
//                 </div>

//                 <div className="contact-benefit">
//                   <span className="contact-benefit__icon">
//                     <MapPinned size={19} strokeWidth={1.6} />
//                   </span>

//                   <span>All India Network</span>
//                 </div>

//                 <div className="contact-benefit">
//                   <span className="contact-benefit__icon">
//                     <Headphones size={19} strokeWidth={1.6} />
//                   </span>

//                   <span>Reliable Support</span>
//                 </div>
//               </div>
//             </div>

//             <div
//               ref={vehicleTrackRef}
//               className="contact-vehicle-track"
//             >
//               {/* <div className="contact-vehicle-track__line" /> */}

//               <div
//                 ref={vehicleRef}
//                 className="contact-vehicle"
//               >
//                 <AnimatePresence mode="wait">
//                   <motion.div
//                     key={service}
//                     className="contact-vehicle__image-wrapper"
//                     initial={
//                       shouldReduceMotion
//                         ? { opacity: 0 }
//                         : {
//                           opacity: 0,
//                           x: -35,
//                           scale: 0.96,
//                         }
//                     }
//                     animate={{
//                       opacity: 1,
//                       x: 0,
//                       scale: 1,
//                     }}
//                     exit={
//                       shouldReduceMotion
//                         ? { opacity: 0 }
//                         : {
//                           opacity: 0,
//                           x: 30,
//                           scale: 0.96,
//                         }
//                     }
//                     transition={{
//                       duration: shouldReduceMotion ? 0.2 : 0.55,
//                       ease: [0.22, 1, 0.36, 1],
//                     }}
//                   >
//                     <Image
//                       src={selectedService.image}
//                       alt={selectedService.alt}
//                       width={1172}
//                       height={1200}
//                       priority
//                       sizes="
//                         (max-width: 560px) 94vw,
//                         (max-width: 900px) 78vw,
//                         (max-width: 1200px) 50vw,
//                         720px
//                       "
//                       className="contact-vehicle__image"
//                     />
//                   </motion.div>
//                 </AnimatePresence>

//                 {/* <div
//                   className="contact-vehicle__shadow"
//                   aria-hidden="true"
//                 /> */}
//               </div>
//             </div>
//           </div>

//           {/* Right form area */}
//           <motion.form
//             ref={formRef}
//             className="contact-form"
//             onSubmit={handleSubmit}
//             noValidate
//             initial={false}
//           >
//             <div className="contact-form__header">
//               <div>
//                 <p className="contact-form__eyebrow">
//                   Start your campaign
//                 </p>

//                 <h2 className="contact-form__title">
//                   Tell us what you need
//                 </h2>
//               </div>

//               <span className="contact-form__step">
//                 01
//               </span>
//             </div>

//             <fieldset className="contact-form__section">
//               <legend className="contact-form__section-title">
//                 Service
//               </legend>

//               <div className="contact-services">
//                 {SERVICE_OPTIONS.map((option) => {
//                   const active = option === service;

//                   return (
//                     <motion.button
//                       key={option}
//                       type="button"
//                       aria-pressed={active}
//                       className={`contact-service ${active
//                           ? "contact-service--active"
//                           : ""
//                         }`}
//                       onClick={() => setService(option)}
//                       whileHover={
//                         shouldReduceMotion
//                           ? undefined
//                           : {
//                             y: -2,
//                           }
//                       }
//                       whileTap={
//                         shouldReduceMotion
//                           ? undefined
//                           : {
//                             scale: 0.97,
//                           }
//                       }
//                     >
//                       <AnimatePresence initial={false}>
//                         {active && (
//                           <motion.span
//                             className="contact-service__check"
//                             initial={{
//                               opacity: 0,
//                               scale: 0.5,
//                               width: 0,
//                             }}
//                             animate={{
//                               opacity: 1,
//                               scale: 1,
//                               width: 17,
//                             }}
//                             exit={{
//                               opacity: 0,
//                               scale: 0.5,
//                               width: 0,
//                             }}
//                           >
//                             <Check
//                               size={13}
//                               strokeWidth={2.5}
//                             />
//                           </motion.span>
//                         )}
//                       </AnimatePresence>

//                       <span>{option}</span>
//                     </motion.button>
//                   );
//                 })}
//               </div>
//             </fieldset>

//             <div className="contact-form__grid">
//               <FormField
//                 label="Your Name"
//                 name="name"
//                 value={form.name}
//                 placeholder="Enter your name"
//                 required
//                 maxLength={FIELD_LIMITS.name}
//                 autoComplete="name"
//                 onChange={handleChange("name")}
//               />

//               <FormField
//                 label="Contact"
//                 name="contact"
//                 value={form.contact}
//                 type="tel"
//                 placeholder="Enter contact number"
//                 required
//                 maxLength={FIELD_LIMITS.contact}
//                 inputMode="tel"
//                 autoComplete="tel"
//                 onChange={handleChange("contact")}
//               />

//               <FormField
//                 label="Email"
//                 name="email"
//                 value={form.email}
//                 type="email"
//                 placeholder="Enter email address"
//                 required
//                 maxLength={FIELD_LIMITS.email}
//                 inputMode="email"
//                 autoComplete="email"
//                 onChange={handleChange("email")}
//               />

//               <FormField
//                 label="Preferred Location"
//                 name="preferredLocation"
//                 value={form.preferredLocation}
//                 placeholder="Enter preferred location"
//                 maxLength={FIELD_LIMITS.preferredLocation}
//                 autoComplete="address-level2"
//                 onChange={handleChange(
//                   "preferredLocation",
//                 )}
//               />
//             </div>

//             <fieldset className="contact-form__section contact-form__section--dates">
//               <legend className="contact-form__section-title">
//                 Campaign Dates
//               </legend>

//               <div className="contact-form__grid">
//                 <FormField
//                   label="Start Date"
//                   name="startDate"
//                   value={form.startDate}
//                   type="date"
//                   placeholder="Select start date"
//                   min={today}
//                   onChange={handleChange("startDate")}
//                 />

//                 <FormField
//                   label="End Date"
//                   name="endDate"
//                   value={form.endDate}
//                   type="date"
//                   placeholder="Select end date"
//                   min={form.startDate || today}
//                   onChange={handleChange("endDate")}
//                 />
//               </div>
//             </fieldset>

//             <label className="contact-message">
//               <span className="contact-form__section-title">
//                 Your Message
//               </span>

//               <textarea
//                 className="contact-message__textarea"
//                 name="message"
//                 value={form.message}
//                 rows={5}
//                 maxLength={FIELD_LIMITS.message}
//                 placeholder="Tell us about your campaign, locations, duration and requirements..."
//                 onChange={handleChange("message")}
//               />

//               <span className="contact-message__count">
//                 {form.message.length}/{FIELD_LIMITS.message}
//               </span>
//             </label>

//             <div className="contact-form__footer">
//               <div
//                 className={`contact-status ${status === "success"
//                     ? "contact-status--success"
//                     : status === "error"
//                       ? "contact-status--error"
//                       : ""
//                   }`}
//                 role="status"
//                 aria-live="polite"
//               >
//                 {statusMessage}
//               </div>

//               <motion.button
//                 className="contact-submit"
//                 type="submit"
//                 disabled={submitting}
//                 whileHover={
//                   shouldReduceMotion || submitting
//                     ? undefined
//                     : {
//                       y: -2,
//                     }
//                 }
//                 whileTap={
//                   shouldReduceMotion || submitting
//                     ? undefined
//                     : {
//                       scale: 0.98,
//                     }
//                 }
//               >
//                 <span>
//                   {submitting
//                     ? "Sending enquiry..."
//                     : "Submit enquiry"}
//                 </span>

//                 <span className="contact-submit__arrow">
//                   <ArrowRight
//                     size={19}
//                     strokeWidth={1.8}
//                   />
//                 </span>
//               </motion.button>
//             </div>
//           </motion.form>
//         </div>
//       </section>
//     </main>
//   );
// }









// /* eslint-disable */
// // @ts-nocheck
// "use client";

// import {
//   useLayoutEffect,
//   useRef,
//   useState,
//   type ChangeEvent,
//   type FormEvent,
// } from "react";
// import Image from "next/image";
// import emailjs from "@emailjs/browser";
// import { mailImageUrl } from "../../../BaseUrl";
// import toast, { Toaster } from "react-hot-toast";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";
// import {
//   faCalendarDays,
//   faClock,
//   faEnvelope,
//   faLocationDot,
//   faMapLocationDot,
//   faMessage,
//   faPhone,
//   faRoute,
//   faUser,
// } from "@fortawesome/free-solid-svg-icons";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";
// import {
//   AnimatePresence,
//   motion,
//   useReducedMotion,
// } from "framer-motion";
// import {
//   ArrowRight,
//   Check,
//   Headphones,
//   MapPinned,
//   MonitorCheck,
// } from "lucide-react";

// import "./page.css";

// gsap.registerPlugin(ScrollTrigger);

// type ServiceOption =
//   | "2 Sided Fabricated LED"
//   | "Single Side Led Vehicle"
//   | "19 Feet Triple Side LED"
//   | "17 Feet Triple Side LED";

// type ContactFormState = {
//   name: string;
//   contact: string;
//   email: string;
//   preferredLocation: string;
//   startDate: string;
//   endDate: string;
//   message: string;
// };

// type ServiceDetails = {
//   image: string;
//   alt: string;
//   title: string;
//   description: string;
//   highlights: {
//     icon: IconDefinition;
//     label: string;
//     value: string;
//   }[];
// };

// const SERVICE_OPTIONS: ServiceOption[] = [
//   "2 Sided Fabricated LED",
//   "Single Side Led Vehicle",
//   "19 Feet Triple Side LED",
//   "17 Feet Triple Side LED",
// ];

// const SERVICE_DETAILS: Record<ServiceOption, ServiceDetails> = {
//   "2 Sided Fabricated LED": {
//     image: "/images/assets/HomeBanner_MainPageFinal.png",
//     alt: "2 sided fabricated LED roadshow vehicle",
//     title: "2 Sided Fabricated LED",
//     description:
//       "A high-impact mobile display with visibility on both sides, suitable for city routes, launches and promotional roadshows.",
//     highlights: [
//       { icon: faClock, label: "Campaign support", value: "8 hours / day" },
//       { icon: faRoute, label: "Route coverage", value: "Up to 60 km / day" },
//       { icon: faMapLocationDot, label: "Tracking", value: "GPS & photo proof" },
//     ],
//   },
//   "Single Side Led Vehicle": {
//     image: "/images/assets/single side edited (1)_NEW.png",
//     alt: "single side LED roadshow vehicle",
//     title: "Single Side LED Vehicle",
//     description:
//       "A large single-facing LED display designed for focused visibility along high-traffic routes and event locations.",
//     highlights: [
//       { icon: faClock, label: "Campaign support", value: "8 hours / day" },
//       { icon: faRoute, label: "Best suited for", value: "Focused route visibility" },
//       { icon: faMapLocationDot, label: "Tracking", value: "GPS & photo proof" },
//     ],
//   },
//   "19 Feet Triple Side LED": {
//     image: "/images/assets/full side LED edited (1)_NEW.png",
//     alt: "19 feet triple side LED roadshow vehicle",
//     title: "19 Feet Triple Side LED",
//     description:
//       "A premium three-sided LED format that delivers strong visibility from multiple directions during moving and static campaigns.",
//     highlights: [
//       { icon: faClock, label: "Campaign support", value: "8 hours / day" },
//       { icon: faRoute, label: "Display format", value: "Three-side visibility" },
//       { icon: faMapLocationDot, label: "Tracking", value: "GPS & photo proof" },
//     ],
//   },
//   "17 Feet Triple Side LED": {
//     image: "/images/assets/tata ultra - 2.png",
//     alt: "17 feet triple side LED roadshow vehicle",
//     title: "17 Feet Triple Side LED",
//     description:
//       "A compact triple-side LED roadshow vehicle offering broad visibility with easier movement across busy urban routes.",
//     highlights: [
//       { icon: faClock, label: "Campaign support", value: "8 hours / day" },
//       { icon: faRoute, label: "Best suited for", value: "Urban roadshows" },
//       { icon: faMapLocationDot, label: "Tracking", value: "GPS & photo proof" },
//     ],
//   },
// };

// const INITIAL_FORM: ContactFormState = {
//   name: "",
//   contact: "",
//   email: "",
//   preferredLocation: "",
//   startDate: "",
//   endDate: "",
//   message: "",
// };

// const FIELD_LIMITS = {
//   name: 80,
//   contact: 15,
//   email: 120,
//   preferredLocation: 120,
//   message: 1000,
// };

// const formatDate = (date: Date): string => {
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// };

// const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const CONTACT_PATTERN = /^[0-9+\-\s()]{8,15}$/;

// type FormFieldProps = {
//   label: string;
//   name: keyof ContactFormState;
//   value: string;
//   type?: string;
//   placeholder: string;
//   required?: boolean;
//   min?: string;
//   maxLength?: number;
//   inputMode?: "text" | "email" | "tel" | "numeric";
//   autoComplete?: string;
//   icon: IconDefinition;
//   onChange: (
//     event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
//   ) => void;
// };

// function FormField({
//   label,
//   name,
//   value,
//   type = "text",
//   placeholder,
//   required = false,
//   min,
//   maxLength,
//   inputMode,
//   autoComplete,
//   icon,
//   onChange,
// }: FormFieldProps) {
//   const inputRef = useRef<HTMLInputElement | null>(null);
//   const isDateField = type === "date";

//   const openDatePicker = () => {
//     if (!isDateField || !inputRef.current) {
//       return;
//     }

//     inputRef.current.focus();

//     try {
//       inputRef.current.showPicker?.();
//     } catch {
//       // Some browsers open the picker from the focused date input automatically.
//     }
//   };

//   return (
//     <label className="contact-field">
//       <span className="contact-field__label">
//         {label}
//         {required && (
//           <span className="contact-field__required" aria-hidden="true">
//             *
//           </span>
//         )}
//       </span>

//       <span
//         className={`contact-field__control ${isDateField ? "contact-field__control--date" : ""
//           }`}
//       >
//         {isDateField ? (
//           <button
//             type="button"
//             className="contact-field__date-button"
//             aria-label={`Open ${label.toLowerCase()} calendar`}
//             onClick={openDatePicker}
//           >
//             <FontAwesomeIcon icon={icon} aria-hidden="true" />
//           </button>
//         ) : (
//           <FontAwesomeIcon
//             icon={icon}
//             className="contact-field__icon"
//             aria-hidden="true"
//           />
//         )}

//         <input
//           ref={inputRef}
//           className="contact-field__input"
//           name={name}
//           type={type}
//           value={value}
//           placeholder={placeholder}
//           required={required}
//           min={min}
//           maxLength={maxLength}
//           inputMode={inputMode}
//           autoComplete={autoComplete}
//           onChange={onChange}
//           onClick={isDateField ? openDatePicker : undefined}
//         />
//       </span>
//     </label>
//   );
// }

// export default function ContactPage() {
//   const pageRef = useRef<HTMLElement | null>(null);
//   const heroRef = useRef<HTMLDivElement | null>(null);
//   const titleRef = useRef<HTMLDivElement | null>(null);
//   const descriptionRef = useRef<HTMLParagraphElement | null>(null);
//   const benefitsRef = useRef<HTMLDivElement | null>(null);
//   const vehicleTrackRef = useRef<HTMLDivElement | null>(null);
//   const vehicleRef = useRef<HTMLDivElement | null>(null);
//   const formRef = useRef<HTMLFormElement | null>(null);

//   const shouldReduceMotion = useReducedMotion();

//   const [service, setService] =
//     useState<ServiceOption>("2 Sided Fabricated LED");

//   const [form, setForm] =
//     useState<ContactFormState>(INITIAL_FORM);

//   const [submitting, setSubmitting] = useState(false);

//   const selectedService = SERVICE_DETAILS[service];
//   const today = formatDate(new Date());

//   useLayoutEffect(() => {
//     if (!pageRef.current || shouldReduceMotion) {
//       return;
//     }

//     const context = gsap.context(() => {
//       const titleLines =
//         titleRef.current?.querySelectorAll(".contact-hero__title-line");

//       const benefitItems =
//         benefitsRef.current?.querySelectorAll(".contact-benefit");

//       if (titleLines?.length) {
//         gsap.fromTo(
//           titleLines,
//           { yPercent: 115, opacity: 0 },
//           {
//             yPercent: 0,
//             opacity: 1,
//             duration: 1.05,
//             stagger: 0.12,
//             ease: "power4.out",
//             delay: 0.08,
//           },
//         );
//       }

//       if (descriptionRef.current) {
//         gsap.fromTo(
//           descriptionRef.current,
//           { y: 24, opacity: 0 },
//           {
//             y: 0,
//             opacity: 1,
//             duration: 0.8,
//             ease: "power3.out",
//             delay: 0.42,
//           },
//         );
//       }

//       if (benefitItems?.length) {
//         gsap.fromTo(
//           benefitItems,
//           { y: 22, opacity: 0 },
//           {
//             y: 0,
//             opacity: 1,
//             duration: 0.75,
//             stagger: 0.1,
//             ease: "power3.out",
//             delay: 0.56,
//           },
//         );
//       }

//       if (formRef.current) {
//         gsap.fromTo(
//           formRef.current,
//           { x: 55, opacity: 0 },
//           {
//             x: 0,
//             opacity: 1,
//             duration: 1,
//             ease: "power3.out",
//             delay: 0.2,
//           },
//         );
//       }

//       if (
//         heroRef.current &&
//         vehicleTrackRef.current &&
//         vehicleRef.current
//       ) {
//         gsap.fromTo(
//           vehicleRef.current,
//           { xPercent: -22, opacity: 0, scale: 0.92 },
//           {
//             xPercent: 0,
//             opacity: 1,
//             scale: 1,
//             duration: 1.3,
//             delay: 0.32,
//             ease: "power4.out",
//           },
//         );

//         gsap.to(vehicleRef.current, {
//           y: -7,
//           duration: 2.3,
//           repeat: -1,
//           yoyo: true,
//           ease: "sine.inOut",
//         });

//         gsap.to(vehicleRef.current, {
//           xPercent: 10,
//           ease: "none",
//           scrollTrigger: {
//             trigger: heroRef.current,
//             start: "top 78%",
//             end: "bottom 20%",
//             scrub: 1.1,
//           },
//         });

//         gsap.to(vehicleTrackRef.current, {
//           backgroundPositionX: "75%",
//           ease: "none",
//           scrollTrigger: {
//             trigger: heroRef.current,
//             start: "top bottom",
//             end: "bottom top",
//             scrub: 1.2,
//           },
//         });
//       }
//     }, pageRef);

//     return () => {
//       context.revert();
//     };
//   }, [shouldReduceMotion]);

//   const handleServiceChange = (option: ServiceOption) => {
//     setService(option);
//   };

//   const handleChange =
//     (field: keyof ContactFormState) =>
//       (
//         event: ChangeEvent<
//           HTMLInputElement | HTMLTextAreaElement
//         >,
//       ) => {
//         let value = event.target.value;

//         if (field === "contact") {
//           value = value.replace(/[^0-9+\-\s()]/g, "");
//         }

//         setForm((previous) => {
//           const nextForm = {
//             ...previous,
//             [field]: value,
//           };

//           if (
//             field === "startDate" &&
//             previous.endDate &&
//             value &&
//             previous.endDate < value
//           ) {
//             nextForm.endDate = "";
//           }

//           return nextForm;
//         });
//       };

//   const validateForm = (): string | null => {
//     if (!form.name.trim()) return "Please enter your name.";
//     if (!form.contact.trim()) return "Please enter your contact number.";
//     if (!CONTACT_PATTERN.test(form.contact.trim())) {
//       return "Please enter a valid contact number.";
//     }
//     if (!form.email.trim()) return "Please enter your email address.";
//     if (!EMAIL_PATTERN.test(form.email.trim())) {
//       return "Please enter a valid email address.";
//     }
//     if (!form.startDate) return "Please select a campaign start date.";
//     if (!form.endDate) return "Please select a campaign end date.";

//     if (form.endDate < form.startDate) {
//       return "End date cannot be earlier than the start date.";
//     }

//     return null;
//   };
//   const getFormattedDateKey = (): string => {
//     const currentDate = new Date();

//     const day = String(currentDate.getDate()).padStart(2, "0");
//     const month = String(currentDate.getMonth() + 1).padStart(
//       2,
//       "0",
//     );
//     const year = currentDate.getFullYear();

//     return `${day}${month}${year}`;
//   };

//   const generateEnquiryId = (): string => {
//     const dateKey = getFormattedDateKey();

//     if (typeof window === "undefined") {
//       return `${dateKey}#01`;
//     }

//     const storageKey = `roadshow-enquiry-count-${dateKey}`;

//     const storedCount = Number(
//       window.localStorage.getItem(storageKey) || "0",
//     );

//     const nextCount = storedCount + 1;

//     window.localStorage.setItem(
//       storageKey,
//       String(nextCount),
//     );

//     const formattedCount = String(nextCount).padStart(2, "0");

//     return `${dateKey}#${formattedCount}`;
//   };
//   //EMAIL ENQUIRY ID FOR CONTACT PAGE 
//   const handleSubmit = async (
//     event: FormEvent<HTMLFormElement>,
//   ) => {
//     event.preventDefault();

//     if (submitting) return;

//     const validationMessage = validateForm();

//     if (validationMessage) {
//       toast.error(validationMessage, {
//         id: "contact-form-toast",
//       });
//       return;
//     }

//     const enquiryId = generateEnquiryId();

//     const serviceId = "service_109ond7";
//     const publicKey = "hmRHPc3KZL8QoEtzw";
//     const templateId = "template_bgyb9rj";

//     if (!serviceId || !templateId || !publicKey) {
//       toast.error(
//         "Email service is not configured. Please check the EmailJS configuration.",
//         {
//           id: "contact-form-toast",
//         },
//       );
//       return;
//     }
//     const selectedVehicleImageUrl = new URL(
//       selectedService.image,
//       `${mailImageUrl}/`,
//     ).href;
//     const templateParams = {
//       enquiry_id: enquiryId,

//       from_name: form.name.trim(),

//       contact_number: form.contact.trim(),

//       contact_email: form.email.trim(),

//       preferred_location:
//         form.preferredLocation.trim() || "Not specified",

//       selected_service: service,

//       campaign_start_date: form.startDate,

//       campaign_end_date: form.endDate,

//       message:
//         form.message.trim() || "No additional message",

//       submitted_at: new Date().toLocaleString("en-IN", {
//         dateStyle: "medium",
//         timeStyle: "short",
//         timeZone: "Asia/Kolkata",
//       }),

//       vehicle_image: selectedVehicleImageUrl,
//     };

//     setSubmitting(true);
//     toast.dismiss("contact-form-toast");

//     try {
//       await emailjs.send(
//         serviceId,
//         templateId,
//         templateParams,
//         {
//           publicKey,
//         },
//       );

//       toast.success(
//         `Thank you! Your campaign enquiry ${enquiryId} has been sent successfully.`,
//         {
//           id: "contact-form-toast",
//         },
//       );

//       setForm(INITIAL_FORM);
//       setService("2 Sided Fabricated LED");
//     } catch (error) {
//       console.error("EmailJS submission failed:", error);

//       toast.error(
//         "We could not send your enquiry. Please try again shortly.",
//         {
//           id: "contact-form-toast",
//         },
//       );
//     } finally {
//       setSubmitting(false);
//     }
//   };
//   return (
//     <main ref={pageRef} className="contact-page">
//       <Toaster
//         position="top-center"
//         containerClassName="contact-toast-container"
//         toastOptions={{
//           duration: 4200,
//           className: "contact-toast",
//           success: {
//             iconTheme: {
//               primary: "#16784a",
//               secondary: "#ffffff",
//             },
//           },
//           error: {
//             iconTheme: {
//               primary: "#a52b2b",
//               secondary: "#ffffff",
//             },
//           },
//         }}
//       />

//       <section className="contact-section">
//         <div className="contact-layout">
//           <div ref={heroRef} className="contact-hero">
//             <div className="contact-hero__content">
//               <div
//                 ref={titleRef}
//                 className="contact-hero__title"
//                 aria-label="Let's make it happen"
//               >
//                 <div className="contact-hero__title-mask">
//                   <span className="contact-hero__title-line">
//                     Let&rsquo;s make it
//                   </span>
//                 </div>

//                 <div className="contact-hero__title-mask">
//                   <span className="contact-hero__title-line">
//                     Happen
//                   </span>
//                 </div>
//               </div>

//               <p
//                 ref={descriptionRef}
//                 className="contact-hero__description"
//               >
//                 Share your roadshow requirements and our team
//                 will take care of everything for you.
//               </p>

//               <div
//                 ref={benefitsRef}
//                 className="contact-benefits"
//               >
//                 <div className="contact-benefit">
//                   <span className="contact-benefit__icon">
//                     <MonitorCheck size={19} strokeWidth={1.6} />
//                   </span>
//                   <span>Modern LED Fleet</span>
//                 </div>

//                 <div className="contact-benefit">
//                   <span className="contact-benefit__icon">
//                     <MapPinned size={19} strokeWidth={1.6} />
//                   </span>
//                   <span>All India Network</span>
//                 </div>

//                 <div className="contact-benefit">
//                   <span className="contact-benefit__icon">
//                     <Headphones size={19} strokeWidth={1.6} />
//                   </span>
//                   <span>Reliable Support</span>
//                 </div>
//               </div>
//             </div>

//             <div className="contact-vehicle-area">
//               <div
//                 ref={vehicleTrackRef}
//                 className="contact-vehicle-track"
//               >
//                 <div
//                   ref={vehicleRef}
//                   className="contact-vehicle"
//                 >
//                   <AnimatePresence mode="wait" initial={false}>
//                     <motion.div
//                       key={service}
//                       className="contact-vehicle__image-wrapper"
//                       initial={
//                         shouldReduceMotion
//                           ? { opacity: 0 }
//                           : { opacity: 0, x: -35, scale: 0.96 }
//                       }
//                       animate={{ opacity: 1, x: 0, scale: 1 }}
//                       exit={
//                         shouldReduceMotion
//                           ? { opacity: 0 }
//                           : { opacity: 0, x: 30, scale: 0.96 }
//                       }
//                       transition={{
//                         duration: shouldReduceMotion ? 0.2 : 0.55,
//                         ease: [0.22, 1, 0.36, 1],
//                       }}
//                     >
//                       <Image
//                         key={`${service}-${selectedService.image}`}
//                         src={selectedService.image}
//                         alt={selectedService.alt}
//                         width={1172}
//                         height={1200}
//                         priority
//                         unoptimized
//                         sizes="
//                           (max-width: 560px) 94vw,
//                           (max-width: 900px) 78vw,
//                           (max-width: 1200px) 50vw,
//                           720px
//                         "
//                         className="contact-vehicle__image"
//                       />
//                     </motion.div>
//                   </AnimatePresence>
//                 </div>
//               </div>

//               <AnimatePresence mode="wait" initial={false}>
//                 <motion.div
//                   key={`details-${service}`}
//                   className="contact-vehicle-details"
//                   initial={{ opacity: 0, y: 14 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   exit={{ opacity: 0, y: -10 }}
//                   transition={{ duration: 0.35 }}
//                 >
//                   <p className="contact-vehicle-details__eyebrow">
//                     Selected roadshow vehicle
//                   </p>
//                   <h3 className="contact-vehicle-details__title">
//                     {selectedService.title}
//                   </h3>
//                   <p className="contact-vehicle-details__description">
//                     {selectedService.description}
//                   </p>

//                   <div className="contact-vehicle-details__list">
//                     {selectedService.highlights.map((item) => (
//                       <div
//                         className="contact-vehicle-detail"
//                         key={`${service}-${item.label}`}
//                       >
//                         <span className="contact-vehicle-detail__icon">
//                           <FontAwesomeIcon icon={item.icon} />
//                         </span>
//                         <span>
//                           <small>{item.label}</small>
//                           <strong>{item.value}</strong>
//                         </span>
//                       </div>
//                     ))}
//                   </div>
//                 </motion.div>
//               </AnimatePresence>
//             </div>
//           </div>

//           <motion.form
//             ref={formRef}
//             className="contact-form"
//             onSubmit={handleSubmit}
//             noValidate
//             initial={false}
//           >
//             <div className="contact-form__header">
//               <div>
//                 <p className="contact-form__eyebrow">
//                   Start your campaign
//                 </p>
//                 <h2 className="contact-form__title">
//                   Tell us what you need
//                 </h2>
//               </div>
//               <span className="contact-form__step">01</span>
//             </div>

//             <fieldset className="contact-form__section">
//               <legend className="contact-form__section-title">
//                 Service
//               </legend>

//               <div className="contact-services">
//                 {SERVICE_OPTIONS.map((option) => {
//                   const active = option === service;

//                   return (
//                     <motion.button
//                       key={option}
//                       type="button"
//                       aria-pressed={active}
//                       className={`contact-service ${active ? "contact-service--active" : ""
//                         }`}
//                       onClick={() => handleServiceChange(option)}
//                       whileHover={
//                         shouldReduceMotion ? undefined : { y: -2 }
//                       }
//                       whileTap={
//                         shouldReduceMotion ? undefined : { scale: 0.97 }
//                       }
//                     >
//                       <AnimatePresence initial={false}>
//                         {active && (
//                           <motion.span
//                             className="contact-service__check"
//                             initial={{ opacity: 0, scale: 0.5, width: 0 }}
//                             animate={{ opacity: 1, scale: 1, width: 17 }}
//                             exit={{ opacity: 0, scale: 0.5, width: 0 }}
//                           >
//                             <Check size={13} strokeWidth={2.5} />
//                           </motion.span>
//                         )}
//                       </AnimatePresence>
//                       <span>{option}</span>
//                     </motion.button>
//                   );
//                 })}
//               </div>
//             </fieldset>

//             <div className="contact-form__grid">
//               <FormField
//                 label="Your Name"
//                 name="name"
//                 value={form.name}
//                 placeholder="Enter your name"
//                 required
//                 maxLength={FIELD_LIMITS.name}
//                 autoComplete="name"
//                 icon={faUser}
//                 onChange={handleChange("name")}
//               />

//               <FormField
//                 label="Contact"
//                 name="contact"
//                 value={form.contact}
//                 type="tel"
//                 placeholder="Enter contact number"
//                 required
//                 maxLength={FIELD_LIMITS.contact}
//                 inputMode="tel"
//                 autoComplete="tel"
//                 icon={faPhone}
//                 onChange={handleChange("contact")}
//               />

//               <FormField
//                 label="Email"
//                 name="email"
//                 value={form.email}
//                 type="email"
//                 placeholder="Enter email address"
//                 required
//                 maxLength={FIELD_LIMITS.email}
//                 inputMode="email"
//                 autoComplete="email"
//                 icon={faEnvelope}
//                 onChange={handleChange("email")}
//               />

//               <FormField
//                 label="Preferred Location"
//                 name="preferredLocation"
//                 value={form.preferredLocation}
//                 placeholder="Enter preferred location"
//                 maxLength={FIELD_LIMITS.preferredLocation}
//                 autoComplete="address-level2"
//                 icon={faLocationDot}
//                 onChange={handleChange("preferredLocation")}
//               />
//             </div>

//             <fieldset className="contact-form__section contact-form__section--dates">
//               <legend className="contact-form__section-title">
//                 Campaign Dates
//               </legend>

//               <div className="contact-form__grid">
//                 <FormField
//                   label="Start Date"
//                   name="startDate"
//                   value={form.startDate}
//                   type="date"
//                   placeholder="Select start date"
//                   required
//                   min={today}
//                   icon={faCalendarDays}
//                   onChange={handleChange("startDate")}
//                 />

//                 <FormField
//                   label="End Date"
//                   name="endDate"
//                   value={form.endDate}
//                   type="date"
//                   placeholder="Select end date"
//                   required
//                   min={form.startDate || today}
//                   icon={faCalendarDays}
//                   onChange={handleChange("endDate")}
//                 />
//               </div>
//             </fieldset>

//             <label className="contact-message">
//               <span className="contact-form__section-title">
//                 Your Message
//               </span>

//               <span className="contact-message__control">
//                 <FontAwesomeIcon
//                   icon={faMessage}
//                   className="contact-message__icon"
//                   aria-hidden="true"
//                 />

//                 <textarea
//                   className="contact-message__textarea"
//                   name="message"
//                   value={form.message}
//                   rows={5}
//                   maxLength={FIELD_LIMITS.message}
//                   placeholder="Tell us about your campaign, locations, duration and requirements..."
//                   onChange={handleChange("message")}
//                 />

//                 <span className="contact-message__count">
//                   {form.message.length}/{FIELD_LIMITS.message}
//                 </span>
//               </span>
//             </label>

//             <div className="contact-form__footer">
//               <motion.button
//                 className="contact-submit"
//                 type="submit"
//                 disabled={submitting}
//                 whileHover={
//                   shouldReduceMotion || submitting
//                     ? undefined
//                     : { y: -2 }
//                 }
//                 whileTap={
//                   shouldReduceMotion || submitting
//                     ? undefined
//                     : { scale: 0.98 }
//                 }
//               >
//                 <span>
//                   {submitting
//                     ? "Sending enquiry..."
//                     : "Submit enquiry"}
//                 </span>

//                 <span className="contact-submit__arrow">
//                   <ArrowRight size={19} strokeWidth={1.8} />
//                 </span>
//               </motion.button>
//             </div>
//           </motion.form>
//         </div>
//       </section>
//     </main>
//   );
// }




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
import emailjs from "@emailjs/browser";
import { mailImageUrl } from "../../../BaseUrl";
import toast, { Toaster } from "react-hot-toast";

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
    image: "/images/assets/full side LED edited (1)_NEW.png",
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
        className={`contact-field__control ${
          isDateField
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

    const serviceId = "service_109ond7";
    const publicKey = "hmRHPc3KZL8QoEtzw";
    const templateId = "template_bgyb9rj";

    if (!serviceId || !templateId || !publicKey) {
      toast.error(
        "Email service is not configured. Please check the EmailJS configuration.",
        {
          id: "contact-form-toast",
        },
      );

      return;
    }

    const selectedVehicleImageUrl = new URL(
      selectedService.image,
      `${mailImageUrl}/`,
    ).href;

    const templateParams = {
      enquiry_id: enquiryId,

      from_name: form.name.trim(),

      contact_number: form.contact.trim(),

      contact_email: form.email.trim(),

      preferred_location:
        form.preferredLocation.trim() ||
        "Not specified",

      selected_service: service,

      campaign_start_date: form.startDate,

      campaign_end_date: form.endDate,

      message:
        form.message.trim() ||
        "No additional message",

      submitted_at: new Date().toLocaleString(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
          timeZone: "Asia/Kolkata",
        },
      ),

      vehicle_image: selectedVehicleImageUrl,
    };

    setSubmitting(true);

    toast.dismiss("contact-form-toast");

    try {
      await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        {
          publicKey,
        },
      );

      toast.success(
        `Thank you! Your campaign enquiry ${enquiryId} has been sent successfully.`,
        {
          id: "contact-form-toast",
        },
      );

      setForm(INITIAL_FORM);

      setService("2 Sided Fabricated LED");
    } catch (error) {
      console.error(
        "EmailJS submission failed:",
        error,
      );

      toast.error(
        "We could not send your enquiry. Please try again shortly.",
        {
          id: "contact-form-toast",
        },
      );
    } finally {
      setSubmitting(false);
    }
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
                      className={`contact-service ${
                        active
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