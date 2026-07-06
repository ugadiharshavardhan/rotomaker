"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Stars } from "@react-three/drei";
import * as THREE from "three";
import { LensFlareLight } from "./FilmCamera";
import { AmbientParticles, MorphParticles } from "./ParticleField";

function CameraRig({ scrollProgress }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    const enter = Math.min(1, scrollProgress / 0.2);
    const dolly = scrollProgress * 4;

    camera.position.z = lerp(14, 6.5, enter) - dolly * 0.5;
    camera.position.y = lerp(2, 0.2, enter);
    camera.position.x = Math.sin(scrollProgress * Math.PI) * 0.6;
    camera.lookAt(target.current);
  });

  return null;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function SceneContent({ scrollProgress }) {
  const flareIntensity =
    scrollProgress < 0.35
      ? 0.3 + scrollProgress
      : 0.5 + Math.min(1, (scrollProgress - 0.7) / 0.3) * 2;

  return (
    <>
      <color attach="background" args={["#030303"]} />
      <fog attach="fog" args={["#030303", 8, 28]} />

      <CameraRig scrollProgress={scrollProgress} />
      <LensFlareLight intensity={flareIntensity} />

      <ambientLight intensity={0.08} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={0.35}
        color="#ffffff"
      />
      <spotLight
        position={[0, 5, 8]}
        angle={0.4}
        penumbra={0.8}
        intensity={0.6 + scrollProgress * 0.5}
        color="#ffffff"
        castShadow
      />

      <Stars
        radius={60}
        depth={40}
        count={1800}
        factor={3}
        saturation={0}
        fade
        speed={0.3}
      />

      <AmbientParticles scrollProgress={scrollProgress} />
      <MorphParticles scrollProgress={scrollProgress} />

      <Environment preset="night" />
    </>
  );
}

export function CinematicCanvas({ scrollProgress }) {
  return (
    <Canvas
      className="scene-canvas"
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      dpr={[1, 1.75]}
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 2, 14] }}
    >
      <Suspense fallback={null}>
        <SceneContent scrollProgress={scrollProgress} />
      </Suspense>
    </Canvas>
  );
}
