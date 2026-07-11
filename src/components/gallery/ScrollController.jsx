"use client";

import { GALLERY } from "@/lib/galleryConfig";

/** Local progress phases inside the Future of Cinema section */
export const GALLERY_HOLD_END = 0.26;
export const GALLERY_CRUISE_END = 0.78;

/**
 * Maps scene scroll progress → camera Z along the tunnel (−Z forward).
 * Hold beat keeps the camera still so the title can land first.
 */
export function getScrollTravelZ(progress) {
  const p = Math.min(1, Math.max(0, progress));

  if (p <= GALLERY_HOLD_END) return 0;

  const cruiseSpan = GALLERY_CRUISE_END - GALLERY_HOLD_END;
  const cruise = Math.min(1, (p - GALLERY_HOLD_END) / cruiseSpan);
  const eased = cruise * cruise * (3 - 2 * cruise);

  const exitT = p > GALLERY_CRUISE_END ? (p - GALLERY_CRUISE_END) / (1 - GALLERY_CRUISE_END) : 0;
  const exitPull = exitT * exitT * 52;

  return -(eased * GALLERY.TRAVEL + exitPull);
}

export function getHeroFade(progress) {
  const p = Math.min(1, Math.max(0, progress));
  // Appear quickly, hold through the title beat, then fade as travel begins
  if (p < 0.05) return p / 0.05;
  if (p < GALLERY_HOLD_END + 0.02) return 1;
  if (p < GALLERY_HOLD_END + 0.18) {
    return 1 - (p - (GALLERY_HOLD_END + 0.02)) / 0.16;
  }
  return 0;
}

/** Grid + posters resolve during the title hold (before flight). */
export function getEntranceReveal(progress) {
  const t = Math.min(1, Math.max(0, progress / 0.16));
  return t * t * (3 - 2 * t);
}

/** Settle camera into the corridor during hold (not forward travel). */
export function getHoldSettle(progress) {
  const t = Math.min(1, Math.max(0, progress / Math.max(0.12, GALLERY_HOLD_END * 0.7)));
  return t * t * (3 - 2 * t);
}

/** Last stretch: dissolve grid/posters into the vanishing light before services. */
export function getExitFade(progress) {
  if (progress < GALLERY_CRUISE_END) return 1;
  const t = (progress - GALLERY_CRUISE_END) / (1 - GALLERY_CRUISE_END);
  return 1 - t * t * (3 - 2 * t);
}

export function getExitBrighten(progress) {
  if (progress < GALLERY_CRUISE_END) return 0;
  const t = (progress - GALLERY_CRUISE_END) / (1 - GALLERY_CRUISE_END);
  return t * t;
}
