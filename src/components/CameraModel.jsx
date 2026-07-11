"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { CAMERA_GLB_PATH } from "@/lib/cameraModelPath";
import { getCameraViewportLayout } from "@/lib/cameraLayout";
import { getLensFaceAmount, CAMERA_MODEL_SIDE_YAW, CAMERA_MODEL_FRONT_YAW } from "@/lib/cameraLens";

useGLTF.preload(CAMERA_GLB_PATH);

/**
 * Use the original GLTF scene (not a clone) so skeleton animations stay bound.
 */
function fitSceneOnce(scene, targetSize, state) {
  if (!state.fitted) {
    scene.traverse((child) => {
      if (!child.isMesh) return;
      child.castShadow = true;
      child.receiveShadow = true;
      if (!child.material) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((mat) => {
        mat.needsUpdate = true;
        if (mat.map) mat.map.colorSpace = THREE.SRGBColorSpace;
        if ("envMapIntensity" in mat) mat.envMapIntensity = 1.2;
        if ("metalness" in mat) mat.metalness = Math.min(mat.metalness ?? 0.5, 0.9);
        if ("roughness" in mat) mat.roughness = Math.max(mat.roughness ?? 0.5, 0.25);
      });
    });

    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
    state.baseMax = Math.max(size.x, size.y, size.z, 0.001);
    state.fitted = true;
  }

  return targetSize / state.baseMax;
}

export function CameraModel({ scrollProgress = 0, opacity = 1 }) {
  const groupRef = useRef();
  const modelRef = useRef();
  const fitState = useRef({ fitted: false, baseMax: 1 });
  const damped = useRef({ y: 0, x: 0, floatY: 0, pitch: 0 });
  const wasVisible = useRef(false);
  const { size } = useThree();
  const layout = getCameraViewportLayout(size.width, size.height);

  const { scene, animations } = useGLTF(CAMERA_GLB_PATH);
  // Bind mixer to the actual animated root — cloning broke clips in production
  const { actions, names } = useAnimations(animations, modelRef);

  const scale = useMemo(
    () => fitSceneOnce(scene, layout.targetSize, fitState.current),
    [scene, layout.targetSize]
  );

  useEffect(() => {
    if (!names?.length) return undefined;
    names.forEach((name) => {
      const action = actions[name];
      if (!action) return;
      action.reset();
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.clampWhenFinished = false;
      action.fadeIn(0.35).play();
    });
    return () => {
      names.forEach((name) => {
        actions[name]?.fadeOut(0.2);
      });
    };
  }, [actions, names]);

  useFrame((state, delta) => {
    if (!groupRef.current || opacity <= 0.01) {
      wasVisible.current = false;
      return;
    }

    const t = state.clock.elapsedTime;
    const faceLens = getLensFaceAmount(scrollProgress);
    const idle = 1 - faceLens;

    const showcaseYaw =
      CAMERA_MODEL_SIDE_YAW + Math.sin(t * 0.22) * 0.008 * idle;
    const targetY = THREE.MathUtils.lerp(
      showcaseYaw,
      CAMERA_MODEL_FRONT_YAW,
      faceLens
    );
    const targetFloatY = Math.sin(t * 0.5) * 0.015 * idle;
    const targetPitch = Math.sin(t * 0.18) * 0.008 * idle;

    const dampPower = faceLens > 0.05 ? 0.00012 : 0.00035;
    const damp = 1 - Math.pow(dampPower, delta);

    if (!wasVisible.current) {
      damped.current.y = targetY;
      damped.current.x = 0;
      damped.current.floatY = targetFloatY;
      damped.current.pitch = targetPitch;
      wasVisible.current = true;
    } else {
      damped.current.y = THREE.MathUtils.lerp(damped.current.y, targetY, damp);
      damped.current.x = THREE.MathUtils.lerp(damped.current.x, 0, damp);
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
    groupRef.current.position.x = 0;
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
      <primitive ref={modelRef} object={scene} />
    </group>
  );
}
