"use client";

import { InfiniteGallery } from "@/components/gallery/InfiniteGallery";

/**
 * Always render once LazyWorld mounts so the gallery can warm off-screen.
 */
export function Scene2World({ progress = 0, opacity = 1, mouse }) {
  const live = opacity > 0.02;

  return (
    <InfiniteGallery
      progress={progress}
      opacity={opacity}
      mouse={mouse}
      live={live}
    />
  );
}
