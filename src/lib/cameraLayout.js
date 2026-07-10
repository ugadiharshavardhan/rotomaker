/** Responsive layout for the Scene 1 VFX camera GLB + orbit rig. */
export function getCameraViewportLayout(width) {
  if (width < 480) {
    return {
      targetSize: 2.55,
      modelOffsetY: -0.05,
      orbitRadius: 4.35,
      orbitHeight: 0.34,
      orbitFov: 40,
      lockOrbitZoom: true,
      orbitRadiusScale: 1.02,
      cameraHeightOffset: -0.04,
      fovBoost: 4,
    };
  }

  if (width < 768) {
    return {
      targetSize: 3.05,
      modelOffsetY: -0.06,
      orbitRadius: 4.55,
      orbitHeight: 0.36,
      orbitFov: 38,
      lockOrbitZoom: true,
      orbitRadiusScale: 0.98,
      cameraHeightOffset: -0.04,
      fovBoost: 2,
    };
  }

  if (width < 1024) {
    return {
      targetSize: 2.45,
      modelOffsetY: -0.2,
      orbitRadiusScale: 1.18,
      cameraHeightOffset: -0.06,
      fovBoost: 2,
    };
  }

  if (width < 1200) {
    return {
      targetSize: 2.75,
      modelOffsetY: -0.1,
      orbitRadiusScale: 1.08,
      cameraHeightOffset: -0.03,
      fovBoost: 1,
    };
  }

  return {
    targetSize: 3.2,
    modelOffsetY: 0,
    orbitRadius: null,
    orbitHeight: null,
    orbitFov: null,
    lockOrbitZoom: false,
    orbitRadiusScale: 1,
    cameraHeightOffset: 0,
    fovBoost: 0,
  };
}
