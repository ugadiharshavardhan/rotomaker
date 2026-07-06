"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { CAMERA_GLB_PATH } from "@/lib/cameraModelPath";

useGLTF.preload(CAMERA_GLB_PATH);

const TARGET_SIZE = 3.2;

function centerAndScale(object) {
  const clone = object.clone(true);

  clone.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
      if (child.material) {
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        materials.forEach((mat) => {
          mat.needsUpdate = true;
          if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
          if ("envMapIntensity" in mat) mat.envMapIntensity = 1.2;
          if ("metalness" in mat) mat.metalness = Math.min(mat.metalness ?? 0.5, 0.9);
          if ("roughness" in mat) mat.roughness = Math.max(mat.roughness ?? 0.5, 0.25);
        });
      }
    }
  });

  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());

  clone.position.sub(center);

  const maxDim = Math.max(size.x, size.y, size.z, 0.001);
  const scale = TARGET_SIZE / maxDim;

  return { node: clone, scale };
}

export function CameraModel({ scrollProgress = 0, opacity = 1 }) {
  const groupRef = useRef();
  const damped = useRef({ y: 0, x: 0, floatY: 0 });

  const { scene, animations } = useGLTF(CAMERA_GLB_PATH);
  const { actions, names } = useAnimations(animations, groupRef);

  const { node, scale } = useMemo(() => centerAndScale(scene), [scene]);

  useEffect(() => {
    names.forEach((name) => {
      const action = actions[name];
      if (action) {
        action.reset().fadeIn(0.3).play();
      }
    });
  }, [actions, names]);

  useFrame((state, delta) => {
    if (!groupRef.current || opacity <= 0.01) return;

    const t = state.clock.elapsedTime;
    const phase = Math.max(0, Math.min(1, (scrollProgress - 0.05) / 0.35));

    const targetY = phase * Math.PI * 0.4 + Math.sin(t * 0.35) * 0.04;
    const targetX = Math.sin(t * 0.55) * 0.03 + phase * 0.08;
    const targetFloatY = Math.sin(t * 0.9) * 0.06 + phase * 0.08;

    const damp = 1 - Math.pow(0.001, delta);

    damped.current.y = THREE.MathUtils.lerp(damped.current.y, targetY, damp);
    damped.current.x = THREE.MathUtils.lerp(damped.current.x, targetX, damp);
    damped.current.floatY = THREE.MathUtils.lerp(
      damped.current.floatY,
      targetFloatY,
      damp
    );

    groupRef.current.rotation.y = damped.current.y;
    groupRef.current.rotation.x = Math.sin(t * 0.25) * 0.02;
    groupRef.current.position.x = damped.current.x;
    groupRef.current.position.y = damped.current.floatY;
  });

  if (opacity <= 0.01) return null;

  return (
    <group ref={groupRef} scale={scale} visible={opacity > 0.01}>
      <primitive object={node} />
    </group>
  );
}
