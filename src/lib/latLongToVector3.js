import * as THREE from "three";

/**
 * Converts WGS-84 latitude/longitude to a point on a Y-up unit sphere.
 * Matches the Sketchfab earth.glb UV layout (north pole = +Y, prime meridian on −X/Z seam).
 *
 * @param {number} latitude  - Degrees north (+) / south (−)
 * @param {number} longitude - Degrees east (+) / west (−)
 * @param {number} radius    - Sphere radius (from mesh bounding sphere)
 * @returns {THREE.Vector3}
 */
export function latLongToVector3(latitude, longitude, radius) {
  const phi = THREE.MathUtils.degToRad(90 - latitude);
  const theta = THREE.MathUtils.degToRad(longitude + 180);
  const sinPhi = Math.sin(phi);

  return new THREE.Vector3(
    -radius * sinPhi * Math.cos(theta),
    radius * Math.cos(phi),
    radius * sinPhi * Math.sin(theta)
  );
}

/**
 * Unit outward normal at a lat/long on the sphere.
 */
export function latLongToNormal(latitude, longitude) {
  return latLongToVector3(latitude, longitude, 1).normalize();
}
