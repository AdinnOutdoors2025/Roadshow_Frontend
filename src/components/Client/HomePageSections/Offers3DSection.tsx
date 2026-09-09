// /* eslint-disable */
// // @ts-nocheck
// "use client";

// /* =========================================================
//    OFFERS — scroll-driven 3D carousel ("roadshow drum")
//    -----------------------------------------------------------
//    The section pins in place while the page scrolls through it,
//    and that scroll progress directly drives the rotation of a
//    3D drum of hoarding cards — scroll down and the drum turns
//    one way, scroll back up and it turns the opposite way,
//    because rotation is just a direct function of scroll
//    position (no separate "up" logic needed — reversing scroll
//    naturally reverses the rotation).

//    The layout is fully count-driven: the angle between cards
//    and the drum's radius are both derived from cities.length,
//    so dropping to 5 cities or growing to 12+ re-spaces itself
//    automatically — nothing to hand-tune.

//    Still no three.js / .glb here — this is CSS 3D transforms
//    (perspective + rotateY + translateZ) driven by Framer
//    Motion's scroll values, which gives a real 3D drum without
//    a WebGL dependency or a binary model asset to ship.
// ========================================================= */

// import React, { useMemo, useRef } from "react";
// import {
//   motion,
//   useScroll,
//   useTransform,
//   useReducedMotion,
// } from "framer-motion";

// import "./Offers3DSection.css";

// /* Add / remove cities freely — angle & radius adjust on their own. */
// const cities = [
//   { name: "Chennai", icon: "./images/assets/Offers_Chennai.png", hasOffer: true, offer: "Flat 20% off hoarding slots" },
//   { name: "Madurai", icon: "./images/assets/Offers_Madurai.png", hasOffer: false },
//   { name: "Coimbatore", icon: "./images/assets/Offers_Cbe.png", hasOffer: true, offer: "2 boards, 1 price" },
//   { name: "Thrissur", icon: "./images/assets/Offers_Thrissur.png", hasOffer: false },
//   { name: "Kollam", icon: "./images/assets/Offers_Kollam.png", hasOffer: true, offer: "2 free weeks on 3-month bookings" },
//   { name: "Bengaluru", icon: "./images/assets/Offers_Bglr.png", hasOffer: true, offer: "Launch pricing for new advertisers" },
//   { name: "Theni", icon: "./images/assets/Offers_Theni.png", hasOffer: false },
//   { name: "Vellore", icon: "./images/assets/Offers_Vellore.png", hasOffer: true, offer: "Festive slot upgrade, no extra cost" },
//   { name: "Trichy", icon: "./images/assets/Offers_Chennai.png", hasOffer: false },
//   { name: "Salem", icon: "./images/assets/Offers_Madurai.png", hasOffer: false },
// ];

// const CARD_WIDTH = 260;
// const MIN_RADIUS = 380;

// function HoardingCard({ city }) {
//   return (
//     <div className={"OffersCard" + (city.hasOffer ? " OffersCard--live" : " OffersCard--quiet")}>
//       <div className="OffersCardTop">
//         <div className="OffersCardIconRing">
//           <img src={city.icon} alt={city.name} className="OffersCardIcon" />
//         </div>
//       </div>

//       <div className="OffersCardBody">
//         <div className="OffersCardName">{city.name}</div>

