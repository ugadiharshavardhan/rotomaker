"use client";

const HERO_END = 0.05;

export function HeroSpotlights({ progress }) {
  if (progress >= HERO_END) return null;

  const fadeOut = Math.max(0, 1 - progress / HERO_END);
  if (fadeOut <= 0.01) return null;

  return (
    <div
      className="hero-spotlights"
      style={{ opacity: fadeOut }}
      aria-hidden="true"
    >
      <div className="hero-spotlights__corner hero-spotlights__corner--left" />
      <div className="hero-spotlights__corner hero-spotlights__corner--right" />
      <div className="hero-spotlights__focus" />
      <div className="hero-spotlights__floor" />
    </div>
  );
}
