"use client";

/**
 * Mouse parallax is applied inside GalleryCameraRig via the shared `mouse` prop.
 * This module exports helpers for normalizing pointer → tunnel offset.
 */

export function pointerToParallax(mouse, strength = 1) {
  return {
    x: ((mouse?.x ?? 0.5) - 0.5) * 2 * strength,
    y: ((mouse?.y ?? 0.5) - 0.5) * -2 * strength,
  };
}
