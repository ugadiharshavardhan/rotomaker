"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function CssFallbackVisual({ visual }) {
  return <div className={`service-ba__scene service-ba__scene--${visual}`} />;
}

function ImagePanel({ src, label, side }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={`${label} — ${side}`} className="service-ba__img" decoding="async" draggable={false} />
  );
}

export function ServiceBeforeAfter({
  visual,
  before,
  after,
  title = "Service",
  serviceKey,
}) {
  const hasImages = Boolean(before && after);
  const frameRef = useRef(null);
  const draggingRef = useRef(false);
  const [position, setPosition] = useState(50);

  useEffect(() => {
    setPosition(50);
  }, [serviceKey, before, after]);

  const setPositionFromClientX = useCallback((clientX) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect?.width) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(clamp(pct, 0, 100));
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!draggingRef.current) return;
      setPositionFromClientX(e.clientX);
    };
    const onTouchMove = (e) => {
      if (!draggingRef.current || !e.touches[0]) return;
      e.preventDefault();
      setPositionFromClientX(e.touches[0].clientX);
    };
    const onEnd = () => {
      draggingRef.current = false;
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onEnd);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onEnd);
      window.removeEventListener("pointercancel", onEnd);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onEnd);
    };
  }, [setPositionFromClientX]);

  const startDrag = (clientX) => {
    draggingRef.current = true;
    setPositionFromClientX(clientX);
  };

  return (
    <div className="service-ba">
      <div
        ref={frameRef}
        className="service-ba__frame"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          startDrag(e.clientX);
        }}
        onTouchStart={(e) => {
          if (!e.touches[0]) return;
          startDrag(e.touches[0].clientX);
        }}
        role="slider"
        aria-label={`${title} before and after comparison`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") setPosition((p) => clamp(p - 3, 0, 100));
          if (e.key === "ArrowRight") setPosition((p) => clamp(p + 3, 0, 100));
        }}
      >
        <div className="service-ba__half service-ba__half--before">
          {hasImages ? (
            <ImagePanel src={before} label={title} side="before" />
          ) : (
            <CssFallbackVisual visual={visual} />
          )}
          <span className="service-ba__tag service-ba__tag--before">Before</span>
        </div>
        <div
          className="service-ba__half service-ba__half--after"
          style={{ clipPath: `inset(0 0 0 ${position}%)` }}
        >
          {hasImages ? (
            <ImagePanel src={after} label={title} side="after" />
          ) : (
            <CssFallbackVisual visual={visual} />
          )}
          <span className="service-ba__tag service-ba__tag--after">After</span>
        </div>
        <div
          className="service-ba__divider"
          style={{ left: `${position}%` }}
          onPointerDown={(e) => {
            e.stopPropagation();
            startDrag(e.clientX);
          }}
        >
          <span className="service-ba__handle" aria-hidden="true" />
        </div>
      </div>
      <p className="service-ba__hint">Drag the line to compare before &amp; after</p>
    </div>
  );
}
