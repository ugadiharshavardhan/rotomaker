"use client";

import Image from "next/image";

export function MoviePosterCard({ movie, reveal = 1, isActive = true }) {
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
      <Image
        src={movie.image}
        alt={movie.title}
        fill
        sizes="(max-width: 768px) 60vw, 17rem"
        quality={75}
        priority={isActive}
        loading={isActive ? "eager" : "lazy"}
        className="enhanced-movies__poster-img"
      />
    </div>
  );
}
