/* eslint-disable */
// @ts-nocheck
"use client";
import React, { useEffect, useState, useRef, useId, useLayoutEffect, useMemo } from 'react';
import Image from "next/image";
import './HomePageSection1.css';
import './HomePageSection2.css';
import { ChevronLeft, ChevronRight, Star, UserCircle2 } from "lucide-react";
import SplitHeading from "@/components/motion/SplitHeading";
import RevealText from "@/components/motion/RevealText";
// TESTIMONIALS SECTION
// Testimonials.tsx exports `Testimonials` as a NAMED export and has no default
// export, so this has to be a named import (aliased to keep the name used below).
import { Testimonials as RdswWebTestimonialsSection } from "./Testimonials";
import { GPSTracking as RdswWebGPSTrackingSection } from "./GPSTracking";
import { useNewsletterSubscribe } from "@/components/Client/Reusable_Components/useNewsletterSubscribe";


function StarRating({ rating, size = 20 }) {
    const idPrefix = useId();
    const fullStars = Math.floor(rating);
    const partial = parseFloat((rating - fullStars).toFixed(2));
    const emptyStars = 5 - fullStars - (partial > 0 ? 1 : 0);

    const StarSVG = ({ fillPercent = 100, idx }) => {
        const gradId = `${idPrefix}-${idx}`;
        return (
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width={size}
                height={size}
                viewBox="0 0 12 11"
                fill="none"
            >
                <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset={`${fillPercent}%`} stopColor="#EDA80A" />
                        <stop offset={`${fillPercent}%`} stopColor="#d1d5db" />
                    </linearGradient>
                </defs>
                <path
                    d="M5.77623 0L7.13973 4.19641L11.5521 4.19641L7.98242 6.78994L9.34591 10.9864L5.77623 8.39283L2.20655 10.9864L3.57005 6.78994L0.000363827 4.19641H4.41273L5.77623 0Z"
                    fill={`url(#${gradId})`}
                />
            </svg>
        );
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {[...Array(fullStars)].map((_, i) => (
                <StarSVG key={`full-${i}`} fillPercent={100} idx={`full-${i}`} />
            ))}
            {partial > 0 && (
                <StarSVG fillPercent={Math.round(partial * 100)} idx="partial" />
            )}
            {[...Array(emptyStars)].map((_, i) => (
                <StarSVG key={`empty-${i}`} fillPercent={0} idx={`empty-${i}`} />
            ))}
            <span style={{ marginLeft: 6, fontSize: 14 }}>
                {Number.isInteger(rating) ? `${rating}.0` : rating.toFixed(1)}
            </span>
        </div>
    );
}

