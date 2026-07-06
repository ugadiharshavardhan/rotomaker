"use client";

const HERO_END = 0.05;
const EXIT_END = 0.16;

export function HangingSpiderMan({ progress }) {
  if (progress >= EXIT_END) return null;

  let opacity = 1;
  let exitY = 0;
  let exitScale = 1;

  if (progress > HERO_END) {
    const t = (progress - HERO_END) / (EXIT_END - HERO_END);
    opacity = Math.max(0, 1 - t * 1.2);
    exitY = -t * 72;
    exitScale = 1 - t * 0.12;
  }

  if (opacity <= 0.01) return null;

  return (
    <div
      className="hanging-spider hanging-spider--hero"
      style={{
        opacity,
        transform: `translateY(${exitY}px) scale(${exitScale})`,
      }}
      aria-hidden="true"
    >
      <div className="hanging-spider__float">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/spider-man-hanging.png"
          alt=""
          className="hanging-spider__image"
          draggable={false}
        />
      </div>
    </div>
  );
}
