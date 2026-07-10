"use client";

import { Suspense } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { HollywoodCameraRig } from "@/components/camera/HollywoodCameraRig";
import { StudioLighting } from "@/components/lighting/StudioLighting";
import { CinematicEffects } from "@/components/lighting/CinematicEffects";
import { Scene1World } from "@/components/scene1/Scene1World";
import { makeLazyWorld } from "@/components/experience/LazySceneWorld";
import { GlbWarmup } from "@/components/preload/GlbWarmup";
import { getSceneBounds, SCENES } from "@/lib/sceneConfig";
import { shouldShowGlbCamera, getScene1Backdrop } from "@/lib/cameraLens";

const LazyScene = makeLazyWorld(() =>
  import("@/components/Scene").then((m) => ({ default: m.Scene }))
);
const LazyScene2World = makeLazyWorld(() =>
  import("@/components/scene2/Scene2World").then((m) => ({ default: m.Scene2World }))
);
const LazyServicesWorld = makeLazyWorld(() =>
  import("@/components/scene2/ServicesWorld").then((m) => ({ default: m.ServicesWorld }))
);
const LazyScene4World = makeLazyWorld(() =>
  import("@/components/scene4/Scene4World").then((m) => ({ default: m.Scene4World }))
);
const LazyScene5World = makeLazyWorld(() =>
  import("@/components/scene5/Scene5World").then((m) => ({ default: m.Scene5World }))
);
const LazyScene6World = makeLazyWorld(() =>
  import("@/components/scene6/Scene6World").then((m) => ({ default: m.Scene6World }))
);
const LazyMoviesWorld = makeLazyWorld(() =>
  import("@/components/movies/MoviesWorld").then((m) => ({ default: m.MoviesWorld }))
);
const LazyScene8World = makeLazyWorld(() =>
  import("@/components/scene7/Scene7World").then((m) => ({ default: m.Scene8World }))
);
const LazyScene9World = makeLazyWorld(() =>
  import("@/components/scene9/Scene9World").then((m) => ({ default: m.Scene9World }))
);
const LazyAboutWorld = makeLazyWorld(() =>
  import("@/components/about/AboutWorld").then((m) => ({ default: m.AboutWorld }))
);
const LazyWhyWorld = makeLazyWorld(() =>
  import("@/components/about/WhyWorld").then((m) => ({ default: m.WhyWorld }))
);
const LazyScene12World = makeLazyWorld(() =>
  import("@/components/scene12/Scene12World").then((m) => ({ default: m.Scene12World }))
);

function sceneStart(id) {
  return SCENES.find((s) => s.id === id)?.start ?? 1;
}

function shouldMountWorld(globalProgress, sceneId, opacity, lead = 0.05) {
  return opacity > 0.001 || globalProgress >= sceneStart(sceneId) - lead;
}

function WorldContent({ sceneState }) {
  const { scenes, scene4, scene9, activeScene, globalProgress } = sceneState;
  const activeId = activeScene.id;
  const isPureHero = scenes[0].progress < 0.05;
  const showGlbCamera = activeId === 1 && shouldShowGlbCamera(scenes[0].progress, scenes[0].opacity);
  const isGlobeActive = activeId === 6 && scenes[5].opacity > 0;
  const canvasBg =
    activeId === 1
      ? getScene1Backdrop(scenes[0].progress)
      : isGlobeActive || (activeId === 6 && scenes[5].opacity > 0.001)
        ? "#000000"
        : "#030303";

  const worldOpacity = (_sceneId, index) => scenes[index].opacity;

  const mountCameraScene = globalProgress < getSceneBounds(2).start + 0.03;

  return (
    <>
      <color attach="background" args={[canvasBg]} />

      {!isPureHero && !showGlbCamera && !isGlobeActive && (
        <StudioLighting intensity={0.85 + scenes[0].opacity * 0.15} />
      )}

      {!showGlbCamera && !isPureHero && (
        <HollywoodCameraRig sceneState={sceneState} />
      )}

      <Scene1World progress={scenes[0].progress} opacity={scenes[0].opacity} />

      <LazyScene
        active={mountCameraScene}
        scrollProgress={scenes[0].progress}
        opacity={scenes[0].opacity}
      />

      <LazyScene2World
        active={shouldMountWorld(globalProgress, 2, worldOpacity(2, 1))}
        progress={scenes[1].progress}
        opacity={worldOpacity(2, 1)}
      />
      <LazyServicesWorld
        active={shouldMountWorld(globalProgress, 3, worldOpacity(3, 2))}
        progress={scenes[2].progress}
        opacity={worldOpacity(3, 2)}
      />
      <LazyScene4World
        active={shouldMountWorld(globalProgress, 5, worldOpacity(5, 4))}
        wordKey={scene4.word.key}
        wordProgress={scene4.wordProgress}
        opacity={worldOpacity(5, 4)}
      />
      <LazyScene5World
        active={shouldMountWorld(globalProgress, 6, worldOpacity(6, 5))}
        progress={scenes[5].progress}
        opacity={worldOpacity(6, 5)}
      />
      <LazyScene6World
        active={shouldMountWorld(globalProgress, 7, worldOpacity(7, 6))}
        progress={scenes[6].progress}
        opacity={worldOpacity(7, 6)}
      />
      <LazyMoviesWorld
        active={shouldMountWorld(globalProgress, 8, worldOpacity(8, 7))}
        progress={scenes[7].progress}
        opacity={worldOpacity(8, 7)}
      />
      <LazyScene8World
        active={shouldMountWorld(globalProgress, 9, worldOpacity(9, 8))}
        progress={scenes[8].progress}
        opacity={worldOpacity(9, 8)}
      />
      <LazyScene9World
        active={shouldMountWorld(globalProgress, 10, worldOpacity(10, 9))}
        statIndex={scene9.index}
        segmentProgress={scene9.segmentProgress}
        opacity={worldOpacity(10, 9)}
      />
      <LazyAboutWorld
        active={shouldMountWorld(globalProgress, 11, worldOpacity(11, 10))}
        progress={scenes[10].progress}
        opacity={worldOpacity(11, 10)}
      />
      <LazyWhyWorld
        active={shouldMountWorld(globalProgress, 12, worldOpacity(12, 11))}
        progress={scenes[11].progress}
        opacity={worldOpacity(12, 11)}
      />
      <LazyScene12World
        active={shouldMountWorld(globalProgress, 13, worldOpacity(13, 12))}
        progress={scenes[12].progress}
        opacity={worldOpacity(13, 12)}
      />

      {!isPureHero && !showGlbCamera && !isGlobeActive && <CinematicEffects />}
    </>
  );
}

export function UnifiedCanvas({ sceneState }) {
  return (
    <Canvas
      className="scene-canvas"
      shadows="soft"
      frameloop="always"
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
        failIfMajorPerformanceCaveat: false,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.25,
      }}
      onCreated={({ gl }) => {
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.25;
      }}
      dpr={[1, 1.5]}
      camera={{ fov: 45, near: 0.1, far: 100, position: [0, 1.2, 5.5] }}
    >
      <Suspense fallback={null}>
        <GlbWarmup />
        <WorldContent sceneState={sceneState} />
      </Suspense>
    </Canvas>
  );
}
