"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

export function CinematicEffects() {
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.25}
        luminanceThreshold={0.35}
        luminanceSmoothing={0.92}
        mipmapBlur
      />
      <Vignette eskil offset={0.25} darkness={0.65} />
    </EffectComposer>
  );
}
