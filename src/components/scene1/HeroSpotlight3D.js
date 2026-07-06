"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

function VolumetricRay({ from, to, opacity = 0.014 }) {
  const ref = useRef();

  const { position, rotation } = useMemo(() => {
    const pos = new THREE.Vector3(...from);
    const target = new THREE.Vector3(...to);
    const dir = target.clone().sub(pos).normalize();
    const quaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, -1, 0),
      dir
    );
    const euler = new THREE.Euler().setFromQuaternion(quaternion);
    return {
      position: from,
      rotation: [euler.x, euler.y, euler.z],
    };
  }, [from, to]);

  useFrame((state) => {
    if (!ref.current) return;
    ref.current.material.opacity =
      opacity + Math.sin(state.clock.elapsedTime * 0.4) * 0.006;
  });

  return (
    <mesh ref={ref} position={position} rotation={rotation}>
      <coneGeometry args={[2.8, 18, 32, 1, true]} />
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={opacity}
        side={THREE.DoubleSide}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function HeroSpotlight3D({ opacity = 1 }) {
  if (opacity <= 0.01) return null;

  const focus = [0, 0, 0];

  return (
    <group visible={opacity > 0.01}>
      <spotLight
        position={[-5.5, 11, 5]}
        angle={0.28}
        penumbra={0.9}
        intensity={2.2 * opacity}
        color="#ffffff"
        distance={30}
      >
        <object3D attach="target" position={[0, 0, 0]} />
      </spotLight>
      <spotLight
        position={[5.5, 11, 5]}
        angle={0.28}
        penumbra={0.9}
        intensity={2.2 * opacity}
        color="#ffffff"
        distance={30}
      >
        <object3D attach="target" position={[0, 0, 0]} />
      </spotLight>

      <VolumetricRay from={[-5.5, 11, 5]} to={focus} opacity={0.016 * opacity} />
      <VolumetricRay from={[5.5, 11, 5]} to={focus} opacity={0.016 * opacity} />

      <pointLight
        position={[0, 0.5, 2]}
        intensity={0.8 * opacity}
        color="#ffffff"
        distance={8}
      />
    </group>
  );
}
