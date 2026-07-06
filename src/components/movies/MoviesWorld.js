"use client";

import { OrbitPaths } from "@/components/portfolio/OrbitPaths";

export function MoviesWorld({ progress, opacity = 1 }) {
  const reveal = Math.min(1, progress / 0.18);
  if (opacity <= 0) return null;

  return (
    <group>
      <ambientLight intensity={0.08 * opacity} />
      <OrbitPaths progress={reveal} opacity={opacity * 0.65} count={2} />
    </group>
  );
}
