"use client";

import { useLayoutEffect, useState } from "react";
import dynamic from "next/dynamic";
import { MOVIE_LIBRARY_CATEGORIES, MOVIE_LIBRARY_PANELS } from "@/lib/moviesData";
import { getMoviesPanelIndex } from "@/lib/statsScroll";
import { warmImageCache } from "@/lib/moviesImageCache";
import { getMoviesDomeMinRadius } from "@/lib/viewport";

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

function CategoryDome({ category, minRadius, isMobile }) {
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
        fit={isMobile ? 1.12 : 1.02}
        fitBasis="max"
        minRadius={minRadius}
        maxRadius={1500}
        padFactor={isMobile ? 0.01 : 0.02}
        overlayBlurColor="transparent"
        seamless
        grayscale={false}
        imageBorderRadius={isMobile ? "4px" : "6px"}
        openedImageBorderRadius="8px"
        openedImageWidth={isMobile ? "min(72vw, 260px)" : "280px"}
        openedImageHeight={isMobile ? "min(58vh, 390px)" : "420px"}
        dragSensitivity={isMobile ? 12 : 14}
        dragDampening={0.9}
        autoRotateSpeed={0.075}
        segments={isMobile ? 28 : 35}
      />
    </div>
  );
}

export function MoviesLibrarySection({ progress, opacity = 1 }) {
  const [minRadius, setMinRadius] = useState(560);
  const [isMobile, setIsMobile] = useState(false);

  useLayoutEffect(() => {
    void warmImageCache(ALL_MOVIES_LIBRARY_IMAGES);
  }, []);

  useLayoutEffect(() => {
    const sync = () => {
      const width = window.innerWidth;
      setMinRadius(getMoviesDomeMinRadius(width));
      setIsMobile(width < 768);
    };
    sync();
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
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
        <CategoryDome category={panel.category} minRadius={minRadius} isMobile={isMobile} />
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
