// "use client";
// import React, { useState, useEffect } from 'react';
// import './HomeBanner.css';

// function HomeBanner() {
//     return (
//         <div className='HomeBannerContainer'>
//             <div className='HomeBannerText'> Take <span className='HomeBannerTextSpan'>Your Brand</span> to the Streets
//             </div>
//             <div >
//                 <img src="./images/assets/BannerTextImg.png" alt="Roadshow Logo" className='HomeBannerTextImg' />
//             </div>
//             <div className='HomeBannerImgContainer'>
//                 <div> <img src="./images/assets/BannerMainImg.png" alt="Roadshow Logo" /></div>
//                 <div style={{ display: 'flex', gap: '20px', marginTop: '20px', justifyContent: 'center' }}>
//                     <div>
//                         <img src="./images/assets/BannerSubImg1.png" alt="Roadshow Logo" />
//                     </div>
//                     <div>
//                         <img src="./images/assets/BannerSubImg2.png" alt="Roadshow Logo" />

//                     </div> <div>
//                         <img src="./images/assets/BannerSubImg3.png" alt="Roadshow Logo" />

//                     </div> <div>
//                         <img src="./images/assets/BannerSubImg4.png" alt="Roadshow Logo" />

//                     </div>
//                 </div>
//             </div>
//         </div>
//     )
// }
// export default HomeBanner;


"use client";
import React, { useState } from 'react';
import './HomeBanner.css';
import OffersSection from '../HomePageSections/HomePageSection1';
const subImages = [
    './images/assets/BannerSubImg1.png',
    './images/assets/BannerSubImg2.png',
    './images/assets/BannerSubImg3.png',
    './images/assets/BannerSubImg4.png',
];

function HomeBanner() {
    const [mainImg, setMainImg] = useState('./images/assets/BannerMainImg.png');
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
                    {subImages.map((src, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSubClick(src, idx)}
                            className={`HomeBannerSubImgBtn ${activeIdx === idx ? 'active' : ''}`}
                            aria-label={`Show image ${idx + 1}`}
                        >
                            <img
                                src={src}
                                alt={`Sub image ${idx + 1}`}
                                className="HomeBannerSubImg"
                            />
                        </button>
                    ))}
                </div>
            </div>
        </div>
        {/* Offers section  */}
        <OffersSection />

        </>

    );
}

export default HomeBanner;