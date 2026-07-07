import { clamp, smoothstep } from "./easing";

/** One item pinned per scroll slot — eased enter, long hold, eased exit. */
export function getPinnedSegmentIndex(progress, count, options = {}) {
  const {
    introHold = 0.05,
    animPortion = 0.14,
    holdEnd = 0.86,
    motionAmount = 24,
  } = options;

  const p = Math.min(0.999, Math.max(0, progress));

  if (count <= 0) {
    return {
      index: 0,
      segmentProgress: 0,
      local: 0,
      isHolding: true,
      opacity: 1,
      transform: "none",
    };
  }

  if (p < introHold) {
    const enter = smoothstep(p / introHold);
    return {
      index: 0,
      segmentProgress: 0,
      local: 0,
      isHolding: false,
      opacity: enter,
      transform: "none",
    };
  }

  const t = (p - introHold) / (1 - introHold);
  const slotSize = 1 / count;
  const index = Math.min(count - 1, Math.floor(t / slotSize));
  const local = (t - index * slotSize) / slotSize;

  let segmentProgress = 0;
  let opacity = 1;
  let transform = "none";

  if (local < animPortion) {
    segmentProgress = smoothstep(local / animPortion);
    opacity = segmentProgress;
    transform = `translateY(${(1 - segmentProgress) * motionAmount}px)`;
  } else if (local < holdEnd) {
    segmentProgress = 1;
    opacity = 1;
    transform = "none";
  } else {
    segmentProgress = 1;
    const exit = smoothstep(Math.min(1, (local - holdEnd) / (1 - holdEnd)));
    opacity = 1 - exit;
    transform = `translateY(${exit * -motionAmount}px)`;
  }

  const isHolding = local >= animPortion && local < holdEnd;

  return { index, segmentProgress, local, isHolding, opacity, transform };
}

/** Services cards — one VFX service at a time. */
export function getServicesItemIndex(progress, count) {
  return getPinnedSegmentIndex(progress, count, {
    introHold: 0.06,
    animPortion: 0.14,
    holdEnd: 0.84,
    motionAmount: 16,
  });
}

/** Discrete milestone stops — each stat holds at full value before advancing. */
export function getStatItemIndex(progress, count) {
  const pinned = getPinnedSegmentIndex(progress, count, {
    introHold: 0.06,
    animPortion: 0.14,
    holdEnd: 0.84,
    motionAmount: 14,
  });
  return {
    index: pinned.index,
    segmentProgress: pinned.segmentProgress,
    isHolding: pinned.isHolding,
  };
}

/** Production reel — one movie pinned at a time. */
export function getReelItemIndex(progress, count) {
  const pinned = getPinnedSegmentIndex(progress, count, {
    introHold: 0.06,
    animPortion: 0.14,
    holdEnd: 0.82,
    motionAmount: 12,
  });
  return {
    index: pinned.index,
    segmentProgress: pinned.segmentProgress,
    opacity: pinned.isHolding || pinned.segmentProgress >= 1 ? 1 : pinned.opacity,
    transform: pinned.transform === "none" ? "none" : pinned.transform,
    isHolding: pinned.isHolding,
  };
}

/** Movies library — one category panel at a time, long hold per subsection. */
export function getMoviesPanelIndex(progress, count) {
  const pinned = getPinnedSegmentIndex(progress, count, {
    introHold: 0.14,
    animPortion: 0.07,
    holdEnd: 0.93,
    motionAmount: 0,
  });
  return {
    index: pinned.index,
    opacity: pinned.opacity,
    transform: "none",
    isHolding: pinned.isHolding,
  };
}

/** About / Why panels — pinned scroll. */
export function getAboutPanelIndex(progress, count) {
  const pinned = getPinnedSegmentIndex(progress, count, {
    introHold: 0.06,
    animPortion: 0.14,
    holdEnd: 0.84,
    motionAmount: 20,
  });
  return {
    index: pinned.index,
    segmentProgress: pinned.local,
    opacity: pinned.opacity,
    transform: pinned.transform,
    isHolding: pinned.isHolding,
  };
}
