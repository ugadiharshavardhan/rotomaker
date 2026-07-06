"use client";

import {
  CAMERA_END,
  CAMERA_ORBIT_END,
  easeInCubic,
  getCameraPhase,
} from "@/lib/cameraLens";

export function LensPortalOverlay({ progress }) {
  const { dive, zoom } = getCameraPhase(progress);

  if (progress <= CAMERA_ORBIT_END || progress >= CAMERA_END) {
    return null;
  }

  const eased = easeInCubic(dive);
  const ringSize = Math.max(3, 94 - eased * 91);
  const tunnelOpacity = Math.min(1, eased * 1.2);
  const whiteFlash = Math.max(0, (dive - 0.78) / 0.22);

  return (
    <>
      <div
        className="lens-portal"
        style={{
          opacity: tunnelOpacity,
          "--ring-size": `${ringSize}%`,
        }}
        aria-hidden="true"
      />
      <div
        className="lens-portal__tunnel"
        style={{
          opacity: eased * 0.9,
          transform: `scale(${1 + zoom * 0.08})`,
        }}
        aria-hidden="true"
      />
      <div
        className="lens-portal__flash"
        style={{ opacity: whiteFlash * 0.65 }}
        aria-hidden="true"
      />
    </>
  );
}
