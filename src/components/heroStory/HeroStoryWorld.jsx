"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useTexture } from "@react-three/drei";
import {
  HERO_CHARACTERS,
  HERO_STORY_BG,
  HERO_STORY_FOG,
  HERO_STORY_LIGHT,
  getHeroStoryState,
} from "@/lib/heroStory";
import { VolumetricFog } from "./VolumetricFog";
import { HeroParticles } from "./HeroParticles";
import { HeroCharacterLayer } from "./HeroCharacter";
import { HeroCameraRig } from "./HeroCameraRig";
import { HeroBackLight } from "./HeroBackLight";
import { FinaleCinemaWorld } from "./FinaleCinemaWorld";

function HeroAtmosphere({ lightBehind }) {
  return (
    <>
      <ambientLight intensity={0.35} color={HERO_STORY_LIGHT} />
      <HeroBackLight intensity={0.45 + lightBehind * 0.35} />
    </>
  );
}

/**
 * Fog story reveals unchanged.
 * Finale = infinite 360° Wall of Cinema (concentric poster rings).
 */
export function HeroStoryWorld({ progress = 0, opacity = 1, mouse }) {
  const state = useMemo(() => getHeroStoryState(progress), [progress]);
  const isFinale = state.phase === "finale";
  const fogApproach = state.fogApproach ?? (state.fogDensity > 0 ? 1 : 0);
  const showFog = !isFinale && fogApproach > 0.02 && state.fogDensity > 0.02;

  useEffect(() => {
    HERO_CHARACTERS.forEach((c) => {
      try {
        useTexture.preload(c.image);
      } catch {
        /* ignore */
      }
    });
  }, []);

  if (opacity <= 0.01) return null;

  return (
    <group visible={opacity > 0.01} userData={{ audioReady: true, chapter: "enter-the-unknown" }}>
      <color attach="background" args={[HERO_STORY_BG]} />
      <HeroCameraRig progress={progress} mouse={mouse} active={opacity > 0.02} />

      {isFinale ? (
        <Suspense fallback={null}>
          <FinaleCinemaWorld local={state.local} mouse={mouse} />
        </Suspense>
      ) : (
        <>
          <HeroAtmosphere lightBehind={state.lightBehind} />

          {fogApproach > 0.15 && (
            <HeroParticles density={0.45 * fogApproach} wind={state.wind} />
          )}

          {showFog && (
            <VolumetricFog
              density={state.fogDensity}
              parting={state.parting}
              wind={state.wind}
              bodyReveal={state.bodyReveal}
              bodySide={state.bodySide}
              approach={fogApproach}
              color={HERO_STORY_FOG}
            />
          )}

          <Suspense fallback={null}>
            <HeroCharacterLayer
              characters={HERO_CHARACTERS}
              characterIndex={state.characterIndex}
              bodyReveal={state.bodyReveal}
              finale={false}
              finaleLocal={0}
            />
          </Suspense>
        </>
      )}
    </group>
  );
}
