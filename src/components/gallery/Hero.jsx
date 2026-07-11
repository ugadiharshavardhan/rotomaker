"use client";

import { getHeroFade } from "./ScrollController";

/**
 * Centered hero copy — CSS entrance only (no GSAP on the scroll path).
 */
export function GalleryHero({ progress = 0, opacity = 1 }) {
  if (opacity <= 0.01) return null;

  const fade = getHeroFade(progress) * opacity;

  return (
    <div
      className={`gallery-hero${opacity > 0.2 ? " gallery-hero--in" : ""}`}
      style={{ opacity: fade }}
      aria-hidden={fade < 0.05}
    >
      <p className="gallery-hero__eyebrow" data-hero-part>
        Rotomaker VFX
      </p>
      <h2 className="gallery-hero__title" data-hero-part>
        THE FUTURE OF CINEMA
      </h2>
      <p className="gallery-hero__sub" data-hero-part>
        Experience Stories Beyond Reality
      </p>
    </div>
  );
}