//         {city.hasOffer ? (
//           <div className="OffersCardStrip OffersCardStrip--live">
//             <span className="OffersLiveDot" />
//             {city.offer}
//           </div>
//         ) : (
//           <div className="OffersCardStrip OffersCardStrip--quiet">
//             No offer running
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default function Offers3DSection() {
//   const wrapRef = useRef(null);
//   const prefersReducedMotion = useReducedMotion();
//   const count = cities.length;
//   const liveCount = cities.filter((c) => c.hasOffer).length;

//   const anglePerCard = 360 / count;
//   const radius = useMemo(() => {
//     const computed = Math.round(
//       (CARD_WIDTH / 2) / Math.tan(Math.PI / count),
//     );
//     return Math.max(computed, MIN_RADIUS);
//   }, [count]);

//   /* One full loop of the drum spans the pinned scroll distance. */
//   const pinVh = Math.min(600, Math.max(260, count * 55));

//   const { scrollYProgress } = useScroll({
//     target: wrapRef,
//     offset: ["start start", "end end"],
//   });

//   const rotateY = useTransform(scrollYProgress, [0, 1], [0, -360]);

//   return (
//     <section className="OffersSection">
//       <div className="OffersHeadingRow">
//         <h2 className="OffersHeading">Offers</h2>

//         <div className="OffersLivePill">
//           <span className="OffersLiveDot" />
//           {liveCount} of {count} cities live right now
//         </div>
//       </div>

//       <p className="OffersSubtext">
//         Keep scrolling — the board turns with you. Scroll back up and
//         it turns right back the way it came.
//       </p>

//       {prefersReducedMotion ? (
//         <div className="OffersStaticGrid">
//           {cities.map((city) => (
//             <HoardingCard key={city.name} city={city} />
//           ))}
//         </div>
//       ) : (
//         <div
//           className="OffersCarouselWrap"
//           ref={wrapRef}
//           style={{ height: `${pinVh}vh` }}
//         >
//           <div className="OffersCarouselSticky">
//             <div
//               className="OffersCarouselStage"
//               style={{ perspective: radius * 2.6 }}
//             >
//               <motion.div
//                 className="OffersCarouselDrum"
//                 style={{ rotateY }}
//               >
//                 {cities.map((city, i) => (
//                   <div
//                     key={city.name}
//                     className="OffersCarouselSlot"
//                     style={{
//                       transform: `rotateY(${anglePerCard * i}deg) translateZ(${radius}px)`,
//                     }}
//                   >
//                     <HoardingCard city={city} />
//                   </div>
//                 ))}
//               </motion.div>
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }




// /* eslint-disable */
// // @ts-nocheck
// "use client";

// import React, {
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";

// import {
//   motion,
//   useMotionValueEvent,
//   useReducedMotion,
//   useScroll,
//   useTransform,
// } from "framer-motion";

// import "./Offers3DSection.css";

// /* =========================================================
//    CITY DATA
// ========================================================= */

// const cities = [
//   {
//     name: "Chennai",
//     icon: "/images/assets/Offers_Chennai.png",
//     hasOffer: true,
//     offer: "Flat 20% off roadshow slots",
//   },

//   {
//     name: "Madurai",
//     icon: "/images/assets/Offers_Madurai.png",
//     hasOffer: false,
//   },

//   {
//     name: "Coimbatore",
//     icon: "/images/assets/Offers_Cbe.png",
//     hasOffer: true,
//     offer: "2 campaign slots, 1 special price",
//   },

//   {
//     name: "Thrissur",
//     icon: "/images/assets/Offers_Thrissur.png",
//     hasOffer: false,
//   },

//   {
//     name: "Kollam",
//     icon: "/images/assets/Offers_Kollam.png",
//     hasOffer: true,
//     offer: "Extra campaign period on select bookings",
//   },

//   {
//     name: "Bengaluru",
//     icon: "/images/assets/Offers_Bglr.png",
//     hasOffer: true,
//     offer: "Special launch pricing available",
//   },

//   {
//     name: "Theni",
//     icon: "/images/assets/Offers_Theni.png",
//     hasOffer: false,
//   },

//   {
//     name: "Vellore",
//     icon: "/images/assets/Offers_Vellore.png",
//     hasOffer: true,
//     offer: "Festive campaign upgrade available",
//   },

//   {
//     name: "Trichy",
//     icon: "/images/assets/Offers_Chennai.png",
//     hasOffer: false,
//   },

//   {
//     name: "Salem",
//     icon: "/images/assets/Offers_Madurai.png",
//     hasOffer: false,
//   },
// ];

// /* =========================================================
//    RESPONSIVE LAYOUT HOOK

//    Important:
//    card width used here = same card width used in CSS.

//    This fixes the earlier radius mismatch.
// ========================================================= */

// function useOffersLayout() {
//   const [width, setWidth] =
//     useState(1440);

//   useEffect(() => {
//     const update = () => {
//       setWidth(
//         window.innerWidth,
//       );
//     };

//     update();

//     window.addEventListener(
//       "resize",
//       update,
//     );

//     return () =>
//       window.removeEventListener(
//         "resize",
//         update,
//       );
//   }, []);

//   return useMemo(() => {
//     /* =====================================================
//        MOBILE
//     ===================================================== */

//     if (width < 768) {
//       return {
//         width,
//         cardWidth: 190,
//         minRadius: 280,
//         stageHeight: 320,

//         /*
//           Mobile won't use pinned
//           drum. Horizontal snap instead.
//         */

//         scrollPerCard: 0,
//         usePinned: false,
//       };
//     }

