export const WHY_ROTOMAKER = {
  eyebrow: "Why Rotomaker?",
  title: "VFX Outsourcing, Done Right.",
  subtitle: "The synonym of VFX outsourcing — built for studios that demand quality and savings.",
  paragraphs: [
    {
      id: "purpose",
      lead: "One purpose",
      text: "Rotomaker LLC has been established for one purpose — VFX outsourcing. Using a robust backend of talented artists and leading technologies paired with superb management, Rotomaker's clients enjoy unprecedented savings on their VFX outsourcing needs.",
    },
    {
      id: "collaboration",
      lead: "Collaboration",
      text: "At Rotomaker, we understand that collaboration plays a major role in achieving high quality feature films, commercials, conversions and full-fledged rotoscoping production. Our creative professionals are highly trained to cope with multiple production paradigms — we don't take any of your corrections personal; we cut as often as you like as long as it yields the perfection on your materials that you crave for.",
    },
    {
      id: "partner",
      lead: "Your partner",
      text: "Rotomaker — the synonym of VFX outsourcing. Call us for estimates or bid now and get more details.",
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
        "Rotomaker LLC is devoted to offer the remarkable VFX post-production services possible for the best price available in the market. Using a robust backend of highly trained artists and leading technologies paired with round-the-clock infrastructure, our clients enjoy uncompromised quality and significant savings on their VFX outsourcing needs.",
      ],
    },
    {
      id: "collaboration",
      title: "Collaboration First",
      paragraphs: [
        "We understand that the collaboration of creative professionals plays a major role in achieving the desired outcome of any feature films, commercials, conversions, and full-fledged rotoscoping production. Our artists are well trained to cope with multiple production paradigms — we don't take any of your corrections personal; we cut as often as you like as long as it yields the perfection on your materials that you crave for.",
        "What if you could save large savings on your next movie production — would you take it? Join the countless multimedia companies who have experienced the highly efficient world of visual effects outsourcing.",
      ],
    },
    {
      id: "pipeline",
      title: "Global Pipeline",
      paragraphs: [
        "Our clients enjoy a fully efficient production pipeline ensuring effortless product development thanks to our technical experts who constantly strive for tighter relationships amongst clients in order to meet stricter goals. Be it an expensive in-house production or extensive work, we solve all your post-production concerns — VFX & stereo rotoscoping, paint, keying, wire removal, clean up, matchmove, and 3D conversion — wherever you are on the planet.",
        "Roto making is not expertise alone — it is closed coordination between talents and round-the-clock production facilities that always fall within production schedules and budgets.",
      ],
    },
    {
      id: "excellence",
      title: "A Decade of Trust",
      paragraphs: [
        "As one of the largest outsourcing service providers, Rotomaker's roots enabled the company to capture the best artists and arm them with the latest tools and technology to produce high-quality feature films, commercials, and TV shows.",
        "Our excellence rests on a strong backbone of compositors, VFX artists, and VFX supervisors in sync with dynamic management, fluid production workflow, and cutting-edge technology — providing full-fledged innovative solutions for visual effects companies worldwide.",
        "Rotomaker stands as a reliable VFX outsourcing partner in the industry for more than a decade. Have a bid to discuss? Call us for estimates and more details.",
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
