import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";
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

function collectMeshGeometries(gltfScene) {
  gltfScene.updateWorldMatrix(true, true);
  const geometries = [];

  gltfScene.traverse((child) => {
    if (!child.isMesh?.geometry) return;
    const geometry = child.geometry.clone();
    geometry.applyMatrix4(child.matrixWorld);
    geometries.push(geometry);
  });

  return geometries;
}

/** Merge every Earth mesh in the GLB, center, and return unified geometry. */
export function prepareEarthGeometry(gltfScene) {
  const geometries = collectMeshGeometries(gltfScene);
  if (!geometries.length) return null;

  const merged = mergeGeometries(geometries, false);
  if (!merged) return null;

  merged.center();
  merged.computeBoundingSphere();
  return merged;
}

/** Clone the full GLB scene, center it, and scale to the target globe radius. */
export function prepareEarthRoot(gltfScene) {
  const root = gltfScene.clone(true);
  root.updateWorldMatrix(true, true);

  root.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = true;
    child.receiveShadow = true;

    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.forEach((mat) => {
      if (!mat) return;
      mat.needsUpdate = true;
      if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
    });
  });

  const box = new THREE.Box3().setFromObject(root);
  const center = box.getCenter(new THREE.Vector3());
  const boundSphere = new THREE.Sphere();
  box.getBoundingSphere(boundSphere);

  root.position.sub(center);

  const scale = GLOBE_MODEL_RADIUS / Math.max(boundSphere.radius, 0.001);

  return {
    root,
    scale,
    radius: GLOBE_MODEL_RADIUS,
  };
}

export function getGlobeScaleFromGeometry(geometry) {
  geometry.computeBoundingSphere();
  const radius = geometry.boundingSphere?.radius ?? 1;
  return GLOBE_MODEL_RADIUS / Math.max(radius, 0.001);
}
