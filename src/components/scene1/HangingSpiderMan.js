"use client";

import {
  HERO_END,
  VFX_SECTION_END,
  getScene1Phase,
  getVfxLocalProgress,
  getCameraPhase,
} from "@/lib/cameraLens";

export function HangingSpiderMan({ progress }) {
  const phase = getScene1Phase(progress);

  if (phase !== "vfx" || progress < HERO_END || progress >= VFX_SECTION_END) {
    return null;
  }

  const local = getVfxLocalProgress(progress);
  const { dive } = getCameraPhase(progress);
  const fadeOut = local > 0.88 ? Math.max(0, 1 - (local - 0.88) / 0.12) : 1;
  const diveFade = dive > 0.06 ? Math.max(0, 1 - (dive - 0.06) / 0.24) : 1;
  const opacity = fadeOut * diveFade;

  if (opacity <= 0.01) return null;

  return (
    <div
      className="hanging-spider hanging-spider--camera"
      style={{ opacity }}
      aria-hidden="true"
    >
      <div className="hanging-spider__rig">
        <div className="hanging-spider__swing">
          <div className="hanging-spider__float">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/spider-man-hanging.png"
              alt=""
              className="hanging-spider__image"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
