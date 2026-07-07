/** Resolve movie poster URLs — external links are proxied to avoid hotlink blocks. */
export function resolveMovieImageUrl(src) {
  const url = typeof src === "string" ? src.trim() : "";
  if (!url) return "";
  if (url.startsWith("/")) return url;
  if (url.startsWith("/api/movie-image")) return url;
  return `/api/movie-image?url=${encodeURIComponent(url)}`;
}
