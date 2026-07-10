export const WHY_ROTOMAKER = {
  eyebrow: "Why Rotomaker?",
  title: "VFX Outsourcing, Done Right.",
  subtitle: "Quality VFX outsourcing built for studios that need speed and savings.",
  paragraphs: [
    {
      id: "purpose",
      lead: "One purpose",
      text: "Rotomaker exists for VFX outsourcing — skilled artists, modern tools, and tight management so studios get premium results at a lower cost.",
    },
    {
      id: "collaboration",
      lead: "Collaboration",
      text: "We work inside your pipeline and revise as often as needed. Corrections are part of the craft — we stay focused on the frame, not the ego.",
    },
    {
      id: "partner",
      lead: "Your partner",
      text: "Need an estimate or a bid? Call us and we’ll walk through scope, schedule, and delivery.",
    },
  ],
  cta: "Call us for estimates or bid now",
};

export const ABOUT_ROTOMAKER = {
  eyebrow: "About Rotomaker",
  title: "About Rotomaker",
  sections: [
    {
      id: "mission",
      title: "Mission & Quality",
      paragraphs: [
        "Rotomaker delivers high-end VFX post at competitive rates — trained artists, proven tools, and round-the-clock capacity without cutting corners on quality.",
      ],
    },
    {
      id: "collaboration",
      title: "Collaboration First",
      paragraphs: [
        "Feature films, commercials, and stereo work succeed when teams stay aligned. We adapt to your production style and revise until the shot is right.",
      ],
    },
    {
      id: "pipeline",
      title: "Global Pipeline",
      paragraphs: [
        "From rotoscoping and paint to keying, cleanup, matchmove, and 3D conversion — one coordinated pipeline keeps schedules and budgets on track, wherever you are.",
      ],
    },
    {
      id: "excellence",
      title: "A Decade of Trust",
      paragraphs: [
        "For more than a decade, studios have trusted Rotomaker as a reliable VFX outsourcing partner. Ready to bid? Call us for estimates.",
      ],
    },
  ],
};

export const ABOUT_SERVICES = {
  eyebrow: "Our Services",
  title: "Full-Service VFX",
  items: [
    "Stereo / VFX Rotoscoping",
    "Keying",
    "Digital Film Restoration",
    "Colorization",
    "Cleanup",
    "Tracking and Matchmove",
    "Stereo / VFX Paint",
    "Rig Removal",
    "Commercial 2D to 3D Conversion",
  ],
};

export const ABOUT_SCROLL_PANELS = [
  ...ABOUT_ROTOMAKER.sections.map((section) => ({
    type: "about",
    key: section.id,
    section,
  })),
  { type: "services", key: "services" },
];
