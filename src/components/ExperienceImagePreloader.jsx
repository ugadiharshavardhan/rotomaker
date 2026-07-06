"use client";

import { useLayoutEffect } from "react";
import { EXPERIENCE_IMAGE_URLS, preloadImages } from "@/lib/imagePreload";

export function ExperienceImagePreloader() {
  useLayoutEffect(() => {
    void preloadImages(EXPERIENCE_IMAGE_URLS);
  }, []);

  return (
    <div className="portfolio-preload" aria-hidden="true">
      {EXPERIENCE_IMAGE_URLS.map((src) => (
        <img key={src} src={src} alt="" decoding="async" fetchPriority="high" loading="eager" />
      ))}
    </div>
  );
}
