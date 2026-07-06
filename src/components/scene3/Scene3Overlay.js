"use client";

import { PipelineSectionOverlay } from "./PipelineSectionOverlay";

export function Scene3Overlay({ progress, opacity = 1 }) {
  return <PipelineSectionOverlay progress={progress} opacity={opacity} variant="full" />;
}
