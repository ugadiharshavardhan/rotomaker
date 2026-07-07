"use client";

import { useEffect, useState } from "react";
import { isImageReady, warmImage } from "@/lib/moviesImageCache";

export function MoviePosterCard({ movie, reveal = 1 }) {
  const [loaded, setLoaded] = useState(() => isImageReady(movie.image));

  useEffect(() => {
    if (isImageReady(movie.image)) {
      setLoaded(true);
      return;
    }

    let active = true;
    warmImage(movie.image).then((img) => {
      if (!active) return;
      setLoaded(Boolean(img && img.naturalWidth > 0));
    });

    return () => {
      active = false;
    };
  }, [movie.image]);

  return (
    <div
      className="enhanced-movies__poster"
      style={{
        opacity: reveal,
        transform: `translateY(${(1 - reveal) * 20}px) scale(${0.92 + reveal * 0.08})`,
      }}
    >
      <div className="enhanced-movies__poster-frame" aria-hidden="true">
        <span className="enhanced-movies__poster-corner enhanced-movies__poster-corner--tl" />
        <span className="enhanced-movies__poster-corner enhanced-movies__poster-corner--tr" />
        <span className="enhanced-movies__poster-corner enhanced-movies__poster-corner--bl" />
        <span className="enhanced-movies__poster-corner enhanced-movies__poster-corner--br" />
      </div>
      <img
        src={movie.image}
        alt={movie.title}
        decoding="async"
        fetchPriority="high"
        loading="eager"
        className={`enhanced-movies__poster-img${loaded ? " enhanced-movies__poster-img--ready" : ""}`}
      />
    </div>
  );
}
