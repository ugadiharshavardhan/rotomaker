/** Responsive layout for the Scene 1 VFX camera GLB + orbit rig. */
export function getCameraViewportLayout(width, height = 0) {
  const h = height > 0 ? height : width * 0.6;
  const aspect = width / Math.max(h, 1);
  // Mobile camera section crops the canvas (~38% viewport height) → very wide aspect.
  const shortCanvas = aspect > 2.05;

  if (width < 480) {
    return {
      targetSize: shortCanvas ? 1.15 : 1.45,
      modelOffsetY: 0,
      orbitRadius: shortCanvas ? 7.2 : 6.2,
      orbitHeight: 0.28,
      orbitFov: shortCanvas ? 32 : 36,
      lockOrbitZoom: true,
      centerModel: true,
      orbitRadiusScale: 1,
      cameraHeightOffset: 0,
      fovBoost: 0,
    };
  }

  if (width < 768) {
    return {
      targetSize: shortCanvas ? 1.25 : 1.55,
      modelOffsetY: 0,
      orbitRadius: shortCanvas ? 7.0 : 6.0,
      orbitHeight: 0.3,
      orbitFov: shortCanvas ? 33 : 36,
      lockOrbitZoom: true,
      centerModel: true,
      orbitRadiusScale: 1,
      cameraHeightOffset: 0,
      fovBoost: 0,
    };
  }

  if (width < 1024) {
    return {
      targetSize: 1.75,
      modelOffsetY: 0,
      orbitRadius: 6.4,
      orbitHeight: 0.35,
      orbitFov: 38,
      lockOrbitZoom: true,
      centerModel: true,
      orbitRadiusScale: 1,
      cameraHeightOffset: 0,
      fovBoost: 0,
    };
  }

  if (width < 1200) {
    return {
      targetSize: 1.95,
      modelOffsetY: 0,
      orbitRadius: 6.6,
      orbitHeight: 0.38,
      orbitFov: 38,
      lockOrbitZoom: true,
      centerModel: true,
      orbitRadiusScale: 1,
      cameraHeightOffset: 0,
      fovBoost: 0,
    };
  }

  return {
    targetSize: 2.15,
    modelOffsetY: 0,
    orbitRadius: 6.8,
    orbitHeight: 0.4,
    orbitFov: 38,
    lockOrbitZoom: true,
    centerModel: true,
    orbitRadiusScale: 1,
    cameraHeightOffset: 0,
    fovBoost: 0,
  };
}