//     /* =====================================================
//        TABLET
//        768 - 991
//     ===================================================== */

//     if (width < 992) {
//       return {
//         width,
//         cardWidth: 200,
//         minRadius: 300,
//         stageHeight: 350,
//         scrollPerCard: 95,
//         usePinned: true,
//       };
//     }

//     /* =====================================================
//        SMALL DESKTOP
//        992 - 1279

//        THIS IS THE IMPORTANT RANGE.
//        Shorter pin distance so no huge
//        empty scroll area.
//     ===================================================== */

//     if (width < 1280) {
//       return {
//         width,
//         cardWidth: 220,
//         minRadius: 330,
//         stageHeight: 390,

//         /*
//           9 movements × 110px
//           = only ~990px extra scroll
//           for 10 cities.
//         */

//         scrollPerCard: 110,
//         usePinned: true,
//       };
//     }

//     /* =====================================================
//        MEDIUM DESKTOP
//        1280 - 1439
//     ===================================================== */

//     if (width < 1440) {
//       return {
//         width,
//         cardWidth: 240,
//         minRadius: 360,
//         stageHeight: 420,
//         scrollPerCard: 130,
//         usePinned: true,
//       };
//     }

//     /* =====================================================
//        LARGE DESKTOP

//        Large desktop visual size
//        remains bigger.
//     ===================================================== */

//     return {
//       width,
//       cardWidth: 260,
//       minRadius: 390,
//       stageHeight: 460,
//       scrollPerCard: 145,
//       usePinned: true,
//     };
//   }, [width]);
// }

// /* =========================================================
//    LIVE DOT
// ========================================================= */

// function LiveDot() {
//   return (
//     <span className="OffersLiveDot" />
//   );
// }

// /* =========================================================
//    CITY CARD
// ========================================================= */

// function HoardingCard({
//   city,
//   active = false,
// }) {
//   return (
//     <div
//       className={[
//         "OffersCard",

//         city.hasOffer
//           ? "OffersCard--live"
//           : "OffersCard--quiet",

//         active
//           ? "OffersCard--active"
//           : "",
//       ]
//         .filter(Boolean)
//         .join(" ")}
//     >
//       {/* =================================================
//           IMAGE
//       ================================================= */}

//       <div className="OffersCardTop">
//         <span className="OffersCardTopGlow" />

//         {city.hasOffer && (
//           <div className="OffersCardOfferBadge">
//             <LiveDot />

//             LIVE
//           </div>
//         )}

//         <div className="OffersCardIconRing">
//           <img
//             src={city.icon}
//             alt={city.name}
//             className="OffersCardIcon"
//           />
//         </div>
//       </div>

//       {/* =================================================
//           BODY
//       ================================================= */}

//       <div className="OffersCardBody">
//         <div className="OffersCardCityLabel">
//           CITY
//         </div>

//         <div className="OffersCardName">
//           {city.name}
//         </div>

//         {city.hasOffer ? (
//           <div className="OffersCardStrip OffersCardStrip--live">
//             <LiveDot />

//             <span>
//               {city.offer}
//             </span>
//           </div>
//         ) : (
//           <div className="OffersCardStrip OffersCardStrip--quiet">
//             No offer running
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// /* =========================================================
//    MOBILE / REDUCED MOTION
// ========================================================= */

// function OffersStatic({
//   activeIndex,
//   setActiveIndex,
// }) {
//   return (
//     <div className="OffersStaticGrid">
//       {cities.map(
//         (city, index) => (
//           <button
//             type="button"
//             key={city.name}
//             className="OffersStaticItem"
//             onClick={() =>
//               setActiveIndex(
//                 index,
//               )
//             }
//           >
//             <HoardingCard
//               city={city}
//               active={
//                 activeIndex ===
//                 index
//               }
//             />
//           </button>
//         ),
//       )}
//     </div>
//   );
// }

// /* =========================================================
//    MAIN SECTION
// ========================================================= */

// export default function Offers3DSection() {
//   const wrapRef =
//     useRef(null);

//   const prefersReducedMotion =
//     useReducedMotion();

//   const layout =
//     useOffersLayout();

//   const count =
//     cities.length;

//   const liveCount =
//     cities.filter(
//       (city) =>
//         city.hasOffer,
//     ).length;

//   const [
//     activeIndex,
//     setActiveIndex,
//   ] = useState(0);

//   /* =====================================================
//      ANGLE
//   ===================================================== */

