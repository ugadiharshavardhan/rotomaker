"use client";

import dynamic from "next/dynamic";
import { STORY_HYPERSPEED_OPTIONS } from "@/lib/storyHyperspeedOptions";

const Hyperspeed = dynamic(() => import("./Hyperspeed"), {
  ssr: false,
  loading: () => null,
});

export function StoryHyperspeedBg() {
  return (
    <div className="story-hyperspeed-bg" aria-hidden="true">
      <Hyperspeed effectOptions={STORY_HYPERSPEED_OPTIONS} />
    </div>
  );
}

if (typeof window !== "undefined") {
  void import("./Hyperspeed");
}
