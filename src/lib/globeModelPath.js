/** Earth GLB in /public/glb/earth.glb */
export const EARTH_GLB_PATH = "/glb/earth.glb";

/** Target radius after centering — matches prior procedural globe size. */
export const GLOBE_MODEL_RADIUS = 2.8;

/** Horizontal layout — globe on the right; look target stays left of globe center. */
export const GLOBE_LAYOUT = {
  desktop: { worldX: 4.4, cameraX: -1.2, lookX: 0.55 },
  mobile: { worldX: 2.7, cameraX: -0.55, lookX: 0.28 },
};

export function getGlobeLayout(width) {
  return width < 768 ? GLOBE_LAYOUT.mobile : GLOBE_LAYOUT.desktop;
}
