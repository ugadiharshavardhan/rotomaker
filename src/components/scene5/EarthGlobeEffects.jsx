"use client";

import { useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

export function EarthGlobeEffects({ opacity = 1 }) {
  const gl = useThree((s) => s.gl);
  if (!gl || opacity <= 0) return null;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={0.12 * opacity}
        luminanceThreshold={0.72}
        luminanceSmoothing={0.92}
        mipmapBlur
      />
    </EffectComposer>
  );
}
