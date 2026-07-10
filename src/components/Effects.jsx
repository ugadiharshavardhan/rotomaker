"use client";

import { useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  SSAO,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

export function Effects({ enabled = true, studio = false }) {
  const gl = useThree((s) => s.gl);
  if (!enabled || !gl) return null;

  if (studio) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom
          intensity={0.08}
          luminanceThreshold={0.72}
          luminanceSmoothing={0.95}
          mipmapBlur
        />
      </EffectComposer>
    );
  }

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
