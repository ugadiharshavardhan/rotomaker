"use client";

import { useLayoutEffect } from "react";
import { MOVIE_CARDS, getPortfolioItemIndex, MOVIE_IMAGES } from "@/lib/portfolioData";
import { warmImageCache } from "@/lib/moviesImageCache";
import { LeftMovieTitles } from "./LeftMovieTitles";
import { MoviePosterCard } from "./MoviePosterCard";

export function Scene2Overlay({ progress, opacity = 1 }) {
  useLayoutEffect(() => {
    void warmImageCache(MOVIE_IMAGES);
  }, []);

  if (opacity <= 0.01) return null;

  const { index: activeIndex, segmentProgress } = getPortfolioItemIndex(
    progress,
    MOVIE_CARDS.length
  );
  const movie = MOVIE_CARDS[activeIndex];
  const reveal = Math.min(1, segmentProgress / 0.28);

  return (
    <div className="enhanced-movies" style={{ opacity }}>
      <aside className="enhanced-movies__sidebar">
        <p className="enhanced-movies__sidebar-label">SELECTED WORK</p>
        <h2 className="enhanced-movies__sidebar-title">ENHANCED MOVIES</h2>
        <LeftMovieTitles activeIndex={activeIndex} />
      </aside>

      <main className="enhanced-movies__content">
        <div className="enhanced-movies__content-header">
          <span className="enhanced-movies__eyebrow">PORTFOLIO</span>
          <span className="enhanced-movies__counter">
            {String(activeIndex + 1).padStart(2, "0")} / {String(MOVIE_CARDS.length).padStart(2, "0")}
          </span>
        </div>

        <div className="enhanced-movies__card-stage">
          <MoviePosterCard key={movie.id} movie={movie} reveal={reveal} />
        </div>

        <div className="enhanced-movies__content-footer">
          <div
            className="enhanced-movies__detail"
            style={{
              opacity: reveal,
              transform: `translateY(${(1 - reveal) * 12}px)`,
            }}
          >
            <span className="enhanced-movies__detail-label">NOW SHOWING</span>
            <h3 className="enhanced-movies__detail-title">{movie.title}</h3>
          </div>

          <div className="enhanced-movies__progress" aria-hidden="true">
            {MOVIE_CARDS.map((item, i) => (
              <span
                key={item.id}
                className={`enhanced-movies__progress-dot${i === activeIndex ? " enhanced-movies__progress-dot--active" : ""}${i < activeIndex ? " enhanced-movies__progress-dot--done" : ""}`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
