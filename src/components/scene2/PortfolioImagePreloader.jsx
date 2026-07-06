"use client";

import { useEffect } from "react";
import { MOVIE_IMAGES } from "@/lib/portfolioData";

export function PortfolioImagePreloader() {
  useEffect(() => {
    MOVIE_IMAGES.forEach((src) => {
      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);

  return (
    <div className="portfolio-preload" aria-hidden="true">
      {MOVIE_IMAGES.map((src) => (
        <img key={src} src={src} alt="" decoding="async" fetchPriority="low" />
      ))}
    </div>
  );
}
