"use client";

import { useMemo } from "react";
import { HERO_CHARACTERS, getHeroStoryState } from "@/lib/heroStory";

/**
 * Brand + credits overlay.
 * Finale logo stays perfectly readable over the 3D cinema wall.
 */
export function HeroStoryOverlay({ progress = 0, opacity = 1 }) {
  const state = useMemo(() => getHeroStoryState(progress), [progress]);

  if (opacity <= 0.01) return null;

  const character =
    state.phase === "character" && state.characterIndex >= 0
      ? HERO_CHARACTERS[state.characterIndex]
      : null;

  const showCredits = character && state.creditsOpacity > 0.02;
  const showClearBrand =
    (state.phase === "unknown" || state.phase === "wind") &&
    state.brandOpacity > 0.05;
  const showFinaleBrand = state.phase === "finale" && state.brandOpacity > 0.05;
  const brandFade =
    state.phase === "unknown"
      ? 1
      : state.phase === "finale"
        ? 1
        : Math.max(0, 1 - (state.fogApproach ?? 0) * 1.35);
  const creditsSide = character?.side === "right" ? "left" : "right";

  return (
    <div className="hero-story" style={{ opacity }} aria-label="Rotomaker intro">
      {(showClearBrand || showFinaleBrand) && brandFade > 0.02 && (
        <div
          className={`hero-story__brand hero-story__brand--clear${
            showFinaleBrand ? " hero-story__brand--finale" : ""
          }`}
          style={{ opacity: state.brandOpacity * brandFade }}
        >
          <p className="hero-story__eyebrow">Invisible Artistry</p>
          <h1 className="hero-story__title">ROTOMAKER</h1>
          <p className="hero-story__tagline">Crafting Invisible Magic</p>
        </div>
      )}

      {showCredits && (
        <aside
          className={`hero-story__credits hero-story__credits--${creditsSide}`}
          style={{ opacity: state.creditsOpacity * opacity }}
        >
          <p className="hero-story__credits-label">{character.label}</p>
          <h2 className="hero-story__credits-name">{character.name}</h2>
          <p className="hero-story__credits-studio">{character.studio}</p>
          <ul className="hero-story__credits-list">
            {character.credits.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
