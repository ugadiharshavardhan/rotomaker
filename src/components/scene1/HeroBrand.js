"use client";

const HERO_END = 0.05;
const LETTERS = "ROTOMAKER".split("");

export function HeroBrand({ progress }) {
  if (progress >= HERO_END) return null;

  const fadeOut = Math.max(0, 1 - progress / HERO_END);
  if (fadeOut <= 0.01) return null;

  return (
    <div className="hero-brand" style={{ opacity: fadeOut }} aria-label="Rotomaker">
      <div className="hero-brand__glow" aria-hidden="true" />
      <h1 className="hero-brand__title" aria-hidden="true">
        {LETTERS.map((letter, index) => (
          <span
            key={`${letter}-${index}`}
            className="hero-brand__letter"
            style={{ animationDelay: `${0.12 + index * 0.07}s` }}
          >
            {letter}
          </span>
        ))}
      </h1>
    </div>
  );
}
