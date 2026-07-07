import { smoothstep, clamp } from "./easing";

export const MOVIE_CARDS = [
  { id: "spiderman", title: "Spider-Man", image: "/cards/spiderman.jpg" },
  { id: "aquaman", title: "Aquaman", image: "/cards/aquaman.jpg" },
  { id: "blackpanther", title: "Black Panther", image: "/cards/blackpanther.jpg" },
  { id: "1917", title: "1917", image: "/cards/1917movie.jpg" },
  { id: "dune", title: "Dune", image: "/cards/dune.jpg" },
  { id: "interstellar", title: "Interstellar", image: "/cards/interstellar.jpg" },
  { id: "avatar", title: "Avatar", image: "/cards/avatar.jpg" },
  { id: "oppenheimer", title: "Oppenheimer", image: "/cards/oppenheimer.jpg" },
  { id: "blade-runner", title: "Blade Runner 2049", image: "/cards/blade-runner.jpg" },
  { id: "matrix", title: "The Matrix", image: "/cards/matrix.jpg" },
];

export const MOVIE_IMAGES = MOVIE_CARDS.map((card) => card.image);

export function getActiveItemIndex(progress, count) {
  const index = Math.min(count - 1, Math.floor(progress * count));
  const segmentProgress = progress * count - index;
  return { index, segmentProgress };
}

/**
 * Enhanced Movies — pinned scroll with a dedicated hold window for the last poster
 * so it does not get cut off when the next section crossfades in.
 */
export function getPortfolioItemIndex(progress, count) {
  const p = Math.min(0.999, Math.max(0, progress));
  const introHold = 0.1;
  const lastHold = 0.22;

  if (count <= 0) {
    return { index: 0, segmentProgress: 1 };
  }

  if (count === 1) {
    return { index: 0, segmentProgress: smoothstep(p) };
  }

  if (p < introHold) {
    return {
      index: 0,
      segmentProgress: smoothstep(p / introHold) * 0.65,
    };
  }

  if (p >= 1 - lastHold) {
    const local = (p - (1 - lastHold)) / lastHold;
    return {
      index: count - 1,
      segmentProgress: 0.75 + smoothstep(local) * 0.25,
    };
  }

  const midSpan = 1 - introHold - lastHold;
  const t = clamp((p - introHold) / midSpan);
  const midCount = count - 1;
  const index = Math.min(midCount - 1, Math.floor(t * midCount));
  const local = t * midCount - index;
  const enter = smoothstep(Math.min(1, local / 0.18));
  const exit =
    local > 0.82 ? 1 - smoothstep((local - 0.82) / 0.18) : 1;

  return {
    index,
    segmentProgress: Math.max(0.35, enter * exit),
  };
}
