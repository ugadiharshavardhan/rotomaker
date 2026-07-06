"use client";

import { useState } from "react";
import { HOLOGRAM_SERVICES } from "@/lib/experienceData";
import { TiltCard } from "@/components/interactions/TiltCard";

function HologramDemo({ serviceId, active }) {
  switch (serviceId) {
    case "roto":
      return (
        <svg className="holo-demo" viewBox="0 0 200 200">
          <path
            className={`holo-demo__path${active ? " holo-demo__path--draw" : ""}`}
            d="M 40,120 C 60,60 100,50 140,80 S 170,140 160,160"
          />
          <circle className="holo-demo__point" cx="40" cy="120" r="4" />
          <circle className="holo-demo__point" cx="100" cy="55" r="4" />
          <circle className="holo-demo__point" cx="160" cy="160" r="4" />
        </svg>
      );
    case "paint":
      return (
        <div className={`holo-demo holo-demo--paint${active ? " holo-demo--paint-active" : ""}`}>
          {[...Array(12)].map((_, i) => (
            <span key={i} className="holo-demo__dust" style={{ left: `${10 + i * 7}%`, top: `${20 + (i % 4) * 15}%` }} />
          ))}
        </div>
      );
    case "wire":
      return (
        <svg className="holo-demo" viewBox="0 0 200 200">
          <line
            className={`holo-demo__wire${active ? " holo-demo__wire--hide" : ""}`}
            x1="30" y1="40" x2="170" y2="160"
          />
          <line
            className={`holo-demo__wire holo-demo__wire--thin${active ? " holo-demo__wire--hide" : ""}`}
            x1="50" y1="170" x2="150" y2="30"
          />
        </svg>
      );
    case "matchmove":
      return (
        <svg className="holo-demo" viewBox="0 0 200 200">
          <rect className="holo-demo__box" x="60" y="60" width="80" height="80" />
          {[
            [60, 60], [140, 60], [140, 140], [60, 140],
          ].map(([x, y], i) => (
            <g key={i} className={active ? "holo-demo__tracker--attach" : ""}>
              <line x1={x} y1={y} x2={x + (x < 100 ? -15 : 15)} y2={y + (y < 100 ? -15 : 15)} className="holo-demo__track-line" />
              <rect x={x + (x < 100 ? -20 : 10)} y={y + (y < 100 ? -20 : 10)} width="10" height="10" className="holo-demo__tracker" />
            </g>
          ))}
        </svg>
      );
    case "cleanup":
      return (
        <div className={`holo-demo holo-demo--cleanup${active ? " holo-demo--cleanup-active" : ""}`}>
          <span className="holo-demo__object" />
          <span className="holo-demo__object holo-demo__object--2" />
        </div>
      );
    case "stereo":
      return (
        <div className={`holo-demo holo-demo--stereo${active ? " holo-demo--stereo-active" : ""}`}>
          <span className="holo-demo__layer holo-demo__layer--left" />
          <span className="holo-demo__layer holo-demo__layer--right" />
        </div>
      );
    default:
      return null;
  }
}

export function Scene7Overlay({ progress, opacity = 1 }) {
  const [activeId, setActiveId] = useState(null);
  const reveal = Math.min(1, progress / 0.25);

  if (opacity <= 0) return null;

  return (
    <div className="scene7-overlay scene-interactive-layer" style={{ opacity }}>
      <header className="scene7-header" style={{ opacity: reveal }}>
        <p className="scene7-eyebrow">Capabilities</p>
        <h2 className="scene7-title">Interactive Services</h2>
        <p className="scene7-sub">Hover to activate hologram</p>
      </header>

      <div className="scene7-grid" style={{ opacity: reveal }}>
        {HOLOGRAM_SERVICES.map((service) => {
          const isActive = activeId === service.id;
          return (
            <TiltCard
              key={service.id}
              as="article"
              className={`scene7-holo${isActive ? " scene7-holo--active" : ""}`}
              maxTilt={6}
              onMouseEnter={() => setActiveId(service.id)}
              onMouseLeave={() => setActiveId(null)}
            >
              <div className="scene7-holo__ring" />
              <div className="scene7-holo__core">
                <HologramDemo serviceId={service.id} active={isActive} />
              </div>
              <div className="scene7-holo__info">
                <h3>{service.title}</h3>
                <p className={isActive ? "scene7-holo__desc--visible" : ""}>
                  {service.description}
                </p>
              </div>
              <div className="scene7-holo__scanlines" />
            </TiltCard>
          );
        })}
      </div>
    </div>
  );
}
