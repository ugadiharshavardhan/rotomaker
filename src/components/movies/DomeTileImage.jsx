"use client";

import { useEffect, useState } from "react";
import { isImageReady, warmImage } from "@/lib/moviesImageCache";

export function DomeTileImage({ src, alt, title }) {
  const imageSrc = typeof src === "string" ? src.trim() : "";
  const [loaded, setLoaded] = useState(() => (imageSrc ? isImageReady(imageSrc) : false));
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!imageSrc) {
      setLoaded(false);
      setFailed(false);
      return;
    }

    if (isImageReady(imageSrc)) {
      setLoaded(true);
      setFailed(false);
      return;
    }

    let active = true;
    setLoaded(false);
    setFailed(false);

    warmImage(imageSrc).then((img) => {
      if (!active) return;
      if (img && img.naturalWidth > 0) {
        setLoaded(true);
        setFailed(false);
      } else {
        setLoaded(false);
        setFailed(true);
      }
    });

    return () => {
      active = false;
    };
  }, [imageSrc]);

  if (!imageSrc || failed) {
    return (
      <div className="dome-tile-placeholder" aria-label={alt}>
        <span>{title || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      draggable={false}
      alt={alt}
      loading="eager"
      decoding="async"
      fetchPriority="high"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={loaded ? "dome-tile-img--ready" : "dome-tile-img--loading"}
    />
  );
}