//   const anglePerCard =
//     360 / count;

//   /* =====================================================
//      RESPONSIVE DRUM RADIUS

//      Earlier:
//      always based on 260px.

//      Now:
//      actual responsive cardWidth.
//   ===================================================== */

//   const radius =
//     useMemo(() => {
//       const calculated =
//         Math.round(
//           (layout.cardWidth /
//             2) /
//             Math.tan(
//               Math.PI /
//                 count,
//             ),
//         );

//       return Math.max(
//         calculated,
//         layout.minRadius,
//       );
//     }, [
//       count,
//       layout.cardWidth,
//       layout.minRadius,
//     ]);

//   /* =====================================================
//      FIX FOR EMPTY SCROLL SPACE

//      OLD:
//      10 cities = 550vh ❌

//      NEW SMALL DESKTOP:
//      9 × 110px = 990px extra scroll ✅

//      Wrapper becomes:
//      viewport height + real animation distance.
//   ===================================================== */

//   const scrollDistance =
//     Math.max(
//       0,
//       (count - 1) *
//         layout.scrollPerCard,
//     );

//   /* =====================================================
//      SCROLL
//   ===================================================== */

//   const {
//     scrollYProgress,
//   } = useScroll({
//     target: wrapRef,

//     offset: [
//       "start start",
//       "end end",
//     ],
//   });

//   /*
//     Don't perform a complete 360°.

//     If we rotate exactly 360°, final
//     city becomes first city again.

//     Instead:

//     0
//       Chennai

//     -36
//       Madurai

//     ...

//     -324
//       Salem

//     That means each city gets exactly
//     one front-facing stop.
//   */

//   const totalRotation =
//     -anglePerCard *
//     (count - 1);

//   const rotateY =
//     useTransform(
//       scrollYProgress,
//       [0, 1],
//       [0, totalRotation],
//     );

//   /* =====================================================
//      CURRENT CITY FROM SCROLL
//   ===================================================== */

//   useMotionValueEvent(
//     scrollYProgress,
//     "change",
//     (progress) => {
//       if (
//         prefersReducedMotion ||
//         !layout.usePinned
//       ) {
//         return;
//       }

//       const nextIndex =
//         Math.min(
//           count - 1,
//           Math.max(
//             0,
//             Math.round(
//               progress *
//                 (count - 1),
//             ),
//           ),
//         );

//       setActiveIndex(
//         nextIndex,
//       );
//     },
//   );

//   const activeCity =
//     cities[activeIndex];

//   /* =====================================================
//      CSS VARIABLES

//      JS + CSS always use same sizes.
//   ===================================================== */

//   const cssVariables = {
//     "--offers-card-width":
//       `${layout.cardWidth}px`,

//     "--offers-stage-height":
//       `${layout.stageHeight}px`,

//     "--offers-radius":
//       `${radius}px`,
//   };

//   return (
//     <section
//       className="OffersSection"
//       style={cssVariables}
//     >
//       {/* =================================================
//           INTRO
//       ================================================= */}

//       <div className="OffersIntro">
//         <div className="OffersHeadingRow">
//           <div>
//             <span className="OffersEyebrow">
//               CITY SPECIAL OFFERS
//             </span>

//             <h2 className="OffersHeading">
//               Offers
//             </h2>
//           </div>

//           <div className="OffersLivePill">
//             <LiveDot />

//             {liveCount} of{" "}
//             {count} cities
//             currently live
//           </div>
//         </div>

//         <p className="OffersSubtext">
//           Scroll to explore city
//           campaigns. The 3D drum
//           follows your scroll
//           direction naturally.
//         </p>
//       </div>

//       {/* =================================================
//           ACTIVE CITY VISUAL

//           Gives the section a bigger
//           city-related image instead
//           of only small cards.
//       ================================================= */}

//       <div className="OffersActiveCityBackdrop">
//         <motion.img
//           key={
//             activeCity.name
//           }
//           src={
//             activeCity.icon
//           }
//           alt=""
//           initial={{
//             opacity: 0,
//             y: 12,
//             scale: 0.9,
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//             scale: 1,
//           }}
//           transition={{
//             duration: 0.4,
//             ease: [
//               0.22,
//               1,
//               0.36,
//               1,
//             ],
//           }}
//         />

