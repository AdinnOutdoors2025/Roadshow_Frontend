/* eslint-disable */
// @ts-nocheck
"use client";
import React, { useEffect, useState, useRef } from 'react';
import Image from "next/image";
import './HomePageSection1.css';
import './HomePageSection2.css';
import { ChevronLeft, ChevronRight, Star, UserCircle2 } from "lucide-react";


function HomePageSection2() {
    //VOICES FROM THE ROAD 

    const [startIndex, setStartIndex] = useState(0);

    const testimonials = [
        {
            id: 1,
            name: "ARAVIND",
            rating: 5,
            review:
                "Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
        },
        {
            id: 2,
            name: "ARAVIND",
            rating: 5,
            review:
                "2 Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
        },
        {
            id: 3,
            name: "ARAVIND",
            rating: 5,
            review:
                "3 Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
            featured: true,
        },
        {
            id: 4,
            name: "ARAVIND",
            rating: 4,
            review:
                " 4 Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
        },
        {
            id: 5,
            name: "ARAVIND",
            rating: 5,
            review:
                " 5 Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
        },
        // {
        //     id: 6,
        //     name: "ARAVIND",
        //     rating: 5,
        //     review:
        //         " 6 Boosted visibility across cities, attracted strong attention, and increased inquiries through the LED roadshow campaign.",
        // },

    ];

    const nextSlide = () => {
        setStartIndex((prev) =>
            prev + 1 >= testimonials.length ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        setStartIndex((prev) =>
            prev === 0 ? testimonials.length - 1 : prev - 1
        );
    };

    const visibleCards = testimonials
        .slice(startIndex)
        .concat(testimonials.slice(0, startIndex))
        .slice(0, 5);



    return (
        <>
            {/* <div className='px-30 mx-auto'>
                <div className="RS_OurRdwHeading">
                    <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2 RS_VFRHeading">Voices From The Road</div>
                </div>
            </div> */}


            {/* <section className="w-full px-4 lg:px-12 py-12 bg-[#f8f8f8]"> */}
            <section className="w-full px-4 lg:px-12 py-12 bg-[#f8f8f8]">

                {/* <h2 className="text-3xl lg:text-5xl font-semibold text-[#B22222] mb-10">
                    Voices From The Road
                </h2> */}
                <div className="RS_OurRdwHeading">
                    <div className="RS_OurRdwHeadingContent1 RS_OurRdwHeadingContent2 RS_VFRHeading text-3xl lg:text-5xl">Voices From The Road</div>
                </div>
                {/* Desktop */}
                <div className="hidden lg:grid grid-cols-[1fr_1fr_2fr_1fr_1fr] gap-6">
                    {visibleCards.map((item, index) => (
                        <div
                            key={item.id}
                            className={`bg-white rounded-[24px] p-5 shadow-sm flex flex-col justify-between
            ${index === 2
                                    ? "min-h-[400px] scale-[1.02]"
                                    : "min-h-[400px]"
                                }`}
                        >
                            <div>
                                <p
                                    className={`text-[#111] leading-relaxed ${index === 2
                                        ? "text-[20px]"
                                        : "text-[14px]"
                                        }`}
                                >
                                    {item.review}
                                </p>

                                <div className="flex items-center gap-1 mt-6">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={18}
                                            fill={
                                                i < item.rating
                                                    ? "#F5B301"
                                                    : "#d1d5db"
                                            }
                                            color={
                                                i < item.rating
                                                    ? "#F5B301"
                                                    : "#d1d5db"
                                            }
                                        />
                                    ))}

                                    <span className="ml-2 text-sm">
                                        {item.rating}.0
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 mt-10">
                                <UserCircle2 size={42} />
                                <span className="tracking-wide font-medium">
                                    {item.name}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Slider */}
                <div className="lg:hidden flex overflow-x-auto gap-4 snap-x">
                    {testimonials.map((item) => (
                        <div
                            key={item.id}
                            className="min-w-[300px] bg-white rounded-[24px] p-5 shadow-sm snap-center"
                        >
                            <p className="text-sm leading-relaxed">
                                {item.review}
                            </p>

                            <div className="flex items-center gap-1 mt-4">
                                {[...Array(5)].map((_, i) => (
                                    <Star
                                        key={i}
                                        size={16}
                                        fill={
                                            i < item.rating
                                                ? "#F5B301"
                                                : "#d1d5db"
                                        }
                                        color={
                                            i < item.rating
                                                ? "#F5B301"
                                                : "#d1d5db"
                                        }
                                    />
                                ))}

                                <span className="ml-2 text-sm">
                                    {item.rating}.0
                                </span>
                            </div>

                            <div className="flex items-center gap-3 mt-8">
                                <UserCircle2 size={36} />
                                <span>{item.name}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Controls */}
                <div className="flex justify-end gap-4 mt-8">
                    <button
                        onClick={prevSlide}
                        className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
                    >
                        <ChevronLeft />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition"
                    >
                        <ChevronRight />
                    </button>
                </div>
            </section>

        </>
    )
}

export default HomePageSection2