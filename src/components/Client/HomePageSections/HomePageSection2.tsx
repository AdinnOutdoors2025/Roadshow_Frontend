// /* eslint-disable */
// // @ts-nocheck
// "use client";
// import React, { useEffect, useState, useRef } from 'react';
// import Image from "next/image";
// import './HomePageSection1.css';
// import './HomePageSection2.css';
// import { ChevronLeft, ChevronRight, Star, UserCircle2 } from "lucide-react";


// function HomePageSection2() {
//     //VOICES FROM THE ROAD 

//     const [startIndex, setStartIndex] = useState(0);

//     const testimonials = [
//         {
//             id: 1,
//             name: "KARTHIK",
//             rating: 4.8,
//             userIcon: './images/assets/ReviewRatingMaleIcon.png',
//             review:
//                 "Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
//         },
//         {
//             id: 2,
//             name: "ABINAYA",
//             rating: 3.2,
//             userIcon: './images/assets/ReviewRatingFemaleIcon.png',
//             review:
//                 "2 Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
//         },
//         {
//             id: 3,
//             name: "MANI",
//             rating: 5.0,
//             userIcon: './images/assets/ReviewRatingMaleIcon.png',
//             review:
//                 "3 Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
//             featured: true,
//         },
//         {
//             id: 4,
//             name: "MONIKA",
//             rating: 4.3,
//             userIcon: './images/assets/ReviewRatingFemaleIcon.png',
//             review:
//                 " 4 Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
//         },
//         {
//             id: 5,
//             name: "ARUN",
//             rating: 3.0,
//             userIcon: './images/assets/ReviewRatingMaleIcon.png',
//             review:
//                 " 5 Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
//         },

//     ];

//     const nextSlide = () => {
//         setStartIndex((prev) =>
//             prev + 1 >= testimonials.length ? 0 : prev + 1
//         );
//     };

//     const prevSlide = () => {
//         setStartIndex((prev) =>
//             prev === 0 ? testimonials.length - 1 : prev - 1
//         );
//     };

//     const visibleCards = testimonials
//         .slice(startIndex)
//         .concat(testimonials.slice(0, startIndex))
//         .slice(0, 5);

//     return (
//         <>
//             {/* <section className="w-full px-4 lg:px-12 py-12 bg-[#f8f8f8]"> */}
//             <section className="w-full px-10 lg:px-20 py-12 bg-[#f8f8f8]">
//                 <div className="RS_OurRdwHeading">
//                     <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2 RS_VFRHeading text-3xl lg:text-5xl">Voices From The Road</div>
//                 </div>
//                 {/* Desktop */}
//                 <div className="hidden lg:grid grid-cols-[1fr_1fr_2fr_1fr_1fr] gap-6">
//                     {visibleCards.map((item, index) => (
//                         <div
//                             key={item.id}
//                             className={`bg-[#D7D7D733] rounded-[20px] p-5 shadow-sm flex flex-col justify-between
//             ${index === 2
//                                     ? "min-h-[400px] scale-[1.02]"
//                                     : "min-h-[400px]"
//                                 }`}
//                         >
//                             <div>
//                                 <div
//                                     className={`text-[#000000] leading-relaxed  ${index === 2
//                                         ? "text-[24px]"
//                                         : "text-[16px]"
//                                         }`} >
//                                     {item.review}
//                                 </div>

//                                 <div className="flex items-center gap-1 mt-6">
//                                     {/* <img src='./images/assets/VFR_RatingIcon.svg' className='VFR_RatingIcon h-5 w-5'></img> */}

//                                      {[...Array(5)].map((_, i) => (
//                                   <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11" fill="none" className='h-5 w-5' 

