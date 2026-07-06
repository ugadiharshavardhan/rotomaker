"use client";

import dynamic from "next/dynamic";
import { STORY_HYPERSPEED_OPTIONS } from "@/lib/storyHyperspeedOptions";

const Hyperspeed = dynamic(() => import("./Hyperspeed"), { ssr: false });

export function StoryHyperspeedBg() {
  return (
    <div className="story-hyperspeed-bg" aria-hidden="true">
      <Hyperspeed effectOptions={STORY_HYPERSPEED_OPTIONS} />
    </div>
  );
}
