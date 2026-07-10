"use client";

export function ExperienceLoadingScreen({ progress = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(progress * 100)));

  return (
    <div className="experience-loader" role="status" aria-live="polite" aria-busy="true">
      <div className="experience-loader__inner">
        <div className="experience-loader__spinner" aria-hidden="true">
          <span className="experience-loader__ring" />
          <span className="experience-loader__ring experience-loader__ring--delay" />
        </div>

        <p className="experience-loader__brand">ROTOMAKER</p>
        <p className="experience-loader__label">Loading experience</p>

        <div className="experience-loader__bar" aria-hidden="true">
          <div className="experience-loader__bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <p className="experience-loader__pct">{pct}%</p>
      </div>
    </div>
  );
}
