const SERVICE_IMAGE_BASE = "/services";

export const SERVICE_IMAGES = {
  rotoscoping: {
    before: `${SERVICE_IMAGE_BASE}/vfxrotoscoping-before.jpg`,
    after: `${SERVICE_IMAGE_BASE}/vfxrotoscoping-after.jpg`,
  },
  keying: {
    before: `${SERVICE_IMAGE_BASE}/keying-before.jpg`,
    after: `${SERVICE_IMAGE_BASE}/owel-After.jpg`,
  },
  matchmove: {
    before: `${SERVICE_IMAGE_BASE}/matchmovie-before.jpg`,
    after: `${SERVICE_IMAGE_BASE}/matchmovie-after.jpg`,
  },
  paint: {
    before: `${SERVICE_IMAGE_BASE}/vfxpaint-before.jpg`,
    after: `${SERVICE_IMAGE_BASE}/vfxpaint-after.jpg`,
  },
  "rig-removal": {
    before: `${SERVICE_IMAGE_BASE}/rigremoval-before.jpg`,
    after: `${SERVICE_IMAGE_BASE}/rigremoval-after.jpg`,
  },
  "conversion-2d3d": {
    before: `${SERVICE_IMAGE_BASE}/2dconversion-before.png`,
    after: `${SERVICE_IMAGE_BASE}/3dconversion-after.png`,
  },
  colorization: {
    before: `${SERVICE_IMAGE_BASE}/colorization-before.png`,
    after: `${SERVICE_IMAGE_BASE}/colorization-after.png`,
  },
  cleanup: {
    before: `${SERVICE_IMAGE_BASE}/cleanup-before.png`,
    after: `${SERVICE_IMAGE_BASE}/cleanup-after.png`,
  },
};

export const VFX_SERVICES = [
  {
    id: "rotoscoping",
    label: "VFX",
    index: "01",
    title: "VFX ROTOSCOPING",
    description:
      "Frame-accurate mattes traced around actors, props, and hair. Every edge refined for seamless compositing.",
    visual: "rotoscoping",
    ...SERVICE_IMAGES.rotoscoping,
  },
  {
    id: "keying",
    label: "EXTRACTION",
    index: "02",
    title: "KEYING",
    description:
      "Green and blue screen pulls with clean edges — smoke, glass, and fine hair preserved perfectly.",
    visual: "keying",
    ...SERVICE_IMAGES.keying,
  },
  {
    id: "matchmove",
    label: "TRACKING",
    index: "03",
    title: "MATCHMOVE",
    description:
      "Camera and object tracking locked to plate. CG elements sit naturally in live-action space.",
    visual: "matchmove",
    ...SERVICE_IMAGES.matchmove,
  },
  {
    id: "paint",
    label: "RESTORATION",
    index: "04",
    title: "VFX PAINT",
    description:
      "Paint-out, beauty work, and frame restoration. Dust, logos, and set artifacts removed invisibly.",
    visual: "paint",
    ...SERVICE_IMAGES.paint,
  },
  {
    id: "rig-removal",
    label: "REMOVAL",
    index: "05",
    title: "RIG REMOVAL",
    description:
      "Stunt rigs, wires, and crew gear erased from shot. Action reads clean and believable on screen.",
    visual: "rig-removal",
    ...SERVICE_IMAGES["rig-removal"],
  },
  {
    id: "conversion-2d3d",
    label: "STEREO",
    index: "06",
    title: "2D TO 3D CONVERSION",
    description:
      "Flat footage given depth and dimension. Layered roto and paint build convincing stereoscopic volume.",
    visual: "conversion-2d3d",
    ...SERVICE_IMAGES["conversion-2d3d"],
  },
  {
    id: "colorization",
    label: "COLOR",
    index: "07",
    title: "COLORIZATION",
    description:
      "Archival and monochrome footage brought to life. Historically accurate palette applied frame by frame.",
    visual: "colorization",
    ...SERVICE_IMAGES.colorization,
  },
  {
    id: "cleanup",
    label: "FINISHING",
    index: "08",
    title: "CLEAN UP",
    description:
      "Final pass removing noise, banding, and artifacts. Every frame delivery-ready for the big screen.",
    visual: "cleanup",
    ...SERVICE_IMAGES.cleanup,
  },
];

export const SERVICE_IMAGE_URLS = VFX_SERVICES.flatMap((s) =>
  s.before && s.after ? [s.before, s.after] : []
);
