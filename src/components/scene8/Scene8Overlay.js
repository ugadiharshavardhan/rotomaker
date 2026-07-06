"use client";

import { BEFORE_AFTER } from "@/lib/experienceData";

export function Scene8Overlay({ progress, opacity = 1 }) {
  const reveal = Math.min(1, progress / 0.15);
  const wipe = Math.min(1, Math.max(0, (progress - 0.1) / 0.75));
  const wipePercent = wipe * 100;

  if (opacity <= 0) return null;

  return (
    <div className="scene8-overlay scene-interactive-layer" style={{ opacity }}>
      <header className="scene8-header" style={{ opacity: reveal }}>
        <p className="scene8-eyebrow">You Are The Pipeline</p>
        <h2 className="scene8-title">{BEFORE_AFTER.title}</h2>
        <p className="scene8-category">{BEFORE_AFTER.category}</p>
      </header>

      <div className="scene8-stage video-reveal" style={{ opacity: reveal }}>
        <div className="scene8-panel scene8-panel--before">
          <img
            src={BEFORE_AFTER.beforeImage}
            alt={`${BEFORE_AFTER.title} — ${BEFORE_AFTER.beforeLabel}`}
            className="scene8-image"
            draggable={false}
          />
          <span className="scene8-label">{BEFORE_AFTER.beforeLabel}</span>
        </div>

        <div
          className="scene8-panel scene8-panel--after"
          style={{ clipPath: `inset(0 ${100 - wipePercent}% 0 0)` }}
        >
          <img
            src={BEFORE_AFTER.afterImage}
            alt={`${BEFORE_AFTER.title} — ${BEFORE_AFTER.afterLabel}`}
            className="scene8-image"
            draggable={false}
          />
          <span className="scene8-label scene8-label--after">{BEFORE_AFTER.afterLabel}</span>
        </div>

        <div className="scene8-wipe-line" style={{ left: `${wipePercent}%` }}>
          <span className="scene8-wipe-handle" />
        </div>
      </div>

      <p className="scene8-prompt" style={{ opacity: reveal * (1 - wipe * 0.5) }}>
        Scroll to remove VFX
      </p>

      <div className="scene8-progress" style={{ opacity: reveal * 0.5 }}>
        <div className="scene8-progress__bar" style={{ width: `${wipePercent}%` }} />
      </div>
    </div>
  );
}
