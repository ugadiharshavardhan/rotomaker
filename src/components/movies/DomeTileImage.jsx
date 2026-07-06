"use client";

import { useEffect, useState } from "react";
import { isImageReady, warmImage } from "@/lib/moviesImageCache";

export function DomeTileImage({ src, alt }) {
  const [ready, setReady] = useState(() => isImageReady(src));

  useEffect(() => {
    if (!src) return;
    if (isImageReady(src)) {
      setReady(true);
      return;
    }
    let active = true;
    warmImage(src).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [src]);

  return (
    <img
      src={src}
      draggable={false}
      alt={alt}
      loading="eager"
      decoding="async"
      fetchPriority="high"
      className={ready ? "dome-tile-img--ready" : "dome-tile-img--loading"}
    />
  );
}
