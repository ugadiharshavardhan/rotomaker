import { HERO_STORY_BG } from "@/lib/heroStory";

export const CAMERA_GLB_PATH = "/glb/1930s_movie_camera.glb";
export const CAMERA_LENS_TARGET = [0, 0.22, 1.45];
export const CAMERA_MODEL_SIDE_YAW = 0;
export const CAMERA_MODEL_FRONT_YAW = Math.PI / 2;

/**
 * Scene 1 sequential chapters (local 0→1 within intro):
 * story (fog heroes) → vfx (camera) → impossible → exit
 */
export const STORY_END = 0.42;
export const HERO_END = STORY_END;
export const VFX_SECTION_END = 0.8;
export const IMPOSSIBLE_SECTION_END = 0.94;

export const CAMERA_ORBIT_END = STORY_END + (VFX_SECTION_END - STORY_END) * 0.9;
export const CAMERA_END = VFX_SECTION_END;

export const STUDIO_BACKDROP = "#e8e8e8";

export function getScene1Phase(progress) {
  if (progress < STORY_END) return "story";
  if (progress < VFX_SECTION_END) return "vfx";
  if (progress < IMPOSSIBLE_SECTION_END) return "impossible";
  return "exit";
}

/** 0→1 within the fog character story chapter only. */
export function getStoryLocalProgress(progress) {
  if (progress <= 0) return 0;
  if (progress >= STORY_END) return 1;
  return progress / STORY_END;
}

export function getVfxLocalProgress(progress) {
  if (progress <= STORY_END) return 0;
  if (progress >= VFX_SECTION_END) return 1;
  return (progress - STORY_END) / (VFX_SECTION_END - STORY_END);
}

export function shouldShowGlbCamera(progress, opacity = 1) {
  if (opacity <= 0.01) return false;
  return getScene1Phase(progress) === "vfx";
}

export function getScene1Backdrop(progress) {
  const phase = getScene1Phase(progress);
  if (phase === "vfx") return STUDIO_BACKDROP;
  if (phase === "story") return HERO_STORY_BG;
  return "#030303";
}

export function getCameraZoom(scrollProgress) {
  return getVfxLocalProgress(scrollProgress);
}

export function getCameraPhase(scrollProgress) {
  const local = getVfxLocalProgress(scrollProgress);
  const orbitSpan = 0.9;
  const orbit = Math.max(0, Math.min(1, local / orbitSpan));
  const dive = Math.max(0, Math.min(1, (local - orbitSpan) / (1 - orbitSpan)));
  return { zoom: local, orbit, dive };
}

export function getLensFaceAmount(scrollProgress) {
  const { orbit, dive } = getCameraPhase(scrollProgress);
  if (dive > 0) return 1;
  const start = 0.06;
  const t = Math.max(0, Math.min(1, (orbit - start) / (1 - start)));
  return easeInOutCubic(t);
}

export function easeInCubic(t) {
  return t * t * t;
}

export function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
