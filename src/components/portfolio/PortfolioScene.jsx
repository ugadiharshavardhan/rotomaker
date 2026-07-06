"use client";

import { useMemo } from "react";
import { OrbitPaths } from "./OrbitPaths";
import { PortfolioCard } from "./PortfolioCard";
import { FocusedPortfolioCard } from "./FocusedPortfolioCard";
import { getActiveItemIndex, getPortfolioItemIndex } from "@/lib/portfolioData";
import { useSafeTextures } from "./useSafeTextures";

function PortfolioOrbitInner({ textures, count, progress, opacity }) {
  const reveal = Math.min(1, progress / 0.06);
  const scrollProgress = Math.min(0.999, Math.max(0, progress));
  const { index: activeIndex, segmentProgress } = getActiveItemIndex(scrollProgress, count);
  const textureList = useMemo(() => textures ?? Array(count).fill(null), [textures, count]);

  if (opacity <= 0 || reveal <= 0.01) return null;

  return (
    <group>
      <ambientLight intensity={0.2 * opacity} />
      <pointLight position={[0, 3, 5]} intensity={1 * opacity} color="#ffffff" />
      <directionalLight position={[4, 6, 3]} intensity={0.45 * opacity} />
      <pointLight position={[-3, 1, 2]} intensity={0.35 * opacity} color="#888888" />
      <OrbitPaths progress={reveal} opacity={opacity} count={2} />
      {Array.from({ length: count }).map((_, i) => (
        <PortfolioCard
          key={`card-${i}`}
          texture={textureList[i] ?? null}
          index={i}
          total={count}
          progress={reveal}
          opacity={opacity}
          activeIndex={activeIndex}
          segmentProgress={segmentProgress}
        />
      ))}
    </group>
  );
}

function PortfolioFocusedInner({ textures, count, progress, opacity }) {
  const reveal = Math.min(1, progress / 0.06);
  const scrollProgress = Math.min(0.999, Math.max(0, progress));
  const { index: activeIndex, segmentProgress } = getPortfolioItemIndex(scrollProgress, count);

  if (opacity <= 0 || reveal <= 0.01) return null;

  return (
    <group>
      <ambientLight intensity={0.25 * opacity} />
      <pointLight position={[2, 3, 6]} intensity={1.1 * opacity} color="#ffffff" />
      <directionalLight position={[4, 6, 4]} intensity={0.5 * opacity} />
      <pointLight position={[-2, 1, 3]} intensity={0.3 * opacity} color="#888888" />
      <FocusedPortfolioCard
        key={`focused-${activeIndex}`}
        texture={textures?.[activeIndex] ?? null}
        segmentProgress={segmentProgress}
        opacity={opacity * reveal}
      />
    </group>
  );
}

function PortfolioSceneWithTextures({ images, itemCount, progress, opacity, mode }) {
  const textures = useSafeTextures(images);
  const count = itemCount ?? images.length;

  if (!textures) return null;

  if (mode === "portfolio") {
    return (
      <PortfolioFocusedInner
        textures={textures}
        count={count}
        progress={progress}
        opacity={opacity}
      />
    );
  }

  return (
    <PortfolioOrbitInner
      textures={textures}
      count={count}
      progress={progress}
      opacity={opacity}
    />
  );
}

function PortfolioSceneWithoutTextures({ itemCount, progress, opacity, mode }) {
  if (mode === "portfolio") {
    return (
      <PortfolioFocusedInner
        textures={null}
        count={itemCount}
        progress={progress}
        opacity={opacity}
      />
    );
  }

  return (
    <PortfolioOrbitInner
      textures={null}
      count={itemCount}
      progress={progress}
      opacity={opacity}
    />
  );
}

export function PortfolioScene({ images = [], progress, opacity = 1, itemCount, mode = "default" }) {
  if (opacity <= 0) return null;

  if (images.length > 0) {
    return (
      <PortfolioSceneWithTextures
        images={images}
        itemCount={itemCount ?? images.length}
        progress={progress}
        opacity={opacity}
        mode={mode}
      />
    );
  }

  return (
    <PortfolioSceneWithoutTextures
      itemCount={itemCount ?? 8}
      progress={progress}
      opacity={opacity}
      mode={mode}
    />
  );
}
