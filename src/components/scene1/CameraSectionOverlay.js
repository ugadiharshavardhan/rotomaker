"use client";

import { getScene1Phase, getVfxLocalProgress } from "@/lib/cameraLens";

export function CameraSectionOverlay({ progress }) {
  const phase = getScene1Phase(progress);

  if (phase !== "vfx") return null;

  const local = getVfxLocalProgress(progress);
  const fadeIn = Math.min(1, local / 0.1);
  const fadeOut = local > 0.88 ? Math.max(0, 1 - (local - 0.88) / 0.12) : 1;
  const opacity = fadeIn * fadeOut;

  if (opacity <= 0.01) return null;

  return (
    <div className="camera-section-overlay camera-section-overlay--studio" style={{ opacity }}>
      <div className="camera-section-overlay__left">
        <p className="camera-section-overlay__eyebrow">Rotomaker VFX</p>
        <h2 className="camera-section-overlay__headline">
          BEHIND EVERY
          <br />
          IMPOSSIBLE SHOT
        </h2>
      </div>

      <div className="camera-section-overlay__right">
        <p className="camera-section-overlay__body">
          Premium visual effects outsourcing for film, television, and
          commercials. Frame-perfect rotoscoping, paint, keying, and
          compositing — delivered by artists who live for the invisible
          detail.
        </p>
        <ul className="camera-section-overlay__tags">
          {["ROTO", "PAINT", "KEY", "COMP"].map((tag) => (
            <li key={tag}>{tag}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
