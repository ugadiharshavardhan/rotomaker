"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export function Scene12World({ progress, opacity = 1 }) {
  const particlesRef = useRef();
  const count = 200;
  const positions = useRef(
    new Float32Array(
      Array.from({ length: count * 3 }, (_, i) => {
        if (i % 3 === 0) return (Math.random() - 0.5) * 20;
        if (i % 3 === 1) return (Math.random() - 0.5) * 12;
        return (Math.random() - 0.5) * 10;
      })
    )
  ).current;

  const fadeOut = Math.max(0, 1 - progress * 0.6);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const arr = particlesRef.current.geometry.attributes.position.array;
    const t = state.clock.elapsedTime;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += 0.008 + progress * 0.02;
      if (arr[i3 + 1] > 8) arr[i3 + 1] = -6;
    }
    particlesRef.current.geometry.attributes.position.needsUpdate = true;
    particlesRef.current.material.opacity = (0.15 + Math.sin(t * 0.5) * 0.05) * fadeOut * opacity;
  });

  if (opacity <= 0) return null;

  return (
    <group>
      <ambientLight intensity={0.03 * opacity * fadeOut} />
      <pointLight
        position={[0, 2, 4]}
        intensity={(0.4 + progress * 0.4) * opacity}
        color="#ffffff"
        distance={20}
      />

      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial
          size={0.04}
          color="#ffffff"
          transparent
          opacity={0.2}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>

      <mesh position={[0, -4, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshBasicMaterial color="#030303" transparent opacity={progress * 0.5} />
      </mesh>
    </group>
  );
}
