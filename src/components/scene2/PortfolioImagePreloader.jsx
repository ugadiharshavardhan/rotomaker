"use client";

import { useLayoutEffect } from "react";
import { HERO_CHARACTERS } from "@/lib/heroStory";
import { GALLERY_POSTER_URLS } from "@/lib/galleryPosters";
import { warmImageCache } from "@/lib/moviesImageCache";
import { warmTextureUrls } from "@/components/portfolio/useSafeTextures";

const CHARACTER_IMAGES = HERO_CHARACTERS.map((c) => c.image);

export function PortfolioImagePreloader() {
  useLayoutEffect(() => {
    void warmImageCache([...CHARACTER_IMAGES, ...GALLERY_POSTER_URLS]);
    warmTextureUrls([...CHARACTER_IMAGES, ...GALLERY_POSTER_URLS]);
  }, []);

  return (
    <div className="portfolio-preload" aria-hidden="true">
      {[...CHARACTER_IMAGES, ...GALLERY_POSTER_URLS.slice(0, 12)].map((src) => (
        <img
          key={src}
          src={src}
          alt=""
          decoding="async"
          fetchPriority="low"
          loading="eager"
        />
      ))}
    </div>
  );
}
