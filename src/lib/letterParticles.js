/**
 * Sample pixel positions from canvas-rendered text to drive particle morph targets.
 */
export function sampleLetterTargets({
  lines = ["ROTO", "MAKER"],
  width = 1200,
  height = 600,
  fontSize = 180,
  fontFamily = "Bebas Neue, Impact, sans-serif",
  particleCount = 6000,
  lineGap = 40,
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
  ctx.font = `700 ${fontSize}px ${fontFamily}`;

  const totalHeight = lines.length * fontSize + (lines.length - 1) * lineGap;
  const startY = height / 2 - totalHeight / 2 + fontSize / 2;

  lines.forEach((line, index) => {
    const y = startY + index * (fontSize + lineGap);
    ctx.fillText(line, width / 2, y);
  });

  const { data } = ctx.getImageData(0, 0, width, height);
  const candidates = [];

  for (let y = 0; y < height; y += 2) {
    for (let x = 0; x < width; x += 2) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 128) {
        candidates.push({
          x: (x / width - 0.5) * 14,
          y: -(y / height - 0.5) * 7,
          z: (Math.random() - 0.5) * 0.4,
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

export function generateExplosionOrigins(count, radius = 0.8) {
  const origins = [];
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = radius * Math.cbrt(Math.random());
    origins.push({
      x: r * Math.sin(phi) * Math.cos(theta),
      y: r * Math.sin(phi) * Math.sin(theta),
      z: r * Math.cos(phi),
    });
  }
  return origins;
}
