/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import "./HomeBanner.css";

import SplitHeading from "@/components/motion/SplitHeading";
import {
  DISTANCE,
  DURATION,
  STAGGER,
  fadeIn,
  fadeScale,
  staggerContainer,
} from "@/components/motion/motionTokens";

const bannerItems = [
    {
        id: 1,
        image: "./images/assets/HomeBanner_MainPageFinal.png",
        title: "2 Sided Led",
    },
    {
        id: 2,
        image: "./images/assets/tata ultra - 2.png",
        title: "3 Sided 17ft",
    },
    {
        id: 3,
        image: "./images/assets/fab_Led_edited.png",
        title: "Hybrid Flex",
    },
    {
        id: 4,
        image: "./images/assets/single side edited (1)_NEW.png",
        title: "Single Side 19ft",
    },
    {
        id: 5,
        image: "./images/assets/full side LED edited (1)_NEW.png",
        title: "3 Sided 19ft",
    },
];

function HomeBanner() {
    const ANIMATION_DURATION = 700;

    // First image shown initially
    const [activeIdx, setActiveIdx] = useState(0);
    const [currentImg, setCurrentImg] = useState(bannerItems[0].image);
    const [previousImg, setPreviousImg] = useState(null);

    const timeoutRef = useRef(null);

    // Preload all banner images to avoid flicker/conflict on click
    useEffect(() => {
        bannerItems.forEach((item) => {
            const img = new Image();
            img.src = item.image;
        });

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleSubClick = (item, idx) => {
        if (idx === activeIdx) return;

        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }

        // Keep old image visible while new image comes in
        setPreviousImg(currentImg);
        setCurrentImg(item.image);
        setActiveIdx(idx);

        timeoutRef.current = setTimeout(() => {
            setPreviousImg(null);
        }, ANIMATION_DURATION);
    };

    return (
        <>
            <div className="HomeBannerContainer">
                {/* Heading — reveals word by word, each rising from behind a mask */}
                <SplitHeading className="HomeBannerText">
                    Take{" "}
                    <span className="HomeBannerTextSpan">
                        Your Brand
                    </span>{" "}
                    to the Streets
                </SplitHeading>

                {/* Sub-text image */}
                <motion.div
                    initial={{ opacity: 0, y: DISTANCE.sm }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: DURATION.base,
                        delay: 0.35,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                >
                    <img
                        src="./images/assets/BannerTextImg.png"
                        alt="Roadshow Logo"
                        className="HomeBannerTextImg"
                    />
                </motion.div>

                {/* Image section.

                    data-speed is a GSAP ScrollSmoother effect (enabled via
                    `effects: true` in GlobalSmoothScroll) — below 1 the block
                    drifts slightly slower than the page for a little depth.

                    It lives on the OUTER container on purpose: ScrollSmoother
                    writes `transform` on whatever carries data-speed, and the
                    inner wrapper's scale-in is written by framer-motion. Both
                    on one element and they would fight over the same property. */}
                <div
                    className="HomeBannerImgContainer"
                    data-speed="0.92"
                >
                    {/* Main image smooth crossfade */}
                    <motion.div
                        className="HomeBannerMainImgWrapper"
                        variants={fadeScale(0.96, DURATION.slow)}
                        initial="hidden"
                        animate="visible"
                    >
                        {previousImg && (
                            <img
                                src={previousImg}
                                alt="Previous Banner"
                                className="HomeBannerMainImg HomeBannerPrevImg"
                                draggable="false"
                            />
                        )}

                        <img
                            key={currentImg}
                            src={currentImg}
                            alt="Main Banner"
                            className="HomeBannerMainImg HomeBannerCurrentImg"
                            draggable="false"
                        />
                    </motion.div>

                    {/* Sub images.

                        The row and its items become motion elements in place
                        rather than gaining wrappers — .HomeBannerSubImgRow is a
                        flex container whose `gap` applies to its direct
                        children, so an inserted wrapper would change the
                        spacing. */}
                    <motion.div
                        className="HomeBannerSubImgRow"
                        variants={staggerContainer(
                            STAGGER.base,
                            0.5
                        )}
                        initial="hidden"
                        animate="visible"
                    >
                        {bannerItems.map((item, idx) => (
                            <motion.div
                                key={item.id}
                                className="HomeBannerSubImgMain"
                                variants={fadeIn(
                                    "up",
                                    DISTANCE.sm
                                )}
                            >
                                <button
                                    type="button"
                                    onClick={() => handleSubClick(item, idx)}
                                    className={`HomeBannerSubImgBtn ${
                                        activeIdx === idx ? "active" : ""
                                    }`}
                                    aria-label={`Show ${item.title}`}
                                >
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="HomeBannerSubImg"
                                        draggable="false"
                                    />

                                    <div className="HomeBannerSubImgTitle">
                                        {item.title}
                                    </div>
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </div>

            {/* Offers section */}
        </>
    );
}

export default HomeBanner;
