/** Discrete milestone stops — each stat holds before advancing. */
export function getStatItemIndex(progress, count) {
  const p = Math.min(0.999, Math.max(0, progress));
  const introHold = 0.08;
  const animPortion = 0.32;

  if (p < introHold) {
    return {
      index: 0,
      segmentProgress: (p / introHold) * animPortion,
      isHolding: false,
    };
  }

  const t = (p - introHold) / (1 - introHold);
  const index = Math.min(count - 1, Math.floor(t * count));
  const local = t * count - index;

  const segmentProgress =
    local < animPortion ? local / animPortion : 1;
  const isHolding = local >= animPortion && local < 0.88;

  return { index, segmentProgress, isHolding };
}

/** Production reel — one movie pinned at a time; no dimming between stops. */
export function getReelItemIndex(progress, count) {
  const p = Math.min(0.999, Math.max(0, progress));
  const introHold = 0.06;

  if (p < introHold) {
    return {
      index: 0,
      segmentProgress: 0,
      opacity: 1,
      transform: "none",
      isHolding: false,
    };
  }

  const t = (p - introHold) / (1 - introHold);
  const floatIndex = t * count;
  const index = Math.min(count - 1, Math.floor(floatIndex));
  const segmentProgress = floatIndex - index;

  return {
    index,
    segmentProgress,
    opacity: 1,
    transform: "none",
    isHolding: segmentProgress < 0.82,
  };
}

/** Movies library panels — snappy scroll, minimal lag. */
export function getMoviesPanelIndex(progress, count) {
  const p = Math.min(0.999, Math.max(0, progress));
  const introHold = 0.04;

  if (p < introHold) {
    const enter = p / introHold;
    return {
      index: 0,
      opacity: enter,
      transform: "none",
    };
  }

  const t = (p - introHold) / (1 - introHold);
  const index = Math.min(count - 1, Math.floor(t * count));
  const local = t * count - index;
  const enter = Math.min(1, local / 0.1);
  const exit = local > 0.88 ? Math.min(1, (local - 0.88) / 0.12) : 0;

  return {
    index,
    opacity: enter * (1 - exit),
    transform: "none",
  };
}

/** About / Why panels — same pinned scroll pattern. */
export function getAboutPanelIndex(progress, count) {
  const p = Math.min(0.999, Math.max(0, progress));
  const introHold = 0.06;

  if (p < introHold) {
    return { index: 0, segmentProgress: p / introHold };
  }

  const t = (p - introHold) / (1 - introHold);
  const index = Math.min(count - 1, Math.floor(t * count));
  const local = t * count - index;
  const enter = Math.min(1, local / 0.22);
  const exit = local > 0.82 ? Math.min(1, (local - 0.82) / 0.18) : 0;

  return {
    index,
    segmentProgress: local,
    opacity: enter * (1 - exit),
    transform: `translateY(${(1 - enter) * 28 + exit * -28}px)`,
  };
}
