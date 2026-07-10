"use client";

import dynamic from "next/dynamic";
import {
  IMPOSSIBLE_SECTION_END,
  VFX_SECTION_END,
  getScene1Phase,
} from "@/lib/cameraLens";

const LightRays = dynamic(() => import("./LightRays"), {
  ssr: false,
  loading: () => null,
});

export function HeroLightRays({ progress }) {
  const phase = getScene1Phase(progress);

  if (
    phase !== "impossible" ||
    progress < VFX_SECTION_END ||
    progress >= IMPOSSIBLE_SECTION_END
  ) {
    return null;
  }

  const fade = 0.06;
  const fadeIn = Math.min(1, (progress - VFX_SECTION_END) / fade);
  const fadeOut = Math.min(1, (IMPOSSIBLE_SECTION_END - progress) / fade);
  const opacity = Math.min(fadeIn, fadeOut);

  if (opacity <= 0.01) return null;

  return (
    <div
      className="hero-light-rays hero-light-rays--impossible"
      style={{ opacity }}
      aria-hidden="true"
    >
      <LightRays
        forceVisible
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1.25}
        lightSpread={0.85}
        rayLength={1.6}
        followMouse
        mouseInfluence={0.14}
        noiseAmount={0.06}
        distortion={0.04}
        fadeDistance={1.2}
        pulsating={false}
        saturation={0.95}
      />
    </div>
  );
}
