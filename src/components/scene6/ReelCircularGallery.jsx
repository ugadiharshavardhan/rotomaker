"use client";

import dynamic from "next/dynamic";
import { useLayoutEffect, useMemo } from "react";
import { PORTFOLIO } from "@/lib/experienceData";
import { warmImageCache } from "@/lib/moviesImageCache";

const CircularGallery = dynamic(() => import("./CircularGallery"), { ssr: false });

const REEL_IMAGES = PORTFOLIO.map((item) => item.image);

export function ReelCircularGallery({ progress = 0 }) {
  const items = useMemo(
    () =>
      PORTFOLIO.map((item) => ({
        image: item.image,
        text: item.title.toUpperCase(),
      })),
    []
  );

  useLayoutEffect(() => {
    void warmImageCache(REEL_IMAGES);
  }, []);

  return (
    <CircularGallery
      items={items}
      bend={3}
      textColor="#ffffff"
      borderRadius={0.05}
      scrollEase={0.08}
      scrollSpeed={2}
      scrollDriven
      scrollProgress={progress}
      itemCount={PORTFOLIO.length}
      fontUrl="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap"
      font="400 30px Bebas Neue"
    />
  );
}
