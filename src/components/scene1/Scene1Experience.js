"use client";

import { useCallback, useRef, useState } from "react";
import { CinematicCanvas } from "./CinematicCanvas";
import { TypographyOverlay } from "./TypographyOverlay";
import { SoundWaveIndicator } from "./SoundWaveIndicator";
import { useSceneScroll } from "@/hooks/useSceneScroll";

export default function Scene1Experience() {
  const triggerRef = useRef(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  const handleProgress = useCallback((value) => {
    setScrollProgress(value);
  }, []);

  useSceneScroll(triggerRef, handleProgress);

  const vignetteStrength = 0.55 + scrollProgress * 0.15;
  const flareOpacity = Math.max(
    0,
    Math.min(1, (scrollProgress - 0.65) / 0.35) * 0.7
  );

  return (
    <>
      <div className="scene-fixed" aria-label="Rotomaker cinematic intro">
        <CinematicCanvas scrollProgress={scrollProgress} />

        <div
          className="scene-vignette"
          style={{
            background: `radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,${vignetteStrength}) 100%)`,
          }}
        />

        <div className="scene-lens-flare" style={{ opacity: flareOpacity }} />

        <SoundWaveIndicator progress={scrollProgress} />
        <TypographyOverlay progress={scrollProgress} />

        <div
          className="scroll-hint"
          style={{ opacity: Math.max(0, 1 - scrollProgress * 3) }}
        >
          <span className="scroll-hint__text">Scroll to continue</span>
          <span className="scroll-hint__line" />
        </div>
      </div>

      <section ref={triggerRef} className="scroll-spacer" aria-hidden="true" />
    </>
  );
}
