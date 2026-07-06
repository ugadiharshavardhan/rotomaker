"use client";

import { MOVIE_CARDS } from "@/lib/portfolioData";

export function LeftMovieTitles({ activeIndex }) {
  return (
    <nav className="enhanced-movies__nav" aria-label="Movie list">
      <ul className="enhanced-movies__nav-list">
        {MOVIE_CARDS.map((movie, i) => (
          <li
            key={movie.id}
            className={`enhanced-movies__nav-item${i === activeIndex ? " enhanced-movies__nav-item--active" : ""}${i < activeIndex ? " enhanced-movies__nav-item--done" : ""}`}
          >
            <span className="enhanced-movies__nav-index">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="enhanced-movies__nav-name">{movie.title}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
}
