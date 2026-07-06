/**
 * Sample pixel positions from canvas-rendered text for particle morph targets.
 */
export function sampleTextTargets({
  text = "1000",
  width = 600,
  height = 300,
  fontSize = 160,
  fontFamily = "Bebas Neue, Impact, sans-serif",
  particleCount = 2500,
} = {}) {
  if (typeof document === "undefined") return [];

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `400 ${fontSize}px ${fontFamily}`;
  ctx.fillText(text, width / 2, height / 2);

  const { data } = ctx.getImageData(0, 0, width, height);
  const candidates = [];

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 128) {
        candidates.push({
          x: (x / width - 0.5) * 8,
          y: -(y / height - 0.5) * 4,
          z: (Math.random() - 0.5) * 0.3,
        });
      }
    }
  }

  if (candidates.length === 0) return [];

  const targets = [];
  for (let i = 0; i < particleCount; i++) {
    targets.push(candidates[Math.floor(Math.random() * candidates.length)]);
  }
  return targets;
}
