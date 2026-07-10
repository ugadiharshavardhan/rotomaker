import { MOVIE_LIBRARY_CATEGORIES } from "@/lib/moviesData";
import { PORTFOLIO } from "@/lib/experienceData";
import { MOVIE_IMAGES } from "@/lib/portfolioData";
import { warmImageCache } from "@/lib/moviesImageCache";

/** Skip blank URLs so preloaders never render `<img src="">`. */
function isValidImageUrl(src) {
  return typeof src === "string" && src.trim().length > 0;
}

/** All unique image URLs used across the experience. */
export function collectExperienceImageUrls() {
  const urls = new Set();

  MOVIE_IMAGES.forEach((src) => {
    if (isValidImageUrl(src)) urls.add(src.trim());
  });
  PORTFOLIO.forEach((item) => {
    if (isValidImageUrl(item.image)) urls.add(item.image.trim());
  });

  MOVIE_LIBRARY_CATEGORIES.forEach((category) => {
    category.movies.forEach((movie) => {
      if (isValidImageUrl(movie.image)) urls.add(movie.image.trim());
    });
  });

  urls.add("/vfx/vfx-after.png");
  urls.add("/vfx/vfx-brfore.png");
  urls.add("/got.jpg");

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
