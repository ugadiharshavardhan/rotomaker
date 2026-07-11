import moviesJson from "@/data/movies.json";
import { resolveMovieImageUrl } from "@/lib/movieImageUrl";

export const MOVIE_LIBRARY_CATEGORIES = moviesJson.categories.map((category) => ({
  ...category,
  movies: category.movies.map((movie) => {
    const source = typeof movie.image === "string" ? movie.image.trim() : "";
    return {
      ...movie,
      image: resolveMovieImageUrl(source),
    };
  }),
}));

export const MOVIE_LIBRARY_PANELS = MOVIE_LIBRARY_CATEGORIES.map((category) => ({
  type: "category",
  key: category.id,
  category,
}));

/** Unique poster URLs from the Our Movies library (same source as the movies section). */
export const MOVIE_LIBRARY_IMAGES = [
  ...new Set(
    MOVIE_LIBRARY_CATEGORIES.flatMap((category) =>
      category.movies.map((movie) => movie.image).filter(Boolean)
    )
  ),
];
