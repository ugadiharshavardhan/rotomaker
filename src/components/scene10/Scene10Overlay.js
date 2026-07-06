"use client";

import { PIPELINE_STEPS } from "@/lib/experienceData";

export function Scene10Overlay({ progress, opacity = 1 }) {
  const reveal = Math.min(1, progress / 0.2);
  const count = PIPELINE_STEPS.length;
  const activeIndex = Math.min(
    count - 1,
    Math.floor(progress * count * 1.1)
  );

  if (opacity <= 0) return null;

  return (
    <div className="scene10-overlay" style={{ opacity }}>
      <header className="scene10-header" style={{ opacity: reveal }}>
        <p className="scene10-eyebrow">Process</p>
        <h2 className="scene10-title">Meet Our Pipeline</h2>
      </header>

      <div className="scene10-ring" style={{ opacity: reveal }}>
        {PIPELINE_STEPS.map((step, i) => {
          const angle = (i / count) * 360 - 90;
          const rad = (angle * Math.PI) / 180;
          const x = 50 + Math.cos(rad) * 38;
          const y = 50 + Math.sin(rad) * 32;
          const isActive = i === activeIndex;
          const isDone = i < activeIndex;

          return (
            <div
              key={step}
              className={`scene10-step${isActive ? " scene10-step--active" : ""}${isDone ? " scene10-step--done" : ""}`}
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <span className="scene10-step__dot" />
              <span className="scene10-step__label">{step}</span>
            </div>
          );
        })}
        <div className="scene10-ring__glow" />
      </div>
    </div>
  );
}