//                                    key={i}
//                                             size={18}
//                                             fill={
//                                                 i < item.rating
//                                                     ? "#F5B301"
//                                                     : "#d1d5db"
//                                             }
//                                             color={
//                                                 i < item.rating
//                                                     ? "#F5B301"
//                                                     : "#d1d5db"
//                                             }>
// <path d="M5.77623 0L7.13973 4.19641L11.5521 4.19641L7.98242 6.78994L9.34591 10.9864L5.77623 8.39283L2.20655 10.9864L3.57005 6.78994L0.000363827 4.19641H4.41273L5.77623 0Z" fill="#EDA80A" />
// </svg>
//  ))}
//   <span className="ml-2 text-sm">
//                                         {item.rating}
//                                     </span>
//                                     {/* {[...Array(5)].map((_, i) => (
//                                         <Star
//                                             key={i}
//                                             size={18}
//                                             fill={
//                                                 i < item.rating
//                                                     ? "#F5B301"
//                                                     : "#d1d5db"
//                                             }
//                                             color={
//                                                 i < item.rating
//                                                     ? "#F5B301"
//                                                     : "#d1d5db"
//                                             }
//                                         />
//                                     ))} */}

//                                     {/* <span className="ml-2 text-sm">
//                                         {item.rating}.0
//                                     </span> */}
//                                 </div>
//                             </div>

//                             <div className="flex items-center gap-3 mt-10">
//                                 <span><img src={item.userIcon} className='h-10 w-10' /></span>
//                                 <span className="tracking-wide font-medium">
//                                     {item.name}
//                                 </span>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Mobile Slider */}
//                 <div className="lg:hidden flex overflow-x-auto gap-4 snap-x">
//                     {testimonials.map((item) => (
//                         <div
//                             key={item.id}
//                             className="min-w-[300px] bg-white rounded-[24px] p-5 shadow-sm snap-center"
//                         >
//                             <p className="text-sm leading-relaxed">
//                                 {item.review}
//                             </p>

//                             <div className="flex items-center gap-1 mt-4">
//                                 {[...Array(5)].map((_, i) => (
//                                     <Star
//                                         key={i}
//                                         size={16}
//                                         fill={
//                                             i < item.rating
//                                                 ? "#F5B301"
//                                                 : "#d1d5db"
//                                         }
//                                         color={
//                                             i < item.rating
//                                                 ? "#F5B301"
//                                                 : "#d1d5db"
//                                         }
//                                     />
//                                 ))}

//                                 <span className="ml-2 text-sm">
//                                     {item.rating}.0
//                                 </span>
//                             </div>

//                             <div className="flex items-center gap-3 mt-8">
//                                 <UserCircle2 size={36} />
//                                 <span>{item.name}</span>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* Controls */}
//                 <div className="flex justify-end gap-4 mt-8">
//                     <button
//                         onClick={prevSlide}
//                         className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
//                     >
//                         <ChevronLeft />
//                     </button>

//                     <button
//                         onClick={nextSlide}
//                         className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
//                     >
//                         <ChevronRight />
//                     </button>
//                 </div>
//             </section>

//         </>
//     )
// }

// export default HomePageSection2;




// /* eslint-disable */
// // @ts-nocheck
// "use client";
// import React, { useEffect, useState, useRef, useId } from 'react';
// import Image from "next/image";
// import './HomePageSection1.css';
// import './HomePageSection2.css';
// import { ChevronLeft, ChevronRight, Star, UserCircle2 } from "lucide-react";


// function StarRating({ rating, size = 20 }) {
//     const idPrefix = useId(); // Stable, unique per component instance
//     const fullStars = Math.floor(rating);
//     const partial = parseFloat((rating - fullStars).toFixed(2));
//     const emptyStars = 5 - fullStars - (partial > 0 ? 1 : 0);

//     const StarSVG = ({ fillPercent = 100, idx }) => {
//         const gradId = `${idPrefix}-${idx}`;
//         return (
//             <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width={size}
//                 height={size}
//                 viewBox="0 0 12 11"
//                 fill="none"
//             >
//                 <defs>
//                     <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
//                         <stop offset={`${fillPercent}%`} stopColor="#EDA80A" />
//                         <stop offset={`${fillPercent}%`} stopColor="#d1d5db" />
//                     </linearGradient>
//                 </defs>
//                 <path
//                     d="M5.77623 0L7.13973 4.19641L11.5521 4.19641L7.98242 6.78994L9.34591 10.9864L5.77623 8.39283L2.20655 10.9864L3.57005 6.78994L0.000363827 4.19641H4.41273L5.77623 0Z"
//                     fill={`url(#${gradId})`}
//                 />
//             </svg>
//         );
//     };

