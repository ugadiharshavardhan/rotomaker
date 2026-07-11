"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { getHeroFade } from "./ScrollController";

/**
 * Centered hero copy over the tunnel — fades out as the user scrolls.
 */
export function GalleryHero({ progress = 0, opacity = 1 }) {
  const rootRef = useRef(null);
  const entered = useRef(false);

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el || entered.current || opacity < 0.2) return;
    entered.current = true;

    const parts = el.querySelectorAll("[data-hero-part]");
    gsap.fromTo(
      parts,
      { y: 28, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        stagger: 0.12,
        ease: "power3.out",
        delay: 0.15,
      }
    );
  }, [opacity]);

  if (opacity <= 0.01) return null;

  const fade = getHeroFade(progress) * opacity;

  return (
    <div
      ref={rootRef}
      className="gallery-hero"
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
