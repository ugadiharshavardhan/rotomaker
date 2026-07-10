"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;

uniform float iTime;
uniform vec2  iResolution;
uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;
uniform float uOpacity;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);
  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));
  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;
  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );
  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void main() {
  vec2 fragCoord = vUv * iResolution;
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);

  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349, 1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) * rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234, 1.1 * raysSpeed);
  vec4 color = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    color.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  color.x *= 0.1 + brightness * 0.8;
  color.y *= 0.3 + brightness * 0.6;
  color.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    color.rgb = mix(vec3(gray), color.rgb, saturation);
  }

  color.rgb *= raysColor;
  float alpha = clamp(max(max(color.r, color.g), color.b) * 1.35, 0.0, 1.0) * uOpacity;
  gl_FragColor = vec4(color.rgb, alpha);
}
`;

function getAnchorAndDir(origin, w, h) {
  const outside = 0.2;
  switch (origin) {
    case "top-left":
      return { anchor: [0, -outside * h], dir: [0, 1] };
    case "top-right":
      return { anchor: [w, -outside * h], dir: [0, 1] };
    default:
      return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
  }
}

/** Same LightRays look, rendered inside the shared R3F WebGL context. */
export function LightRaysR3F({
  opacity = 1,
  raysOrigin = "top-center",
  raysColor = "#ffffff",
  raysSpeed = 1.25,
  lightSpread = 0.85,
  rayLength = 1.6,
  fadeDistance = 1.2,
  saturation = 0.95,
  mouseInfluence = 0.14,
  noiseAmount = 0.06,
  distortion = 0.04,
}) {
  const materialRef = useRef();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const smoothMouse = useRef({ x: 0.5, y: 0.5 });
  const { size, gl } = useThree();

  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iResolution: { value: new THREE.Vector2(1, 1) },
      rayPos: { value: new THREE.Vector2(0, 0) },
      rayDir: { value: new THREE.Vector2(0, 1) },
      raysColor: { value: new THREE.Color(raysColor) },
      raysSpeed: { value: raysSpeed },
      lightSpread: { value: lightSpread },
      rayLength: { value: rayLength },
      pulsating: { value: 0 },
      fadeDistance: { value: fadeDistance },
      saturation: { value: saturation },
      mousePos: { value: new THREE.Vector2(0.5, 0.5) },
      mouseInfluence: { value: mouseInfluence },
      noiseAmount: { value: noiseAmount },
      distortion: { value: distortion },
      uOpacity: { value: opacity },
    }),
    // Stable uniform object — values updated in useFrame / effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const onMove = (e) => {
      const point = e.touches?.[0] ?? e;
      if (point?.clientX == null) return;
      const rect = gl.domElement.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      mouseRef.current = {
        x: (point.clientX - rect.left) / rect.width,
        y: (point.clientY - rect.top) / rect.height,
      };
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
    };
  }, [gl]);

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;

    const dpr = gl.getPixelRatio();
    const w = size.width * dpr;
    const h = size.height * dpr;
    mat.uniforms.iTime.value = state.clock.elapsedTime;
    mat.uniforms.iResolution.value.set(w, h);
    mat.uniforms.uOpacity.value = opacity;
    mat.uniforms.raysSpeed.value = raysSpeed;
    mat.uniforms.lightSpread.value = lightSpread;
    mat.uniforms.rayLength.value = rayLength;
    mat.uniforms.fadeDistance.value = fadeDistance;
    mat.uniforms.saturation.value = saturation;
    mat.uniforms.mouseInfluence.value = mouseInfluence;
    mat.uniforms.noiseAmount.value = noiseAmount;
    mat.uniforms.distortion.value = distortion;
    mat.uniforms.raysColor.value.set(raysColor);

    const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
    mat.uniforms.rayPos.value.set(anchor[0], anchor[1]);
    mat.uniforms.rayDir.value.set(dir[0], dir[1]);

    const t = 1 - Math.pow(0.92, delta * 60);
    smoothMouse.current.x += (mouseRef.current.x - smoothMouse.current.x) * t;
    smoothMouse.current.y += (mouseRef.current.y - smoothMouse.current.y) * t;
    mat.uniforms.mousePos.value.set(smoothMouse.current.x, smoothMouse.current.y);
  });

  if (opacity <= 0.01) return null;

  return (
    <mesh frustumCulled={false} renderOrder={20}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  );
}