//         <motion.div
//           key={`${activeCity.name}-info`}
//           className="OffersActiveCityInfo"
//           initial={{
//             opacity: 0,
//             y: 8,
//           }}
//           animate={{
//             opacity: 1,
//             y: 0,
//           }}
//           transition={{
//             duration: 0.3,
//           }}
//         >
//           <span>
//             {String(
//               activeIndex + 1,
//             ).padStart(
//               2,
//               "0",
//             )}
//           </span>

//           <strong>
//             {activeCity.name}
//           </strong>

//           {activeCity.hasOffer ? (
//             <small className="OffersActiveOffer">
//               <LiveDot />

//               {activeCity.offer}
//             </small>
//           ) : (
//             <small>
//               No active offer
//             </small>
//           )}
//         </motion.div>
//       </div>

//       {/* =================================================
//           MOBILE / REDUCED MOTION
//       ================================================= */}

//       {prefersReducedMotion ||
//       !layout.usePinned ? (
//         <OffersStatic
//           activeIndex={
//             activeIndex
//           }
//           setActiveIndex={
//             setActiveIndex
//           }
//         />
//       ) : (
//         /* =================================================
//            PINNED CAROUSEL

//            IMPORTANT:
//            Pixel-based animation distance,
//            not 550vh.
//         ================================================= */

//         <div
//           className="OffersCarouselWrap"
//           ref={wrapRef}
//           style={{
//             height:
//               `calc(100svh + ${scrollDistance}px)`,
//           }}
//         >
//           <div className="OffersCarouselSticky">
//             {/* =============================================
//                 SIDE PROGRESS
//             ============================================= */}

//             <div className="OffersScrollProgress">
//               <span>
//                 {String(
//                   activeIndex +
//                     1,
//                 ).padStart(
//                   2,
//                   "0",
//                 )}
//               </span>

//               <div className="OffersProgressTrack">
//                 <motion.div
//                   className="OffersProgressFill"
//                   style={{
//                     scaleY:
//                       scrollYProgress,
//                   }}
//                 />
//               </div>

//               <span>
//                 {String(
//                   count,
//                 ).padStart(
//                   2,
//                   "0",
//                 )}
//               </span>
//             </div>

//             {/* =============================================
//                 3D STAGE
//             ============================================= */}

//             <div
//               className="OffersCarouselStage"
//               style={{
//                 perspective:
//                   radius * 2.7,
//               }}
//             >
//               <motion.div
//                 className="OffersCarouselDrum"
//                 style={{
//                   rotateY,
//                 }}
//               >
//                 {cities.map(
//                   (
//                     city,
//                     index,
//                   ) => (
//                     <div
//                       key={
//                         city.name
//                       }
//                       className="OffersCarouselSlot"
//                       style={{
//                         transform:
//                           `rotateY(${
//                             anglePerCard *
//                             index
//                           }deg)
//                            translateZ(${radius}px)`,
//                       }}
//                     >
//                       <div className="OffersCardAnchor">
//                         <HoardingCard
//                           city={city}
//                           active={
//                             activeIndex ===
//                             index
//                           }
//                         />
//                       </div>
//                     </div>
//                   ),
//                 )}
//               </motion.div>

//               {/* =============================================
//                   FLOOR
//               ============================================= */}

//               <div className="OffersCarouselFloor">
//                 <span />
//               </div>
//             </div>

//             {/* =============================================
//                 SCROLL GUIDE
//             ============================================= */}

//             <div className="OffersScrollGuide">
//               <span>
//                 SCROLL
//               </span>

//               <i />

//               <span>
//                 EXPLORE
//               </span>
//             </div>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }


// /* eslint-disable */
// // @ts-nocheck
// "use client";

// import React, {
//   Suspense,
//   useEffect,
//   useRef,
//   useState,
// } from "react";

// import * as THREE from "three";

// import {
//   Canvas,
//   useFrame,
// } from "@react-three/fiber";

// import {
//   RoundedBox,
//   Text,
// } from "@react-three/drei";

// import {
//   motion,
//   AnimatePresence,
// } from "framer-motion";

// import "./Offers3DSection.css";


// /* =========================================================
//    CITY DATA
// ========================================================= */


// const cities = [
//   {
//     name:"Chennai",
//     icon:"./images/assets/Offers_Chennai.png",
//     offer:"Premium OOH locations available",
//   },

//   {
//     name:"Madurai",
//     icon:"./images/assets/Offers_Madurai.png",
//     offer:"Festival campaign offers",
//   },

//   {
//     name:"Coimbatore",
//     icon:"./images/assets/Offers_Cbe.png",
//     offer:"High visibility packages",
//   },

