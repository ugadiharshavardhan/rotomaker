"use client";

import dynamic from "next/dynamic";

const GradientBlinds = dynamic(() => import("./GradientBlinds"), {
  ssr: false,
  loading: () => null,
});

const GRADIENT_BLINDS_OPTIONS = {
  gradientColors: ["#FF6F37", "#5227FF", "#1a0a2e"],
  angle: 12,
  noise: 0.28,
  blindCount: 12,
  blindMinWidth: 50,
  spotlightRadius: 0.48,
  spotlightSoftness: 1.15,
  spotlightOpacity: 0.95,
  mouseDampening: 0.15,
  distortAmount: 0,
  shineDirection: "left",
  mixBlendMode: "lighten",
};

export function ServicesGradientBlindsBg() {
  return (
    <div className="services-gradient-blinds-bg" aria-hidden="true">
      <GradientBlinds {...GRADIENT_BLINDS_OPTIONS} />
    </div>
  );
}
