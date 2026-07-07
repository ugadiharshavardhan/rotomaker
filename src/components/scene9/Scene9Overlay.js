"use client";

import { STATS } from "@/lib/experienceData";

function formatValue(stat, segmentProgress) {
  if (stat.display) return stat.display;
  const eased = Math.min(1, segmentProgress);
  const current = Math.floor(stat.value * eased);

  if (stat.format === "comma") {
    return current.toLocaleString("en-US");
  }

  return `${current}${stat.suffix ?? ""}`;
}

export function Scene9Overlay({ scene9, opacity = 1 }) {
  const { index, segmentProgress, overall, isHolding } = scene9;
  const stat = STATS[index];
  const reveal = Math.min(1, overall / 0.12);
  const numberReveal = isHolding || segmentProgress >= 0.98 ? 1 : Math.min(1, segmentProgress / 0.85);
  const displayValue = formatValue(stat, isHolding ? 1 : segmentProgress);

  if (opacity <= 0) return null;

  return (
    <div className="scene9-overlay" style={{ opacity }}>
      <header className="scene9-header" style={{ opacity: reveal }}>
        <p className="scene9-eyebrow">Successful Milestones</p>
      </header>

      <div
        key={stat.id}
        className={`scene9-stat${isHolding ? " scene9-stat--hold" : ""}`}
        style={{
          opacity: numberReveal,
          transform: isHolding ? "scale(1)" : `scale(${0.92 + numberReveal * 0.08})`,
        }}
      >
        <span className="scene9-stat__value">{displayValue}</span>
        <span className="scene9-stat__label">{stat.label}</span>
      </div>

      <div className="scene9-dots" style={{ opacity: reveal }}>
        {STATS.map((s, i) => (
          <span
            key={s.id}
            className={`scene9-dot${i === index ? " scene9-dot--active" : ""}${i < index ? " scene9-dot--done" : ""}`}
          />
        ))}
      </div>
    </div>
  );
}
