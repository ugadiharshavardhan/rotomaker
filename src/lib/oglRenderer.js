import { Renderer } from "ogl";

/**
 * Safely create an OGL Renderer without throwing when WebGL is unavailable
 * or the browser has blocked new contexts after rapid remounts (common in dev/HMR).
 */
export function createOglRenderer(options) {
  if (typeof window === "undefined") return null;

  try {
    const renderer = new Renderer(options);
    if (!renderer?.gl) return null;
    return renderer;
  } catch (error) {
    console.warn("[WebGL] OGL renderer creation failed:", error);
    return null;
  }
}

/** Remove an OGL canvas without forcing context loss (avoids browser context blocking). */
export function disposeOglCanvas(renderer) {
  if (!renderer?.gl) return;

  try {
    const canvas = renderer.gl.canvas;
    if (canvas?.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }
  } catch (error) {
    console.warn("[WebGL] OGL canvas cleanup failed:", error);
  }
}
