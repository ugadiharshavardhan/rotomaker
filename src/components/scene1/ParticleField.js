"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import {
  sampleLetterTargets,
} from "@/lib/letterParticles";

const PARTICLE_COUNT = 900;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function AmbientParticles({ count = 280, scrollProgress }) {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 55;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 32;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 38 - 8;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.015;
    const fade = Math.max(0, 1 - scrollProgress * 1.8);
    ref.current.material.opacity = 0.18 * fade;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.028}
        color="#ffffff"
        transparent
        opacity={0.18}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function MorphParticles({ scrollProgress }) {
  const ref = useRef();
  const data = useMemo(() => {
    const targets = sampleLetterTargets({ particleCount: PARTICLE_COUNT });
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const velocities = new Float32Array(PARTICLE_COUNT * 3);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      const speed = 2 + Math.random() * 4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      velocities[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      velocities[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * speed;
      velocities[i * 3 + 2] = Math.cos(phi) * speed;
    }

    return { targets, positions, velocities };
  }, []);

  useFrame((_, delta) => {
    if (!ref.current) return;

    const positions = ref.current.geometry.attributes.position.array;
    const { targets, velocities } = data;

    const explosionStart = 0.32;
    const explosionEnd = 0.52;
    const morphEnd = 0.88;

    let explosionT = 0;
    if (scrollProgress > explosionStart) {
      explosionT = Math.min(
        1,
        (scrollProgress - explosionStart) / (explosionEnd - explosionStart)
      );
    }

    let morphT = 0;
    if (scrollProgress > explosionEnd) {
      morphT = Math.min(
        1,
        (scrollProgress - explosionEnd) / (morphEnd - explosionEnd)
      );
    }

    const easedExplosion = easeOutCubic(explosionT);
    const easedMorph = easeInOutCubic(morphT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      const tx = targets[i]?.x ?? 0;
      const ty = targets[i]?.y ?? 0;
      const tz = targets[i]?.z ?? 0;

      const burstX = velocities[i3] * easedExplosion * 2.5;
      const burstY = velocities[i3 + 1] * easedExplosion * 2.5;
      const burstZ = velocities[i3 + 2] * easedExplosion * 2.5;

      const midX = lerp(burstX, tx, easedMorph);
      const midY = lerp(burstY, ty, easedMorph);
      const midZ = lerp(burstZ, tz, easedMorph);

      positions[i3] = midX;
      positions[i3 + 1] = midY;
      positions[i3 + 2] = midZ;
    }

    ref.current.geometry.attributes.position.needsUpdate = true;

    const visible = scrollProgress > explosionStart - 0.05;
    ref.current.visible = visible;

    const mat = ref.current.material;
    if (scrollProgress < explosionStart) {
      mat.opacity = 0;
    } else if (scrollProgress < explosionEnd) {
      mat.opacity = 0.2 + easedExplosion * 0.25;
    } else {
      mat.opacity = 0.28 + easedMorph * 0.12;
    }
  });

  return (
    <points ref={ref} visible={false}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={data.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.038}
        color="#ffffff"
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </points>
  );
}
