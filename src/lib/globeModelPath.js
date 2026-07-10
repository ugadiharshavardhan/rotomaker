/** Earth GLB in /public/glb/earth.glb */
export const EARTH_GLB_PATH = "/glb/earth.glb";

/** Target radius after centering — matches prior procedural globe size. */
export const GLOBE_MODEL_RADIUS = 2.8;

/** Aligns WGS-84 coordinates to the earth.glb mesh orientation. */
export const GLOBE_MODEL_ALIGNMENT = {
  x: Math.PI / 2,
  y: 5.105088062083414,
  z: (3 * Math.PI) / 2,
  order: "XYZ",
};

const GLOBE_APPROACH_END = 0.52;
export const GLOBE_ORBIT_HANDOFF = 0.96;

function smootherstep(t) {
  const c = Math.min(1, Math.max(0, t));
  return c * c * c * (c * (c * 6 - 15) + 10);
}

export function getGlobeApproach(progress) {
  return smootherstep(progress / GLOBE_APPROACH_END);
}

export function getGlobeOrbitHandoff(progress) {
  return getGlobeApproach(progress) >= GLOBE_ORBIT_HANDOFF;
}

/** Horizontal layout — globe on the right (desktop), centered behind copy (mobile) */
export const GLOBE_LAYOUT = {
  mobile: { worldX: 0, worldY: -0.15, cameraX: 0, lookX: 0 },
  tablet: { worldX: 1.15, worldY: -0.08, cameraX: -0.28, lookX: 0.14 },
  laptop: { worldX: 3.05, worldY: 0, cameraX: -0.82, lookX: 0.44 },
  desktop: { worldX: 4.05, worldY: 0, cameraX: -1, lookX: 0.56 },
};

function lerpLayout(a, b, t) {
  const c = Math.min(1, Math.max(0, t));
  return {
    worldX: a.worldX + (b.worldX - a.worldX) * c,
    worldY: (a.worldY ?? 0) + ((b.worldY ?? 0) - (a.worldY ?? 0)) * c,
    cameraX: a.cameraX + (b.cameraX - a.cameraX) * c,
    lookX: a.lookX + (b.lookX - a.lookX) * c,
  };
}

export function getGlobeLayout(width) {
  if (width < 480) return GLOBE_LAYOUT.mobile;
  if (width < 768) {
    return lerpLayout(GLOBE_LAYOUT.mobile, GLOBE_LAYOUT.tablet, (width - 480) / 288);
  }
  if (width < 1024) {
    return lerpLayout(GLOBE_LAYOUT.tablet, GLOBE_LAYOUT.laptop, (width - 768) / 256);
  }
  if (width < 1200) {
    return lerpLayout(GLOBE_LAYOUT.laptop, GLOBE_LAYOUT.desktop, (width - 1024) / 176);
  }
  if (width < 1440) {
    return lerpLayout(GLOBE_LAYOUT.laptop, GLOBE_LAYOUT.desktop, (width - 1200) / 240);
  }
  return GLOBE_LAYOUT.desktop;
}

export function getGlobeResponsiveScale(width) {
  if (width < 480) return 1.05;
  if (width < 768) return 0.92;
  if (width < 1024) return 0.78;
  if (width < 1200) return 0.84;
  if (width < 1440) return 0.88;
  return 0.94;
}
