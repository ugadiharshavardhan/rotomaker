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

/** Slower first movie + intro hold; used by portfolio / enhanced movies scene. */
export function getPortfolioItemIndex(progress, count) {
  const p = Math.min(0.999, Math.max(0, progress));
  const introHold = 0.16;

  if (p < introHold) {
    return {
      index: 0,
      segmentProgress: (p / introHold) * 0.55,
    };
  }

  const t = (p - introHold) / (1 - introHold);
  const index = Math.min(count - 1, Math.floor(t * count));
  const segmentProgress = t * count - index;
  return { index, segmentProgress };
}
