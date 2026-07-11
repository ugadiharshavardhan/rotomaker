"use client";

import { HeroStoryWorld } from "@/components/heroStory/HeroStoryWorld";
import { LensFlareLight } from "@/components/scene1/FilmCamera";
import { AmbientParticles } from "@/components/scene1/ParticleField";
import {
  STORY_END,
  VFX_SECTION_END,
  getScene1Phase,
  getStoryLocalProgress,
} from "@/lib/cameraLens";

/**
 * Scene 1: fog hero story → (camera lives in Scene.jsx) → impossible accents.
 */
export function Scene1World({ progress, opacity = 1, mouse }) {
  if (opacity <= 0) return null;

  const phase = getScene1Phase(progress);
  const storyProgress = getStoryLocalProgress(progress);
  const showStory = phase === "story";
  const showImpossibleFx = phase === "impossible" || phase === "exit";

  return (
    <group visible={opacity > 0.01}>
      {showStory && (
        <HeroStoryWorld
          progress={storyProgress}
          opacity={opacity}
          mouse={mouse}
        />
      )}

      {showImpossibleFx && (
        <>
          <LensFlareLight intensity={(0.6 + Math.min(1, (progress - VFX_SECTION_END) / 0.1)) * opacity} />
          <ambientLight intensity={0.1 * opacity} />
          <directionalLight position={[5, 8, 5]} intensity={0.4 * opacity} />
          {progress >= VFX_SECTION_END && (
            <AmbientParticles scrollProgress={Math.min(1, (progress - STORY_END) / (1 - STORY_END))} />
          )}
        </>
      )}
    </group>
  );
}
