"use client";

export function ParallaxBackground({ globalProgress, mouse }) {
  const scrollY = globalProgress * 40;
  const mouseX = (mouse.x - 0.5) * 20;
  const mouseY = (mouse.y - 0.5) * 20;

  return (
    <div className="parallax-bg" aria-hidden="true">
      <div
        className="parallax-bg__layer parallax-bg__layer--1"
        style={{
          transform: `translate(${mouseX * 0.3}px, ${scrollY * 0.2 + mouseY * 0.3}px)`,
        }}
      />
      <div
        className="parallax-bg__layer parallax-bg__layer--2"
        style={{
          transform: `translate(${mouseX * 0.6}px, ${scrollY * 0.4 + mouseY * 0.5}px)`,
        }}
      />
      <div
        className="parallax-bg__layer parallax-bg__layer--3"
        style={{
          transform: `translate(${mouseX}px, ${scrollY * 0.6 + mouseY}px)`,
        }}
      />
    </div>
  );
}
