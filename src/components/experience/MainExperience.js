"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getSceneState, getActiveSceneOpacity, getStoryOverlayOpacity, getSceneBounds } from "@/lib/sceneConfig";
import { useScrollExperience } from "@/hooks/useScrollExperience";
import { getScene1Phase, getScene1Backdrop, getVfxLocalProgress, getCameraPhase, STUDIO_BACKDROP } from "@/lib/cameraLens";
import { waitForExperienceReady, prefetchUpcomingByProgress } from "@/lib/experienceAssetPreload";
import { ExperienceLoadingScreen } from "@/components/preload/ExperienceLoadingScreen";
import { ExperienceWarmLayer } from "@/components/preload/ExperienceWarmLayer";
import { ServicesGradientBlindsBg } from "@/components/services/ServicesGradientBlindsBg";
import { ScrollPulseLayer } from "./ScrollPulseLayer";
import { HeroTypography } from "@/components/typography/HeroTypography";
import { ParallaxBackground } from "@/components/interactions/ParallaxBackground";
import { HeroBrand } from "@/components/scene1/HeroBrand";
import { HangingSpiderMan } from "@/components/scene1/HangingSpiderMan";
import { LensPortalOverlay } from "@/components/scene1/LensPortalOverlay";
import { CameraSectionOverlay } from "@/components/scene1/CameraSectionOverlay";
import { SoundWaveIndicator } from "@/components/scene1/SoundWaveIndicator";
import { Scene2Overlay } from "@/components/scene2/Scene2Overlay";
import { PortfolioImagePreloader } from "@/components/scene2/PortfolioImagePreloader";
import { ServiceImagePreloader } from "@/components/scene2/ServiceImagePreloader";
import { ExperienceImagePreloader } from "@/components/ExperienceImagePreloader";
import { ServicesSection } from "@/components/scene2/ServicesSection";
import { ServicesEvilEyeBg } from "@/components/services/ServicesEvilEyeBg";
import { getServicesIntroBgOpacity, getServicesCardsBgOpacity, SERVICES_INTRO_END } from "@/lib/servicesVisualState";
import { Scene4Overlay } from "@/components/scene4/Scene4Overlay";
import { Scene5Overlay } from "@/components/scene5/Scene5Overlay";
import { Scene6Overlay } from "@/components/scene6/Scene6Overlay";
import { Scene8Overlay } from "@/components/scene8/Scene8Overlay";
import { Scene9Overlay } from "@/components/scene9/Scene9Overlay";
import { MoviesLibrarySection } from "@/components/movies/MoviesLibrarySection";
import { AboutSection } from "@/components/about/AboutSection";
import { WhySection } from "@/components/about/WhySection";
import { StoryHyperspeedBg } from "@/components/about/StoryHyperspeedBg";
import { Scene12Overlay } from "@/components/scene12/Scene12Overlay";

const UnifiedCanvas = dynamic(
  () => import("./UnifiedCanvas").then((m) => m.UnifiedCanvas),
  { ssr: false }
);

