"use client";

import dynamic from "next/dynamic";

const EvilEye = dynamic(() => import("./EvilEye"), {
  ssr: false,
  loading: () => null,
});

const EVIL_EYE_OPTIONS = {
  eyeColor: "#FF6F37",
  intensity: 1.5,
  pupilSize: 0.6,
  irisWidth: 0.25,
  glowIntensity: 0.35,
  scale: 0.72,
  noiseScale: 1.0,
  pupilFollow: 0.45,
  flameSpeed: 1.0,
  backgroundColor: "#030303",
};

export function ServicesEvilEyeBg() {
  return (
    <div className="services-evil-eye-bg" aria-hidden="true">
      <EvilEye {...EVIL_EYE_OPTIONS} />
    </div>
  );
}