// Responsive Smooth Expanding Carousel Hook 
function useCarousel(length) {
    const viewportRef = useRef(null);

    const [startIndex, setStartIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);
    const [animation, setAnimation] = useState(null);

    const DURATION = 950;

    useLayoutEffect(() => {
        if (!viewportRef.current) return;

        const updateWidth = () => {
            setContainerWidth(viewportRef.current.offsetWidth);
        };

        updateWidth();

        const observer = new ResizeObserver(updateWidth);
        observer.observe(viewportRef.current);

        return () => observer.disconnect();
    }, []);

    const normalize = (index) => {
        return (index + length) % length;
    };

    const layout = useMemo(() => {
        if (containerWidth <= 0) {
            return {
                mode: "desktop",
                gap: 20,
                visibleCount: 5,
                displayCount: 5,
                smallCard: 0,
                bigCard: 0,
                step: 0,
            };
        }

        const isMobile = containerWidth < 640;
        const isTablet = containerWidth >= 640 && containerWidth < 1024;

        if (isMobile) {
            const gap = 14;
            const cardWidth = containerWidth;

            return {
                mode: "mobile",
                gap,
                visibleCount: 1,
                displayCount: 2,
                smallCard: cardWidth,
                bigCard: cardWidth,
                step: cardWidth + gap,
            };
        }

        if (isTablet) {
            const gap = 18;
            const unit = (containerWidth - gap * 2) / 4;

            return {
                mode: "tablet",
                gap,
                visibleCount: 3,
                displayCount: 4,
                smallCard: unit,
                bigCard: unit * 2,
                step: unit + gap,
            };
        }

        const gap = 20;
        const unit = (containerWidth - gap * 4) / 6;

        return {
            mode: "desktop",
            gap,
            visibleCount: 5,
            displayCount: 6,
            smallCard: unit,
            bigCard: unit * 2,
            step: unit + gap,
        };
    }, [containerWidth]);

    const navigate = (dir) => {
        if (animation || length <= 1) return;

        setAnimation({ dir, stage: "from" });

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                setAnimation({ dir, stage: "to" });
            });
        });

        setTimeout(() => {
            setStartIndex((prev) => {
                if (dir === "next") return normalize(prev + 1);
                return normalize(prev - 1);
            });

            setAnimation(null);
        }, DURATION);
    };

    const isAnimating = Boolean(animation);

    const displayStartIndex =
        animation?.dir === "prev"
            ? normalize(startIndex - 1)
            : startIndex;

    const visibleCount = isAnimating
        ? layout.displayCount
        : layout.visibleCount;

    const getWidths = () => {
        const s = layout.smallCard;
        const b = layout.bigCard;

        if (layout.mode === "mobile") {
            return [s, s];
        }

        if (layout.mode === "tablet") {
            if (!animation) return [s, b, s];

            if (animation.dir === "next") {
                return animation.stage === "from"
                    ? [s, b, s, s]
                    : [s, s, b, s];
            }

            return animation.stage === "from"
                ? [s, s, b, s]
                : [s, b, s, s];
        }

        if (!animation) return [s, s, b, s, s];

        if (animation.dir === "next") {
            return animation.stage === "from"
                ? [s, s, b, s, s, s]
                : [s, s, s, b, s, s];
        }

        return animation.stage === "from"
            ? [s, s, s, b, s, s]
            : [s, s, b, s, s, s];
    };

    const cardWidths = getWidths();

    let transform = "translate3d(0px, 0px, 0px)";
    let transition = "none";

    if (animation?.dir === "next") {
        transform =
            animation.stage === "to"
                ? `translate3d(-${layout.step}px, 0px, 0px)`
                : "translate3d(0px, 0px, 0px)";

        transition =
            animation.stage === "to"
                ? `transform ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`
                : "none";
    }

    if (animation?.dir === "prev") {
        transform =
            animation.stage === "from"
                ? `translate3d(-${layout.step}px, 0px, 0px)`
                : "translate3d(0px, 0px, 0px)";

        transition =
            animation.stage === "to"
                ? `transform ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`
                : "none";
    }

    const centerSlot = useMemo(() => {
        if (!animation) {
            if (layout.mode === "mobile") return 0;
            if (layout.mode === "tablet") return 1;
            return 2;
        }

        if (layout.mode === "mobile") {
            if (animation.dir === "next") {
                return animation.stage === "to" ? 1 : 0;
            }

            return animation.stage === "to" ? 0 : 1;
        }

        if (layout.mode === "tablet") {
            if (animation.dir === "next") {
                return animation.stage === "to" ? 2 : 1;
            }

            return animation.stage === "to" ? 1 : 2;
        }

        if (animation.dir === "next") {
            return animation.stage === "to" ? 3 : 2;
        }

        return animation.stage === "to" ? 2 : 3;
    }, [animation, layout.mode]);

    const trackStyle = {
        gap: `${layout.gap}px`,
        transform,
        transition,
        "--vfr-duration": `${DURATION}ms`,
    };

    const getCardStyle = (index) => {
        const width = cardWidths[index] || layout.smallCard;

        return {
            flex: `0 0 ${width}px`,
            width: `${width}px`,
            transition: `
                flex-basis ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1),
                width ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1),
                transform ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)
            `,
        };
    };

    return {
        viewportRef,
        displayStartIndex,
        visibleCount,
        centerSlot,
        isAnimating,
        navigate,
        trackStyle,
        getCardStyle,
        carouselMode: layout.mode,
    };
}

