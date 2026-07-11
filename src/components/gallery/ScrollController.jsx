"use client";

import { GALLERY } from "@/lib/galleryConfig";

/** Local progress phases inside the Future of Cinema section */
export const GALLERY_HOLD_END = 0.18;
export const GALLERY_CRUISE_END = 0.78;

/**
 * Maps scene scroll progress → camera Z along the tunnel (−Z forward).
 * Short title hold, then flight — tiny drift during hold so scroll never feels stuck.
 */
export function getScrollTravelZ(progress) {
  const p = Math.min(1, Math.max(0, progress));

  if (p <= GALLERY_HOLD_END) {
    // Micro drift during title beat (keeps Lenis feeling responsive)
    return -((p / GALLERY_HOLD_END) * 3.5);
  }

  const cruiseSpan = GALLERY_CRUISE_END - GALLERY_HOLD_END;
  const cruise = Math.min(1, (p - GALLERY_HOLD_END) / cruiseSpan);
  const eased = cruise * cruise * (3 - 2 * cruise);

  const exitT = p > GALLERY_CRUISE_END ? (p - GALLERY_CRUISE_END) / (1 - GALLERY_CRUISE_END) : 0;
  const exitPull = exitT * exitT * 52;

  return -(3.5 + eased * (GALLERY.TRAVEL - 3.5) + exitPull);
}

export function getHeroFade(progress) {
  const p = Math.min(1, Math.max(0, progress));
  if (p < 0.04) return p / 0.04;
  if (p < GALLERY_HOLD_END + 0.02) return 1;
  if (p < GALLERY_HOLD_END + 0.16) {
    return 1 - (p - (GALLERY_HOLD_END + 0.02)) / 0.14;
  }
  return 0;
}

/** Grid + posters resolve during the title hold (before flight). */
export function getEntranceReveal(progress) {
  const t = Math.min(1, Math.max(0, progress / 0.1));
  return t * t * (3 - 2 * t);
}

/** Settle camera into the corridor during hold (not forward travel). */
export function getHoldSettle(progress) {
  const t = Math.min(1, Math.max(0, progress / Math.max(0.08, GALLERY_HOLD_END * 0.65)));
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
