import { MOVIE_LIBRARY_CATEGORIES } from "@/lib/moviesData";
import { PORTFOLIO } from "@/lib/experienceData";
import { MOVIE_IMAGES } from "@/lib/portfolioData";
import { warmImageCache } from "@/lib/moviesImageCache";

/** All unique image URLs used across the experience. */
export function collectExperienceImageUrls() {
  const urls = new Set();

  MOVIE_IMAGES.forEach((src) => urls.add(src));
  PORTFOLIO.forEach((item) => urls.add(item.image));

  MOVIE_LIBRARY_CATEGORIES.forEach((category) => {
    category.movies.forEach((movie) => urls.add(movie.image));
  });

  urls.add("/vfx/vfx-after.png");
  urls.add("/vfx/vfx-brfore.png");

  return [...urls];
}

export const EXPERIENCE_IMAGE_URLS = collectExperienceImageUrls();

/** Local poster assets — safe for layout <link rel="preload">. */
export const LOCAL_MOVIE_CARD_URLS = EXPERIENCE_IMAGE_URLS.filter((src) =>
  src.startsWith("/")
);

export function preloadImages(urls) {
  if (typeof window === "undefined") return Promise.resolve();
  return warmImageCache(urls);
}
