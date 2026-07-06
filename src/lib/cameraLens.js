export const CAMERA_GLB_PATH = "/glb/1930s_movie_camera.glb";

/** Lens focal point in centered model space (+Z forward). */
export const CAMERA_LENS_TARGET = [0, 0.22, 1.45];

/** Scene 1 sequential phases (no overlap, no repeat). */
export const HERO_END = 0.05;
export const VFX_SECTION_END = 0.44;
export const IMPOSSIBLE_SECTION_END = 0.88;

/** Legacy aliases used by lens portal — mapped to vfx section bounds. */
export const CAMERA_ORBIT_END = HERO_END + (VFX_SECTION_END - HERO_END) * 0.48;
export const CAMERA_END = VFX_SECTION_END;

export function getScene1Phase(progress) {
  if (progress < HERO_END) return "hero";
  if (progress < VFX_SECTION_END) return "vfx";
  if (progress < IMPOSSIBLE_SECTION_END) return "impossible";
  return "exit";
}

/** Maps scene-1 progress into 0–1 within the single VFX block. */
export function getVfxLocalProgress(progress) {
  if (progress <= HERO_END) return 0;
  if (progress >= VFX_SECTION_END) return 1;
  return (progress - HERO_END) / (VFX_SECTION_END - HERO_END);
}

export function shouldShowGlbCamera(progress, opacity = 1) {
  if (opacity <= 0.01) return false;
  return getScene1Phase(progress) === "vfx";
}

export function getScene1Backdrop(progress) {
  return getScene1Phase(progress) === "vfx" ? "#e8e9ec" : "#030303";
}

export function getCameraZoom(scrollProgress) {
  return getVfxLocalProgress(scrollProgress);
}

export function getCameraPhase(scrollProgress) {
  const local = getVfxLocalProgress(scrollProgress);
  const orbitSpan = 0.52;
  const orbit = Math.max(0, Math.min(1, local / orbitSpan));
  const dive = Math.max(0, Math.min(1, (local - orbitSpan) / (1 - orbitSpan)));
  return { zoom: local, orbit, dive };
}

export function easeInCubic(t) {
  return t * t * t;
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
