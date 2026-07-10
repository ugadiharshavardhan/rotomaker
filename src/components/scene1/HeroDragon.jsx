"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { DRAGON_GLB_PATH } from "@/lib/dragonModelPath";
import { HERO_END } from "@/lib/cameraLens";

useGLTF.preload(DRAGON_GLB_PATH);

const IDLE_ANIM =
  "SKM_DaenerysDragon|AA_DaenerysDragon_Battle_Stand";

/** Desktop first-load: three-quarter, bottom-right. */
const DESKTOP = {
  yaw: -1.18,
  pitch: 0.16,
  scale: 3.35,
  position: [0.05, -0.12, 0],
  camera: [0.25, 0.2, 4.15],
  lookAt: [0, -0.05, 0],
  fov: 34,
};

/**
 * Mobile first-load: smaller, face visible (three-quarter), head lower-left.
 * Avoid high top-down camera — that hid the face and showed only back/wings.
 */
const MOBILE = {
  yaw: -1.12,
  pitch: 0.12,
  scale: 2.75,
  position: [0.05, -0.2, 0],
  camera: [0.2, 0.45, 4.4],
  lookAt: [0, 0.05, 0],
  fov: 36,
};

function prepareMeshes(root) {
  if (root.userData.__dragonPrepared) return;
  root.userData.__dragonPrepared = true;

  root.traverse((child) => {
    if (!child.isMesh) return;
    child.castShadow = false;
    child.receiveShadow = false;
    child.frustumCulled = false;
    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material];
    materials.forEach((mat) => {
      if (!mat) return;
      if (mat.map) {
        mat.map.colorSpace = THREE.SRGBColorSpace;
        mat.map.anisotropy = 4;
      }
      if (mat.color) mat.color.multiplyScalar(1.35);
      if ("emissive" in mat) {
        mat.emissive = new THREE.Color("#1a0c08");
        mat.emissiveIntensity = 0.22;
      }
      if ("envMapIntensity" in mat) mat.envMapIntensity = 0.55;
      if ("roughness" in mat) mat.roughness = Math.min(mat.roughness ?? 0.7, 0.78);
      mat.needsUpdate = true;
    });
  });
}

function DragonModel({ pose, yawRef }) {
  const groupRef = useRef();
  const timeRef = useRef(0);
  const { scene, animations } = useGLTF(DRAGON_GLB_PATH);
  const { actions, names } = useAnimations(animations, groupRef);

  const layout = useMemo(() => {
    prepareMeshes(scene);
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    return {
      scale: pose.scale / maxDim,
      offset: [-center.x, -center.y * 0.88, -center.z],
    };
  }, [scene, pose.scale]);

  useEffect(() => {
    if (yawRef) yawRef.current = pose.yaw;
    if (groupRef.current) {
      groupRef.current.rotation.y = pose.yaw;
      groupRef.current.rotation.x = pose.pitch;
      groupRef.current.position.set(...pose.position);
    }
  }, [pose, yawRef]);

  useEffect(() => {
    const preferred =
      actions[IDLE_ANIM] ||
      names.map((n) => actions[n]).find(Boolean);

    if (!preferred) return undefined;

    preferred.reset().fadeIn(0.35).play();
    preferred.setLoop(THREE.LoopRepeat, Infinity);

    return () => {
      preferred.fadeOut(0.2);
    };
  }, [actions, names]);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    timeRef.current += delta;
    const targetYaw = yawRef?.current ?? pose.yaw;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetYaw,
      14,
      delta
    );
    groupRef.current.rotation.x = pose.pitch;
    groupRef.current.position.x = pose.position[0];
    groupRef.current.position.z = pose.position[2];
    groupRef.current.position.y =
      pose.position[1] + Math.sin(timeRef.current * 0.7) * 0.02;
  });

  return (
    <group
      ref={groupRef}
      scale={layout.scale}
      position={pose.position}
      rotation={[pose.pitch, pose.yaw, 0]}
    >
      <group position={layout.offset}>
        <primitive object={scene} />
      </group>
    </group>
  );
}

function DragonCamera({ pose }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.fov = pose.fov;
    camera.position.set(...pose.camera);
    camera.lookAt(...pose.lookAt);
    camera.updateProjectionMatrix();
  }, [camera, pose]);

  return null;
}

function DragonLights() {
  return (
    <>
      <ambientLight intensity={0.95} />
      <hemisphereLight args={["#fff2e8", "#3a2818", 0.85]} />
      <directionalLight position={[2.5, 4.5, 5]} intensity={1.85} color="#fff6ea" />
      <directionalLight position={[-2, 2.5, 3]} intensity={1.15} color="#ffb089" />
      <directionalLight position={[-4, 1.5, -3]} intensity={1.35} color="#9ec5ff" />
      <pointLight position={[0.8, 1.2, 2.8]} intensity={1.4} color="#ffd2a8" distance={12} />
      <pointLight position={[1.5, 0.2, -1.5]} intensity={0.9} color="#ff6a3d" distance={10} />
    </>
  );
}

export function HeroDragon({ progress }) {
  const [isMobile, setIsMobile] = useState(false);
  const pose = isMobile ? MOBILE : DESKTOP;
  const yawRef = useRef(pose.yaw);
  const dragRef = useRef({ active: false, lastX: 0 });

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const sync = () => {
      const mobile = mq.matches;
      setIsMobile(mobile);
      const next = mobile ? MOBILE : DESKTOP;
      yawRef.current = next.yaw;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    yawRef.current = pose.yaw;
  }, [pose.yaw]);

  useEffect(() => {
    const original = console.warn;
    console.warn = (...args) => {
      const msg = args[0];
      if (typeof msg === "string" && msg.includes("THREE.Clock")) return;
      original.apply(console, args);
    };
    return () => {
      console.warn = original;
    };
  }, []);

  const onPointerDown = useCallback((e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current.active = true;
    dragRef.current.lastX = e.clientX;
  }, []);

  const onPointerMove = useCallback(
    (e) => {
      if (!dragRef.current.active) return;
      const dx = e.clientX - dragRef.current.lastX;
      dragRef.current.lastX = e.clientX;
      yawRef.current = THREE.MathUtils.clamp(
        yawRef.current + dx * 0.01,
        pose.yaw - Math.PI,
        pose.yaw + Math.PI
      );
    },
    [pose.yaw]
  );

  const onPointerUp = useCallback((e) => {
    dragRef.current.active = false;
    if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }, []);

  if (progress >= HERO_END) return null;

  const fadeOut = Math.max(0, 1 - progress / HERO_END);
  if (fadeOut <= 0.01) return null;

  return (
    <div
      className={`hero-dragon${isMobile ? " hero-dragon--mobile" : " hero-dragon--desktop"}`}
      style={{ opacity: fadeOut }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <Canvas
        key={isMobile ? "mobile" : "desktop"}
        className="hero-dragon__canvas"
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          failIfMajorPerformanceCaveat: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.45,
        }}
        dpr={[1, 1.5]}
        camera={{
          fov: pose.fov,
          near: 0.1,
          far: 40,
          position: pose.camera,
        }}
        style={{ background: "transparent", pointerEvents: "none" }}
        onCreated={({ gl, camera }) => {
          gl.setClearColor(0x000000, 0);
          gl.outputColorSpace = THREE.SRGBColorSpace;
          camera.lookAt(...pose.lookAt);
        }}
      >
        <Suspense fallback={null}>
          <DragonCamera pose={pose} />
          <DragonLights />
          <DragonModel pose={pose} yawRef={yawRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}