//   {
//     name:"Bengaluru",
//     icon:"./images/assets/Offers_Bglr.png",
//     offer:"Launch campaign offers",
//   },

//   {
//     name:"Vellore",
//     icon:"./images/assets/Offers_Vellore.png",
//     offer:"Special city packages",
//   },
// ];



// /* =========================================================
//    FLOATING LED PANEL
// ========================================================= */


// function LEDPanel({
//   city
// }){

//   const group =
//     useRef<THREE.Group>();


//   const time =
//     useRef(0);



//   useFrame(
//     (_,delta)=>{

//       time.current += delta;


//       if(!group.current)
//         return;


//       group.current.rotation.y =
//         Math.sin(
//           time.current*0.5
//         )*0.15;



//       group.current.position.y =
//         Math.sin(
//           time.current*1.2
//         )*0.08;

//     }
//   );



//   return (

//     <group
//       ref={group}
//     >


//       {/* outer glass frame */}

//       <RoundedBox

//         args={[
//           2.6,
//           1.5,
//           0.12
//         ]}

//         radius={0.08}

//         smoothness={6}

//       >


//         <meshPhysicalMaterial

//           color="#ffffff"

//           roughness={0.15}

//           transmission={0.3}

//           clearcoat={1}

//         />


//       </RoundedBox>



//       {/* LED SCREEN */}

//       <mesh
//         position={[
//           0,
//           0,
//           0.08
//         ]}
//       >

//         <planeGeometry
//           args={[
//             2.25,
//             1.05
//           ]}
//         />


//         <meshPhysicalMaterial

//           color="#dff7f5"

//           emissive="#6c63ff"

//           emissiveIntensity={0.35}

//         />

//       </mesh>




//       {/* screen content */}

//       <Text

//         position={[
//           0,
//           0.2,
//           0.12
//         ]}

//         fontSize={0.18}

//         color="#111827"

//         anchorX="center"

//       >

//         ADINN

//       </Text>



//       <Text

//         position={[
//           0,
//           -0.12,
//           0.12
//         ]}

//         fontSize={0.12}

//         color="#0f8f88"

//         anchorX="center"

//       >

//         {city.name}

//       </Text>



//       <Text

//         position={[
//           0,
//           -0.4,
//           0.12
//         ]}

//         fontSize={0.07}

//         color="#64748b"

//         anchorX="center"

//       >

//         ROADSHOW OFFERS

//       </Text>



//     </group>

//   )

// }



// /* =========================================================
//    GLASS ORB
// ========================================================= */


// function GlassOrb(){

// const ref =
// useRef();


// useFrame(
// (_,delta)=>{

//  if(ref.current){

//  ref.current.rotation.y +=
//  delta*0.15;

//  }

// }
// )



// return (

// <mesh
// ref={ref}
// >

// <icosahedronGeometry
// args={[
// 1.5,
// 4
// ]}
// />


// <meshPhysicalMaterial

// color="#8b7cf6"

// transparent

// opacity={0.18}

// roughness={0}

// transmission={1}

// clearcoat={1}

// />


// </mesh>

// )

// }





// /* =========================================================
//    PARTICLES
// ========================================================= */


// function Particles(){

// const ref =
// useRef();


// const positions =
// new Float32Array(
// 300*3
// );



// for(
// let i=0;
// i<300;
// i++
// ){

// const r =
// 2+
// Math.random()*2;


// positions[i*3]=
// (Math.random()-0.5)*r;


// positions[i*3+1]=
// (Math.random()-0.5)*r;


// positions[i*3+2]=
// (Math.random()-0.5)*r;


// }



// useFrame(
// (_,delta)=>{

// if(ref.current){

// ref.current.rotation.y+=
// delta*0.02;

// }

// }
// )



// return (

// <points
// ref={ref}
// >


// <bufferGeometry>

// <bufferAttribute

// attach="attributes-position"

// array={positions}

// count={positions.length/3}

// itemSize={3}

// />

// </bufferGeometry>



// <pointsMaterial

// size={0.025}

// color="#0f8f88"

// transparent

// opacity={0.35}

// />


// </points>

// )

// }



// /* =========================================================
//    THREE SCENE
// ========================================================= */


// function Scene({
// city
// }){


// return (

// <>

// <ambientLight
// intensity={2}
// />


// <directionalLight

// position={[
// 3,
// 4,
// 5
// ]}

// intensity={3}

// />


