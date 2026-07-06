"use client";

const HERO_END = 0.05;

export function HeroAquaman({ progress }) {
  if (progress >= HERO_END) return null;

  const fadeOut = Math.max(0, 1 - progress / HERO_END);
  if (fadeOut <= 0.01) return null;

  return (
    <div className="hero-aquaman" style={{ opacity: fadeOut }} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/aquaman.png"
        alt=""
        className="hero-aquaman__image"
        draggable={false}
      />
    </div>
  );
}
