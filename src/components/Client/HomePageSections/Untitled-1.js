/* eslint-disable */
// @ts-nocheck
"use client";

import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import * as THREE from "three";

import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";

import "./Offers3DSection.css";

/* =========================================================
   COLORS
========================================================= */

const COLORS = {
  dark: "#111827",

  teal: "#0f8f88",

  cyan: "#64d8d1",

  lavender: "#8b7cf6",

  pearl: "#f6f8fb",

  softBlue: "#dbeafe",

  champagne: "#d6c29e",
};

/* =========================================================
   CITY DATA
========================================================= */

const cities = [
  {
    name: "Chennai",
    icon: "/images/assets/Offers_Chennai.png",
    hasOffer: true,
  },

  {
    name: "Madurai",
    icon: "/images/assets/Offers_Madurai.png",
    hasOffer: true,
  },

  {
    name: "Coimbatore",
    icon: "/images/assets/Offers_Cbe.png",
    hasOffer: false,
  },

  {
    name: "Thrissur",
    icon: "/images/assets/Offers_Thrissur.png",
    hasOffer: false,
  },

  {
    name: "Kollam",
    icon: "/images/assets/Offers_Kollam.png",
    hasOffer: false,
  },

  {
    name: "Bengaluru",
    icon: "/images/assets/Offers_Bglr.png",
    hasOffer: true,
  },

  {
    name: "Theni",
    icon: "/images/assets/Offers_Theni.png",
    hasOffer: false,
  },

  {
    name: "Vellore",
    icon: "/images/assets/Offers_Vellore.png",
    hasOffer: true,
  },
];

const OFFER_INDEXES =
  cities
    .map((city, index) =>
      city.hasOffer
        ? index
        : null,
    )
    .filter(
      (index) =>
        index !== null,
    );

/* =========================================================
   PARTICLES
========================================================= */

function ParticleField() {
  const ref =
    useRef<THREE.Points>(
      null,
    );

  const time =
    useRef(0);

  const positions =
    useMemo(() => {
      const count = 650;

      const array =
        new Float32Array(
          count * 3,
        );

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const radius =
          2.6 +
          Math.random() *
            2.8;

        const theta =
          Math.random() *
          Math.PI *
          2;

        const phi =
          Math.acos(
            2 *
              Math.random() -
              1,
          );

        array[i * 3] =
          radius *
          Math.sin(phi) *
          Math.cos(theta);

        array[
          i * 3 + 1
        ] =
          radius *
          Math.cos(phi);

        array[
          i * 3 + 2
        ] =
          radius *
          Math.sin(phi) *
          Math.sin(theta);
      }

      return array;
    }, []);

  useFrame(
    (_state, delta) => {
      time.current +=
        delta;

      if (!ref.current) {
        return;
      }

      ref.current.rotation.y +=
        delta * 0.035;

      ref.current.rotation.z =
        Math.sin(
          time.current *
            0.18,
        ) * 0.04;
    },
  );

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          itemSize={3}
          count={
            positions.length /
            3
          }
        />
      </bufferGeometry>

      <pointsMaterial
        size={0.024}
        color={
          COLORS.teal
        }
        transparent
        opacity={0.22}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

/* =========================================================
   CENTRAL GLASS ORB
========================================================= */

function MainOrb({
  activeIndex,
}: any) {
  const ref =
    useRef<THREE.Mesh>(
      null,
    );

  const time =
    useRef(0);

  useFrame(
    (_state, delta) => {
      time.current +=
        delta;

      if (!ref.current) {
        return;
      }

      ref.current.rotation.x +=
        delta * 0.07;

      ref.current.rotation.y +=
        delta * 0.11;

      const scale =
        1 +
        Math.sin(
          time.current *
            1.35,
        ) *
          0.025;

      ref.current.scale.setScalar(
        scale,
      );
    },
  );

  const colors = [
    "#9ee7df",
    "#b9b1ff",
    "#d3edf7",
    "#a7ded9",
  ];

  const activeColor =
    colors[
      activeIndex %
        colors.length
    ];

  return (
    <mesh ref={ref}>
      <icosahedronGeometry
        args={[1.25, 5]}
      />

      <meshPhysicalMaterial
        color={
          activeColor
        }
        transparent
        opacity={0.62}
        roughness={0.14}
        metalness={0.02}
        transmission={0.28}
        thickness={1.2}
        clearcoat={1}
        clearcoatRoughness={
          0.08
        }
      />
    </mesh>
  );
}

/* =========================================================
   INNER ORB
========================================================= */