//     return (
//         <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//             {[...Array(fullStars)].map((_, i) => (
//                 <StarSVG key={`full-${i}`} fillPercent={100} idx={`full-${i}`} />
//             ))}
//             {partial > 0 && (
//                 <StarSVG fillPercent={Math.round(partial * 100)} idx="partial" />
//             )}
//             {[...Array(emptyStars)].map((_, i) => (
//                 <StarSVG key={`empty-${i}`} fillPercent={0} idx={`empty-${i}`} />
//             ))}
//             <span style={{ marginLeft: 6, fontSize: 14 }}>
//                 {Number.isInteger(rating) ? `${rating}.0` : rating.toFixed(1)}
//             </span>
//         </div>
//     );
// }


// // ─── Smooth Carousel Hook (REPLACE the existing useCarousel) ────────────────
// function useCarousel(length) {
//     const [startIndex, setStartIndex] = useState(0);
//     const [pendingIndex, setPendingIndex] = useState(null);
//     const [phase, setPhase] = useState('idle'); // 'idle' | 'sliding'
//     const [direction, setDirection] = useState(null);
//     const DURATION = 420;

//     const navigate = (dir) => {
//         if (phase !== 'idle') return;
//         const next = dir === 'next'
//             ? (startIndex + 1) % length
//             : (startIndex - 1 + length) % length;
//         setDirection(dir);
//         setPendingIndex(next);
//         setPhase('sliding');
//         setTimeout(() => {
//             setStartIndex(next);
//             setPendingIndex(null);
//             setPhase('idle');
//         }, DURATION);
//     };

//     return { startIndex, pendingIndex, phase, direction, navigate };
// }
// // ─── Main Component ──────────────────────────────────────────────────────────
// function HomePageSection2() {
//     const testimonials = [
//         {
//             id: 1,
//             name: "KARTHIK",
//             rating: 4.8,
//             userIcon: './images/assets/ReviewRatingMaleIcon.png',
//             review:
//                 "Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
//         },
//         {
//             id: 2,
//             name: "ABINAYA",
//             rating: 3.5,
//             userIcon: './images/assets/ReviewRatingFemaleIcon.png',
//             review:
//                 "2 Attracted strong attention, and increased inquiries through the LED roadshow campaign.",
//         },
//         {
//             id: 3,
//             name: "MANI",
//             rating: 5.0,
//             userIcon: './images/assets/ReviewRatingMaleIcon.png',
//             review:
//                 "3 Across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
//             featured: true,
//         },
//         {
//             id: 4,
//             name: "MONIKA",
//             rating: 4.3,
//             userIcon: './images/assets/ReviewRatingFemaleIcon.png',
//             review:
//                 " 4 Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
//         },
//         {
//             id: 5,
//             name: "ARUN",
//             rating: 3.0,
//             userIcon: './images/assets/ReviewRatingMaleIcon.png',
//             review:
//                 " 5 Visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
//         },
//     ];

//     const { startIndex, animating, direction, navigate } = useCarousel(testimonials.length);

//     const visibleCards = testimonials
//         .slice(startIndex)
//         .concat(testimonials.slice(0, startIndex))
//         .slice(0, 5);

//     // Translate amount during animation: cards slide in from right (next) or left (prev)
//     const translateX = animating
//         ? direction === 'next' ? '-8%' : '8%'
//         : '0%';