export default function MainExperience() {
  const triggerRef = useRef(null);
  const [globalProgress, setGlobalProgress] = useState(0);
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
  const [loadProgress, setLoadProgress] = useState(0);
  const [assetsReady, setAssetsReady] = useState(false);
  const [gpuReady, setGpuReady] = useState(false);
  const [effectsReady, setEffectsReady] = useState(false);
  const ready = assetsReady && gpuReady && effectsReady;

  const progressRafRef = useRef(0);
  const pendingProgressRef = useRef(0);

  const handleProgress = useCallback((value) => {
    pendingProgressRef.current = value;
    if (progressRafRef.current) return;
    progressRafRef.current = requestAnimationFrame(() => {
      progressRafRef.current = 0;
      setGlobalProgress(pendingProgressRef.current);
    });
  }, []);

  const handleGlbWarm = useCallback(() => {
    setGpuReady(true);
  }, []);

  const handleEffectsWarm = useCallback(() => {
    setEffectsReady(true);
  }, []);

  useScrollExperience(triggerRef, handleProgress, ready);

  useEffect(() => {
    return () => {
      if (progressRafRef.current) {
        cancelAnimationFrame(progressRafRef.current);
        progressRafRef.current = 0;
      }
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    document.body.classList.add("experience-loading");
    document.documentElement.classList.add("experience-loading");

    void waitForExperienceReady((value) => {
      if (!cancelled) setLoadProgress(value);
    }).then(() => {
      if (!cancelled) setAssetsReady(true);
    });

    // Safety: never trap the user if GPU / effect warm hangs.
    const safety = window.setTimeout(() => {
      if (!cancelled) {
        setAssetsReady(true);
        setGpuReady(true);
        setEffectsReady(true);
      }
    }, 12000);

    // Recover from WebGL context failures so the page stays usable.
    const onRejection = (event) => {
      const message = String(event.reason?.message || event.reason || "");
      if (!/webgl/i.test(message)) return;
      event.preventDefault();
      console.warn("[experience] Recovered from WebGL failure:", event.reason);
      if (!cancelled) {
        setGpuReady(true);
        setEffectsReady(true);
      }
    };
    window.addEventListener("unhandledrejection", onRejection);

    return () => {
      cancelled = true;
      window.clearTimeout(safety);
      window.removeEventListener("unhandledrejection", onRejection);
      document.body.classList.remove("experience-loading");
      document.documentElement.classList.remove("experience-loading");
    };
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.body.classList.remove("experience-loading");
    document.documentElement.classList.remove("experience-loading");
  }, [ready]);

  useEffect(() => {
    let rafId = 0;
    let next = { x: 0.5, y: 0.5 };
    const onMove = (e) => {
      next = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        setMouse(next);
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Never leave movies scroll-lock stuck — it blocks scrolling mid-experience.
  useEffect(() => {
    const movies = getSceneBounds(8);
    const inMovies =
      globalProgress >= movies.start && globalProgress < movies.end;
    if (!inMovies) {
      document.body.classList.remove("dg-scroll-lock");
    }
  }, [globalProgress]);

  // Prefetch the next section's modules/models before the user arrives.
  useEffect(() => {
    if (!ready) return;
    prefetchUpcomingByProgress(globalProgress);
  }, [ready, globalProgress]);

  const sceneState = useMemo(
    () => ({
      ...getSceneState(globalProgress),
      onGlbWarm: handleGlbWarm,
      // Never force-mount every R3F world — that exhausts WebGL contexts and crashes deploy/preview tabs.
      forceWarmWorlds: false,
    }),
    [globalProgress, handleGlbWarm]
  );

  const { scenes, microBeat } = sceneState;
  const scene1 = scenes[0];
  const scene2 = scenes[1];
  const scene3 = scenes[2];
  const scene4 = scenes[3];
  const scene5 = scenes[4];
  const scene6 = scenes[5];
  const scene7 = scenes[6];
  const scene7b = scenes[7];
  const scene8 = scenes[8];
  const scene9 = scenes[9];
  const scene10 = scenes[10];
  const scene11 = scenes[11];
  const scene12 = scenes[12];

  const isInteractive = globalProgress >= getSceneBounds(6).start;

  const overlay2 = getActiveSceneOpacity(globalProgress, 2);
  const overlay3 = getActiveSceneOpacity(globalProgress, 3);
  const overlay4 = getActiveSceneOpacity(globalProgress, 4);
  const overlayGlobe = getActiveSceneOpacity(globalProgress, 6);
  const overlayReel = getStoryOverlayOpacity(globalProgress, 7);
  const overlayMovies = getStoryOverlayOpacity(globalProgress, 8);
  const overlayVfx = getStoryOverlayOpacity(globalProgress, 9);
  const overlayStats = getStoryOverlayOpacity(globalProgress, 10);
  const overlayAbout = getStoryOverlayOpacity(globalProgress, 11);
  const overlayWhy = getStoryOverlayOpacity(globalProgress, 12);

  const scene1Phase = getScene1Phase(scene1.progress);
  const isPureHero = scene1Phase === "hero";
  const isVfxSection = scene1Phase === "vfx";
  const activeSceneId = sceneState.activeScene.id;
  const isGalleryScene = activeSceneId === 7 || activeSceneId === 8;
  const moviesSceneStart = getSceneBounds(8).start;
  const ctaSceneStart = getSceneBounds(13).start;
  const isStoryContent = globalProgress >= moviesSceneStart && globalProgress < ctaSceneStart;

  const vignetteStrength = isStoryContent
    ? 0.06
    : isGalleryScene
      ? 0.22
      : 0.55 + globalProgress * 0.1;
  const flareOpacity = isVfxSection
    ? Math.max(0, Math.min(1, getVfxLocalProgress(scene1.progress) * 0.35) * scene1.opacity)
    : 0;

  const lensDive = isVfxSection ? getVfxLocalProgress(scene1.progress) : 0;
  const cameraDive = isVfxSection ? getCameraPhase(scene1.progress).dive : 0;
  const isGlobeSection = overlayGlobe > 0.01 && activeSceneId === 6;
  const phaseBackdropColor =
    isVfxSection
      ? STUDIO_BACKDROP
      : isGlobeSection
        ? "#000000"
        : scene1.opacity > 0.01
          ? getScene1Backdrop(scene1.progress)
          : null;

  const studioFade =
    globalProgress >= ctaSceneStart && globalProgress < ctaSceneStart + 0.017
      ? Math.min(1, (globalProgress - ctaSceneStart) / 0.017)
      : 0;

  const contactOpacity =
    globalProgress >= ctaSceneStart
      ? getStoryOverlayOpacity(globalProgress, 13, 0.028)
      : 0;

  const storyHyperspeedOpacity =
    Math.max(overlayAbout, overlayWhy) * (1 - studioFade * 0.5);

  const servicesEvilEyeOpacity = getServicesIntroBgOpacity(
    scene3.progress,
    overlay3,
    studioFade
  );
  const servicesCardsBgOpacity = getServicesCardsBgOpacity(
    scene3.progress,
    overlay3,
    studioFade
  );

  // Mount heavy WebGL backgrounds slightly before they are visible so shaders compile early.
  const servicesStart = getSceneBounds(3).start;
  const approachingServices = globalProgress >= servicesStart - 0.045;
  const approachingCards =
    approachingServices && scene3.progress >= SERVICES_INTRO_END * 0.45;
  const approachingStory = globalProgress >= getSceneBounds(11).start - 0.04;

  const mountEvilEye =
    ready && (servicesEvilEyeOpacity > 0.01 || approachingServices);
  const mountGradientBlinds =
    ready && (servicesCardsBgOpacity > 0.01 || approachingCards);
  const mountHyperspeed =
    ready && (storyHyperspeedOpacity > 0.01 || approachingStory);

  // Keep the experience canvas mounted — remounting EffectComposer crashes with null gl.
  // Mount during loading so GlbWarmup can decode the camera GLB into GPU memory.
  const shouldMountExperienceCanvas = true;

  const displayLoadProgress = ready
    ? 1
    : effectsReady
      ? Math.max(loadProgress, 0.99)
      : assetsReady
        ? Math.max(loadProgress, 0.94)
        : loadProgress;

  return (
    <>
      {!ready && <ExperienceLoadingScreen progress={displayLoadProgress} />}

      <ExperienceWarmLayer
        active={assetsReady && gpuReady && !effectsReady}
        onReady={handleEffectsWarm}
      />

      {(ready || assetsReady) && (
        <>
          <PortfolioImagePreloader />
          <ServiceImagePreloader />
          <ExperienceImagePreloader />
        </>
      )}

      <div
        className={`scene-fixed${isInteractive ? " scene-fixed--interactive" : ""}${isVfxSection ? " scene-fixed--camera" : ""}${cameraDive > 0.02 ? " scene-fixed--camera-dive" : ""}${isGlobeSection ? " scene-fixed--globe" : ""}`}
        aria-label="Rotomaker cinematic experience"
        style={{
          opacity: ready ? 1 : 0,
          pointerEvents: ready ? undefined : "none",
          filter:
            microBeat.effect === "depth"
              ? `brightness(${1 + microBeat.beatProgress * 0.03})`
              : undefined,
        }}
      >
        {isPureHero && <div className="hero-backdrop" aria-hidden="true" />}

        {phaseBackdropColor && (
          <div
            className="scene-phase-backdrop"
            style={{ background: phaseBackdropColor }}
            aria-hidden="true"
          />
        )}

        {sceneState.activeScene.id > 1 && sceneState.activeScene.id !== 2 && (
          <ParallaxBackground globalProgress={globalProgress} mouse={mouse} />
        )}

        <div
          className={`scene-canvas-wrap${sceneState.activeScene.id === 2 ? " scene-canvas-wrap--portfolio-content" : ""}`}
          style={{
            opacity:
              isPureHero || activeSceneId === 2 || activeSceneId === 7
                ? 0
                : 1,
            transition: "opacity 0.65s ease",
          }}
        >
          {shouldMountExperienceCanvas && <UnifiedCanvas sceneState={sceneState} />}
        </div>

        <ScrollPulseLayer microBeat={microBeat} suppressed={isStoryContent} />

        <div
          className="scene-vignette"
          style={{
            opacity:
              isPureHero || scene1Phase === "impossible" || isVfxSection
                ? 0
                : Math.max(0, 1 - lensDive * 0.85),
            transition: "opacity 0.55s ease",
            background: `radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,${vignetteStrength + studioFade * 0.2}) 100%)`,
          }}
        />

        {!isPureHero && isVfxSection && (
          <div
            className="scene-lens-flare"
            style={{ opacity: flareOpacity * (1 - studioFade) }}
          />
        )}

        <HeroBrand progress={scene1.progress} />

        <HeroTypography scene1Progress={scene1.progress} scene1Opacity={scene1.opacity} />

        {!isPureHero && isVfxSection && (
          <SoundWaveIndicator progress={scene1.progress} dark />
        )}

        <HangingSpiderMan progress={scene1.progress} />

        {isVfxSection && <LensPortalOverlay progress={scene1.progress} />}
        <CameraSectionOverlay progress={scene1.progress} />

        <Scene2Overlay
          progress={scene2.progress}
          opacity={overlay2 * (1 - studioFade * 0.5)}
        />

        {mountEvilEye && (
          <div
            className="services-evil-eye-layer"
            style={{ opacity: servicesEvilEyeOpacity }}
            aria-hidden="true"
          >
            <ServicesEvilEyeBg />
          </div>
        )}

        {mountGradientBlinds && (
          <div
            className="services-gradient-blinds-layer"
            style={{ opacity: servicesCardsBgOpacity }}
            aria-hidden="true"
          >
            <ServicesGradientBlindsBg />
          </div>
        )}

        <ServicesSection
          progress={scene3.progress}
          opacity={overlay3 * (1 - studioFade * 0.5)}
        />

        <Scene4Overlay scene4={sceneState.scene4} opacity={overlay4 * (1 - studioFade * 0.5)} />

        <Scene5Overlay progress={scene6.progress} opacity={overlayGlobe * (1 - studioFade * 0.5)} />
        <Scene6Overlay
          progress={scene7.progress}
          opacity={overlayReel * (1 - studioFade * 0.5)}
        />
        <MoviesLibrarySection
          progress={scene7b.progress}
          opacity={overlayMovies * (1 - studioFade * 0.5)}
        />
        <Scene8Overlay progress={scene8.progress} opacity={overlayVfx * (1 - studioFade * 0.5)} />
        <Scene9Overlay scene9={sceneState.scene9} opacity={overlayStats * (1 - studioFade * 0.5)} />

        {mountHyperspeed && (
          <div
            className="story-hyperspeed-layer"
            style={{ opacity: storyHyperspeedOpacity }}
            aria-hidden="true"
          >
            <StoryHyperspeedBg />
          </div>
        )}

        <AboutSection progress={scene10.progress} opacity={overlayAbout * (1 - studioFade * 0.5)} />
        <WhySection progress={scene11.progress} opacity={overlayWhy * (1 - studioFade * 0.5)} />
        <Scene12Overlay
          progress={scene12.progress}
          opacity={contactOpacity}
        />

        <div
          className="scroll-hint"
          style={{
            opacity: isPureHero || isVfxSection ? 0 : Math.max(0, 1 - globalProgress * 4),
          }}
        >
          <span className="scroll-hint__text">Scroll to continue</span>
          <span className="scroll-hint__line" />
        </div>
      </div>

      <section
        ref={triggerRef}
        className="scroll-spacer experience-scroll"
        aria-hidden="true"
        style={{ visibility: ready ? "visible" : "hidden" }}
      />
    </>
  );
}
