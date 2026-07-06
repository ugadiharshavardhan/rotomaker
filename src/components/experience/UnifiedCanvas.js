"use client";

import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { HollywoodCameraRig } from "@/components/camera/HollywoodCameraRig";
import { StudioLighting } from "@/components/lighting/StudioLighting";
import { CinematicEffects } from "@/components/lighting/CinematicEffects";
import { Scene } from "@/components/Scene";
import { Scene1World } from "@/components/scene1/Scene1World";
import { Scene2World } from "@/components/scene2/Scene2World";
import { ServicesWorld } from "@/components/scene2/ServicesWorld";
import { Scene4World } from "@/components/scene4/Scene4World";
import { Scene5World } from "@/components/scene5/Scene5World";
import { Scene6World } from "@/components/scene6/Scene6World";
import { MoviesWorld } from "@/components/movies/MoviesWorld";
import { Scene8World } from "@/components/scene7/Scene7World";
import { Scene9World } from "@/components/scene9/Scene9World";
import { AboutWorld } from "@/components/about/AboutWorld";
import { WhyWorld } from "@/components/about/WhyWorld";
import { Scene12World } from "@/components/scene12/Scene12World";
import { HERO_END, CAMERA_END, shouldShowGlbCamera, getScene1Backdrop } from "@/lib/cameraLens";

function WorldContent({ sceneState }) {
  const { scenes, scene4, scene9, activeScene } = sceneState;
  const activeId = activeScene.id;
  const isPureHero = scenes[0].progress < 0.05;
  const showGlbCamera = activeId === 1 && shouldShowGlbCamera(scenes[0].progress, scenes[0].opacity);
  const canvasBg = activeId === 1 ? getScene1Backdrop(scenes[0].progress) : "#030303";

  const worldOpacity = (sceneId, index) =>
    activeId === sceneId ? scenes[index].opacity : 0;

  return (
    <>
      <color attach="background" args={[canvasBg]} />

      {!isPureHero && !showGlbCamera && (
        <StudioLighting intensity={0.85 + scenes[0].opacity * 0.15} />
      )}

      {!showGlbCamera && !isPureHero && (
        <HollywoodCameraRig sceneState={sceneState} />
      )}

      <Scene1World progress={scenes[0].progress} opacity={scenes[0].opacity} />
      <Scene
        scrollProgress={scenes[0].progress}
        opacity={scenes[0].opacity}
      />

      <Scene2World progress={scenes[1].progress} opacity={worldOpacity(2, 1)} />
      <ServicesWorld progress={scenes[2].progress} opacity={worldOpacity(3, 2)} />
      <Scene4World
        wordKey={scene4.word.key}
        wordProgress={scene4.wordProgress}
        opacity={worldOpacity(5, 4)}
      />
      <Scene5World progress={scenes[5].progress} opacity={worldOpacity(6, 5)} />
      <Scene6World progress={scenes[6].progress} opacity={worldOpacity(7, 6)} />
      <MoviesWorld progress={scenes[7].progress} opacity={worldOpacity(8, 7)} />
      <Scene8World progress={scenes[8].progress} opacity={worldOpacity(9, 8)} />
      <Scene9World
        statIndex={scene9.index}
        segmentProgress={scene9.segmentProgress}
        opacity={worldOpacity(10, 9)}
      />
      <AboutWorld progress={scenes[10].progress} opacity={worldOpacity(11, 10)} />
      <WhyWorld progress={scenes[11].progress} opacity={worldOpacity(12, 11)} />
      <Scene12World progress={scenes[12].progress} opacity={worldOpacity(13, 12)} />

      {!isPureHero && !showGlbCamera && <CinematicEffects />}
    </>
  );
}

export function UnifiedCanvas({ sceneState }) {
  return (
    <Canvas
      className="scene-canvas"
      shadows="soft"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.25,
      }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.25;
      }}
      dpr={[1, 1.75]}
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 1.2, 5.5] }}
    >
      <Suspense fallback={null}>
        <WorldContent sceneState={sceneState} />
      </Suspense>
    </Canvas>
  );
}
