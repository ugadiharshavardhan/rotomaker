"use client";

import { GLOBE_LOCATIONS } from "@/lib/sceneConfig";

export function Scene5Overlay({ progress, opacity = 1 }) {
  const reveal = Math.min(1, progress / 0.35);

  if (opacity <= 0) return null;

  return (
    <div className="scene5-overlay" style={{ opacity }}>
      <p className="scene5-eyebrow" style={{ opacity: reveal }}>
        Global Production
      </p>
      <h2 className="scene5-heading" style={{ opacity: reveal }}>
        World Wide
      </h2>
      <p className="scene5-subheading" style={{ opacity: reveal * 0.92 }}>
        Feature-film VFX delivered across three continents — one pipeline, synchronized dailies,
        and timezone-overlap for round-the-clock compositing.
      </p>

      <ul className="scene5-locations" style={{ opacity: reveal * 0.9 }}>
        {GLOBE_LOCATIONS.map((loc, i) => (
          <li
            key={loc.name}
            className="scene5-location"
            style={{
              opacity: Math.max(0, Math.min(1, (progress - 0.2 - i * 0.08) / 0.2)),
              transform: `translateY(${Math.max(0, (0.3 - progress + i * 0.05) * 20)}px)`,
            }}
          >
            <span className="scene5-location__dot" />
            <div className="scene5-location__text">
              <a
                href={loc.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="scene5-location__link"
              >
                {loc.name}
              </a>
              {loc.label && <span className="scene5-location__label">{loc.label}</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
