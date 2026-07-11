"use client";

import { useMemo } from "react";
import { HERO_CHARACTERS, getHeroStoryState } from "@/lib/heroStory";

const ROTO_LETTERS = "ROTOMAKER".split("");

/**
 * Brand + credits overlay.
 * Opening: letter-by-letter ROTOMAKER typo over the 360° wall.
 */
export function HeroStoryOverlay({ progress = 0, opacity = 1 }) {
  const state = useMemo(() => getHeroStoryState(progress), [progress]);

  if (opacity <= 0.01) return null;

  const character =
    state.phase === "character" && state.characterIndex >= 0
      ? HERO_CHARACTERS[state.characterIndex]
      : null;

  const showCredits = character && state.creditsOpacity > 0.02;
  const showWallBrand =
    ((state.phase === "unknown" || state.phase === "finale") &&
      state.brandOpacity > 0.05) ||
    (state.phase === "wind" && state.brandOpacity > 0.05 && (state.cinemaOpen ?? 0) > 0.2);
  const showWindBrandOnly =
    state.phase === "wind" &&
    state.brandOpacity > 0.05 &&
    (state.cinemaOpen ?? 0) <= 0.2;
  const brandFade =
    state.phase === "unknown" || state.phase === "finale"
      ? 1
      : state.phase === "wind"
        ? Math.max(0, state.brandOpacity)
        : Math.max(0, 1 - (state.fogApproach ?? 0) * 1.35);
  const creditsSide = character?.side === "right" ? "left" : "right";
  const onWall =
    state.phase === "unknown" ||
    state.phase === "finale" ||
    (state.cinemaOpen ?? 0) > 0.2;
  const showSubtitles = state.phase === "finale";
  const animateLetters = state.phase === "unknown";

  return (
    <div className="hero-story" style={{ opacity }} aria-label="Rotomaker intro">
      {(showWallBrand || showWindBrandOnly) && brandFade > 0.02 && (
        <div
          className={`hero-story__brand hero-story__brand--clear${
            onWall ? " hero-story__brand--finale" : ""
          }${animateLetters ? " hero-story__brand--intro" : ""}`}
          style={{ opacity: state.brandOpacity * brandFade }}
        >
          {showSubtitles && (
            <p className="hero-story__eyebrow">Invisible Artistry</p>
          )}
          <h1 className="hero-story__title" aria-label="ROTOMAKER">
            {animateLetters ? (
              ROTO_LETTERS.map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="hero-story__letter"
                  style={{ animationDelay: `${0.12 + index * 0.07}s` }}
                >
                  {letter}
                </span>
              ))
            ) : (
              "ROTOMAKER"
            )}
          </h1>
          {showSubtitles && (
            <p className="hero-story__tagline">Crafting Invisible Magic</p>
          )}
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
