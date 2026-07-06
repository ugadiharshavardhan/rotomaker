"use client";

import {
  EffectComposer,
  Bloom,
  SSAO,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export function Effects({ enabled = true }) {
  if (!enabled) return null;

  return (
    <EffectComposer multisampling={0} enableNormalPass>
      <Bloom
        intensity={0.22}
        luminanceThreshold={0.55}
        luminanceSmoothing={0.92}
        mipmapBlur
      />
      <SSAO
        blendFunction={BlendFunction.MULTIPLY}
        samples={12}
        radius={0.08}
        intensity={8}
        luminanceInfluence={0.35}
        color="black"
      />
      <Vignette eskil offset={0.22} darkness={0.45} />
    </EffectComposer>
  );
}
