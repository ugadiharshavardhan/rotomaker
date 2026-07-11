"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/**
 * Soft fill light only — no visible cone / god-ray mesh.
 */
export function HeroBackLight({ intensity = 1 }) {
  const key = useRef();
  const fill = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const pulse = 0.92 + Math.sin(t * 0.35) * 0.08;
    if (key.current) key.current.intensity = 4.5 * intensity * pulse;
    if (fill.current) fill.current.intensity = 2.2 * intensity;
  });

  return (
    <group>
      <pointLight
        ref={key}
        position={[0, 2.2, -10]}
        intensity={4.5}
        distance={28}
        color="#ffffff"
      />
      <pointLight
        ref={fill}
        position={[0, 1.2, -6]}
        intensity={2.2}
        distance={18}
        color="#ffffff"
      />
    </group>
  );
}
