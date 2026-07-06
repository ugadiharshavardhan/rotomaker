"use client";

import {
  ABOUT_ROTOMAKER,
  ABOUT_SCROLL_PANELS,
  ABOUT_SERVICES,
} from "@/lib/aboutData";
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

function AboutPanel({ section }) {
  return (
    <>
      <h2 className="story-flow__title">{section.title}</h2>
      <div className="story-flow__body">
        {section.paragraphs.map((text) => (
          <p key={text.slice(0, 32)} className="story-flow__desc">
            {text}
          </p>
        ))}
      </div>
    </>
  );
}

function ServicesPanel() {
  return (
    <>
      <h2 className="story-flow__title">{ABOUT_SERVICES.title}</h2>
      <ul className="story-flow__services">
        {ABOUT_SERVICES.items.map((item) => (
          <li key={item} className="story-flow__service">
            <span className="story-flow__service-dot" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}

export function AboutSection({ progress, opacity = 1 }) {
  if (opacity <= 0.01) return null;

  const { index, opacity: panelOpacity, transform } = getAboutPanelIndex(
    progress,
    ABOUT_SCROLL_PANELS.length
  );
  const panel = ABOUT_SCROLL_PANELS[index];

  return (
    <section className="story-flow about-flow">
      <div className="story-flow__content" style={{ opacity }}>
      <div className="story-flow__chrome">
        <span className="services-flow__mark story-flow__mark" aria-hidden="true" />
        <p className="scene9-eyebrow story-flow__eyebrow">{ABOUT_ROTOMAKER.eyebrow}</p>
        <div className="scene4-index story-flow__index">
          {String(index + 1).padStart(2, "0")} / {String(ABOUT_SCROLL_PANELS.length).padStart(2, "0")}
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
          {panel.type === "about" && <AboutPanel section={panel.section} />}
          {panel.type === "services" && <ServicesPanel />}
        </div>
      </div>

      <PanelProgress total={ABOUT_SCROLL_PANELS.length} active={index} />
      </div>
    </section>
  );
}
