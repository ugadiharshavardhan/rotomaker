/** Infinite perspective gallery — shared layout constants */

export const GALLERY = {
  HALF: 3.8,
  SEG_LEN: 8,
  SEG_COUNT: 22,
  /** Fewer divisions = larger grid boxes */
  GRID_DIV: 4,
  /** Dense poster pool (snapped to cells) */
  POSTER_COUNT: 220,
  /** Camera travel along −Z across scene progress 0→1 */
  TRAVEL: 130,
  FOG_NEAR: 5,
  FOG_FAR: 42,
  BG: "#f4f4f4",
  GRID_COLOR: "#c4c4c4",
  GRID_OPACITY: 0.5,
  LOOK_AHEAD: 36,
  /** Poster inset inside a grid cell (world units) */
  CELL_PAD: 0.1,
};

export function getCellSize() {
  return (GALLERY.HALF * 2) / GALLERY.GRID_DIV;
}

export function getCellZ() {
  return GALLERY.SEG_LEN / GALLERY.GRID_DIV;
}

/** Deterministic 0–1 hash from integer seed */
export function hash01(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

export function hashRange(n, min, max) {
  return min + hash01(n) * (max - min);
}
