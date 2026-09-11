"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, ContactShadows, Float } from "@react-three/drei";
import * as THREE from "three";

function Truck() {
  const group = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t * 0.25) * 0.18;
    group.current.position.y = Math.sin(t * 0.6) * 0.04;
  });
  return (
    <group ref={group} position={[0, -0.3, 0]} rotation={[0, -0.35, 0]}>
      {/* Cargo body */}
      <mesh castShadow position={[-0.2, 0.55, 0]}>
        <boxGeometry args={[2.2, 1.1, 1.0]} />
        <meshStandardMaterial color="#ffffff" metalness={0.15} roughness={0.35} />
      </mesh>
      {/* LED screen panel */}
      <mesh position={[-0.2, 0.55, 0.51]}>
        <planeGeometry args={[2.0, 0.95]} />
        <meshStandardMaterial
          color="#dc2626"
          emissive={new THREE.Color("#ff2a2a")}
          emissiveIntensity={1.4}
          roughness={0.4}
        />
      </mesh>
      {/* LED frame */}
      <mesh position={[-0.2, 0.55, 0.515]}>
        <ringGeometry args={[0.0, 0.0, 4]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      {/* Cab */}
      <mesh castShadow position={[1.15, 0.4, 0]}>
        <boxGeometry args={[0.75, 0.8, 0.95]} />
        <meshStandardMaterial color="#E9E9E9" metalness={0.2} roughness={0.4} />
      </mesh>
      {/* Windshield */}
      <mesh position={[1.45, 0.55, 0]}>
        <boxGeometry args={[0.05, 0.4, 0.85]} />
        <meshStandardMaterial color="#1a1a1a" metalness={0.6} roughness={0.1} />
      </mesh>
      {/* Wheels */}
      {[[-0.9, 0, 0.5], [-0.9, 0, -0.5], [1.05, 0, 0.5], [1.05, 0, -0.5]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.16, 28]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
        </mesh>
      ))}
      {/* Chassis */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[3.0, 0.1, 0.85]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.6} />
      </mesh>
      {/* Red under-glow */}
      <pointLight position={[0, 0.1, 0]} intensity={6} distance={3} color="#ff2a2a" />
    </group>
  );
}

export function HeroScene() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="aspect-[5/4] w-full rounded-3xl bg-surface-muted" aria-hidden />;
  }
  return (
    <div className="relative aspect-[5/4] w-full">
      <Canvas
        dpr={[1, 1.6]}
        camera={{ position: [4.2, 2.2, 4.2], fov: 32 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 6, 4]} intensity={1.2} castShadow />
        <Float speed={1.2} rotationIntensity={0.15} floatIntensity={0.25}>
          <Truck />
        </Float>
        <ContactShadows position={[0, -0.32, 0]} opacity={0.35} scale={8} blur={2.4} far={3} />
        <Environment preset="city" />
      </Canvas>
      <div className="pointer-events-none absolute -bottom-6 left-1/2 -translate-x-1/2 h-12 w-2/3 rounded-full bg-primary/20 blur-3xl" />
    </div>
  );
}
