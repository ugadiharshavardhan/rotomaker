/**
 * Detect whether the browser can create a WebGL context.
 * Avoids mounting R3F/Three canvases that would throw and crash the page.
 */
export function isWebGLAvailable() {
  if (typeof document === "undefined") return false;

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("experimental-webgl", { failIfMajorPerformanceCaveat: false });

    return Boolean(gl);
  } catch {
    return false;
  }
}

export function isWebGLError(error) {
  const message = String(error?.message || error || "");
  return /webgl|WebGL|WEBGL/i.test(message);
}
