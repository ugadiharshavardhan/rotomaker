"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

export function useScrollExperience(triggerRef, onProgress, enabled = true) {
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    if (!enabled) return;

    const trigger = triggerRef.current;
    if (!trigger) return;

    const lenis = new Lenis({
      duration: 0.55,
      easing: (t) => 1 - Math.pow(1 - t, 3),
      smoothWheel: true,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.15,
      syncTouch: false,
      lerp: 0.14,
      autoRaf: false,
    });

    lenis.on("scroll", ScrollTrigger.update);

    let rafId;
    const raf = (time) => {
      if (
        document.body.classList.contains("dg-scroll-lock") &&
        !document.querySelector(".sphere-root[data-enlarging='true'], .enlarge")
      ) {
        document.body.classList.remove("dg-scroll-lock");
      }
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
          scrub: 0.65,
          onUpdate: (self) => {
            onProgressRef.current?.(self.progress);
          },
        },
      }
    );

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        document.body.classList.remove("dg-scroll-lock");
        ScrollTrigger.update();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.body.classList.remove("dg-scroll-lock");
      tween.kill();
      cancelAnimationFrame(rafId);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [triggerRef, enabled]);
}