//     //Roadshow Advantages section 
//     // Why Adinn Roadshows (Works Best) data — add image per item
//     const roadshow_Advantages = [
//         {
//             name: 'Fast',
//             desc: 'Quick campaign launch Book roadshow vehicles in minutes and start your brand promotion without delays.',
//         },
//         {
//             name: 'Flexible',
//             desc: 'Quick campaign launch Book roadshow vehicles in minutes and start your brand promotion without delays.'
//         },
//         {
//             name: 'Reliable',
//             desc: 'From planning to execution, everything managed in one place for a seamless roadshow campaign.'
//         },
//     ];

//     const [activeIndex, setActiveIndex] = useState(0);

//     const handleItemClick = (idx) => {
//         if (idx === activeIndex) {
//             setActiveIndex(-1); // collapse
//             return;
//         }
//         const direction = idx > activeIndex ? 'forward' : 'backward';
//         triggerTransition(idx, direction);
//     };


//     //Help center section 
//     const help_Center_Faq = [
//         {
//             id: 1,
//             question: 'What’s included in a standard roadshow package?',
//             answer: ' Typically: branded vehicle, driver, fuel, basic audio, permissions support, promoters (if scoped), branding print/installation, GPS tracking, daily photos/videos, and a post-campaign report. Exclusions often include venue rentals, premium activations, and special permits.'
//         },
//         {
//             id: 2,
//             question: 'How much lead time do you need?',
//             answer: ' Typically: branded vehicle, driver, fuel, basic audio, permissions support, promoters (if scoped), branding print/installation, GPS tracking, daily photos/videos, and a post-campaign report. Exclusions often include venue rentals, premium activations, and special permits.'
//         },
//         {
//             id: 3,
//             question: 'Who handles permissions?',
//             answer: ' Typically: branded vehicle, driver, fuel, basic audio, permissions support, promoters (if scoped), branding print/installation, GPS tracking, daily photos/videos, and a post-campaign report. Exclusions often include venue rentals, premium activations, and special permits.'
//         },
//         {
//             id: 4,
//             question: 'Are there time or noise restrictions?',
//             answer: ' Typically: branded vehicle, driver, fuel, basic audio, permissions support, promoters (if scoped), branding print/installation, GPS tracking, daily photos/videos, and a post-campaign report. Exclusions often include venue rentals, premium activations, and special permits.'
//         },
//     ]
//     return (
//         <>
//             <section className="w-full px-10 lg:px-20 py-12 bg-[#f8f8f8]">
//                 <div className="RS_OurRdwHeading">
//                     <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2 RS_VFRHeading text-3xl lg:text-5xl">
//                         Voices From The Road
//                     </div>
//                 </div>

//                 {/* ── Desktop Carousel ── */}
//                 <div
//                     style={{
//                         overflow: 'hidden',
//                     }}
//                     className="hidden lg:block"
//                 >
//                     <div
//                         className="grid grid-cols-[1fr_1fr_2fr_1fr_1fr] gap-6"
//                         style={{
//                             transform: `translateX(${translateX})`,
//                             opacity: animating ? 0.45 : 1,
//                             transition: animating
//                                 ? 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s ease'
//                                 : 'transform 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.35s ease',
//                         }}
//                     >
//                         {visibleCards.map((item, index) => (
//                             <div
//                                 key={item.id}
//                                 className={` VFRCardMain bg-[#D7D7D733] rounded-[20px] p-5 shadow-sm flex flex-col justify-between
//                                     ${index === 2 ? "min-h-[400px] scale-[1.02]" : "min-h-[400px]"}`}
//                             >
//                                 <div>
//                                     <div
//                                         className={`text-[#000000] leading-relaxed ${index === 2 ? "text-[24px]" : "text-[16px]"}`}
//                                     >
//                                         {item.review}
//                                     </div>

//                                     <div className="mt-6">
//                                         <StarRating rating={item.rating} size={index === 2 ? 22 : 18} />
//                                     </div>
//                                 </div>

