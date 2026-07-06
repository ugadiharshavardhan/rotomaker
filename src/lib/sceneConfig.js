import { getMicroBeatState } from "./microBeats";
import { STATS } from "./experienceData";
import { ABOUT_SCROLL_PANELS } from "./aboutData";
import { getStatItemIndex, getAboutPanelIndex } from "./statsScroll";

export const SCENES = [
  { id: 1, name: "intro", start: 0, end: 0.145 },
  { id: 2, name: "portfolio", start: 0.145, end: 0.305 },
  { id: 3, name: "services", start: 0.305, end: 0.565 },
  { id: 4, name: "pipeline", start: 0.565, end: 0.565 },
  { id: 5, name: "services-words", start: 0.565, end: 0.565 },
  { id: 6, name: "globe", start: 0.565, end: 0.702 },
  { id: 7, name: "portfolio-reel", start: 0.708, end: 0.812 },
  { id: 8, name: "movies-library", start: 0.815, end: 0.875 },
  { id: 9, name: "beforeafter", start: 0.875, end: 0.905 },
  { id: 10, name: "stats", start: 0.905, end: 0.928 },
  { id: 11, name: "about", start: 0.928, end: 0.962 },
  { id: 12, name: "why", start: 0.962, end: 0.975 },
  { id: 13, name: "cta", start: 0.975, end: 1.0 },
];

export const SCENE4_WORDS = [
  { key: "intro", text: "We Don't Just Edit.", type: "intro" },
  { key: "track", text: "We Track.", type: "service" },
  { key: "paint", text: "We Paint.", type: "service" },
  { key: "key", text: "We Key.", type: "service" },
  { key: "composite", text: "We Composite.", type: "service" },
  { key: "worlds", text: "We Create Worlds.", type: "service" },
];

/** WGS-84 geographic centers — sourced from USGS / Wikipedia / Natural Resources Canada. */
export const GLOBE_LOCATIONS = [
  {
    name: "India",
    lat: 20.5937,
    lng: 78.9629,
    label: "Mumbai · Bengaluru · Hyderabad",
    mapUrl: "https://maps.app.goo.gl/Qhx3UgQJZtf8orqr6",
  },
  {
    name: "USA",
    lat: 39.833,
    lng: -98.583,
    label: "Los Angeles · New York · Atlanta",
    mapUrl: "https://maps.app.goo.gl/dvsRWEMQEYBioBTF7",
  },
  {
    name: "Canada",
    lat: 56.1304,
    lng: -106.3468,
    label: "Toronto · Vancouver · Montréal",
    mapUrl: "https://maps.app.goo.gl/Wt8mQBRjuiQ837hY7",
  },
];

export const SCROLL_HEIGHT_VH = 1600;

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function getSceneProgress(global, start, end) {
  return clamp((global - start) / (end - start));
}

function isLastScene(scene) {
  return scene.id === SCENES[SCENES.length - 1].id;
}

export function getSceneOpacity(global, start, end, fade = 0.008) {
  const last = SCENES[SCENES.length - 1];
  const isLast = end === last.end && start === last.start;

  if (global < start || (!isLast && global >= end)) return 0;

  const span = end - start;
  const edgeFade = Math.min(fade, span * 0.12);
  const fadeIn = clamp((global - start) / edgeFade);
  const fadeOut = isLast ? 1 : clamp((end - global) / edgeFade);
  return Math.min(fadeIn, fadeOut);
}

/** Only the active scene is visible — prevents portfolio/services/pipeline overlap. */
export function getActiveSceneOpacity(globalProgress, sceneId, edgeFade = 0.012) {
  const last = SCENES[SCENES.length - 1];
  const active =
    SCENES.find(
      (s) =>
        globalProgress >= s.start &&
        (globalProgress < s.end || isLastScene(s))
    ) ?? last;

  if (active.id !== sceneId) return 0;

  const scene = SCENES.find((s) => s.id === sceneId);
  if (!scene) return 0;

  const fadeIn = clamp((globalProgress - scene.start) / edgeFade);
  const fadeOut = isLastScene(scene) ? 1 : clamp((scene.end - globalProgress) / edgeFade);
  return Math.min(fadeIn, fadeOut);
}

export function getSceneState(globalProgress) {
  const scenes = SCENES.map((scene) => ({
    ...scene,
    progress: getSceneProgress(globalProgress, scene.start, scene.end),
    opacity: getSceneOpacity(globalProgress, scene.start, scene.end),
  }));

  const active =
    scenes.find(
      (s) =>
        globalProgress >= s.start &&
        (globalProgress < s.end || s.id === scenes[scenes.length - 1].id)
    ) ?? scenes[scenes.length - 1];

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

