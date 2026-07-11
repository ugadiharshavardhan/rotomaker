"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Lightweight dust / ash / stars — GPU-cheap group drift, no per-particle CPU writes.
 */
export function HeroParticles({ density = 1, wind = 0.2 }) {
  const group = useRef();
  const dust = useMemo(() => makePoints(280, 16, 10, 12), []);
  const ash = useMemo(() => makePoints(80, 12, 8, 10), []);
  const stars = useMemo(() => makePoints(100, 36, 22, 28, true), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const g = group.current;
    if (!g) return;
    g.rotation.y = t * 0.012 * (0.5 + wind);
    g.position.x = Math.sin(t * 0.08) * 0.15 * wind;
    g.position.y = Math.cos(t * 0.06) * 0.08;
    const mats = g.children;
    if (mats[0]) mats[0].material.opacity = 0.2 * density;
    if (mats[1]) mats[1].material.opacity = 0.25 * density;
    if (mats[2]) mats[2].material.opacity = 0.5 * density;
  });

  return (
    <group ref={group}>
      <points geometry={dust} renderOrder={4}>
        <pointsMaterial
          size={0.04}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#ffffff"
          opacity={0.2}
          sizeAttenuation
        />
      </points>
      <points geometry={ash} renderOrder={5}>
        <pointsMaterial
          size={0.07}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#d0d0d0"
          opacity={0.25}
          sizeAttenuation
        />
      </points>
      <points geometry={stars} renderOrder={1}>
        <pointsMaterial
          size={0.035}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          color="#ffffff"
          opacity={0.5}
          sizeAttenuation
        />
      </points>
    </group>
  );
}

function makePoints(count, spreadX, spreadY, depth, far = false) {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spreadX;
    positions[i * 3 + 1] = (Math.random() - 0.5) * spreadY;
    positions[i * 3 + 2] = far
      ? -16 - Math.random() * depth
      : -1.5 - Math.random() * depth;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return geo;
}