//                                 <div className="flex items-center gap-3 mt-10">
//                                     <span>
//                                         <img src={item.userIcon} className="h-10 w-10" />
//                                     </span>
//                                     <span className="tracking-wide font-medium">{item.name}</span>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {/* ── Mobile Slider (unchanged) ── */}
//                 <div className="lg:hidden flex overflow-x-auto gap-4 snap-x">
//                     {testimonials.map((item) => (
//                         <div
//                             key={item.id}
//                             className="min-w-[300px] bg-white rounded-[24px] p-5 shadow-sm snap-center">
//                             <p className="text-sm leading-relaxed">{item.review}</p>

//                             <div className="mt-4">
//                                 <StarRating rating={item.rating} size={16} />
//                             </div>

//                             <div className="flex items-center gap-3 mt-8">
//                                 <UserCircle2 size={36} />
//                                 <span>{item.name}</span>
//                             </div>
//                         </div>
//                     ))}
//                 </div>

//                 {/* ── Controls ── */}
//                 <div className="flex justify-end gap-4 mt-8">
//                     <button
//                         onClick={() => navigate('prev')}
//                         className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
//                     >
//                         <ChevronLeft />
//                     </button>

//                     <button
//                         onClick={() => navigate('next')}
//                         className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
//                     >
//                         <ChevronRight />
//                     </button>
//                 </div>
//             </section>

//             {/* Roadshow Advantages  */}

//             <div className='RA_Main px-30 mx-auto'>

//                 <div className="RS_OurRdwHeading">
//                     <div className="RS_OurRdwHeadingContent1">Roadshow</div>
//                     <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2">Advantages</div>
//                 </div>

//                 <div className='flex gap-4 justify-around' >
//                     <div>
//                         {roadshow_Advantages.map((RA, idx) => (


//                             <div
//                                 key={idx}
//                                 className={`${activeIndex === idx ? 'active' : ''}`}
//                                 onClick={() => handleItemClick(idx)} >
//                                 <div className='RS_WhyAdRSContentIcon'>
//                                     <i className="fa-solid fa-plus"></i>
//                                 </div>
//                                 <div className='RS_WhyAdRS_ItemText'>
//                                     <div className='RS_WhyAdRS_ItemName'>{RA.name}</div>
//                                     <div className='RS_WhyAdRS_ItemDesc'>{RA.desc}</div>
//                                 </div>
//                             </div>

//                         ))}
//                     </div>
//                     <div>
//                         <div>Make Streets Your Stage </div>
//                         <div>
//                             <div>Don’t Need to Miss out </div>
//                             <div className="flex items-center bg-white rounded-full overflow-hidden pr-1 pl-4 py-1 w-full max-w-xs">
//                                 <input
//                                     type="email"
//                                     placeholder="Your email or phone number"
//                                     onChange={(e) => setEmail(e.target.value)}
//                                     className="flex-1 bg-transparent text-black text-sm outline-none placeholder-gray-400 min-w-0"
//                                 />
//                                 <button
//                                     className="bg-red-600 hover:bg-red-700 transition-colors duration-200 rounded-full p-2 flex items-center justify-center flex-shrink-0"
//                                     aria-label="Subscribe"
//                                 >
//                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
//                                         <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
//                                     </svg>
//                                 </button>
//                             </div>

//                             <div>
//                                 <img src='./images/assets/RA_RightVanImg.png' className='h-100 w-120'></img>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>


//             {/* HELP CENTER  */}
//             <div className='HC_Main'>
//                 <div className='px-30 mx-auto'>

//                     <div className="HC_headingMain">
//                         <div className="HC_HeadingContent1">Help Center</div>
//                         <div className="HC_HeadingContent2">Find quick answers to common questions about our services, process, and support.</div>
//                     </div>

//                     <div className='px-30 mx-auto HC_FAQMain'>
//                         <div>
//                             {
//                                 help_Center_Faq.map(
//                                     (faq, id) => (
//                                         <div key={id} className='flex justify-between HC_FAQ_QnAnsMain'>
//                                             <div className='HC_FAQ_Question'>{faq.question}</div>
//                                             <div className='HC_FAQ_Question_Arrow'>
//                                                 <i className="fa-solid fa-chevron-down"></i>

//                                             </div>
//                                         </div>
//                                     )
//                                 )
//                             }
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// }

