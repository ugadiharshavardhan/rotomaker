"use client";

export function TypographyOverlay({ progress, sceneOpacity = 1 }) {
  const enter = Math.max(0, Math.min(1, (progress - 0.42) / 0.2));
  const opacity = enter * sceneOpacity;
  const scale = 0.96 + enter * 0.04;

  if (progress < 0.42 || opacity <= 0.01) return null;

  return (
    <div
      className="typography-overlay typography-overlay--sharp"
      style={{
        opacity,
        transform: `translate(-50%, -50%) scale(${scale})`,
      }}
      aria-hidden={enter < 0.5}
    >
      <p className="typography-tagline">Behind Every Impossible Shot</p>
      <h1 className="typography-hero">
        <span className="typography-line">ROTO</span>
        <span className="typography-line typography-line--accent">MAKER</span>
      </h1>
      <div className="typography-flare" style={{ opacity: enter * 0.9 }} />
    </div>
  );
}
