/** Earth GLB in /public/glb/earth.glb */
export const EARTH_GLB_PATH = "/glb/earth.glb";

/** Target radius after centering — matches prior procedural globe size. */
export const GLOBE_MODEL_RADIUS = 2.8;

const GLOBE_APPROACH_END = 0.38;
export const GLOBE_ORBIT_HANDOFF = 0.96;

function smoothstep(t) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * (3 - 2 * c);
}

export function getGlobeApproach(progress) {
  return smoothstep(progress / GLOBE_APPROACH_END);
}

export function getGlobeOrbitHandoff(progress) {
  return getGlobeApproach(progress) >= GLOBE_ORBIT_HANDOFF;
}

/** Horizontal layout — globe on the right, inset from the screen edge */
export const GLOBE_LAYOUT = {
  desktop: { worldX: 4.25, cameraX: -1.05, lookX: 0.58 },
  mobile: { worldX: 2.45, cameraX: -0.62, lookX: 0.3 },
};

export function getGlobeLayout(width) {
  return width < 768 ? GLOBE_LAYOUT.mobile : GLOBE_LAYOUT.desktop;
}
