/* eslint-disable */
// @ts-nocheck
"use client";

import React, { useEffect, useRef, useState } from "react";
import "./HomeBanner.css";

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
        title: "3 Sided 19ft",
    },
    {
        id: 5,
        image: "./images/assets/full side LED edited (1)_NEW.png",
        title: "Full Side Led",
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
                {/* Heading */}
                <div className="HomeBannerText">
                    Take{" "}
                    <span className="HomeBannerTextSpan">
                        Your Brand
                    </span>{" "}
                    to the Streets
                </div>

                {/* Sub-text image */}
                <div>
                    <img
                        src="./images/assets/BannerTextImg.png"
                        alt="Roadshow Logo"
                        className="HomeBannerTextImg"
                    />
                </div>

                {/* Image section */}
                <div className="HomeBannerImgContainer">
                    {/* Main image smooth crossfade */}
                    <div className="HomeBannerMainImgWrapper">
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
                    </div>

                    {/* Sub images */}
                    <div className="HomeBannerSubImgRow">
                        {bannerItems.map((item, idx) => (
                            <div key={item.id} className="HomeBannerSubImgMain">
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
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Offers section */}
        </>
    );
}

export default HomeBanner;