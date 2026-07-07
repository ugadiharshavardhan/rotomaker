"use client";

import { useMemo } from "react";
import * as THREE from "three";
import { useEarthGlobe } from "./EarthGlobeContext";

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragment = /* glsl */ `
  varying vec3 vNormal;
  uniform vec3 glowColor;
  uniform float intensity;
  void main() {
    float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.8);
    float alpha = fresnel * intensity;
    gl_FragColor = vec4(glowColor, alpha);
  }
`;

export function EarthAtmosphere({ opacity = 1 }) {
  const { radius } = useEarthGlobe();

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
      uniforms: {
        glowColor: { value: new THREE.Color("#4da6ff") },
        intensity: { value: 0.55 * opacity },
      },
      transparent: true,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
  }, [opacity]);

  return (
    <mesh scale={1.045} material={material}>
      <sphereGeometry args={[radius, 64, 64]} />
    </mesh>
  );
}