// <Particles/>


// <GlassOrb/>


// <LEDPanel
// city={city}
// />


// </>


// )

// }



// /* =========================================================
//    MAIN
// ========================================================= */


// export default function Offers3DSection(){


// const [
// active,
// setActive
// ]=useState(0);



// useEffect(()=>{


// const timer =
// setInterval(()=>{


// setActive(
// prev=>
// (prev+1)
// %
// cities.length
// );


// },3500);


// return ()=>clearInterval(timer);


// },[]);



// const city =
// cities[active];



// return (

// <section
// className="Offers3D"
// >


// {/* LEFT CONTENT */}


// <div
// className="Offers3D_Content"
// >


// <motion.span

// initial={{
// opacity:0,
// y:20
// }}

// whileInView={{
// opacity:1,
// y:0
// }}

// >

// CITY SPECIAL OFFERS

// </motion.span>



// <motion.h2

// initial={{
// opacity:0,
// y:40
// }}

// whileInView={{
// opacity:1,
// y:0
// }}

// transition={{
// duration:.8
// }}

// >

// Offers

// </motion.h2>



// <p>

// Explore exclusive roadshow
// opportunities across cities.

// </p>



// <div
// className="OfferStats"
// >

// <strong>
// {cities.length}+
// </strong>


// <span>
// Active Cities
// </span>


// </div>


// </div>




// {/* THREE AREA */}



// <div
// className="Offers3D_Canvas"
// >


// <Canvas

// camera={{
// position:[
// 0,
// 0,
// 5
// ],

// fov:40

// }}

// >


// <Suspense
// fallback={null}
// >


// <Scene

// city={city}

// />


// </Suspense>


// </Canvas>



// </div>




// {/* CITY SELECTOR */}



// <div
// className="OffersCities"
// >


// {cities.map(
// (item,index)=>(


// <button

// key={item.name}

// className={
// active===index
// ?
// "active"
// :""
// }

// onClick={()=>setActive(index)}

// >


// <img
// src={item.icon}
// />


// <span>
// {item.name}
// </span>


// </button>


// )

// )}


// </div>




// {/* ACTIVE OFFER */}


// <AnimatePresence
// mode="wait"
// >


// <motion.div

// key={city.name}

// className="ActiveOffer"

// initial={{
// opacity:0,
// x:30
// }}

// animate={{
// opacity:1,
// x:0
// }}

// exit={{
// opacity:0,
// x:-30
// }}

// >


// <small>
// LIVE OFFER
// </small>


// <h3>
// {city.name}
// </h3>


// <p>
// {city.offer}
// </p>


// </motion.div>


// </AnimatePresence>



// </section>


// )

// }


/* eslint-disable */
// @ts-nocheck
"use client";

import React, {
  Suspense,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Canvas,
  useFrame,
} from "@react-three/fiber";

import {
  RoundedBox,
  Text,
} from "@react-three/drei";

import * as THREE from "three";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import "./Offers3DSection.css";


/* =========================================================
   CITY DATA
========================================================= */

const cities = [

{
name:"Chennai",
icon:"/images/assets/Offers_Chennai.png",
offer:"Premium roadshow locations available"
},

{
name:"Madurai",
icon:"/images/assets/Offers_Madurai.png",
offer:"Festival campaign packages"
},

{
name:"Coimbatore",
icon:"/images/assets/Offers_Cbe.png",
offer:"High visibility packages"
},

{
name:"Bengaluru",
icon:"/images/assets/Offers_Bglr.png",
offer:"Launch campaign offers"
},

{
name:"Vellore",
icon:"/images/assets/Offers_Vellore.png",
offer:"Special city packages"
}

];



/* =========================================================
   3D LED OBJECT
   MUST BE INSIDE CANVAS
========================================================= */


