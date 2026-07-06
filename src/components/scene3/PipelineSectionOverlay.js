"use client";

export function PipelineSectionOverlay({ progress, opacity = 1, variant = "full" }) {
  if (opacity <= 0.01 || progress < 0.06) return null;

  const reveal = Math.min(1, (progress - 0.06) / (variant === "intro" ? 0.28 : 0.2));
  const combined = opacity * reveal;

  return (
    <div
      className={`pipeline-section${variant === "intro" ? " pipeline-section--intro" : ""}`}
      style={{ opacity: combined }}
    >
      <div className="pipeline-section__eyebrow">
        <span className="pipeline-section__eyebrow-line" />
        <span>CGI PRODUCTION PIPELINE</span>
      </div>

      <h2 className="pipeline-section__title">
        <span className="pipeline-section__title-top">INSIDE THE</span>
        <span className="pipeline-section__title-main">PIPELINE</span>
      </h2>

      <p className="pipeline-section__desc">
        Screens. Nodes. Cameras. Tracking points. Motion paths. Film reels — all
        connected.
      </p>
    </div>
  );
}
