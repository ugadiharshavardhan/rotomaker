"use client";

import { InfiniteGallery } from "@/components/gallery/InfiniteGallery";

export function Scene2World({ progress = 0, opacity = 1, mouse }) {
  if (opacity <= 0.01) return null;

  return (
    <InfiniteGallery
      progress={progress}
      opacity={opacity}
      mouse={mouse}
      active={opacity > 0.01}
    />
  );
}
