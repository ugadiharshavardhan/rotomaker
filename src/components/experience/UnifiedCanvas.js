"use client";

import { Suspense, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { HollywoodCameraRig } from "@/components/camera/HollywoodCameraRig";
import { StudioLighting } from "@/components/lighting/StudioLighting";
import { CinematicEffects } from "@/components/lighting/CinematicEffects";
import { Scene1World } from "@/components/scene1/Scene1World";
import { Scene } from "@/components/Scene";
import { makeLazyWorld } from "@/components/experience/LazySceneWorld";
import { GlbWarmup, GlbWarmupFallback } from "@/components/preload/GlbWarmup";
import { CanvasErrorBoundary } from "@/components/experience/CanvasErrorBoundary";
import { getSceneBounds, SCENES } from "@/lib/sceneConfig";
import {
  getScene1Backdrop,
  getScene1Phase,
  shouldShowGlbCamera,
  STORY_END,
  VFX_SECTION_END,
  IMPOSSIBLE_SECTION_END,
} from "@/lib/cameraLens";
import { LightRaysR3F } from "@/components/scene1/LightRaysR3F";
import { isWebGLAvailable, isWebGLError } from "@/lib/webglSupport";

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

function shouldMountWorld(globalProgress, sceneId, opacity, lead = 0.1) {
  return opacity > 0.001 || globalProgress >= sceneStart(sceneId) - lead;
}

function WorldContent({ sceneState }) {
  const { scenes, scene4, scene9, activeScene, globalProgress, forceWarmWorlds = false, mouse } = sceneState;
  const activeId = activeScene.id;
  const scene1Progress = scenes[0].progress;
  const scene1Opacity = scenes[0].opacity;
  const phase = getScene1Phase(scene1Progress);
  const isStoryChapter = phase === "story" && scene1Opacity > 0.05;
  const isVfxChapter = phase === "vfx" && scene1Opacity > 0.05;
  const isImpossible =
    phase === "impossible" &&
    scene1Progress >= VFX_SECTION_END &&
    scene1Progress < IMPOSSIBLE_SECTION_END &&
    scene1Opacity > 0.05;
  const showGlbCamera = shouldShowGlbCamera(scene1Progress, scene1Opacity);
  const isGlobeActive = activeId === 6 && scenes[5].opacity > 0;
  const isTunnelGallery = scenes[1].opacity > 0.05;
  /** Keep intro chapters visible until scene 1 is mostly gone — don't cut off for early gallery fade. */
  const showIntroWorld = scene1Opacity > 0.02 && (!isTunnelGallery || scene1Opacity > 0.35);

  const impossibleFade = 0.06;
  const impossibleOpacity = isImpossible
    ? Math.min(
        (scene1Progress - VFX_SECTION_END) / impossibleFade,
        (IMPOSSIBLE_SECTION_END - scene1Progress) / impossibleFade,
        1
      ) * scene1Opacity
    : 0;

  const canvasBg =
    showIntroWorld && (isStoryChapter || showGlbCamera || isImpossible)
      ? getScene1Backdrop(scene1Progress)
      : isTunnelGallery
        ? "#f4f4f4"
        : activeId === 1 || scene1Opacity > 0.05
          ? getScene1Backdrop(scene1Progress)
          : isGlobeActive || (activeId === 6 && scenes[5].opacity > 0.001)
            ? "#000000"
            : "#030303";

  const worldOpacity = (_sceneId, index) => scenes[index].opacity;
  const warmOr = (sceneId, opacity) =>
    forceWarmWorlds || shouldMountWorld(globalProgress, sceneId, opacity);

  const mountCameraScene =
    forceWarmWorlds ||
    (globalProgress < getSceneBounds(2).end && scene1Progress >= STORY_END - 0.04);

  const useStudioLook =
    !isStoryChapter &&
    !showGlbCamera &&
    !isGlobeActive &&
    !isImpossible &&
    !isTunnelGallery &&
    activeId > 1;

  return (
    <>
      <color attach="background" args={[canvasBg]} />

      {impossibleOpacity > 0.01 && (
        <LightRaysR3F opacity={impossibleOpacity} raysColor="#ffffff" saturation={0} />
      )}

      {useStudioLook && (
        <StudioLighting intensity={0.85 + scenes[0].opacity * 0.15} />
      )}

      {!showGlbCamera && !isStoryChapter && !isImpossible && !isTunnelGallery && (
        <HollywoodCameraRig sceneState={sceneState} />
      )}

      {showIntroWorld && (
        <Suspense fallback={null}>
          <Scene1World
            progress={scenes[0].progress}
            opacity={scenes[0].opacity}
            mouse={mouse}
          />
        </Suspense>
      )}

      {mountCameraScene && !isStoryChapter && showIntroWorld && (
        <Suspense fallback={null}>
          <Scene
            scrollProgress={scenes[0].progress}
            opacity={
              forceWarmWorlds
                ? Math.max(isVfxChapter ? scene1Opacity : 0.001, 0.001)
                : isVfxChapter
                  ? scene1Opacity
                  : 0
            }
          />
        </Suspense>
      )}

      <LazyScene2World
        active={
          forceWarmWorlds ||
          shouldMountWorld(globalProgress, 2, worldOpacity(2, 1), 0.16)
        }
        progress={scenes[1].progress}
        opacity={forceWarmWorlds ? Math.max(worldOpacity(2, 1), 0.001) : worldOpacity(2, 1)}
        mouse={mouse}
      />
      <LazyServicesWorld
        active={warmOr(3, worldOpacity(3, 2))}
        progress={scenes[2].progress}
        opacity={forceWarmWorlds ? Math.max(worldOpacity(3, 2), 0.001) : worldOpacity(3, 2)}
      />
      <LazyScene4World
        active={warmOr(5, worldOpacity(5, 4))}
        wordKey={scene4.word.key}
        wordProgress={scene4.wordProgress}
        opacity={forceWarmWorlds ? Math.max(worldOpacity(5, 4), 0.001) : worldOpacity(5, 4)}
      />
      <LazyScene5World
        active={warmOr(6, worldOpacity(6, 5))}
        progress={scenes[5].progress}
        opacity={forceWarmWorlds ? Math.max(worldOpacity(6, 5), 0.001) : worldOpacity(6, 5)}
      />
      <LazyScene6World
        active={warmOr(7, worldOpacity(7, 6))}
        progress={scenes[6].progress}
        opacity={forceWarmWorlds ? Math.max(worldOpacity(7, 6), 0.001) : worldOpacity(7, 6)}
      />
      <LazyMoviesWorld
        active={warmOr(8, worldOpacity(8, 7))}
        progress={scenes[7].progress}
        opacity={forceWarmWorlds ? Math.max(worldOpacity(8, 7), 0.001) : worldOpacity(8, 7)}
      />
      <LazyScene8World
        active={warmOr(9, worldOpacity(9, 8))}
        progress={scenes[8].progress}
        opacity={forceWarmWorlds ? Math.max(worldOpacity(9, 8), 0.001) : worldOpacity(9, 8)}
      />
      <LazyScene9World
        active={warmOr(10, worldOpacity(10, 9))}
        statIndex={scene9.index}
        segmentProgress={scene9.segmentProgress}
        opacity={forceWarmWorlds ? Math.max(worldOpacity(10, 9), 0.001) : worldOpacity(10, 9)}
      />
      <LazyAboutWorld
        active={warmOr(11, worldOpacity(11, 10))}
        progress={scenes[10].progress}
        opacity={forceWarmWorlds ? Math.max(worldOpacity(11, 10), 0.001) : worldOpacity(11, 10)}
      />
      <LazyWhyWorld
        active={warmOr(12, worldOpacity(12, 11))}
        progress={scenes[11].progress}
        opacity={forceWarmWorlds ? Math.max(worldOpacity(12, 11), 0.001) : worldOpacity(12, 11)}
      />
      <LazyScene12World
        active={warmOr(13, worldOpacity(13, 12))}
        progress={scenes[12].progress}
        opacity={forceWarmWorlds ? Math.max(worldOpacity(13, 12), 0.001) : worldOpacity(13, 12)}
      />

      {useStudioLook && <CinematicEffects />}
    </>
  );
}

function ExperienceCanvas({ sceneState, onUnavailable }) {
  const maxDpr =
    typeof window !== "undefined" && window.devicePixelRatio > 1.5 ? 1.15 : 1.25;

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
        gl.domElement.addEventListener(
          "webglcontextlost",
          (event) => {
            event.preventDefault();
            console.warn("[canvas] WebGL context lost");
            onUnavailable?.();
          },
          false
        );
      }}
      dpr={[1, maxDpr]}
      camera={{ fov: 45, near: 0.1, far: 200, position: [0, 1.2, 5.5] }}
    >
      <Suspense fallback={<GlbWarmupFallback onReady={sceneState.onGlbWarm} />}>
        <GlbWarmup onReady={sceneState.onGlbWarm} />
      </Suspense>
      {/* Isolated from GLB / texture Suspense — one failed remote image must not blank the whole canvas */}
      <WorldContent sceneState={sceneState} />
    </Canvas>
  );
}

export function UnifiedCanvas({ sceneState }) {
  const [enabled, setEnabled] = useState(() =>
    typeof window === "undefined" ? false : isWebGLAvailable()
  );
  const onGlbWarm = sceneState.onGlbWarm;

  const handleUnavailable = () => {
    setEnabled(false);
    // Unlock loading even when GPU init fails.
    onGlbWarm?.();
  };

  useEffect(() => {
    if (!isWebGLAvailable()) {
      handleUnavailable();
      return undefined;
    }

    const onRejection = (event) => {
      if (!isWebGLError(event.reason)) return;
      event.preventDefault();
      console.warn("[canvas] Suppressed WebGL rejection:", event.reason);
      handleUnavailable();
    };

    window.addEventListener("unhandledrejection", onRejection);
    return () => window.removeEventListener("unhandledrejection", onRejection);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only recovery wiring
  }, []);

  if (!enabled) {
    return null;
  }

  return (
    <CanvasErrorBoundary onError={handleUnavailable}>
      <ExperienceCanvas sceneState={sceneState} onUnavailable={handleUnavailable} />
    </CanvasErrorBoundary>
  );
}
