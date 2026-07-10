"use client";

import { useLayoutEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import "./ScrollStack.css";

export const ScrollStackItem = ({ children, itemClassName = "" }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

function applyCardTransform(card, { translateY, scale, rotation, blur, opacity, zIndex, pointerEvents }) {
  const transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotation}deg)`;
  card.style.transform = transform;
  card.style.filter = blur > 0 ? `blur(${blur}px)` : "";
  card.style.opacity = opacity ?? "";
  card.style.zIndex = String(zIndex);
  if (pointerEvents !== undefined) {
    card.style.pointerEvents = pointerEvents;
  }
}

function ScrollStack({
  children,
  className = "",
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = "20%",
  scaleEndPosition = "10%",
  baseScale = 0.85,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  controlledProgress,
  onStackComplete,
}) {
  const scrollerRef = useRef(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef(null);
  const lenisRef = useRef(null);
  const cardsRef = useRef([]);
  const lastTransformsRef = useRef(new Map());
  const isUpdatingRef = useRef(false);
  const isControlled = controlledProgress !== undefined;

  const calculateProgress = useCallback((scrollTop, start, end) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value, containerHeight) => {
    if (typeof value === "string" && value.includes("%")) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight,
      };
    }
    const scroller = scrollerRef.current;
    return {
      scrollTop: scroller?.scrollTop ?? 0,
      containerHeight: scroller?.clientHeight ?? window.innerHeight,
    };
  }, [useWindowScroll]);

  const getElementOffset = useCallback(
    (element) => {
      if (useWindowScroll) {
        const rect = element.getBoundingClientRect();
        return rect.top + window.scrollY;
      }
      return element.offsetTop;
    },
    [useWindowScroll]
  );

  const updateFromControlledProgress = useCallback(
    (progress) => {
      const cards = cardsRef.current;
      if (!cards.length) return;

      const p = Math.min(0.999, Math.max(0, progress));
      const count = cards.length;
      const floatIndex = p * count;
      const topIndex = Math.min(count - 1, Math.floor(floatIndex));
      const topLocal = floatIndex - topIndex;

      cards.forEach((card, i) => {
        if (!card) return;

        const depth = topIndex - i;

        if (i > topIndex) {
          const ahead = i - topIndex;
          applyCardTransform(card, {
            translateY: 70 + ahead * 36 + (1 - topLocal) * 24,
            scale: 0.9 - ahead * 0.02,
            rotation: 0,
            blur: 0,
            opacity: Math.max(0, 0.15 - ahead * 0.08),
            zIndex: i,
            pointerEvents: "none",
          });
          return;
        }

        if (i === topIndex) {
          applyCardTransform(card, {
            translateY: (1 - topLocal) * 28,
            scale: baseScale + topLocal * (1 - baseScale),
            rotation: rotationAmount ? rotationAmount * 0.15 * (1 - topLocal) : 0,
            blur: 0,
            opacity: 1,
            zIndex: count + 10,
            pointerEvents: "auto",
          });
          return;
        }

        const backDepth = depth;
        applyCardTransform(card, {
          translateY: -backDepth * itemStackDistance * 0.85,
          scale: Math.max(0.72, baseScale - backDepth * itemScale * 2.2),
          rotation: rotationAmount ? -backDepth * rotationAmount * 0.35 : 0,
          blur: blurAmount ? backDepth * blurAmount : 0,
          opacity: Math.max(0.35, 0.92 - backDepth * 0.12),
          zIndex: count - backDepth,
          pointerEvents: "none",
        });
      });

      if (p >= 0.98 && !stackCompletedRef.current) {
        stackCompletedRef.current = true;
        onStackComplete?.();
      } else if (p < 0.98 && stackCompletedRef.current) {
        stackCompletedRef.current = false;
      }
    },
    [baseScale, blurAmount, itemScale, itemStackDistance, onStackComplete, rotationAmount]
  );

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length || isUpdatingRef.current || isControlled) return;

    isUpdatingRef.current = true;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endElement = useWindowScroll
      ? document.querySelector(".scroll-stack-end")
      : scrollerRef.current?.querySelector(".scroll-stack-end");

    const endElementTop = endElement ? getElementOffset(endElement) : 0;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      const cardTop = getElementOffset(card);
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
      const pinEnd = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jCardTop = getElementOffset(cardsRef.current[j]);
          const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) {
            topCardIndex = j;
          }
        }

        if (i < topCardIndex) {
          blur = Math.max(0, (topCardIndex - i) * blurAmount);
        }
      }

      let translateY = 0;
      const isPinned = scrollTop >= pinStart && scrollTop <= pinEnd;

      if (isPinned) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      applyCardTransform(card, {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
        zIndex: i,
      });

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });

    isUpdatingRef.current = false;
  }, [
    isControlled,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    useWindowScroll,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData,
    getElementOffset,
  ]);

  const handleScroll = useCallback(() => {
    updateCardTransforms();
  }, [updateCardTransforms]);

  const setupLenis = useCallback(() => {
    if (useWindowScroll) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
        smoothWheel: true,
        touchMultiplier: 2,
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075,
      });

      lenis.on("scroll", handleScroll);

      const raf = (time) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);

      lenisRef.current = lenis;
      return lenis;
    }

    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const lenis = new Lenis({
      wrapper: scroller,
      content: scroller.querySelector(".scroll-stack-inner"),
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      smoothWheel: true,
      touchMultiplier: 2,
      gestureOrientation: "vertical",
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075,
    });

    lenis.on("scroll", handleScroll);

    const raf = (time) => {
      lenis.raf(time);
      animationFrameRef.current = requestAnimationFrame(raf);
    };
    animationFrameRef.current = requestAnimationFrame(raf);

    lenisRef.current = lenis;
    return lenis;
  }, [handleScroll, useWindowScroll]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;

    const cards = Array.from(scroller.querySelectorAll(".scroll-stack-card"));
    cardsRef.current = cards;

    cards.forEach((card, i) => {
      if (!isControlled && i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      } else if (isControlled) {
        card.style.marginBottom = "0";
      }
      card.style.willChange = "transform, filter";
      card.style.transformOrigin = "top center";
      card.style.backfaceVisibility = "hidden";
      card.style.position = isControlled ? "absolute" : "relative";
      if (isControlled) {
        card.style.left = "0";
        card.style.right = "0";
        card.style.top = "0";
      }
    });

    if (isControlled) {
      updateFromControlledProgress(controlledProgress ?? 0);
      return () => {
        cardsRef.current = [];
        stackCompletedRef.current = false;
      };
    }

    setupLenis();
    updateCardTransforms();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      lastTransformsRef.current.clear();
      isUpdatingRef.current = false;
    };
  }, [
    isControlled,
    itemDistance,
    setupLenis,
    updateCardTransforms,
    updateFromControlledProgress,
  ]);

  useLayoutEffect(() => {
    if (!isControlled) return;
    updateFromControlledProgress(controlledProgress);
  }, [controlledProgress, isControlled, updateFromControlledProgress]);

  return (
    <div
      className={`scroll-stack-scroller${isControlled ? " scroll-stack-scroller--controlled" : ""} ${className}`.trim()}
      ref={scrollerRef}
    >
      <div className={`scroll-stack-inner${isControlled ? " scroll-stack-inner--controlled" : ""}`}>
        {children}
        {!isControlled && <div className="scroll-stack-end" />}
      </div>
    </div>
  );
}

export default ScrollStack;
