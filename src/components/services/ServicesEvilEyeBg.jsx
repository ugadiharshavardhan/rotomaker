"use client";

import dynamic from "next/dynamic";

const EvilEye = dynamic(() => import("./EvilEye"), { ssr: false });

const EVIL_EYE_OPTIONS = {
  eyeColor: "#F0F0F0",
  intensity: 1.2,
  pupilSize: 0.58,
  irisWidth: 0.25,
  glowIntensity: 0.3,
  scale: 0.72,
  noiseScale: 1.0,
  pupilFollow: 0.45,
  flameSpeed: 0.85,
  backgroundColor: "#030303",
};

export function ServicesEvilEyeBg() {
  return (
    <div className="services-evil-eye-bg" aria-hidden="true">
      <EvilEye {...EVIL_EYE_OPTIONS} />
    </div>
  );
}
