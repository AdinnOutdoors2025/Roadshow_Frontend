/* eslint-disable */
// @ts-nocheck
"use client";
import React, { useState } from 'react';
import './HomeBanner.css';
// import OffersSection from '../HomePageSections/HomePageSection1';
const subImages = [
    // './images/assets/BannerSubImg1.png',
    // './images/assets/BannerSubImg2.png',
    // './images/assets/BannerSubImg3.png',
    // './images/assets/BannerSubImg4.png',
    './images/assets/HomeBanner_MainPageFinal.png', // 2 sided led - ok
    './images/assets/tata ultra - 2.png', // 3 sided 17ft (with door) - ok
    // './images/assets/full side LED.png',  // 3 sided 19ft () - ok
    './images/assets/single side.png', // 19ft single side - ok
    // './images/assets/full side LED edited.png', // OKAY BUT BACKGROUND SHADOWN REMOVE
    // './images/assets/WhatsApp Image 2026-06-09 at 6.53.18 PM.jpeg',
    // './images/assets/WhatsApp Image 2026-06-09 at 6.53.23 PM.jpeg',
    // './images/assets/fab led edited.png', // fabricated (hybrid flex) 7 X 5 - ok
    './images/assets/fab_Led_edited.png', // fabricated (hybrid flex) 7 X 5 - ok
    './images/assets/full_side_LED_edited.png', // fabricated (hybrid flex) 7 X 5 - ok 

];

const subImagesWithTitle = [
    {
        id: 1,
        image: './images/assets/HomeBanner_MainPageFinal.png', // 2 sided led - ok
        title: '2 Sided Led'
    },
    {
        id: 2,
        image: './images/assets/tata ultra - 2.png', // 3 sided 17ft (with door) - ok
        title: ' 3 Sided 17ft'
    },
    {
        id: 3,
        image: './images/assets/fab_Led_edited.png', // fabricated (hybrid flex) 7 X 5 - ok
        title: 'Hybrid Flex'
    },
    {
        id: 4,
        image: './images/assets/single side edited (1)_NEW.png', // 19ft single side - ok single side edited (1)_NEW
        title: ' 3 Sided 19ft'
    },
    
    {
        id: 5,
        image: './images/assets/full side LED edited (1)_NEW.png', // fabricated (hybrid flex) 7 X 5 - ok
        title: 'Full Side Led'
    }
];

function HomeBanner() {
    const [mainImg, setMainImg] = useState('./images/assets/tata ultra - 2.png');
    const [fadeKey, setFadeKey] = useState(0); // changing key re-triggers CSS animation
    const [activeIdx, setActiveIdx] = useState<number | null>(null);

    const handleSubClick = (src: string, idx: number) => {
        setMainImg(src);
        setFadeKey(prev => prev + 1); // triggers re-mount / re-animation
        setActiveIdx(idx);
    };

    return (
        <>
            <div className='HomeBannerContainer'>
                {/* Heading */}
                <div className='HomeBannerText'>
                    Take <span className='HomeBannerTextSpan'>Your Brand</span> to the Streets
                </div>

                {/* Sub-text image */}
                <div>
                    <img
                        src="./images/assets/BannerTextImg.png"
                        alt="Roadshow Logo"
                        className='HomeBannerTextImg'
                    />
                </div>

                {/* Image section */}
                <div className='HomeBannerImgContainer'>
                    {/* Main image with fade-in on swap */}
                    <div className="HomeBannerMainImgWrapper">
                        <img
                            key={fadeKey}
                            src={mainImg}
                            alt="Main Banner"
                            className="HomeBannerMainImg"
                        />
                    </div>

                    {/* Sub images */}
                    <div className="HomeBannerSubImgRow">
                        {subImagesWithTitle.map((src, idx) => (
                            <div  key={idx} className='HomeBannerSubImgMain'>
                            <button
                               
                                onClick={() => handleSubClick(src.image, idx)}
                                className={`HomeBannerSubImgBtn ${activeIdx === idx ? 'active' : ''}`}
                                aria-label={`Show image ${idx + 1}`}
                            >
                                <img
                                    src={src.image}
                                    alt={`Sub image ${idx + 1}`}
                                    className="HomeBannerSubImg"
                                />
                               <div className='HomeBannerSubImgTitle'> {src.title}</div>
                            </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Offers section  */}

        </>

    );
}

export default HomeBanner;