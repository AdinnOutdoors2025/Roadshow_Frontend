/* eslint-disable */
// @ts-nocheck
"use client";

/* =============================================================
   HELP CENTER / FAQ — VERSION 2

   Self-contained "v2" redesign of the Help Center / FAQ section.
   Kept as its own component + its own CSS file (HelpCenterFAQv2.css)
   so the original Help Center markup/styles in HomePageSection2.tsx
   (.HC_* classes) stay untouched and can still be restored by
   simply re-rendering that old block instead of this component.

   Layout:
     - Left column: eyebrow label, heading, description, red
       accent underline, and a "We're here to help / Fast,
       reliable support" info row.
     - Right column: FAQ accordion, each question as a rounded
       pill card with a circular chevron toggle.
============================================================= */

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Headphones, ShieldCheck, ChevronDown } from "lucide-react";
import RevealText from "@/components/motion/RevealText";
/* RS_OurRdwHeading / RS_OurRdwHeadingContent1 / RS_OurRdwHeadingContent2 —
   the black+red two-part reveal heading style used by the "Why Adinn
   Roadshows" and other homepage sections — live in HomePageSection1.css.
   Imported here too so this component doesn't depend on load order. */
import "./HomePageSection1.css";
import "./HelpCenterFAQv2.css";

const help_Center_Faq_v2 = [
    {
        id: 1,
        question: "What's included in a standard roadshow package?",
        answer:
            "Vehicle, branding, driver, fuel, basic audio, GPS tracking, permissions support, campaign updates and reporting. Additional: Promoters, venue rentals, premium activations and special permits.",
    },
    {
        id: 2,
        question: "How much lead time do you need?",
        answer:
            "Most roadshow campaigns can be delivered within 24–48 hours after confirmation. Timelines may vary based on vehicle availability, location, and campaign requirements.",
    },
    {
        id: 3,
        question: "Who handles permissions?",
        answer:
            "Our internal team takes care of the required permissions and approvals, so you don’t have to manage the process yourself.",
    },
    {
        id: 4,
        question: "Are there time or noise restrictions?",
        answer:
            "Audio can be played subject to local regulations and should be kept below 55 decibels. Campaigns typically run for up to 8 hours per day, with timings adjusted based on the client’s requirements and location.",
    },
];