// export default HomePageSection2;


/* eslint-disable */
// @ts-nocheck
"use client";
import React, { useEffect, useState, useRef, useId, useLayoutEffect, useMemo } from 'react';
import Image from "next/image";
import './HomePageSection1.css';
import './HomePageSection2.css';
import { ChevronLeft, ChevronRight, Star, UserCircle2 } from "lucide-react";


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


// // ─── Smooth Carousel Hook ────────────────────────────────────────────────────
// function useCarousel(length) {
//     const [startIndex, setStartIndex] = useState(0);
//     const [pendingIndex, setPendingIndex] = useState(null);
//     const [phase, setPhase] = useState('idle');
//     const [direction, setDirection] = useState(null);
//     const DURATION = 420;

//     const navigate = (dir) => {
//         if (phase !== 'idle') return;
//         const next = dir === 'next'
//             ? (startIndex + 1) % length
//             : (startIndex - 1 + length) % length;
//         setDirection(dir);
//         setPendingIndex(next);
//         setPhase('sliding');
//         setTimeout(() => {
//             setStartIndex(next);
//             setPendingIndex(null);
//             setPhase('idle');
//         }, DURATION);
//     };

//     return { startIndex, pendingIndex, phase, direction, navigate };
// }




// ─── Smooth Expanding Carousel Hook ─────────────────────────────────────────
function useCarousel(length) {
    const viewportRef = useRef(null);

    const [startIndex, setStartIndex] = useState(0);
    const [containerWidth, setContainerWidth] = useState(0);

    const [animation, setAnimation] = useState(null);
    // animation = { dir: "next" | "prev", stage: "from" | "to" }

    const DURATION = 520;
    const GAP = 20;

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

    const displayCount = isAnimating ? 6 : 5;

    const cardUnit = containerWidth > 0
        ? (containerWidth - GAP * 4) / 6
        : 0;

    const step = cardUnit + GAP;

    const small = `${cardUnit}px`;
    const big = `${cardUnit * 2}px`;

    let gridTemplateColumns = "1fr 1fr 2fr 1fr 1fr";
    let transform = "translateX(0px)";
    let transition = "none";

    if (containerWidth > 0) {
        if (!animation) {
            gridTemplateColumns = `${small} ${small} ${big} ${small} ${small}`;
            transform = "translateX(0px)";
        }

        if (animation?.dir === "next") {
            if (animation.stage === "from") {
                gridTemplateColumns = `${small} ${small} ${big} ${small} ${small} ${small}`;
                transform = "translateX(0px)";
                transition = "none";
            } else {
                gridTemplateColumns = `${small} ${small} ${small} ${big} ${small} ${small}`;
                transform = `translateX(-${step}px)`;
                transition = `transform ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1), grid-template-columns ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`;
            }
        }

        if (animation?.dir === "prev") {
            if (animation.stage === "from") {
                gridTemplateColumns = `${small} ${small} ${small} ${big} ${small} ${small}`;
                transform = `translateX(-${step}px)`;
                transition = "none";
            } else {
                gridTemplateColumns = `${small} ${small} ${big} ${small} ${small} ${small}`;
                transform = "translateX(0px)";
                transition = `transform ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1), grid-template-columns ${DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`;
            }
        }
    }

    const centerSlot = useMemo(() => {
        if (!animation) return 2;

        if (animation.dir === "next") {
            return animation.stage === "to" ? 3 : 2;
        }

        return animation.stage === "to" ? 2 : 3;
    }, [animation]);

    const trackStyle = {
        gap: `${GAP}px`,
        gridTemplateColumns,
        transform,
        transition,
    };

    return {
        viewportRef,
        startIndex,
        displayStartIndex,
        displayCount,
        centerSlot,
        isAnimating,
        navigate,
        trackStyle,
    };
}




// ─── Main Component ──────────────────────────────────────────────────────────
function HomePageSection2() {
  
// VOICES FROM THE ROAD SECTION 
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
    displayCount,
    centerSlot,
    isAnimating,
    navigate,
    trackStyle,
} = useCarousel(testimonials.length);

