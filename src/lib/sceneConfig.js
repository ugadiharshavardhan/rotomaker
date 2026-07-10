import { getMicroBeatState } from "./microBeats";
import { STATS } from "./experienceData";
import { ABOUT_SCROLL_PANELS } from "./aboutData";
import { getStatItemIndex, getAboutPanelIndex } from "./statsScroll";
import { clamp, crossfadeOpacity } from "./easing";

export const SCENES = [
  { id: 1, name: "intro", start: 0, end: 0.145 },
  { id: 2, name: "portfolio", start: 0.145, end: 0.338 },
  { id: 3, name: "services", start: 0.318, end: 0.525 },
  { id: 4, name: "pipeline", start: 0.52, end: 0.52 },
  { id: 5, name: "services-words", start: 0.52, end: 0.52 },
  { id: 6, name: "globe", start: 0.515, end: 0.608 },
  { id: 7, name: "portfolio-reel", start: 0.592, end: 0.692 },
  { id: 8, name: "movies-library", start: 0.678, end: 0.862 },
  { id: 9, name: "beforeafter", start: 0.844, end: 0.898 },
  { id: 10, name: "stats", start: 0.884, end: 0.944 },
  { id: 11, name: "about", start: 0.928, end: 0.976 },
  { id: 12, name: "why", start: 0.966, end: 0.994 },
  { id: 13, name: "cta", start: 0.982, end: 1.0 },
];

export const SCENE4_WORDS = [
  { key: "intro", text: "We Don't Just Edit.", type: "intro" },
  { key: "track", text: "We Track.", type: "service" },
  { key: "paint", text: "We Paint.", type: "service" },
  { key: "key", text: "We Key.", type: "service" },
  { key: "composite", text: "We Composite.", type: "service" },
  { key: "worlds", text: "We Create Worlds.", type: "service" },
];

/** WGS-84 anchors — converted to 3D via latLongToVector3 on the globe mesh. */
export const GLOBE_LOCATIONS = [
  {
    name: "India",
    lat: 28.6139,
    lng: 77.209,
    label: "New Delhi · Mumbai · Bengaluru",
    mapUrl: "https://maps.app.goo.gl/Qhx3UgQJZtf8orqr6",
  },
  {
    name: "USA",
    lat: 40.7128,
    lng: -74.006,
    label: "New York · Los Angeles · Atlanta",
    mapUrl: "https://maps.app.goo.gl/dvsRWEMQEYBioBTF7",
  },
  {
    name: "Canada",
    lat: 43.6532,
    lng: -79.3832,
    label: "Toronto · Vancouver · Montréal",
    mapUrl: "https://maps.app.goo.gl/Wt8mQBRjuiQ837hY7",
  },
];

export const SCROLL_HEIGHT_VH = 2400;

export function getSceneBounds(sceneId) {
  const scene = SCENES.find((s) => s.id === sceneId);
  return scene ? { start: scene.start, end: scene.end } : { start: 0, end: 0 };
}

export function isGlobalInScene(globalProgress, sceneId) {
  const { start, end } = getSceneBounds(sceneId);
  return globalProgress >= start && globalProgress < end;
}

export function getSceneProgress(global, start, end) {
  return clamp((global - start) / (end - start));
}

function isLastScene(scene) {
  return scene.id === SCENES[SCENES.length - 1].id;
}

export function getSceneOpacity(global, start, end, edgeFade = 0.022) {
  const last = SCENES[SCENES.length - 1];
  const isLast = end === last.end && start === last.start;
  return crossfadeOpacity(global, start, end, edgeFade, isLast);
}

/** Crossfade overlays for gallery / story sections (allows brief overlap at boundaries). */
export function getStoryOverlayOpacity(globalProgress, sceneId, edgeFade = 0.038) {
  const scene = SCENES.find((s) => s.id === sceneId);
  if (!scene) return 0;
  return crossfadeOpacity(
    globalProgress,
    scene.start,
    scene.end,
    edgeFade,
    isLastScene(scene)
  );
}

function resolveActiveScene(globalProgress, scenes) {
  const inRange = scenes.filter(
    (s) =>
      globalProgress >= s.start &&
      (globalProgress < s.end || s.id === scenes[scenes.length - 1].id)
  );

  if (inRange.length > 0) {
    return inRange.reduce((best, s) => (s.opacity > best.opacity ? s : best), inRange[0]);
  }

  return scenes.reduce((best, s) => {
    const mid = (s.start + s.end) * 0.5;
    const bestMid = (best.start + best.end) * 0.5;
    return Math.abs(globalProgress - mid) < Math.abs(globalProgress - bestMid) ? s : best;
  });
}

/** Crossfaded overlay opacity — adjacent sections blend at boundaries. */
export function getActiveSceneOpacity(globalProgress, sceneId, edgeFade = 0.026) {
  const scene = SCENES.find((s) => s.id === sceneId);
  if (!scene) return 0;
  return crossfadeOpacity(
    globalProgress,
    scene.start,
    scene.end,
    edgeFade,
    isLastScene(scene)
  );
}

export function getSceneState(globalProgress) {
  const scenes = SCENES.map((scene) => ({
    ...scene,
    progress: getSceneProgress(globalProgress, scene.start, scene.end),
    opacity:
      scene.id >= 7
        ? getStoryOverlayOpacity(globalProgress, scene.id)
        : getSceneOpacity(globalProgress, scene.start, scene.end),
  }));

  const active = resolveActiveScene(globalProgress, scenes);

  const scene4Overall = getSceneProgress(
    globalProgress,
    SCENES[4].start,
    SCENES[4].end
  );
  const segmentCount = SCENE4_WORDS.length;
  const segmentFloat = scene4Overall * segmentCount;
  const scene4Index = Math.min(segmentCount - 1, Math.floor(segmentFloat));
  const scene4WordProgress = segmentFloat - scene4Index;

  return {
    globalProgress,
    scenes,
    activeScene: active,
    microBeat: getMicroBeatState(globalProgress, SCROLL_HEIGHT_VH),
    scene4: {
      index: scene4Index,
      word: SCENE4_WORDS[scene4Index],
      wordProgress: scene4WordProgress,
      overall: scene4Overall,
    },
    scene6: {
      overall: getSceneProgress(globalProgress, SCENES[6].start, SCENES[6].end),
    },
    scene8: {
      overall: getSceneProgress(globalProgress, SCENES[8].start, SCENES[8].end),
    },
    scene9: (() => {
      const overall = getSceneProgress(globalProgress, SCENES[9].start, SCENES[9].end);
      const { index, segmentProgress, isHolding } = getStatItemIndex(overall, STATS.length);
      return { overall, index, segmentProgress, isHolding };
    })(),
    about: (() => {
      const overall = getSceneProgress(globalProgress, SCENES[10].start, SCENES[10].end);
      const panel = getAboutPanelIndex(overall, ABOUT_SCROLL_PANELS.length);
      return { overall, ...panel };
    })(),
  };
}

