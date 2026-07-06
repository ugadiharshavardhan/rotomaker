"use client";

import { MagneticButton } from "@/components/interactions/MagneticButton";

export function Scene11Overlay({ progress, opacity = 1 }) {
  const lightLevel = Math.min(1, progress / 0.5);
  const reveal = Math.min(1, progress / 0.25);
  const contentReveal = Math.max(0, (progress - 0.4) / 0.4);

  if (opacity <= 0) return null;

  return (
    <div
      className="scene11-overlay scene-interactive-layer"
      style={{
        opacity,
        background: `rgba(3, 3, 3, ${0.85 - lightLevel * 0.5})`,
      }}
    >
      <div
        className="scene11-lights"
        style={{ opacity: lightLevel }}
        aria-hidden="true"
      >
        <div className="scene11-light scene11-light--1" />
        <div className="scene11-light scene11-light--2" />
        <div className="scene11-light scene11-light--3" />
      </div>

      <div className="scene11-silhouettes" style={{ opacity: lightLevel * 0.9 }} aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <figure
            key={i}
            className="scene11-person"
            style={{
              left: `${15 + i * 22}%`,
              opacity: Math.max(0, lightLevel - i * 0.1),
            }}
          >
            <div className="scene11-person__head" />
            <div className="scene11-person__body" />
          </figure>
        ))}
      </div>

      <div className="scene11-monitors-ui" style={{ opacity: lightLevel * 0.7 }} aria-hidden="true">
        <div className="scene11-monitor scene11-monitor--1" />
        <div className="scene11-monitor scene11-monitor--2" />
        <div className="scene11-monitor scene11-monitor--3" />
      </div>

      <div
        className="scene11-content"
        style={{
          opacity: contentReveal,
          transform: `translateY(${(1 - contentReveal) * 30}px)`,
        }}
      >
        <p className="scene11-eyebrow">Join The Studio</p>
        <h2 className="scene11-title">Careers</h2>
        <p className="scene11-desc">
          Enter a global VFX studio where artists craft impossible shots
          for the world&apos;s biggest productions.
        </p>
        <MagneticButton as="a" href="mailto:careers@rotomaker.com" className="scene11-cta" strength={0.35}>
          View Open Roles
        </MagneticButton>
      </div>
    </div>
  );
}
