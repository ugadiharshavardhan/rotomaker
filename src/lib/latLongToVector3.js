import * as THREE from "three";
import { GLOBE_MODEL_ALIGNMENT } from "@/lib/globeModelPath";

const alignmentQuaternion = new THREE.Quaternion().setFromEuler(
  new THREE.Euler(
    GLOBE_MODEL_ALIGNMENT.x,
    GLOBE_MODEL_ALIGNMENT.y,
    GLOBE_MODEL_ALIGNMENT.z,
    GLOBE_MODEL_ALIGNMENT.order
  )
);

/**
 * WGS-84 latitude/longitude → 3D point on the globe (Y-up).
 *
 * x = r * cos(lat) * sin(lon)
 * y = r * sin(lat)
 * z = r * cos(lat) * cos(lon)
 *
 * @param {number} latitude  - Degrees north (+) / south (−)
 * @param {number} longitude - Degrees east (+) / west (−)
 * @param {number} radius    - Sphere radius
 * @returns {THREE.Vector3}
 */
export function latLongToVector3(latitude, longitude, radius) {
  const latRad = THREE.MathUtils.degToRad(latitude);
  const lonRad = THREE.MathUtils.degToRad(longitude);

  const point = new THREE.Vector3(
    radius * Math.cos(latRad) * Math.sin(lonRad),
    radius * Math.sin(latRad),
    radius * Math.cos(latRad) * Math.cos(lonRad)
  );

  return point.applyQuaternion(alignmentQuaternion);
}

/** Unit outward normal at a lat/long on the sphere. */
export function latLongToNormal(latitude, longitude) {
  return latLongToVector3(latitude, longitude, 1).normalize();
}
