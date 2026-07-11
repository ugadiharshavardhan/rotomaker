"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HERO_STORY_FOG } from "@/lib/heroStory";

/** Soft organic sheets — large enough that edges never read as rectangles. */
const LAYER_COUNT = 6;

const fogVert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * Infinite drifting mist — soft cloud blobs only (no hard quad edges).
 * uApproach: 0 = far/thin, 1 = fills the volume around the camera.
 */
const fogFrag = /* glsl */ `
  precision mediump float;
  varying vec2 vUv;

  uniform float uTime;
  uniform float uDensity;
  uniform float uParting;
  uniform float uWind;
  uniform float uLayer;
  uniform float uSpeed;
  uniform float uNoiseScale;
  uniform float uOpacity;
  uniform float uBodyReveal;
  uniform float uBodySide;
  uniform float uApproach;
  uniform vec3 uColor;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 3; i++) {
      v += a * noise(p);
      p *= 2.05;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    // Centered coords — soft radial falloff (no rectangular frame)
    vec2 p = vUv * 2.0 - 1.0;
    float radial = length(p * vec2(1.0, 0.72));

    float t = uTime * uSpeed * (0.035 + uWind * 0.04);
    // Continuous flow from "infinity" — scroll toward camera feel
    vec2 flow = vec2(t * 0.55, -t * 0.9 - uApproach * 0.8);
    float n = fbm(vUv * uNoiseScale + flow + uLayer * 1.1);
    n = mix(n, fbm(vUv * uNoiseScale * 1.55 - flow * 0.7 + 3.1), 0.45);

    // Soft cloud blobs — denser, still organic
    float clouds = smoothstep(0.28, 0.62, n);
    clouds *= smoothstep(0.2, 0.5, fbm(vUv * uNoiseScale * 0.7 - flow * 0.4));

    // Fade to nothing at plane edges so quads are invisible
    float softEdge = 1.0 - smoothstep(0.85, 1.45, radial);

    // Character corridor (narrow — fog stays around figure)
    float cx = 0.5 + uBodySide * 0.2;
    float bodyInfluence = clamp(uBodyReveal, 0.0, 1.0);
    float dx = abs(vUv.x - cx);
    float bodyWidth = mix(0.05, 0.12, smoothstep(0.7, 0.25, vUv.y)) * bodyInfluence;
    float open = smoothstep(bodyWidth, bodyWidth + 0.12 + uParting * 0.1, dx);
    float corridor = mix(1.0, mix(0.55, open, 0.75), clamp(uParting * 0.55 + bodyInfluence * 0.45, 0.0, 1.0));

    float density = clouds * softEdge * corridor * uOpacity * uDensity * max(uApproach, 0.15);
    float alpha = clamp(density, 0.0, 0.72);

    gl_FragColor = vec4(uColor, alpha);
  }
`;

const SHARED_GEO = new THREE.PlaneGeometry(1, 1);

function makeLayer(i) {
  const t = i / Math.max(1, LAYER_COUNT - 1);
  return {
    id: i,
    z: -1.2 - t * 14,
    // Oversized so edges stay off-screen
    scaleX: 48 + t * 18,
    scaleY: 28 + t * 10,
    y: ((i % 3) - 1) * 0.35,
    x: ((i % 2) - 0.5) * 0.5,
    rotZ: ((i * 11) % 20 - 10) * 0.002,
    speed: 0.55 + (i % 4) * 0.18,
    noiseScale: 1.6 + (i % 3) * 0.45,
    opacity: 0.2 + (1 - t) * 0.16,
    timeOffset: i * 6.3,
  };
}

/**
 * Soft infinite mist — approaches from depth on scroll, never reads as a box.
 */
export function VolumetricFog({
  density = 1,
  parting = 0,
  wind = 0.2,
  bodyReveal = 0,
  bodySide = 0,
  approach = 1,
  color = HERO_STORY_FOG,
}) {
  const group = useRef();
  const mats = useRef([]);
  const layers = useMemo(() => Array.from({ length: LAYER_COUNT }, (_, i) => makeLayer(i)), []);
  const colorObj = useMemo(() => new THREE.Color(color), [color]);
  const propsRef = useRef({ density, parting, wind, bodyReveal, bodySide, approach });
  propsRef.current = { density, parting, wind, bodyReveal, bodySide, approach };

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = propsRef.current;
    const children = group.current?.children;
    for (let i = 0; i < mats.current.length; i++) {
      const m = mats.current[i];
      if (!m) continue;
      const layer = layers[i];
      m.uniforms.uTime.value = t + layer.timeOffset;
      m.uniforms.uDensity.value = p.density;
      m.uniforms.uParting.value = p.parting;
      m.uniforms.uWind.value = p.wind;
      m.uniforms.uBodyReveal.value = p.bodyReveal;
      m.uniforms.uBodySide.value = p.bodySide;
      m.uniforms.uApproach.value = p.approach;
      m.uniforms.uColor.value.copy(colorObj);

      const mesh = children?.[i];
      if (mesh) {
        // Drift in from depth as approach rises
        const baseZ = layer.z;
        const push = (1 - p.approach) * -6;
        mesh.position.z = baseZ + push;
        mesh.position.x = layer.x + Math.sin(t * 0.05 + i) * 0.12 * p.wind;
        mesh.position.y = layer.y + Math.cos(t * 0.04 + i) * 0.08;
      }
    }
  });

  if (approach < 0.02 && density < 0.05) return null;

  return (
    <group ref={group}>
      {layers.map((layer, i) => (
        <mesh
          key={layer.id}
          geometry={SHARED_GEO}
          position={[layer.x, layer.y, layer.z]}
          rotation={[0, 0, layer.rotZ]}
          scale={[layer.scaleX, layer.scaleY, 1]}
          renderOrder={i < 3 ? 28 + i : 4 + i}
          frustumCulled={false}
        >
          <shaderMaterial
            ref={(m) => {
              mats.current[i] = m;
            }}
            transparent
            depthWrite={false}
            depthTest={false}
            blending={THREE.NormalBlending}
            side={THREE.FrontSide}
            vertexShader={fogVert}
            fragmentShader={fogFrag}
            uniforms={{
              uTime: { value: 0 },
              uDensity: { value: 1 },
              uParting: { value: 0 },
              uWind: { value: 0.2 },
              uLayer: { value: i + 1 },
              uSpeed: { value: layer.speed },
              uNoiseScale: { value: layer.noiseScale },
              uOpacity: { value: layer.opacity },
              uBodyReveal: { value: 0 },
              uBodySide: { value: 0 },
              uApproach: { value: 0 },
              uColor: { value: new THREE.Color(color) },
            }}
          />
        </mesh>
      ))}
    </group>
  );
}
