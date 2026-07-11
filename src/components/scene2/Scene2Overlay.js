"use client";

import { useLayoutEffect } from "react";
import { GALLERY_POSTER_URLS } from "@/lib/galleryPosters";
import { warmImageCache } from "@/lib/moviesImageCache";
import { GalleryHero } from "@/components/gallery/Hero";

export function Scene2Overlay({ progress, opacity = 1 }) {
  useLayoutEffect(() => {
    void warmImageCache(GALLERY_POSTER_URLS);
  }, []);

  if (opacity <= 0.01) return null;

  return <GalleryHero progress={progress} opacity={opacity} />;
}
