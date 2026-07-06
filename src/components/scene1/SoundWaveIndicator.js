"use client";

import { getScene1Phase, getVfxLocalProgress } from "@/lib/cameraLens";

export function SoundWaveIndicator({ progress, dark = false }) {
  const phase = getScene1Phase(progress);

  if (phase !== "vfx") return null;

  const local = getVfxLocalProgress(progress);
  const opacity = Math.max(0, 1 - local / 0.18);

  if (opacity <= 0.01) return null;

  return (
    <div className={`sound-wave${dark ? " sound-wave--dark" : ""}`} style={{ opacity }} aria-hidden="true">
      <span className="sound-wave__label">Entering studio</span>
      <div className="sound-wave__bars">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="sound-wave__bar"
            style={{ animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </div>
      <span className="sound-wave__sublabel">Scroll to explore</span>
    </div>
  );
}
