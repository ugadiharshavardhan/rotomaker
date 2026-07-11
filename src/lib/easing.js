export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function smoothstep(t) {
  const c = clamp(t);
  return c * c * (3 - 2 * c);
}

export function easeInOutCubic(t) {
  const c = clamp(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

/** Eased reveal when a section first enters (0 → 1 over `duration` of local progress). */
export function sectionReveal(progress, duration = 0.22) {
  return smoothstep(clamp(progress / duration));
}

/** Smooth section crossfade — eased fade-in and fade-out at boundaries. */
export function crossfadeOpacity(global, start, end, edgeFade = 0.028, isLast = false) {
  if (global < start || (!isLast && global >= end)) return 0;

  const span = Math.max(end - start, 0.0001);
  const fade = Math.min(edgeFade, span * 0.4);

  // Scene starting at 0 has no previous section — never fade in from invisible
  // (otherwise progress 0 yields opacity 0 and a black hole after loading).
  const fadeIn =
    start <= 0 ? 1 : smoothstep(clamp((global - start) / Math.max(fade, 0.0001)));
  const fadeOut = isLast ? 1 : smoothstep(clamp((end - global) / Math.max(fade, 0.0001)));
  return fadeIn * fadeOut;
}
