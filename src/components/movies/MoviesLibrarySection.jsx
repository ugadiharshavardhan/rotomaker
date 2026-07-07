"use client";

import { useLayoutEffect } from "react";
import dynamic from "next/dynamic";
import { MOVIE_LIBRARY_CATEGORIES, MOVIE_LIBRARY_PANELS } from "@/lib/moviesData";
import { getMoviesPanelIndex } from "@/lib/statsScroll";
import { warmImageCache } from "@/lib/moviesImageCache";

const DomeGallery = dynamic(() => import("./DomeGallery"), {
  ssr: false,
  loading: () => null,
});

const ALL_MOVIES_LIBRARY_IMAGES = [
  ...new Set(
    MOVIE_LIBRARY_CATEGORIES.flatMap((category) =>
      category.movies.map((movie) => movie.image).filter(Boolean)
    )
  ),
];

function CategoryHeader({ category, motion }) {
  return (
    <div
      className="movies-flow__header"
      style={{ opacity: motion.opacity }}
      aria-live="polite"
    >
      <h2 className="movies-flow__title">{category.title}</h2>
      <p className="movies-flow__desc">{category.description}</p>
    </div>
  );
}

function CategoryDome({ category }) {
  const galleryImages = category.movies.map((movie) => ({
    src: movie.image,
    alt: `${movie.title} (${movie.year})`,
    title: movie.title,
  }));

  return (
    <div className="movies-flow__dome">
      <DomeGallery
        key={category.id}
        images={galleryImages}
        fit={1.02}
        fitBasis="max"
        minRadius={560}
        maxRadius={1500}
        padFactor={0.02}
        overlayBlurColor="transparent"
        seamless
        grayscale={false}
        imageBorderRadius="6px"
        openedImageBorderRadius="8px"
        openedImageWidth="280px"
        openedImageHeight="420px"
        dragSensitivity={14}
        dragDampening={0.9}
        autoRotateSpeed={0.075}
        segments={35}
      />
    </div>
  );
}

export function MoviesLibrarySection({ progress, opacity = 1 }) {
  useLayoutEffect(() => {
    void warmImageCache(ALL_MOVIES_LIBRARY_IMAGES);
  }, []);

  useLayoutEffect(() => {
    if (opacity > 0.01) return undefined;
    document.body.classList.remove("dg-scroll-lock");
    return undefined;
  }, [opacity]);

  if (opacity <= 0.01) return null;

  const { index, opacity: panelOpacity } = getMoviesPanelIndex(
    progress,
    MOVIE_LIBRARY_PANELS.length
  );
  const panel = MOVIE_LIBRARY_PANELS[index];

  return (
    <section className="story-flow movies-flow" style={{ opacity }}>
      <div className="movies-flow__topbar">
        <p className="scene9-eyebrow movies-flow__eyebrow">Our Movies</p>
        <div className="movies-flow__index">
          {String(index + 1).padStart(2, "0")} / {String(MOVIE_LIBRARY_PANELS.length).padStart(2, "0")}
        </div>
      </div>

      <CategoryHeader category={panel.category} motion={{ opacity: panelOpacity }} />

      <div className="story-flow__stage movies-flow__stage">
        <CategoryDome category={panel.category} />
      </div>

      <div className="movies-flow__tabs" aria-hidden="true">
        {MOVIE_LIBRARY_CATEGORIES.map((cat, i) => (
          <span
            key={cat.id}
            className={`movies-flow__tab${i === index ? " movies-flow__tab--active" : ""}`}
          >
            {cat.title}
          </span>
        ))}
      </div>
    </section>
  );
}