// ─── Main Component ──────────────────────────────────────────────────────────
function HomePageSection2() {
    // VOICES FROM THE ROAD SECTION
    const [activeAdvantage, setActiveAdvantage] = useState<number | null>(null);
    const testimonials = [
        {
            id: 1,
            name: "KARTHIK",
            rating: 4.8,
            userIcon: "./images/assets/ReviewRatingMaleIcon.png",
            review:
                "Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
        },
        {
            id: 2,
            name: "ABINAYA",
            rating: 3.5,
            userIcon: "./images/assets/ReviewRatingFemaleIcon.png",
            review:
                "2 Attracted strong attention, and increased inquiries through the LED roadshow campaign.",
        },
        {
            id: 3,
            name: "MANI",
            rating: 5.0,
            userIcon: "./images/assets/ReviewRatingMaleIcon.png",
            review:
                "3 Across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
            featured: true,
        },
        {
            id: 4,
            name: "MONIKA",
            rating: 4.3,
            userIcon: "./images/assets/ReviewRatingFemaleIcon.png",
            review:
                "4 Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
        },
        {
            id: 5,
            name: "ARUN",
            rating: 3.0,
            userIcon: "./images/assets/ReviewRatingMaleIcon.png",
            review:
                "5 Visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
        },
    ];

    const {
        viewportRef,
        displayStartIndex,
        visibleCount,
        centerSlot,
        isAnimating,
        navigate,
        trackStyle,
        getCardStyle,
        carouselMode,
    } = useCarousel(testimonials.length);

    const visibleCards = Array.from({ length: visibleCount }, (_, index) => {
        return testimonials[(displayStartIndex + index) % testimonials.length];
    });


    // Roadshow Advantages section
    const roadshow_Advantages = [
        {
            name: 'Fast',
            desc: 'Quick campaign launch Book roadshow vehicles in minutes and start your brand promotion without delays.',
        },
        {
            name: 'Flexible',
            desc: 'Quick campaign launch Book roadshow vehicles in minutes and start your brand promotion without delays.'
        },
        {
            name: 'Reliable',
            desc: 'From planning to execution, everything managed in one place for a seamless roadshow campaign.'
        },
    ];

    const [activeIndex, setActiveIndex] = useState();

    const handleItemClick = (idx) => {
        setActiveIndex(prev => prev === idx ? -1 : idx);
    };

    // Roadshow Advantages email/phone capture — same validation, captcha
    // and EmailJS template as the Footer newsletter field (shared hook).
    const {
        email: raEmail,
        onEmailChange: onRaEmailChange,
        loading: raLoading,
        isEmpty: isRaEmpty,
        openCaptchaPopup: openRaCaptchaPopup,
        handleNewsletterKeyDown: handleRaKeyDown,
        modal: raCaptchaModal,
    } = useNewsletterSubscribe("Adinn Roadshows Website - Roadshow Advantages Section");

    // Help center section
    const help_Center_Faq = [
        {
            id: 1,
            question: 'What\'s included in a standard roadshow package?',
            answer: 'Typically: branded vehicle, driver, fuel, basic audio, permissions support, promoters (if scoped), branding print/installation, GPS tracking, daily photos/videos, and a post-campaign report. Exclusions often include venue rentals, premium activations, and special permits.'
        },
        {
            id: 2,
            question: 'How much lead time do you need?',
            answer: 'Typically: branded vehicle, driver, fuel, basic audio, permissions support, promoters (if scoped), branding print/installation, GPS tracking, daily photos/videos, and a post-campaign report. Exclusions often include venue rentals, premium activations, and special permits.'
        },
        {
            id: 3,
            question: 'Who handles permissions?',
            answer: 'Typically: branded vehicle, driver, fuel, basic audio, permissions support, promoters (if scoped), branding print/installation, GPS tracking, daily photos/videos, and a post-campaign report. Exclusions often include venue rentals, premium activations, and special permits.'
        },
        {
            id: 4,
            question: 'Are there time or noise restrictions?',
            answer: 'Typically: branded vehicle, driver, fuel, basic audio, permissions support, promoters (if scoped), branding print/installation, GPS tracking, daily photos/videos, and a post-campaign report. Exclusions often include venue rentals, premium activations, and special permits.'
        },
    ];

    const [activeFaqIndex, setActiveFaqIndex] = useState(null);

    const handleFaqClick = (id) => {
        setActiveFaqIndex(prev => prev === id ? null : id);
    };

    return (
        <>
            {/* VOICES FROM THE ROAD SECTION */}
            {/* <section className="w-full px-5 sm:px-8 lg:px-20 py-12 bg-[#f8f8f8]">
    
                <div className="RS_OurRdwHeading">
                    <RevealText
                        className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2 RS_VFRHeading text-3xl lg:text-5xl"
                        effect="wipe"
                    >
                        Voices From The Road
                    </RevealText>
                </div>

                <div
                    ref={viewportRef}
                    className={`VFRCarouselViewport VFRMode-${carouselMode} ${isAnimating ? "VFRCarouselMoving" : ""
                        }`}
                >
                    <div
                        className="VFRContentMainGrid"
                        style={trackStyle}
                    >
                        {visibleCards.map((item, index) => {
                            const isCenter = index === centerSlot;

                            return (
                                <div
                                    key={`${item.id}-${displayStartIndex + index}`}
                                    style={getCardStyle(index)}
                                    className={`VFRCardMain bg-[#D7D7D733] rounded-[20px] p-5 shadow-sm flex flex-col justify-between min-h-[400px] ${isCenter ? "VFRCardCenter" : ""
                                        }`}
                                >
                                    <div className="VFRCardContent flex-1">
                                        <div className="VFRReviewOuter">
                                            <div
                                                className={`VFRReviewScaleBox ${isCenter
                                                    ? "VFRReviewScaleBoxCenter"
                                                    : ""
                                                    }`}
                                            >
                                                <div className="VFRReviewText text-[#000000] leading-relaxed">
                                                    {item.review}
                                                </div>
                                            </div>
                                        </div>

                                        <div
                                            className={`mt-6 VFRStarWrap ${isCenter ? "VFRStarWrapCenter" : ""
                                                }`}
                                        >
                                            <StarRating rating={item.rating} size={18} />
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-10 VFRUserInfo">
                                        <span>
                                            <img
                                                src={item.userIcon}
                                                className="h-10 w-10"
                                                alt={item.name}
                                            />
                                        </span>

                                        <span className="tracking-wide font-medium">
                                            {item.name}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-center lg:justify-end gap-4 mt-8">
                    <button
                        onClick={() => navigate("prev")}
                        disabled={isAnimating}
                        className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft />
                    </button>

                    <button
                        onClick={() => navigate("next")}
                        disabled={isAnimating}
                        className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </section> */}

            <RdswWebTestimonialsSection />
            {/* RdswWebGPSTrackingSection */}
            <div
            // style={{ width: '70%', margin:'auto' }}
            >
                <RdswWebGPSTrackingSection />
            </div>
            {/* Roadshow Advantages */}
            <div className='RA_Main px-30 mx-auto'>

                <div className="RS_OurRdwHeading">
                    <SplitHeading className="RS_OurRdwHeadingContent1">Roadshow</SplitHeading>
                    <RevealText className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2" effect="wipe" delay={0.18}>Advantages</RevealText>
                </div>

                <div className='flex gap-4 justify-around RA_LeftRightMain'>
                    <div className='RA_leftMain'>
                        {roadshow_Advantages.map((RA, idx) => (
                            <div
                                key={idx}
                                className={`RS_RA_Item ${activeIndex === idx ? 'active' : ''}`}
                                onClick={() => handleItemClick(idx)}
                            >
                                {/* Header row — always visible */}
                                <div className='RA_leftContentMain flex justify-between'>
                                    <div className='RA_leftContentHeading'>{RA.name}</div>
                                    <div className='RA_leftContentIcon'>
                                        {/* <i className={`fa-solid ${activeIndex === idx ? 'fa-xmark' : 'fa-plus'}`}></i> */}
                                        <i className="fa-solid fa-plus"></i>
                                    </div>
                                </div>

                                {/* ── CHANGE: Smooth collapse wrapper using CSS max-height transition ── */}
                                <div className={`RA_collapseWrapper ${activeIndex === idx ? 'open' : ''}`}>
                                    <div className='RA_leftContentDesc'>{RA.desc}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className='RA_RightMain'>
                        <div className='RA_RightContent1'>Make Streets Your Stage</div>
                        <div className='RA_RightSecondContentMain'>
                            <div className='RA_RightSecondContentInsideMain'>
                                <div className='RA_RightSecondContent1'>Don't Need to Miss out</div>
                                <div className=" RA_RightContent2Main flex gap-5 items-center bg-white rounded-full overflow-hidden pr-1 pl-4 py-1 w-full max-w-xs">
                                    <input
                                        type="text"
                                        inputMode="email"
                                        autoComplete="email"
                                        placeholder="Your email or phone number"
                                        value={raEmail}
                                        disabled={raLoading}
                                        onChange={(event) => onRaEmailChange(event.target.value)}
                                        onKeyDown={handleRaKeyDown}
                                        className="RA_RightContent2Input  flex-1 bg-transparent text-black text-md outline-none placeholder-gray-400 min-w-0 disabled:opacity-60"
                                    />
                                    <button
                                        type="button"
                                        onClick={openRaCaptchaPopup}
                                        disabled={raLoading || isRaEmpty}
                                        className={`RA_RightContent2InpBtn transition-all duration-200 rounded-full p-2 flex items-center justify-center flex-shrink-0 ${raLoading || isRaEmpty ? "cursor-not-allowed opacity-40" : "cursor-pointer opacity-100"
                                            }`}
                                        aria-label="Continue with contact verification">
                                        {raLoading ? (
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                                        ) : (
                                            <i className="fa-solid fa-chevron-right"></i>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <img src='./images/assets/RA_RightVanImg.png' className=' RA_RightVanImg  w-120' />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {raCaptchaModal}

            <div className='HC_Main'>
                <div className='px-30 mx-auto'>

                    <div className="HC_headingMain">
                        <SplitHeading className="HC_HeadingContent1">Help Center</SplitHeading>
                        <SplitHeading className="HC_HeadingContent2" delay={0.12}>Find quick answers to common questions about our services, process, and support.</SplitHeading>
                    </div>

                    <div className='px-30 mx-auto HC_FAQMain'>
                        <div>
                            {/* ── CHANGE 6: Updated FAQ accordion JSX ── */}
                            {help_Center_Faq.map((faq) => (
                                <div
                                    key={faq.id}
                                    className='HC_FAQ_QnAnsMain'
                                    onClick={() => handleFaqClick(faq.id)}
                                >
                                    <div className='HC_FAQ_TopRow'>
                                        <div className='HC_FAQ_Question'>{faq.question}</div>
                                        <div className={`HC_FAQ_Question_Arrow ${activeFaqIndex === faq.id ? 'open' : ''}`}>
                                            <i className="fa-solid fa-chevron-down"></i>
                                        </div>
                                    </div>
                                    {/* Smooth collapse wrapper */}
                                    <div className={`HC_FAQ_Answer_Wrapper ${activeFaqIndex === faq.id ? 'open' : ''}`}>
                                        <div className='HC_FAQ_Answer'>{faq.answer}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default HomePageSection2;