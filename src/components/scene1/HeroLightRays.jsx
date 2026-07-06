"use client";

import dynamic from "next/dynamic";

const LightRays = dynamic(() => import("./LightRays"), { ssr: false });

const HERO_END = 0.05;

export function HeroLightRays({ progress }) {
  if (progress >= HERO_END) return null;

  const fadeOut = Math.max(0, 1 - progress / HERO_END);
  if (fadeOut <= 0.01) return null;

  return (
    <div className="hero-light-rays" style={{ opacity: fadeOut }} aria-hidden="true">
      <LightRays
        raysOrigin="top-center"
        raysColor="#ffffff"
        raysSpeed={1.25}
        lightSpread={0.72}
        rayLength={1.35}
        followMouse
        mouseInfluence={0.14}
        noiseAmount={0.06}
        distortion={0.04}
        fadeDistance={1.1}
        pulsating={false}
        saturation={0.95}
      />
    </div>
  );
}