function InnerOrb() {
  const ref =
    useRef<THREE.Mesh>(
      null,
    );

  const time =
    useRef(0);

  useFrame(
    (_state, delta) => {
      time.current +=
        delta;

      if (!ref.current) {
        return;
      }

      const pulse =
        0.96 +
        Math.sin(
          time.current *
            2,
        ) *
          0.06;

      ref.current.scale.setScalar(
        pulse,
      );
    },
  );

  return (
    <mesh ref={ref}>
      <sphereGeometry
        args={[
          0.58,
          42,
          42,
        ]}
      />

      <meshPhysicalMaterial
        color="#ffffff"
        roughness={0.06}
        metalness={0}
        clearcoat={1}
        emissive={
          COLORS.teal
        }
        emissiveIntensity={
          0.12
        }
      />
    </mesh>
  );
}

/* =========================================================
   FLOATING CUBE
========================================================= */

function FloatingCube({
  position,
  speed = 1,
  color,
}: any) {
  const ref =
    useRef<THREE.Mesh>(
      null,
    );

  const time =
    useRef(
      Math.random() * 10,
    );

  useFrame(
    (_state, delta) => {
      time.current +=
        delta;

      if (!ref.current) {
        return;
      }

      ref.current.rotation.x +=
        delta *
        0.25 *
        speed;

      ref.current.rotation.y +=
        delta *
        0.34 *
        speed;

      ref.current.position.y =
        position[1] +
        Math.sin(
          time.current *
            speed,
        ) *
          0.12;
    },
  );

  return (
    <mesh
      ref={ref}
      position={position}
    >
      <boxGeometry
        args={[
          0.56,
          0.56,
          0.56,
        ]}
      />

      <meshPhysicalMaterial
        color={color}
        transparent
        opacity={0.72}
        roughness={0.16}
        clearcoat={1}
        clearcoatRoughness={
          0.12
        }
      />
    </mesh>
  );
}

/* =========================================================
   FLOATING SPHERE
========================================================= */

function FloatingSphere({
  position,
}: any) {
  const ref =
    useRef<THREE.Mesh>(
      null,
    );

  const time =
    useRef(3);

  useFrame(
    (_state, delta) => {
      time.current +=
        delta;

      if (!ref.current) {
        return;
      }

      ref.current.position.y =
        position[1] +
        Math.cos(
          time.current *
            0.85,
        ) *
          0.18;
    },
  );

  return (
    <mesh
      ref={ref}
      position={position}
    >
      <sphereGeometry
        args={[
          0.34,
          32,
          32,
        ]}
      />

      <meshPhysicalMaterial
        color={
          COLORS.champagne
        }
        roughness={0.18}
        metalness={0.15}
        clearcoat={1}
      />
    </mesh>
  );
}

/* =========================================================
   TORUS
========================================================= */

function FloatingTorus({
  position,
}: any) {
  const ref =
    useRef<THREE.Mesh>(
      null,
    );

  useFrame(
    (_state, delta) => {
      if (!ref.current) {
        return;
      }

      ref.current.rotation.x +=
        delta * 0.17;

      ref.current.rotation.y -=
        delta * 0.23;
    },
  );

  return (
    <mesh
      ref={ref}
      position={position}
      rotation={[
        0.4,
        0.2,
        0,
      ]}
    >
      <torusGeometry
        args={[
          0.48,
          0.1,
          20,
          70,
        ]}
      />

      <meshPhysicalMaterial
        color={
          COLORS.lavender
        }
        roughness={0.17}
        metalness={0.06}
        clearcoat={1}
      />
    </mesh>
  );
}

/* =========================================================
   ORBIT RINGS
========================================================= */

function OrbitRings() {
  const one =
    useRef<THREE.Mesh>(
      null,
    );

  const two =
    useRef<THREE.Mesh>(
      null,
    );

  useFrame(
    (_state, delta) => {
      if (one.current) {
        one.current.rotation.z +=
          delta * 0.07;
      }

      if (two.current) {
        two.current.rotation.z -=
          delta * 0.045;
      }
    },
  );

  return (
    <>
      <mesh
        ref={one}
        rotation={[
          1.32,
          0.25,
          0.15,
        ]}
      >
        <torusGeometry
          args={[
            2.05,
            0.018,
            8,
            160,
          ]}
        />

        <meshBasicMaterial
          color={
            COLORS.teal
          }
          transparent
          opacity={0.38}
        />
      </mesh>

      <mesh
        ref={two}
        rotation={[
          1.68,
          -0.18,
          0.3,
        ]}
      >
        <torusGeometry
          args={[
            1.72,
            0.012,
            8,
            160,
          ]}
        />

        <meshBasicMaterial
          color={
            COLORS.lavender
          }
          transparent
          opacity={0.25}
        />
      </mesh>
    </>
  );
}

