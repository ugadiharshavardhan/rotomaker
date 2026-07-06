"use client";

import { OrbitPaths } from "@/components/portfolio/OrbitPaths";

export function AboutWorld({ progress, opacity = 1 }) {
  const reveal = Math.min(1, progress / 0.2);

  if (opacity <= 0) return null;

  return (
    <group>
      <ambientLight intensity={0.1 * opacity} />
      <OrbitPaths progress={reveal} opacity={opacity * 0.7} count={2} />
    </group>
  );
}
