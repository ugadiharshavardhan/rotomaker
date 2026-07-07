"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export function EarthGlobeEffects({ opacity = 1 }) {
  if (opacity <= 0) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.45 * opacity}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.85}
        mipmapBlur
      />
      <Vignette eskil offset={0.28} darkness={0.55 * opacity} />
    </EffectComposer>
  );
}
