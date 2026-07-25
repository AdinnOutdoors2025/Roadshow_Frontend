"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ArrowRight } from "lucide-react";

/* =========================================================
   Contact Us page — implements Figma "Road-Show-2" file,
   frame "Desktop - 4" (node-id 3108:14056).

   Navbar and Footer are rendered globally by the root layout
   (src/app/layout.tsx), so this file only implements the page
   content between them: hero heading, service selector,
   contact details form, campaign dates and message.
========================================================= */

type ServiceOption =
  | "Led Vehicle"
  | "Fabricated LED"
  | "19 Feet Triple Side LED"
  | "19 Feet Single Side LED";

const SERVICE_OPTIONS: ServiceOption[] = [
  "Led Vehicle",
  "Fabricated LED",
  "19 Feet Triple Side LED",
  "19 Feet Single Side LED",
];

type ContactFormState = {
  name: string;
  contact: string;
  email: string;
  preferredLocation: string;
  startDate: string;
  endDate: string;
  message: string;
};

const INITIAL_FORM: ContactFormState = {
  name: "",
  contact: "",
  email: "",
  preferredLocation: "",
  startDate: "",
  endDate: "",
  message: "",
};

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required,
  maxWidth = 220,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  maxWidth?: number;
}) {
  return (
    <label className="block">
      <span className="block text-[16px] font-normal text-[#625656] sm:text-[18px]">
        {label}
      </span>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        style={{ maxWidth }}
        className="mt-3 w-full border-0 border-b border-[#c9c9c9] bg-transparent pb-2 text-[15px] text-black outline-none transition-colors placeholder:text-[#9a9a9a] focus:border-black"
      />
    </label>
  );
}

export default function ContactPage() {
  const [service, setService] = useState<ServiceOption>("Led Vehicle");
  const [form, setForm] = useState<ContactFormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange =
    (field: keyof ContactFormState) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      if (status !== "idle") setStatus("idle");
    };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.name.trim() || !form.contact.trim() || !form.email.trim()) {
      setStatus("error");
      return;
    }

    setSubmitting(true);

    // No backend endpoint exists yet for the public contact form (public
    // site is presentation-only — see CLAUDE.md §12/§13), so this only
    // simulates submission locally.
    window.setTimeout(() => {
      setSubmitting(false);
      setStatus("success");
      setForm(INITIAL_FORM);
      setService("Led Vehicle");
    }, 500);
  };

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="mx-auto grid max-w-[1420px] grid-cols-1 gap-16 px-4 pb-24 pt-36 sm:pt-40 lg:grid-cols-2 lg:items-start lg:gap-10">
        {/* Left — Hero */}
        <div className="lg:sticky lg:top-40">
          <h1 className="max-w-[560px] text-[48px] font-normal leading-[1.05] text-black sm:text-[64px] lg:text-[76px] xl:text-[92px]">
            Let&rsquo;s make it Happen
          </h1>
        </div>

        {/* Right — Contact form */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-[620px] lg:justify-self-end"
          noValidate
        >
          {/* Service */}
          <div>
            <h2 className="text-[26px] font-normal text-black sm:text-[32px] lg:text-[38px]">
              Service
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {SERVICE_OPTIONS.map((option) => {
                const active = option === service;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setService(option)}
                    aria-pressed={active}
                    className={`rounded-[30px] px-6 py-3 text-[14px] font-medium whitespace-nowrap transition-colors sm:text-[16px] ${
                      active
                        ? "bg-[#e4e4e4] text-black"
                        : "border border-[#625656] text-black hover:bg-[#f5f5f5]"
                    }`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name / Contact / Email / Preferred Location */}
          <div className="mt-12 grid grid-cols-1 gap-x-12 gap-y-8 sm:grid-cols-2">
            <FormField
              label="Your Name"
              name="name"
              value={form.name}
              onChange={handleChange("name")}
              required
            />
            <FormField
              label="Contact"
              name="contact"
              value={form.contact}
              onChange={handleChange("contact")}
              required
            />
            <FormField
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange("email")}
              required
            />
            <FormField
              label="Preferred  Location"
              name="preferredLocation"
              value={form.preferredLocation}
              onChange={handleChange("preferredLocation")}
            />
          </div>

          {/* Campaign Dates */}
          <div className="mt-12">
            <h2 className="text-[26px] font-normal text-black sm:text-[32px] lg:text-[38px]">
              Campaign Dates
            </h2>
            <div className="mt-6 grid max-w-[420px] grid-cols-2 gap-x-10 gap-y-8">
              <FormField
                label="Start Date"
                name="startDate"
                type="date"
                value={form.startDate}
                onChange={handleChange("startDate")}
                maxWidth={150}
              />
              <FormField
                label="End Date"
                name="endDate"
                type="date"
                value={form.endDate}
                onChange={handleChange("endDate")}
                maxWidth={150}
              />
            </div>
          </div>

          {/* Message */}
          <div className="mt-12">
            <h2 className="text-[26px] font-normal text-black sm:text-[32px] lg:text-[38px]">
              Your Message
            </h2>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange("message")}
              rows={5}
              className="mt-6 w-full max-w-[560px] rounded-[10px] border border-[#625656] p-4 text-[15px] text-black outline-none placeholder:text-[#9a9a9a]"
            />
          </div>

          {/* Submit */}
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <button
              type="submit"
              disabled={submitting}
              className="group flex items-center gap-4 disabled:opacity-60"
            >
              <span className="bg-gradient-to-l from-[#7d0008] to-[#e3000f] bg-clip-text text-[20px] font-medium text-transparent sm:text-[22px]">
                {submitting ? "Sending..." : "Submit"}
              </span>
              <span className="flex h-[52px] w-[110px] items-center justify-center rounded-full border-[0.5px] border-black transition-colors group-hover:bg-black sm:h-[58px] sm:w-[126px]">
                <ArrowRight
                  size={20}
                  className="text-black transition-colors group-hover:text-white"
                />
              </span>
            </button>

            {status === "success" && (
              <span className="text-[14px] font-medium text-[#0a8f3c]">
                Thanks! We&rsquo;ll get back to you shortly.
              </span>
            )}
            {status === "error" && (
              <span className="text-[14px] font-medium text-[#e3000f]">
                Please fill in your name, contact and email.
              </span>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}
