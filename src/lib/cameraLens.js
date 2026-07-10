export const CAMERA_GLB_PATH = "/glb/1930s_movie_camera.glb";

/** Lens focal point in world space once the model faces the viewer (front yaw). */
export const CAMERA_LENS_TARGET = [0, 0.22, 1.45];

/**
 * GLB rests in side profile (lens → -X). +90° Y turns the lens toward the viewer (+Z).
 */
export const CAMERA_MODEL_SIDE_YAW = 0;
export const CAMERA_MODEL_FRONT_YAW = Math.PI / 2;

/**
 * Scene 1 sequential phases (local 0→1 within intro).
 * Longer holds so hero → camera → impossible each read clearly on scroll.
 */
export const HERO_END = 0.16;
export const VFX_SECTION_END = 0.62;
export const IMPOSSIBLE_SECTION_END = 0.94;

/** Legacy aliases used by lens portal — mapped to vfx section bounds. */
export const CAMERA_ORBIT_END = HERO_END + (VFX_SECTION_END - HERO_END) * 0.88;
export const CAMERA_END = VFX_SECTION_END;

/** Light studio backdrop for the VFX camera block. */
export const STUDIO_BACKDROP = "#e8e9ec";

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
  return getScene1Phase(progress) === "vfx" ? STUDIO_BACKDROP : "#030303";
}

export function getCameraZoom(scrollProgress) {
  return getVfxLocalProgress(scrollProgress);
}

export function getCameraPhase(scrollProgress) {
  const local = getVfxLocalProgress(scrollProgress);
  // Long orbit showcase; dive is a short finish into the next section.
  const orbitSpan = 0.88;
  const orbit = Math.max(0, Math.min(1, local / orbitSpan));
  const dive = Math.max(0, Math.min(1, (local - orbitSpan) / (1 - orbitSpan)));
  return { zoom: local, orbit, dive };
}

/**
 * 0 → side-profile showcase, 1 → model rotated so the lens faces the viewer.
 * Starts late in the orbit so the turn feels deliberate, not rushed.
 */
export function getLensFaceAmount(scrollProgress) {
  const { orbit, dive } = getCameraPhase(scrollProgress);
  if (dive > 0) return 1;
  const t = Math.max(0, Math.min(1, (orbit - 0.55) / 0.45));
  return t * t * (3 - 2 * t);
}

export function easeInCubic(t) {
  return t * t * t;
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
