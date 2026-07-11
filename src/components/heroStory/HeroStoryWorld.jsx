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
import { warmTextureUrls } from "@/components/portfolio/useSafeTextures";
import { getFinalePosterUrls, getFinaleWarmUrls, FinaleCinemaWorld } from "./FinaleCinemaWorld";
import { VolumetricFog } from "./VolumetricFog";
import { HeroParticles } from "./HeroParticles";
import { HeroCharacterLayer } from "./HeroCharacter";
import { HeroCameraRig } from "./HeroCameraRig";
import { HeroBackLight } from "./HeroBackLight";

function HeroAtmosphere({ lightBehind }) {
  return (
    <>
      <ambientLight intensity={0.35} color={HERO_STORY_LIGHT} />
      <HeroBackLight intensity={0.45 + lightBehind * 0.35} />
    </>
  );
}

/**
 * Opening = 360° cinema wall (replaces flat black brand card).
 * Then fog character reveals, then wall returns for the climax.
 */
export function HeroStoryWorld({ progress = 0, opacity = 1, mouse }) {
  const state = useMemo(() => getHeroStoryState(progress), [progress]);
  const isFinale = state.phase === "finale";
  const cinemaOpen = state.cinemaOpen ?? 0;
  const showCinema = cinemaOpen > 0.02;
  const fogApproach = state.fogApproach ?? (state.fogDensity > 0 ? 1 : 0);
  const showStory = !showCinema || state.phase === "wind" || state.phase === "character";
  /* Fog only on the wind approach — characters get lighting, not mist */
  const showFog =
    state.phase === "wind" &&
    fogApproach > 0.02 &&
    state.fogDensity > 0.02;
  const showCharacters = state.phase === "character";

  useEffect(() => {
    HERO_CHARACTERS.forEach((c) => {
      try {
        useTexture.preload(c.image);
      } catch {
        /* ignore */
      }
    });
    warmTextureUrls(getFinalePosterUrls());
  }, []);

  useEffect(() => {
    if (!showCinema && state.phase !== "character") return;
    warmTextureUrls(getFinaleWarmUrls());
  }, [showCinema, state.phase]);

  if (opacity <= 0.01) return null;

  const wallLocal =
    state.phase === "unknown"
      ? 1
      : state.phase === "wind"
        ? Math.max(0.05, cinemaOpen)
        : state.phase === "finale"
          ? state.local
          : 0;

  return (
    <group visible={opacity > 0.01} userData={{ audioReady: true, chapter: "enter-the-unknown" }}>
      <color attach="background" args={[HERO_STORY_BG]} />
      <HeroCameraRig progress={progress} mouse={mouse} active={opacity > 0.02} />

      {(showStory || showCharacters) && (
        <group visible={!showCinema || state.phase === "wind"}>
          <HeroAtmosphere lightBehind={state.lightBehind} />

          {state.phase === "wind" && fogApproach > 0.15 && (
            <HeroParticles density={0.45 * fogApproach} wind={state.wind} />
          )}

          {showFog && (
            <VolumetricFog
              density={state.fogDensity * (1 - cinemaOpen * 0.85)}
              parting={state.parting}
              wind={state.wind}
              bodyReveal={state.bodyReveal}
              bodySide={state.bodySide}
              approach={fogApproach}
              color={HERO_STORY_FOG}
            />
          )}

          {showCharacters && (
            <Suspense fallback={null}>
              <HeroCharacterLayer
                characters={HERO_CHARACTERS}
                characterIndex={state.characterIndex}
                bodyReveal={state.bodyReveal}
                finale={false}
                finaleLocal={0}
              />
            </Suspense>
          )}
        </group>
      )}

      {/* Always mount early so post-load opening has no hitch */}
      <Suspense fallback={null}>
        <FinaleCinemaWorld
          local={wallLocal}
          active={showCinema}
          mouse={mouse}
        />
      </Suspense>
    </group>
  );
}
