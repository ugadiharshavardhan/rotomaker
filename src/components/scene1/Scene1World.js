"use client";

import { LensFlareLight } from "@/components/scene1/FilmCamera";
import { AmbientParticles } from "@/components/scene1/ParticleField";
import { HERO_END, CAMERA_END } from "@/lib/cameraLens";

export function Scene1World({ progress, opacity = 1 }) {
  const flareIntensity =
    progress < 0.35
      ? 0.3 + progress
      : 0.5 + Math.min(1, (progress - 0.7) / 0.3) * 2;

  if (opacity <= 0) return null;

  const isHeroLights = progress < HERO_END;
  const isCameraSection = progress >= HERO_END && progress < CAMERA_END;
  const showParticles = progress >= 0.72;

  return (
    <group visible={opacity > 0.01}>
      {!isHeroLights && !isCameraSection && (
        <>
          <LensFlareLight intensity={flareIntensity * opacity} />
          <ambientLight intensity={0.08 * opacity} />
          <directionalLight position={[5, 8, 5]} intensity={0.35 * opacity} />
        </>
      )}

      {showParticles && <AmbientParticles scrollProgress={progress} />}
    </group>
  );
}
