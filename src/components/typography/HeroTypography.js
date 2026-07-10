"use client";

import {
  IMPOSSIBLE_SECTION_END,
  VFX_SECTION_END,
  getScene1Phase,
} from "@/lib/cameraLens";

export function HeroTypography({ scene1Progress, scene1Opacity = 1 }) {
  const phase = getScene1Phase(scene1Progress);

  if (
    phase !== "impossible" ||
    scene1Opacity <= 0.01 ||
    scene1Progress < VFX_SECTION_END ||
    scene1Progress >= IMPOSSIBLE_SECTION_END
  ) {
    return null;
  }

  const fade = 0.045;
  const fadeIn = Math.min(1, (scene1Progress - VFX_SECTION_END) / fade);
  const fadeOut = Math.min(1, (IMPOSSIBLE_SECTION_END - scene1Progress) / fade);
  const opacity = Math.min(fadeIn, fadeOut) * scene1Opacity;

  if (opacity <= 0.01) return null;

  const lines = ["WE", "BUILD", "THE", "IMPOSSIBLE"];

  return (
    <div className="hero-typography hero-typography--impossible" style={{ opacity }} aria-hidden="true">
      <div className="hero-typography__inner">
        {lines.map((line, i) => (
          <span
            key={line}
            className={`hero-typography__line${line === "IMPOSSIBLE" ? " hero-typography__line--accent" : ""}`}
            style={{
              transform: `translateY(${(1 - opacity) * (30 + i * 10)}px)`,
              opacity: Math.min(1, opacity * 1.5 - i * 0.08),
            }}
          >
            {line}
          </span>
        ))}
      </div>
    </div>
  );
}
