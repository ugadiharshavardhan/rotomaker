"use client";

import { OrbitPaths } from "@/components/portfolio/OrbitPaths";

export function Scene9World({ statIndex, segmentProgress, opacity = 1 }) {
  const reveal = Math.min(1, segmentProgress / 0.15);

  if (opacity <= 0) return null;

  return (
    <group scale={reveal}>
      <ambientLight intensity={0.1 * opacity} />
      <OrbitPaths progress={reveal} opacity={opacity * 0.85} count={3} />
    </group>
  );
}