const visibleCards = Array.from({ length: displayCount }, (_, index) => {
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

    // ── CHANGE 1: activeIndex starts at 0 so first item is open by default ──
    const [activeIndex, setActiveIndex] = useState();

    // ── CHANGE 2: One-open-at-a-time toggle for Roadshow Advantages ──
    const handleItemClick = (idx) => {
        setActiveIndex(prev => prev === idx ? -1 : idx);
    };

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

    // ── CHANGE 3: NEW state for FAQ accordion (null = all closed) ──
    const [activeFaqIndex, setActiveFaqIndex] = useState(null);

    // ── CHANGE 4: NEW handler for FAQ — one open at a time ──
    const handleFaqClick = (id) => {
        setActiveFaqIndex(prev => prev === id ? null : id);
    };

    return (
        <>
             <section className="w-full px-10 lg:px-20 py-12 bg-[#f8f8f8]">
        <div className="RS_OurRdwHeading">
            <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2 RS_VFRHeading text-3xl lg:text-5xl">
                Voices From The Road
            </div>
        </div>

        {/* ── Desktop Carousel ── */}
        <div
            ref={viewportRef}
            className="hidden lg:block VFRCarouselViewport"
        >
            <div
                className="VFRContentMainGrid"
                style={trackStyle}
            >
                {visibleCards.map((item, index) => {
                    const isCenter = index === centerSlot;

                    return (
                        <div
                            key={`${item.id}-${index}-${displayStartIndex}`}
                            className={`VFRCardMain bg-[#D7D7D733] rounded-[20px] p-5 shadow-sm flex flex-col justify-between min-h-[400px]
                                ${isCenter ? "VFRCardCenter" : ""}`}
                        >
                            <div>
                                <div
                                    className={`VFRReviewText text-[#000000] leading-relaxed ${
                                        isCenter ? "VFRReviewTextCenter" : ""
                                    }`}
                                >
                                    {item.review}
                                </div>

                                <div className="mt-6">
                                    <StarRating
                                        rating={item.rating}
                                        size={isCenter ? 22 : 18}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-10">
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

        {/* ── Mobile Slider ── */}
        <div className="lg:hidden flex overflow-x-auto gap-4 snap-x">
            {testimonials.map((item) => (
                <div
                    key={item.id}
                    className="min-w-[300px] bg-white rounded-[24px] p-5 shadow-sm snap-center"
                >
                    <p className="text-sm leading-relaxed">{item.review}</p>

                    <div className="mt-4">
                        <StarRating rating={item.rating} size={16} />
                    </div>

                    <div className="flex items-center gap-3 mt-8">
                        <UserCircle2 size={36} />
                        <span>{item.name}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* ── Controls ── */}
        <div className="flex justify-end gap-4 mt-8">
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
    </section>

            {/* Roadshow Advantages */}
            <div className='RA_Main px-30 mx-auto'>

                <div className="RS_OurRdwHeading">
                    <div className="RS_OurRdwHeadingContent1">Roadshow</div>
                    <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2">Advantages</div>
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
                                        <i className='fa-solid fa-plus'></i>
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
                                    type="email"
                                    placeholder="Your email or phone number"
                                    className="RA_RightContent2Input  flex-1 bg-transparent text-black text-md outline-none placeholder-gray-400 min-w-0"
                                />
                                <button
                                    className=" RA_RightContent2InpBtn transition-colors duration-200 rounded-full p-2 flex items-center justify-center flex-shrink-0"
                                    aria-label="Subscribe">
                                    <i className="fa-solid fa-chevron-right"></i>
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

            {/* HELP CENTER */}
            <div className='HC_Main'>
                <div className='px-30 mx-auto'>

                    <div className="HC_headingMain">
                        <div className="HC_HeadingContent1">Help Center</div>
                        <div className="HC_HeadingContent2">Find quick answers to common questions about our services, process, and support.</div>
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