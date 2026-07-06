"use client";

import { WHY_ROTOMAKER } from "@/lib/aboutData";
import { getAboutPanelIndex } from "@/lib/statsScroll";

function PanelProgress({ total, active }) {
  return (
    <div className="story-flow__progress" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`scene4-dot${i === active ? " scene4-dot--active" : ""}${i < active ? " scene4-dot--done" : ""}`}
        />
      ))}
    </div>
  );
}

export function WhySection({ progress, opacity = 1 }) {
  const panels = WHY_ROTOMAKER.paragraphs;
  const { index, opacity: panelOpacity, transform } = getAboutPanelIndex(progress, panels.length);
  const block = panels[index];

  if (opacity <= 0.01) return null;

  return (
    <section className="story-flow why-flow">
      <div className="story-flow__content" style={{ opacity }}>
      <div className="story-flow__chrome">
        <span className="services-flow__mark story-flow__mark" aria-hidden="true" />
        <p className="scene9-eyebrow story-flow__eyebrow">{WHY_ROTOMAKER.eyebrow}</p>
        <div className="scene4-index story-flow__index">
          {String(index + 1).padStart(2, "0")} / {String(panels.length).padStart(2, "0")}
        </div>
      </div>

      <div className="story-flow__stage">
        <div
          className="story-flow__panel"
          style={{
            opacity: panelOpacity,
            transform,
          }}
        >
          {index === 0 ? (
            <>
              <h2 className="story-flow__title story-flow__title--hero">{WHY_ROTOMAKER.title}</h2>
              <p className="story-flow__desc">{WHY_ROTOMAKER.subtitle}</p>
            </>
          ) : (
            <h2 className="story-flow__title">{block.lead}</h2>
          )}
          <p className="story-flow__desc">{block.text}</p>
          {index === panels.length - 1 && (
            <p className="story-flow__cta">{WHY_ROTOMAKER.cta}</p>
          )}
        </div>
      </div>

      <PanelProgress total={panels.length} active={index} />
      </div>
    </section>
  );
}