/* =========================================================
   ORBIT DOT
========================================================= */

function OrbitDot() {
  const ref =
    useRef<THREE.Group>(
      null,
    );

  useFrame(
    (_state, delta) => {
      if (!ref.current) {
        return;
      }

      ref.current.rotation.y +=
        delta * 0.4;
    },
  );

  return (
    <group
      ref={ref}
      rotation={[
        1.3,
        0,
        0,
      ]}
    >
      <mesh
        position={[
          2.05,
          0,
          0,
        ]}
      >
        <sphereGeometry
          args={[
            0.055,
            16,
            16,
          ]}
        />

        <meshBasicMaterial
          color={
            COLORS.teal
          }
        />
      </mesh>
    </group>
  );
}

/* =========================================================
   ABSTRACT SCENE
========================================================= */

function AbstractScene({
  activeIndex,
  pointerRef,
}: any) {
  const groupRef =
    useRef<THREE.Group>(
      null,
    );

  const { size } =
    useThree();

  const mobile =
    size.width < 760;

  useFrame(
    (_state, delta) => {
      if (!groupRef.current) {
        return;
      }

      groupRef.current.rotation.y =
        THREE.MathUtils.damp(
          groupRef.current
            .rotation.y,

          pointerRef.current.x *
            0.11,

          4.5,
          delta,
        );

      groupRef.current.rotation.x =
        THREE.MathUtils.damp(
          groupRef.current
            .rotation.x,

          -pointerRef.current.y *
            0.055,

          4.5,
          delta,
        );

      groupRef.current.position.x =
        THREE.MathUtils.damp(
          groupRef.current
            .position.x,

          pointerRef.current.x *
            0.12,

          4,
          delta,
        );
    },
  );

  return (
    <>
      <ambientLight
        intensity={2.1}
      />

      <hemisphereLight
        args={[
          "#ffffff",
          "#dce7ea",
          1.4,
        ]}
      />

      <directionalLight
        position={[
          -4,
          5,
          5,
        ]}
        intensity={2.5}
      />

      <pointLight
        position={[
          2,
          1,
          4,
        ]}
        color="#dff9f6"
        intensity={8}
        distance={10}
      />

      <pointLight
        position={[
          -2,
          0,
          3,
        ]}
        color="#dedaff"
        intensity={6}
        distance={9}
      />

      <group
        ref={groupRef}
        scale={
          mobile
            ? 0.82
            : 1
        }
      >
        <ParticleField />

        <OrbitRings />

        <OrbitDot />

        <MainOrb
          activeIndex={
            activeIndex
          }
        />

        <InnerOrb />

        <FloatingCube
          position={[
            -2.1,
            1.25,
            0.3,
          ]}
          speed={0.8}
          color="#d7f1ef"
        />

        <FloatingCube
          position={[
            1.95,
            -1.15,
            0.2,
          ]}
          speed={1.15}
          color="#dedaff"
        />

        <FloatingSphere
          position={[
            2.15,
            1.15,
            -0.2,
          ]}
        />

        <FloatingTorus
          position={[
            -1.9,
            -1.15,
            0.1,
          ]}
        />
      </group>
    </>
  );
}

/* =========================================================
   BADGE
========================================================= */

