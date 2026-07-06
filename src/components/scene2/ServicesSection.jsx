"use client";

import { VFX_SERVICES } from "@/lib/servicesData";
import { getActiveItemIndex } from "@/lib/portfolioData";
import {
  SERVICES_INTRO_END,
  SERVICES_INTRO_WORD,
  SERVICES_WORDS_END,
} from "@/lib/servicesVisualState";
import { ServiceBeforeAfter } from "./ServiceBeforeAfter";

function wordMotion(segmentProgress) {
  const enter = Math.min(1, segmentProgress / 0.25);
  const exit = segmentProgress > 0.75 ? Math.min(1, (segmentProgress - 0.75) / 0.25) : 0;
  return {
    enter,
    exit,
    opacity: enter * (1 - exit),
    transform: `translateY(${(1 - enter) * 24 + exit * -24}px)`,
  };
}

function ServicesProgress({ total, active }) {
  return (
    <div className="scene4-progress services-flow__progress" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`scene4-dot${i === active ? " scene4-dot--active" : ""}${i < active ? " scene4-dot--done" : ""}`}
        />
      ))}
    </div>
  );
}

export function ServicesSection({ progress, opacity = 1 }) {
  if (opacity <= 0.01 || progress < 0.02) return null;

  if (progress < SERVICES_INTRO_END) {
    const seg = progress / SERVICES_INTRO_END;
    const motion = wordMotion(Math.min(1, seg * 1.2));

    return (
      <div className="services-flow services-flow--intro" style={{ opacity }}>
        <span className="services-flow__mark" aria-hidden="true" />
        <div className="services-flow__center">
          <div
            className="scene4-text scene4-text--intro"
            style={{
              opacity: motion.opacity,
              transform: motion.transform,
            }}
          >
            {SERVICES_INTRO_WORD.text}
          </div>
        </div>
      </div>
    );
  }

  const local = (progress - SERVICES_WORDS_END) / (1 - SERVICES_WORDS_END);
  if (local < 0.02) return null;

  const { index: activeIndex, segmentProgress } = getActiveItemIndex(local, VFX_SERVICES.length);
  const service = VFX_SERVICES[activeIndex];
  const motion = wordMotion(segmentProgress);

  return (
    <div className="services-flow services-flow--cards" style={{ opacity }}>
      <span className="services-flow__mark" aria-hidden="true" />
      <div className="scene4-index services-flow__index">
        {service.index} / {String(VFX_SERVICES.length).padStart(2, "0")}
      </div>

      <div
        className="services-flow__stack"
        style={{
          opacity: motion.opacity,
          transform: motion.transform,
        }}
      >
        <ServiceBeforeAfter
          key={service.id}
          serviceKey={service.id}
          visual={service.visual}
          before={service.before}
          after={service.after}
          title={service.title}
        />

        <div className="services-flow__meta">
          <span className="services-flow__eyebrow">{service.label}</span>
          <h3 className="services-flow__card-title">{service.title}</h3>
          <p className="services-flow__desc">{service.description}</p>
        </div>
      </div>

      <ServicesProgress total={VFX_SERVICES.length} active={activeIndex} />
    </div>
  );
}
