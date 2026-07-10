"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { CAMERA_GLB_PATH } from "@/lib/cameraModelPath";
import { getCameraViewportLayout } from "@/lib/cameraLayout";
import { getCameraPhase, getLensFaceAmount, CAMERA_MODEL_SIDE_YAW, CAMERA_MODEL_FRONT_YAW } from "@/lib/cameraLens";

useGLTF.preload(CAMERA_GLB_PATH);

function centerAndScale(object, targetSize) {
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
  const scale = targetSize / maxDim;

  return { node: clone, scale };
}

export function CameraModel({ scrollProgress = 0, opacity = 1 }) {
  const groupRef = useRef();
  const damped = useRef({ y: 0, x: 0, floatY: 0, pitch: 0 });
  const wasVisible = useRef(false);
  const { size } = useThree();
  const layout = getCameraViewportLayout(size.width, size.height);

  const { scene, animations } = useGLTF(CAMERA_GLB_PATH);
  const { actions, names } = useAnimations(animations, groupRef);

  const { node, scale } = useMemo(
    () => centerAndScale(scene, layout.targetSize),
    [scene, layout.targetSize]
  );

  useEffect(() => {
    names.forEach((name) => {
      const action = actions[name];
      if (action) {
        action.reset().fadeIn(0.3).play();
      }
    });
  }, [actions, names]);

  useFrame((state, delta) => {
    if (!groupRef.current || opacity <= 0.01) {
      wasVisible.current = false;
      return;
    }

    const t = state.clock.elapsedTime;
    const { orbit } = getCameraPhase(scrollProgress);
    const faceLens = getLensFaceAmount(scrollProgress);
    const idle = 1 - faceLens;

    // Side profile at rest → rotate +90° so the lens faces the viewer for the next section
    const showcaseYaw =
      CAMERA_MODEL_SIDE_YAW +
      orbit * Math.PI * 0.028 * idle +
      Math.sin(t * 0.22) * 0.012 * idle;
    const targetY = THREE.MathUtils.lerp(
      showcaseYaw,
      CAMERA_MODEL_FRONT_YAW,
      faceLens
    );
    const targetX = Math.sin(t * 0.28) * 0.008 * idle;
    const targetFloatY = Math.sin(t * 0.5) * 0.02 * idle;
    const targetPitch = Math.sin(t * 0.18) * 0.012 * idle;

    // Soft damping so the side→front turn reads slowly across scroll
    const dampPower = faceLens > 0.05 ? 0.00004 : 0.00035;
    const damp = 1 - Math.pow(dampPower, delta);

    if (!wasVisible.current) {
      damped.current.y = targetY;
      damped.current.x = targetX;
      damped.current.floatY = targetFloatY;
      damped.current.pitch = targetPitch;
      wasVisible.current = true;
    } else {
      damped.current.y = THREE.MathUtils.lerp(damped.current.y, targetY, damp);
      damped.current.x = THREE.MathUtils.lerp(damped.current.x, targetX, damp);
      damped.current.floatY = THREE.MathUtils.lerp(
        damped.current.floatY,
        targetFloatY,
        damp
      );
      damped.current.pitch = THREE.MathUtils.lerp(
        damped.current.pitch,
        targetPitch,
        damp
      );
    }

    groupRef.current.rotation.y = damped.current.y;
    groupRef.current.rotation.x = damped.current.pitch;
    groupRef.current.rotation.z = 0;
    groupRef.current.position.x = damped.current.x;
    groupRef.current.position.y = (layout.modelOffsetY ?? 0) + damped.current.floatY;
    groupRef.current.position.z = 0;
  });

  if (opacity <= 0.01) return null;

  return (
    <group
      ref={groupRef}
      scale={scale}
      position={[0, layout.modelOffsetY, 0]}
      visible={opacity > 0.01}
    >
      <primitive object={node} />
    </group>
  );
}