function LEDObject({
city
}:any){

const ref =
useRef<THREE.Group>(null);


useFrame(
(state)=>{

if(!ref.current)
return;


const t =
state.clock.elapsedTime;


ref.current.rotation.y =
Math.sin(t*0.6)*0.15;


ref.current.position.y =
Math.sin(t*1.3)*0.08;


}
);



return (

<group
ref={ref}
>



{/* Glass Halo */}

<mesh>

<sphereGeometry
args={[
1.8,
40,
40
]}
/>


<meshPhysicalMaterial

color="#8b7cf6"

transparent

opacity={0.12}

roughness={0}

transmission={1}

/>

</mesh>




{/* LED DISPLAY */}


<RoundedBox

args={[
2.5,
1.45,
0.18
]}

radius={0.08}

smoothness={8}

>

<meshPhysicalMaterial

color="#ffffff"

roughness={0.15}

metalness={0.05}

clearcoat={1}

/>

</RoundedBox>




{/* Screen */}


<mesh

position={[
0,
0,
0.11
]}

>

<planeGeometry
args={[
2.15,
1.05
]}
/>


<meshStandardMaterial

color="#111827"

emissive="#0f8f88"

emissiveIntensity={0.35}

/>


</mesh>





{/* Screen Text */}


<Text

position={[
0,
0.18,
0.13
]}

fontSize={0.22}

color="white"

anchorX="center"

>

ADINN

</Text>



<Text

position={[
0,
-0.12,
0.13
]}

fontSize={0.13}

color="#6ee7b7"

anchorX="center"

>

{city.name}

</Text>



<Text

position={[
0,
-0.35,
0.13
]}

fontSize={0.08}

color="#cbd5e1"

anchorX="center"

>

ROADSHOW OFFER

</Text>



</group>

)

}






/* =========================================================
   PARTICLES
========================================================= */


function Particles(){

const ref =
useRef<THREE.Points>(null);



const positions =
new Float32Array(
250*3
);



for(
let i=0;
i<250;
i++
){

positions[i*3]
=
(Math.random()-0.5)*5;


positions[i*3+1]
=
(Math.random()-0.5)*3;


positions[i*3+2]
=
(Math.random()-0.5)*3;

}



useFrame(
(_,delta)=>{

if(ref.current){

ref.current.rotation.y
+=
delta*0.02;

}

}
);



return (

<points
ref={ref}
>

<bufferGeometry>

<bufferAttribute

attach="attributes-position"

array={positions}

count={250}

itemSize={3}

/>

</bufferGeometry>



<pointsMaterial

size={0.025}

color="#0f8f88"

transparent

opacity={0.35}

/>


</points>

)

}







/* =========================================================
   3D SCENE WRAPPER
========================================================= */


function OffersScene({
city
}:any){

return (

<>

<ambientLight
intensity={2}
/>


<directionalLight

position={[
3,
5,
4
]}

intensity={3}

/>



<Particles/>


<LEDObject
city={city}
/>


</>

)

}








/* =========================================================
   MAIN COMPONENT
========================================================= */


export default function Offers3DSection(){


const [
active,
setActive
]=
useState(0);



useEffect(()=>{


const timer =
setInterval(()=>{

setActive(
prev=>
(prev+1)
%
cities.length
);


},3500);


return ()=>clearInterval(timer);


},[]);



const city =
cities[active];



return (

<section
className="Offers3D"
>



{/* LEFT CONTENT */}


<div
className="OffersContent"
>


<motion.span

initial={{
opacity:0,
y:20
}}

whileInView={{
opacity:1,
y:0
}}

>

CITY SPECIAL OFFERS

</motion.span>



<motion.h1

initial={{
opacity:0,
y:40
}}

whileInView={{
opacity:1,
y:0
}}

transition={{
duration:.8
}}

>

Offers

</motion.h1>



<p>

Explore exclusive roadshow
opportunities across cities.

</p>



<div
className="OfferCount"
>

<strong>
{cities.length}+
</strong>


<span>
Active Cities
</span>


</div>


</div>





{/* THREE CANVAS */}

<div
className="OffersCanvas"
>


<Canvas

camera={{
position:[
0,
0,
5
],

fov:40
}}

>


<Suspense
fallback={null}
>


<OffersScene

city={city}

/>


</Suspense>


</Canvas>



</div>






{/* ACTIVE CITY */}


<AnimatePresence
mode="wait"
>

<motion.div

key={city.name}

className="ActiveOffer"

initial={{
opacity:0,
x:30
}}

animate={{
opacity:1,
x:0
}}

exit={{
opacity:0,
x:-30
}}

>


<span>
LIVE OFFER
</span>


<h2>
{city.name}
</h2>


<p>
{city.offer}
</p>


</motion.div>


</AnimatePresence>







{/* CITY BUTTONS */}


<div
className="CitySelector"
>

{
cities.map(
(item,index)=>(

<button

key={item.name}

className={
active===index
?
"active"
:
""
}

onClick={()=>
setActive(index)
}

>

<img
src={item.icon}
/>


{item.name}


</button>


)

)

}


</div>



</section>

)

}