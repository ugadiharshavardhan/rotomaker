import { MOVIE_IMAGES } from "@/lib/portfolioData";
import { MOVIE_LIBRARY_CATEGORIES } from "@/lib/moviesData";

/**
 * Poster URLs for the infinite gallery:
 * local /cards first, then every image from the Our Movies library.
 */
export function getGalleryPosterUrls() {
  const library = MOVIE_LIBRARY_CATEGORIES.flatMap((category) =>
    category.movies.map((movie) => movie.image).filter(Boolean)
  );

  const seen = new Set();
  const urls = [];

  for (const url of [...MOVIE_IMAGES, ...library]) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }

  return urls;
}

export const GALLERY_POSTER_URLS = getGalleryPosterUrls();