function HelpCenterFAQv2() {
    const [activeFaqId, setActiveFaqId] = useState(null);

    /* =====================================================
       MEASURED-HEIGHT ACCORDION

       A fixed CSS max-height (e.g. 300px) animates against a cap
       that's much taller than the real answer text, so most of the
       open/close transition is spent "inside" that empty gap — the
       visible content snaps open almost immediately and the reverse
       (closing) stays visibly full-height for most of the transition
       before suddenly collapsing. That snap/jerk is the "increase
       decrease" jump effect.

       Measuring each answer's real scrollHeight and transitioning
       max-height to that exact pixel value (0 when closed) makes the
       transition track the actual content growth/shrink 1:1, so
       opening a new question and the previous one collapsing move in
       visual sync instead of jumping.
    ===================================================== */
    const answerRefs = useRef({});
    const cardRefs = useRef({});
    const [, forceRecalc] = useState(0);

    /* =====================================================
       RESERVE SPACE FOR THE TALLEST OPEN STATE

       This page is wrapped in GSAP ScrollSmoother (GlobalSmoothScroll.tsx),
       which watches #smooth-content's height with a ResizeObserver and
       calls ScrollTrigger.refresh() once the height stops changing. That
       exists so late-loading content (images, API data) doesn't leave
       ScrollTrigger positions stale — but this accordion's max-height
       transition also changes that height while it animates, so every
       open/close now triggers the same refresh, which recalculates scroll
       positions and reads as a jump. It's worse at wide/desktop sizes
       because the fonts (and therefore the height delta) are bigger.

       Fix: give the FAQ column a min-height up front covering "every card
       closed + the tallest single answer open," measured from the real
       content. Opening/closing a question then only redistributes space
       that's already reserved — the section's total height never changes,
       so there's nothing for the page-level observer to react to.
    ===================================================== */
    const [reservedHeight, setReservedHeight] = useState(null);

    const measureReservedHeight = () => {
        const ids = help_Center_Faq_v2.map((f) => f.id);

        const closedCardHeights = ids
            .map((id) => cardRefs.current[id]?.offsetHeight ?? 0)
            .filter((h) => h > 0);

        // Every closed card is the same height — take the smallest reading
        // so the currently-open card (which is taller) never skews it.
        const closedCardHeight = closedCardHeights.length
            ? Math.min(...closedCardHeights)
            : 0;

        const maxAnswerHeight = Math.max(
            0,
            ...ids.map((id) => answerRefs.current[id]?.scrollHeight ?? 0)
        );

        const rightColumn = document.querySelector(".HCv2_Right");
        const gap = rightColumn
            ? parseFloat(getComputedStyle(rightColumn).rowGap || "0") || 0
            : 0;

        const total =
            closedCardHeight * ids.length +
            gap * (ids.length - 1) +
            maxAnswerHeight;

        setReservedHeight(total > 0 ? total : null);
    };

    useLayoutEffect(() => {
        measureReservedHeight();
    }, []);

    useEffect(() => {
        let frame = null;

        const handleResize = () => {
            if (frame) cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                forceRecalc((tick) => tick + 1);
                measureReservedHeight();
            });
        };

        window.addEventListener("resize", handleResize);
        return () => {
            window.removeEventListener("resize", handleResize);
            if (frame) cancelAnimationFrame(frame);
        };
    }, []);

    const getMeasuredHeight = (id) => answerRefs.current[id]?.scrollHeight ?? 0;

    const handleFaqClick = (id) => {
        setActiveFaqId((prev) => (prev === id ? null : id));
    };

    return (
        <section className="HCv2_Section">
            <div className="HCv2_Decor HCv2_DecorTopLeft" aria-hidden="true" />
            <div className="HCv2_Decor HCv2_DecorBottomRight" aria-hidden="true" />

            <div className="mx-auto px-30 RS_HelpCenterFAQSectionWrap">
                <div className="RS_OurRdwHeading">
                    <RevealText className="RS_OurRdwHeadingContent1" effect="blur">
                        Frequently Asked
                    </RevealText>

                    <RevealText
                        className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2"
                        effect="wipe"
                        delay={0.18}
                    >
                        Questions
                    </RevealText>
                </div>

                <div className="HCv2_Grid">
                    {/* LEFT — HEADING / DESCRIPTION / INFO ROW */}
                    <div className="HCv2_Left">
                        <div className="HCv2_Eyebrow">
                            <span>ROADSHOW SUPPORT</span>
                            {/* <span className="HCv2_EyebrowLine" /> */}
                        </div>

                        <h2 className="HCv2_Heading">Help Center</h2>

                        <p className="HCv2_Desc">
                            Find quick answers to common questions about our
                            services, process, and support.
                        </p>

                        <span className="HCv2_AccentBar" />

                        <div className="HCv2_InfoRow">
                            <div className="HCv2_InfoItem">
                                <Headphones size={20} strokeWidth={1.75} />
                                <span>We're here to help</span>
                            </div>

                            <span className="HCv2_InfoDivider" />

                            <div className="HCv2_InfoItem">
                                <ShieldCheck size={20} strokeWidth={1.75} />
                                <span>Fast, reliable support</span>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT — FAQ ACCORDION */}
                    <div
                        className="HCv2_Right"
                        style={reservedHeight ? { minHeight: `${reservedHeight}px` } : undefined}
                    >
                        {help_Center_Faq_v2.map((faq) => {
                            const isOpen = activeFaqId === faq.id;

                            return (
                                <div
                                    key={faq.id}
                                    ref={(el) => {
                                        cardRefs.current[faq.id] = el;
                                    }}
                                    className={`HCv2_FaqCard ${isOpen ? "open" : ""}`}
                                    role="button"
                                    tabIndex={0}
                                    aria-expanded={isOpen}
                                    onClick={() => handleFaqClick(faq.id)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            handleFaqClick(faq.id);
                                        }
                                    }}
                                >
                                    <div className="HCv2_FaqTopRow">
                                        <div className="HCv2_FaqQuestion">{faq.question}</div>

                                        <div className="HCv2_FaqArrowBtn">
                                            <ChevronDown size={18} strokeWidth={2} />
                                        </div>
                                    </div>

                                    <div
                                        className="HCv2_FaqAnswerWrapper"
                                        style={{
                                            maxHeight: isOpen ? `${getMeasuredHeight(faq.id)}px` : "0px",
                                        }}
                                    >
                                        <div
                                            className="HCv2_FaqAnswer"
                                            ref={(el) => {
                                                answerRefs.current[faq.id] = el;
                                            }}
                                        >
                                            {faq.answer}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default HelpCenterFAQv2;
