"use client";

import { OrbitPaths } from "@/components/portfolio/OrbitPaths";
import { getServicesVisualState } from "@/lib/servicesVisualState";

export function ServicesWorld({ progress, opacity = 1 }) {
  if (opacity <= 0) return null;

  const { orbitReveal, show3d } = getServicesVisualState(progress);

  if (!show3d) {
    return <ambientLight intensity={0.08 * opacity} />;
  }

  return (
    <group>
      <ambientLight intensity={0.14 * opacity} />
      <OrbitPaths progress={orbitReveal} opacity={opacity * 0.5} count={2} />
    </group>
  );
}