function OfferBadge() {
  return (
    <div className="ABO_Badge">
      <span className="ABO_BadgeRing" />

      <div className="ABO_BadgeCore">
        %
      </div>
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function Offers3DSection() {
  const pointerRef =
    useRef({
      x: 0,
      y: 0,
    });

  const pausedRef =
    useRef(false);

  const [
    activeIndex,
    setActiveIndex,
  ] = useState(
    OFFER_INDEXES[0] ??
      0,
  );

  /* =====================================================
     AUTO CHANGE ACTIVE OFFER CITY
  ===================================================== */

  useEffect(() => {
    const timer =
      window.setInterval(
        () => {
          if (
            pausedRef.current
          ) {
            return;
          }

          setActiveIndex(
            (current) => {
              let position =
                OFFER_INDEXES.indexOf(
                  current,
                );

              if (
                position < 0
              ) {
                position = 0;
              }

              const next =
                (position + 1) %
                OFFER_INDEXES.length;

              return OFFER_INDEXES[
                next
              ];
            },
          );
        },
        3600,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, []);

  const activeCity =
    cities[activeIndex];

  const offerPosition =
    Math.max(
      0,
      OFFER_INDEXES.indexOf(
        activeIndex,
      ),
    );

  const next = () => {
    const nextPosition =
      (offerPosition + 1) %
      OFFER_INDEXES.length;

    setActiveIndex(
      OFFER_INDEXES[
        nextPosition
      ],
    );
  };

  const previous = () => {
    const previousPosition =
      offerPosition === 0
        ? OFFER_INDEXES.length -
          1
        : offerPosition - 1;

    setActiveIndex(
      OFFER_INDEXES[
        previousPosition
      ],
    );
  };

  const pointerMove = (
    event:
      React.PointerEvent<HTMLElement>,
  ) => {
    const rect =
      event.currentTarget.getBoundingClientRect();

    pointerRef.current.x =
      ((event.clientX -
        rect.left) /
        rect.width) *
        2 -
      1;

    pointerRef.current.y =
      ((event.clientY -
        rect.top) /
        rect.height) *
        2 -
      1;
  };

  return (
    <section
      className="ABO_Section"
      onPointerMove={
        pointerMove
      }
      onPointerEnter={() => {
        pausedRef.current =
          true;
      }}
      onPointerLeave={() => {
        pausedRef.current =
          false;

        pointerRef.current.x =
          0;

        pointerRef.current.y =
          0;
      }}
    >
      {/* =================================================
          DECORATION
      ================================================= */}

      <div className="ABO_Background">
        <span className="ABO_Blob ABO_Blob--one" />

        <span className="ABO_Blob ABO_Blob--two" />

        <span className="ABO_HugeText">
          OFFER
        </span>
      </div>

      {/* =================================================
          LEFT
      ================================================= */}

      <div className="ABO_Content">
        <div className="ABO_Kicker">
          <span />

          CITY OPPORTUNITIES
        </div>

        <div className="ABO_Title">
          <h2>
            Offers
          </h2>

          <OfferBadge />
        </div>

        <p>
          Discover active roadshow
          opportunities across cities,
          visualised through an
          interactive experience.
        </p>

        <div className="ABO_Info">
          <strong>
            {
              OFFER_INDEXES.length
            }
          </strong>

          <span>
            ACTIVE
            <br />
            OFFER CITIES
          </span>
        </div>
      </div>

      {/* =================================================
          CANVAS
      ================================================= */}

      <div className="ABO_Canvas">
        <Canvas
          dpr={[1, 1.5]}
          camera={{
            position: [
              0,
              0,
              6.6,
            ],

            fov: 40,

            near: 0.1,

            far: 100,
          }}
          gl={{
            antialias: true,

            alpha: true,

            powerPreference:
              "high-performance",
          }}
        >
          <AbstractScene
            activeIndex={
              activeIndex
            }
            pointerRef={
              pointerRef
            }
          />
        </Canvas>
      </div>

      {/* =================================================
          ACTIVE CITY CARD
      ================================================= */}

      <div
        className={[
          "ABO_ActiveCard",

          activeCity.hasOffer
            ? "ABO_ActiveCard--live"
            : "",
        ].join(" ")}
      >
        <div className="ABO_Status">
          <span />

          {activeCity.hasOffer
            ? "OFFER AVAILABLE"
            : "CITY NETWORK"}
        </div>

        <strong>
          {
            activeCity.name
          }
        </strong>

        <p>
          {activeCity.hasOffer
            ? "Exclusive roadshow opportunity is currently active."
            : "Explore our roadshow presence in this city."}
        </p>

        <button
          type="button"
        >
          Explore city
          <span>
            ↗
          </span>
        </button>
      </div>

      {/* =================================================
          CITY SELECTOR
      ================================================= */}

      <div className="ABO_Cities">
        {cities.map(
          (
            city,
            index,
          ) => (
            <button
              key={
                city.name
              }
              type="button"
              className={[
                "ABO_City",

                activeIndex ===
                index
                  ? "ABO_City--active"
                  : "",

                city.hasOffer
                  ? "ABO_City--offer"
                  : "",
              ]
                .filter(
                  Boolean,
                )
                .join(" ")}
              onClick={() =>
                setActiveIndex(
                  index,
                )
              }
            >
              <span className="ABO_CityDot" />

              <span>
                {
                  city.name
                }
              </span>
            </button>
          ),
        )}
      </div>

      {/* =================================================
          NAVIGATION
      ================================================= */}

      <div className="ABO_Navigation">
        <button
          type="button"
          onClick={
            previous
          }
        >
          ←
        </button>

        <div>
          {String(
            offerPosition + 1,
          ).padStart(
            2,
            "0",
          )}

          <span>
            /
          </span>

          {String(
            OFFER_INDEXES.length,
          ).padStart(
            2,
            "0",
          )}
        </div>

        <button
          type="button"
          onClick={next}
        >
          →
        </button>
      </div>
    </section>
  );
}