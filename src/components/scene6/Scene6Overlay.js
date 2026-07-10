"use client";

import { useState } from "react";
import { PORTFOLIO } from "@/lib/experienceData";
import { getReelItemIndex } from "@/lib/statsScroll";
import { sectionReveal } from "@/lib/easing";
import { MagneticButton } from "@/components/interactions/MagneticButton";
import { ReelCircularGallery } from "@/components/scene6/ReelCircularGallery";

export function Scene6Overlay({ progress, opacity = 1 }) {
  const [hoveredId, setHoveredId] = useState(null);
  const reveal = sectionReveal(progress, 0.2);
  const count = PORTFOLIO.length;
  const { index: activeIndex } = getReelItemIndex(progress, count);
  const active = PORTFOLIO[activeIndex];
  const hovered = hoveredId ? PORTFOLIO.find((p) => p.id === hoveredId) : null;
  const display = hovered ?? active;

  if (opacity <= 0) return null;

  return (
    <div className="scene6-overlay scene-interactive-layer" style={{ opacity }}>
      <header className="scene6-header" style={{ opacity: reveal }}>
        <p className="scene6-eyebrow">Selected Work</p>
        <h2 className="scene6-title">Production Reel</h2>
      </header>

      <div className="scene6-gallery" style={{ opacity: reveal }}>
        <ReelCircularGallery progress={progress} />
      </div>

      <div className="scene6-strip-ui" style={{ opacity: reveal }}>
        {PORTFOLIO.map((item, i) => {
          const isActive = i === activeIndex;
          return (
            <MagneticButton
              key={item.id}
              type="button"
              strength={0}
              className={`scene6-frame-btn${isActive ? " scene6-frame-btn--active" : ""}${hoveredId === item.id ? " scene6-frame-btn--hover" : ""}${i < activeIndex ? " scene6-frame-btn--done" : ""}`}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              aria-label={`View ${item.title}`}
              aria-current={isActive ? "true" : undefined}
            >
              <img
                src={item.image}
                alt={item.title}
                className="scene6-frame-btn__thumb"
                loading="eager"
                decoding="async"
              />
            </MagneticButton>
          );
        })}
      </div>

      <aside
        className="scene6-detail"
        key={display.id}
        style={{
          opacity: reveal,
        }}
      >
        <p className="scene6-detail__label">{display.category}</p>
        <h3 className="scene6-detail__title">{display.title}</h3>
        <dl className="scene6-detail__stats">
          <div>
            <dt>Shots</dt>
            <dd>{display.shots.toLocaleString()}</dd>
          </div>
          <div>
            <dt>Frames</dt>
            <dd>{display.frames}</dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{display.category}</dd>
          </div>
        </dl>
        {!hovered && (
          <p className="scene6-detail__hint">Scroll to browse each title</p>
        )}
      </aside>

      <div className="scene6-counter" style={{ opacity: reveal * 0.6 }}>
        {String(activeIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
      </div>
    </div>
  );
}
