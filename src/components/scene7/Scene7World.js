"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Scene7World({ progress, opacity = 1 }) {
  const ref = useRef();
  const reveal = Math.min(1, progress / 0.25);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  if (opacity <= 0) return null;

  return (
    <group ref={ref} scale={reveal}>
      <ambientLight intensity={0.04 * opacity} />
      <pointLight position={[0, 0, 5]} intensity={0.6 * opacity} color="#ffffff" />
      <gridHelper args={[20, 20, "#ffffff", "#111"]} position={[0, -3, 0]} />
    </group>
  );
}

export function Scene8World({ progress, opacity = 1 }) {
  const ref = useRef();
  const count = 60;
  const positions = useRef(
    new Float32Array(
      Array.from({ length: count * 3 }, () => (Math.random() - 0.5) * 16)
    )
  ).current;

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.opacity = 0.08 + progress * 0.15;
    ref.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  if (opacity <= 0) return null;

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.1}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
