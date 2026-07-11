import { MOVIE_IMAGES } from "@/lib/portfolioData";
import { MOVIE_LIBRARY_CATEGORIES } from "@/lib/moviesData";

/**
 * Poster URLs for the infinite gallery.
 * Local /cards load first (fast); a capped set of library images follow.
 */
export function getGalleryPosterUrls() {
  const library = MOVIE_LIBRARY_CATEGORIES.flatMap((category) =>
    category.movies.map((movie) => movie.image).filter(Boolean)
  );

  const seen = new Set();
  const urls = [];

  for (const url of MOVIE_IMAGES) {
    if (!url || seen.has(url)) continue;
    seen.add(url);
    urls.push(url);
  }

  // Cap remote library images to keep GPU upload light at section entry
  let remoteAdded = 0;
  for (const url of library) {
    if (!url || seen.has(url) || remoteAdded >= 14) continue;
    seen.add(url);
    urls.push(url);
    remoteAdded += 1;
  }

  return urls;
}

export const GALLERY_POSTER_URLS = getGalleryPosterUrls();
