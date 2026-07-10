"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getSceneState, getActiveSceneOpacity, getStoryOverlayOpacity, getSceneBounds } from "@/lib/sceneConfig";
import { EXPERIENCE_IMAGE_URLS } from "@/lib/imagePreload";
import { warmImageCache } from "@/lib/moviesImageCache";
import { useScrollExperience } from "@/hooks/useScrollExperience";
import { getScene1Phase, getScene1Backdrop, getVfxLocalProgress, getCameraPhase, STUDIO_BACKDROP, HERO_END } from "@/lib/cameraLens";
import { ExperienceAssetPreloader } from "@/components/preload/ExperienceAssetPreloader";
import { ScrollPulseLayer } from "./ScrollPulseLayer";
import { HeroTypography } from "@/components/typography/HeroTypography";
import { TrackingCursor } from "@/components/interactions/TrackingCursor";
import { ParallaxBackground } from "@/components/interactions/ParallaxBackground";
import { HeroBrand } from "@/components/scene1/HeroBrand";
import { HeroLightRays } from "@/components/scene1/HeroLightRays";
import { HangingSpiderMan } from "@/components/scene1/HangingSpiderMan";
import { HeroDragon } from "@/components/scene1/HeroDragon";
import { LensPortalOverlay } from "@/components/scene1/LensPortalOverlay";
import { CameraSectionOverlay } from "@/components/scene1/CameraSectionOverlay";
import { SoundWaveIndicator } from "@/components/scene1/SoundWaveIndicator";
import { Scene2Overlay } from "@/components/scene2/Scene2Overlay";
import { PortfolioImagePreloader } from "@/components/scene2/PortfolioImagePreloader";
import { ServiceImagePreloader } from "@/components/scene2/ServiceImagePreloader";
import { ExperienceImagePreloader } from "@/components/ExperienceImagePreloader";
import { ServicesSection } from "@/components/scene2/ServicesSection";
import { ServicesEvilEyeBg } from "@/components/services/ServicesEvilEyeBg";
import { ServicesGradientBlindsBg } from "@/components/services/ServicesGradientBlindsBg";
import { getServicesCardsBgOpacity, getServicesIntroBgOpacity } from "@/lib/servicesVisualState";
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

  const handleProgress = useCallback((value) => {
    setGlobalProgress(value);
  }, []);

  useScrollExperience(triggerRef, handleProgress);

  useLayoutEffect(() => {
    void warmImageCache(EXPERIENCE_IMAGE_URLS);
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      });
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  const sceneState = useMemo(
    () => getSceneState(globalProgress),
    [globalProgress]
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
      ? getStoryOverlayOpacity(globalProgress, 13, 0.018)
      : 0;

  const storyHyperspeedOpacity =
    Math.max(overlayAbout, overlayWhy) * (1 - studioFade * 0.5);

  const servicesEvilEyeOpacity = getServicesIntroBgOpacity(
    scene3.progress,
    overlay3,
    studioFade
  );

  const servicesGradientBlindsOpacity = getServicesCardsBgOpacity(
    scene3.progress,
    overlay3,
    studioFade
  );

  const shouldMountExperienceCanvas =
    scene1.progress >= HERO_END || activeSceneId > 1 || globalProgress >= 0.12;

  return (
    <>
      <ExperienceAssetPreloader />
      <TrackingCursor enabled={globalProgress < moviesSceneStart} />
      <PortfolioImagePreloader />
      <ServiceImagePreloader />
      <ExperienceImagePreloader />

      <div
        className={`scene-fixed${isInteractive ? " scene-fixed--interactive" : ""}${isVfxSection ? " scene-fixed--camera" : ""}${cameraDive > 0.02 ? " scene-fixed--camera-dive" : ""}${isGlobeSection ? " scene-fixed--globe" : ""}`}
        aria-label="Rotomaker cinematic experience"
        style={{
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
            opacity: isPureHero || activeSceneId === 2 || activeSceneId === 7 ? 0 : 1,
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

        <HeroLightRays progress={scene1.progress} />
        <HeroBrand progress={scene1.progress} />

        <HeroTypography scene1Progress={scene1.progress} scene1Opacity={scene1.opacity} />

        {!isPureHero && isVfxSection && (
          <SoundWaveIndicator progress={scene1.progress} dark />
        )}

        <HangingSpiderMan progress={scene1.progress} />
        <HeroDragon progress={scene1.progress} />

        {isVfxSection && <LensPortalOverlay progress={scene1.progress} />}
        <CameraSectionOverlay progress={scene1.progress} />

        <Scene2Overlay
          progress={scene2.progress}
          opacity={overlay2 * (1 - studioFade * 0.5)}
        />

        {servicesEvilEyeOpacity > 0.01 && (
          <div
            className="services-evil-eye-layer"
            style={{ opacity: servicesEvilEyeOpacity }}
            aria-hidden="true"
          >
            <ServicesEvilEyeBg />
          </div>
        )}

        {servicesGradientBlindsOpacity > 0.01 && (
          <div
            className="services-gradient-blinds-layer"
            style={{ opacity: servicesGradientBlindsOpacity }}
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
        <Scene6Overlay progress={scene7.progress} opacity={overlayReel * (1 - studioFade * 0.5)} />
        <MoviesLibrarySection progress={scene7b.progress} opacity={overlayMovies * (1 - studioFade * 0.5)} />
        <Scene8Overlay progress={scene8.progress} opacity={overlayVfx * (1 - studioFade * 0.5)} />
        <Scene9Overlay scene9={sceneState.scene9} opacity={overlayStats * (1 - studioFade * 0.5)} />

        {storyHyperspeedOpacity > 0.01 && (
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

      <section ref={triggerRef} className="scroll-spacer experience-scroll" aria-hidden="true" />
    </>
  );
}
