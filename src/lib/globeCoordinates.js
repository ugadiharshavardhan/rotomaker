import * as THREE from "three";
import { GLOBE_MODEL_RADIUS } from "@/lib/globeModelPath";
import { latLongToVector3 } from "@/lib/latLongToVector3";

/** Detect sphere radius from centered Earth geometry (bounding sphere). */
export function getEarthRadiusFromGeometry(geometry) {
  geometry.computeBoundingSphere();
  return geometry.boundingSphere?.radius ?? 1;
}

/** @deprecated Use latLongToVector3 — kept for existing call sites returning arrays. */
export function latLngToGlobeVector3(lat, lng, radius = GLOBE_MODEL_RADIUS) {
  const v = latLongToVector3(lat, lng, radius);
  return [v.x, v.y, v.z];
}

export function prepareEarthGeometry(gltfScene) {
  gltfScene.updateWorldMatrix(true, true);

  let sourceMesh = null;
  gltfScene.traverse((child) => {
    if (child.isMesh && !sourceMesh) sourceMesh = child;
  });

  if (!sourceMesh) return null;

  const geometry = sourceMesh.geometry.clone();
  geometry.applyMatrix4(sourceMesh.matrixWorld);
  geometry.center();
  geometry.computeBoundingSphere();

  return geometry;
}

export function getGlobeScaleFromGeometry(geometry) {
  geometry.computeBoundingSphere();
  const radius = geometry.boundingSphere?.radius ?? 1;
  return GLOBE_MODEL_RADIUS / Math.max(radius, 0.001);
}
