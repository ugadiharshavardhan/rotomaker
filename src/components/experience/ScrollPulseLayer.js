"use client";

export function ScrollPulseLayer({ microBeat, suppressed = false }) {
  if (suppressed) return null;

  const { effect, beatProgress, index } = microBeat;

  return (
    <>
      <div
        className={`scroll-pulse scroll-pulse--${effect}`}
        style={{ "--beat": beatProgress, "--idx": index }}
        aria-hidden="true"
      />
      <div
        className="scroll-noise"
        style={{
          opacity: 0.02 + (effect === "noise" ? beatProgress * 0.04 : 0.015),
        }}
        aria-hidden="true"
      />
      <div
        className={`scroll-glass${effect === "glass" ? " scroll-glass--active" : ""}`}
        style={{ opacity: effect === "glass" ? beatProgress * 0.08 : 0 }}
        aria-hidden="true"
      />
    </>
  );
}
