"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function useSceneScroll(triggerRef, onProgress) {
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const lenis = new Lenis({
      duration: 0.7,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.14,
      syncTouch: false,
      autoRaf: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const tween = gsap.to(
      {},
      {
        duration: 1,
        ease: "none",
        scrollTrigger: {
          trigger,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
          onUpdate: (self) => {
            onProgressRef.current?.(self.progress);
          },
        },
      }
    );

    return () => {
      tween.kill();
      cancelAnimationFrame(rafId);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [triggerRef]);
}
