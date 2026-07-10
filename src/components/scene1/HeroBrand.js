"use client";

import { HERO_END } from "@/lib/cameraLens";

const LETTERS = "ROTOMAKER".split("");
const TAGLINE_WORDS = "YOUR OFFSHORE VFX PARTNER".split(" ");

export function HeroBrand({ progress }) {
  if (progress >= HERO_END) return null;

  const fadeOut = Math.max(0, 1 - progress / HERO_END);
  if (fadeOut <= 0.01) return null;

  return (
    <div className="hero-brand" style={{ opacity: fadeOut }} aria-label="Rotomaker">
      <div className="hero-brand__backdrop" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/got.jpg"
          alt=""
          className="hero-brand__backdrop-image"
          draggable={false}
        />
        <div className="hero-brand__backdrop-shade" />
      </div>

      <div className="hero-brand__glow" aria-hidden="true" />

      <div className="hero-brand__stack">
        <h1 className="hero-brand__title" aria-hidden="true">
          {LETTERS.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="hero-brand__letter"
              style={{ animationDelay: `${0.18 + index * 0.08}s` }}
            >
              {letter}
            </span>
          ))}
        </h1>
        <span className="sr-only">Rotomaker</span>

        <p className="hero-brand__tagline" aria-hidden="true">
          {TAGLINE_WORDS.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="hero-brand__tagline-word"
              style={{ animationDelay: `${0.95 + index * 0.1}s` }}
            >
              {word}
            </span>
          ))}
        </p>
      </div>
    </div>
  );
}
