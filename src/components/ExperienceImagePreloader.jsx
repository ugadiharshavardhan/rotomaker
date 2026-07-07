"use client";

import { useLayoutEffect } from "react";
import { EXPERIENCE_IMAGE_URLS, preloadImages } from "@/lib/imagePreload";

const CRITICAL_IMAGE_COUNT = 12;

export function ExperienceImagePreloader() {
  useLayoutEffect(() => {
    void preloadImages(EXPERIENCE_IMAGE_URLS);
  }, []);

  const critical = EXPERIENCE_IMAGE_URLS.slice(0, CRITICAL_IMAGE_COUNT);
  const deferred = EXPERIENCE_IMAGE_URLS.slice(CRITICAL_IMAGE_COUNT);

  return (
    <div className="portfolio-preload" aria-hidden="true">
      {critical.filter(Boolean).map((src) => (
        <img key={src} src={src} alt="" decoding="async" fetchPriority="high" loading="eager" />
      ))}
      {deferred.filter(Boolean).map((src) => (
        <img key={src} src={src} alt="" decoding="async" loading="lazy" />
      ))}
    </div>
  );
}
