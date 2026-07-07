"use client";

import { useLayoutEffect } from "react";
import { MOVIE_IMAGES } from "@/lib/portfolioData";
import { warmImageCache } from "@/lib/moviesImageCache";

export function PortfolioImagePreloader() {
  useLayoutEffect(() => {
    void warmImageCache(MOVIE_IMAGES);
  }, []);

  return (
    <div className="portfolio-preload" aria-hidden="true">
      {MOVIE_IMAGES.map((src) => (
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
