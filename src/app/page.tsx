"use client";

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Navbar from '../components/Client/Reusable_Components/Navbar';
import Footer from '@/components/Client/Reusable_Components/Footer';
import HomeBanner from '@/components/Client/HomeBanner/HomeBanner';
import HomePageSection1 from '@/components/Client/HomePageSections/HomePageSection1';
import GlobalSmoothScroll from '@/components/GlobalSmoothScroll';

/* adinnroadshows.com's own production build (verified via its served HTML)
   serves this exact same file to every visitor, not just iOS — the name is
   legacy, the encoding is just broadly compatible. Matching that instead of
   guessing at per-device source-swapping. */
const LOADER_VIDEO_SRC = '/images/assets/Rdsw_Web_images/loader-ios.mp4';
const LOADER_POSTER_SRC = '/images/assets/Rdsw_Web_images/loader-poster.png';
const LOADER_MIN_DURATION_MS = 2000;

/* The homepage lives at the app root, NOT under src/app/roadshow/layout.tsx,
   so it does not inherit that layout's GlobalSmoothScroll and has to mount
   its own. Navbar portals itself to document.body, so it escapes
   #smooth-content's transform regardless of where it sits here. */
export default function MainPage() {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [showLoader, setShowLoader] = useState(true);
    const [videoBlocked, setVideoBlocked] = useState(false);

    useEffect(() => {
        const loaderTimer = window.setTimeout(() => {
            setShowLoader(false);
        }, LOADER_MIN_DURATION_MS);

        return () => {
            window.clearTimeout(loaderTimer);
        };
    }, []);

    /* iOS Safari only allows autoplay when muted/playsInline are already set
       BEFORE play() is called, so those are forced here rather than relying
       on the JSX attributes alone.

       Wrapped in useCallback so the function identity is stable across
       re-renders — an inline arrow here gets recreated every render, and
       React detaches + reattaches a changed ref callback on every one of
       those. `src` is a plain JSX attribute below (not set here) precisely
       so it isn't at the mercy of that: an earlier version assigned
       node.src imperatively in this callback, and each unnecessary
       reattach reassigned it, which per the HTML spec restarts the media
       load algorithm from scratch — any re-render during the loader window
       silently restarted the video, which is what showed up as a blank
       black screen instead of the loader clip. */
    const setLoaderVideoRef = useCallback(
        (node: HTMLVideoElement | null) => {
            videoRef.current = node;

            if (!node) return;

            node.muted = true;
            node.defaultMuted = true;
            node.playsInline = true;
            node.controls = false;

            node.setAttribute('muted', '');
            node.setAttribute('playsinline', '');
            node.setAttribute('webkit-playsinline', '');
        },
        []
    );

    useEffect(() => {
        if (!showLoader) return;

        const video = videoRef.current;
        if (!video) return;

        let cancelled = false;

        const playVideo = async () => {
            try {
                video.muted = true;
                video.defaultMuted = true;
                video.playsInline = true;

                video.setAttribute('muted', '');
                video.setAttribute('playsinline', '');
                video.setAttribute('webkit-playsinline', '');

                video.currentTime = 0;
                await video.play();
            } catch {
                if (!cancelled) {
                    setVideoBlocked(true);
                }
            }
        };

        if (video.readyState >= 2) {
            playVideo();
        } else {
            video.addEventListener('loadeddata', playVideo, { once: true });
        }

        return () => {
            cancelled = true;
            video.removeEventListener('loadeddata', playVideo);
        };
    }, [showLoader]);

    if (showLoader) {
        return (
            <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#030303]">
                {!videoBlocked ? (
                    <video
                        ref={setLoaderVideoRef}
                        src={LOADER_VIDEO_SRC}
                        poster={LOADER_POSTER_SRC}
                        autoPlay
                        muted
                        playsInline
                        loop
                        preload="auto"
                        disablePictureInPicture
                        controls={false}
                        onError={() => setVideoBlocked(true)}
                        className="pointer-events-none h-auto max-h-[72vh] w-[78vw] max-w-[920px] object-contain md:w-[85vw]"
                    />
                ) : (
                    <img
                        src={LOADER_POSTER_SRC}
                        alt="Loading"
                        className="h-auto max-h-[72vh] w-[78vw] max-w-[920px] object-contain md:w-[85vw]"
                    />
                )}
            </div>
        );
    }

    return (
        <GlobalSmoothScroll>
            <div>
                <div style={{ background: 'linear-gradient(180deg, #D2D2FF 0%, #FFFFFF 100%)' }}>
                    <Navbar />
                    <HomeBanner />
                </div>
                {/* Offers section  */}
                <HomePageSection1 />
                <Footer />
            </div>
        </GlobalSmoothScroll>
    );
}
