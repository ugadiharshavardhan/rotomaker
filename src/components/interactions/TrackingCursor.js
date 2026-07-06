"use client";

import { useEffect, useRef, useState } from "react";

export function TrackingCursor({ enabled = true }) {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!enabled) {
      document.body.classList.remove("experience-cursor");
      return;
    }

    const finePointer = window.matchMedia("(pointer: fine)").matches;
    if (!finePointer) return;

    document.body.classList.add("experience-cursor");

    let rafId;
    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px)`;
      }
      rafId = requestAnimationFrame(animate);
    };
    rafId = requestAnimationFrame(animate);

    const onMove = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const onOver = (e) => {
      const el = e.target.closest("[data-scan], .magnetic-btn, .tilt-card, a, button");
      setScanning(!!el);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    return () => {
      document.body.classList.remove("experience-cursor");
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={ringRef}
        className={`tracking-cursor__ring${scanning ? " tracking-cursor__ring--scan" : ""}`}
        aria-hidden="true"
      />
      <div
        ref={cursorRef}
        className={`tracking-cursor${scanning ? " tracking-cursor--scan" : ""}`}
        aria-hidden="true"
      >
        <span className="tracking-cursor__cross-h" />
        <span className="tracking-cursor__cross-v" />
        <span className="tracking-cursor__dot" />
        {scanning && <span className="tracking-cursor__scan-line" />}
      </div>
    </>
  );
}
