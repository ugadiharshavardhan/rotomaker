export function getMoviesDomeMinRadius(width) {
  // Larger mobile radius → bigger tiles, less empty black between posters.
  if (width < 480) return 460;
  if (width < 768) return 520;
  if (width < 1024) return 480;
  if (width < 1200) return 500;
  return 560;
}
