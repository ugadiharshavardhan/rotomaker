"use client";

import dynamic from "next/dynamic";

const EvilEye = dynamic(() => import("./EvilEye"), {
  ssr: false,
  loading: () => null,
});

const EVIL_EYE_OPTIONS = {
  eyeColor: "#FF6F37",
  intensity: 1.75,
  pupilSize: 0.58,
  irisWidth: 0.28,
  glowIntensity: 0.48,
  scale: 0.78,
  noiseScale: 1.15,
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

if (typeof window !== "undefined") {
  void import("./EvilEye");
}
