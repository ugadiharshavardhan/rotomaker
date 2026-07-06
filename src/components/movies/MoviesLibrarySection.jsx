"use client";

import { useLayoutEffect } from "react";
import dynamic from "next/dynamic";
import { MOVIE_LIBRARY_CATEGORIES, MOVIE_LIBRARY_PANELS } from "@/lib/moviesData";
import { getMoviesPanelIndex } from "@/lib/statsScroll";
import { warmImageCache } from "@/lib/moviesImageCache";

const DomeGallery = dynamic(() => import("./DomeGallery"), { ssr: false });

const ALL_MOVIES_LIBRARY_IMAGES = [
  ...new Set(
    MOVIE_LIBRARY_CATEGORIES.flatMap((category) =>
      category.movies.map((movie) => movie.image)
    )
  ),
];

function PanelProgress({ total, active }) {
  return (
    <div className="story-flow__progress movies-flow__progress" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`scene4-dot${i === active ? " scene4-dot--active" : ""}${i < active ? " scene4-dot--done" : ""}`}
        />
      ))}
    </div>
  );
}

function CategoryPanel({ category, motion }) {
  const galleryImages = category.movies.map((movie) => ({
    src: movie.image,
    alt: `${movie.title} (${movie.year})`,
  }));

  return (
    <div
      className="movies-flow__panel story-flow__panel"
      style={{ opacity: motion.opacity, transform: motion.transform }}
    >
      <h2 className="story-flow__title">{category.title}</h2>
      <p className="story-flow__desc movies-flow__desc">{category.description}</p>
      <p className="movies-flow__hint">Drag to explore · Click a poster to enlarge</p>

      <div className="movies-flow__dome">
        <DomeGallery
          key={category.id}
          images={galleryImages}
          fit={0.9}
          fitBasis="min"
          minRadius={480}
          maxRadius={1200}
          padFactor={0.06}
          overlayBlurColor="transparent"
          seamless
          grayscale={false}
          imageBorderRadius="6px"
          openedImageBorderRadius="8px"
          openedImageWidth="320px"
          openedImageHeight="480px"
          dragSensitivity={14}
          dragDampening={0.9}
          autoRotateSpeed={0.075}
          segments={35}
        />
      </div>
    </div>
  );
}

export function MoviesLibrarySection({ progress, opacity = 1 }) {
  useLayoutEffect(() => {
    void warmImageCache(ALL_MOVIES_LIBRARY_IMAGES);
  }, []);

  if (opacity <= 0.01) return null;

  const { index, opacity: panelOpacity, transform } = getMoviesPanelIndex(
    progress,
    MOVIE_LIBRARY_PANELS.length
  );
  const panel = MOVIE_LIBRARY_PANELS[index];

  return (
    <section className="story-flow movies-flow" style={{ opacity }}>
      <div className="story-flow__chrome">
        <span className="services-flow__mark story-flow__mark" aria-hidden="true" />
        <p className="scene9-eyebrow story-flow__eyebrow">Our Movies</p>
        <div className="scene4-index story-flow__index">
          {String(index + 1).padStart(2, "0")} / {String(MOVIE_LIBRARY_PANELS.length).padStart(2, "0")}
        </div>
      </div>

      <div className="story-flow__stage movies-flow__stage">
        <CategoryPanel
          category={panel.category}
          motion={{ opacity: panelOpacity, transform }}
        />
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

      <PanelProgress total={MOVIE_LIBRARY_PANELS.length} active={index} />
    </section>
  );
}
