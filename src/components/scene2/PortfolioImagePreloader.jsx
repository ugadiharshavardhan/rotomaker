"use client";

import { useLayoutEffect } from "react";
import { MOVIE_IMAGES } from "@/lib/portfolioData";
import { GALLERY_POSTER_URLS } from "@/lib/galleryPosters";
import { warmImageCache } from "@/lib/moviesImageCache";

export function PortfolioImagePreloader() {
  useLayoutEffect(() => {
    void warmImageCache(GALLERY_POSTER_URLS);
  }, []);

  return (
    <div className="portfolio-preload" aria-hidden="true">
      {GALLERY_POSTER_URLS.slice(0, 24).map((src) => (
        <img
          key={src}
          src={src}
          alt=""
          decoding="async"
          fetchPriority="high"
          loading="eager"
        />
      ))}
    </div>
  );
}
