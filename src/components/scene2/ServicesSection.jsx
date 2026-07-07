"use client";

import { VFX_SERVICES } from "@/lib/servicesData";
import {
  SERVICES_INTRO_END,
  SERVICES_INTRO_WORD,
} from "@/lib/servicesVisualState";
import { ServicesScrollStack } from "./ServicesScrollStack";

function introMotion(segmentProgress) {
  const enter = Math.min(1, segmentProgress / 0.2);
  const exit =
    segmentProgress > 0.86 ? Math.min(1, (segmentProgress - 0.86) / 0.14) : 0;
  return {
    opacity: enter * (1 - exit),
    transform: `translateY(${(1 - enter) * 24 + exit * -24}px)`,
  };
}

function ServicesSideTitle() {
  return (
    <aside className="services-flow__side-title" aria-label="Services">
      {"services".split("").map((letter, i) => (
        <span key={`${letter}-${i}`} className="services-flow__side-letter">
          {letter}
        </span>
      ))}
    </aside>
  );
}

export function ServicesSection({ progress, opacity = 1 }) {
  if (opacity <= 0.01 || progress < 0.02) return null;

  if (progress < SERVICES_INTRO_END) {
    const seg = progress / SERVICES_INTRO_END;
    const motion = introMotion(Math.min(1, seg));

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

  const local = (progress - SERVICES_INTRO_END) / (1 - SERVICES_INTRO_END);
  if (local <= 0) return null;

  const activeIndex = Math.min(
    VFX_SERVICES.length - 1,
    Math.floor(local * VFX_SERVICES.length)
  );

  return (
    <div className="services-flow services-flow--cards" style={{ opacity }}>
      <ServicesSideTitle />
      <div className="scene4-index services-flow__index">
        {String(activeIndex + 1).padStart(2, "0")} / {String(VFX_SERVICES.length).padStart(2, "0")}
      </div>

      <div className="services-flow__stack-stage">
        <ServicesScrollStack services={VFX_SERVICES} progress={local} />
      </div>
    </div>
  );
}
