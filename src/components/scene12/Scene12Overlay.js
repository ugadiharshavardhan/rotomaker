"use client";

import { useState } from "react";

const CONTACT_EMAILS = [
  { href: "mailto:mike@rotomaker.com", value: "mike@rotomaker.com" },
  { href: "mailto:info@rotomaker.com", value: "info@rotomaker.com" },
];

const CONTACT_PHONES = [
  { href: "tel:+918811811811", value: "+91 8811811811" },
  { href: "tel:+12133086500", value: "+12133086500" },
];

const SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/company/rotomaker-studio/",
    label: "Rotomaker on LinkedIn",
    icon: "linkedin",
  },
  {
    href: "https://www.facebook.com/RotomakerVfx/",
    label: "Rotomaker on Facebook",
    icon: "facebook",
  },
];

function SocialIcon({ type }) {
  if (type === "linkedin") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="scene12-social__icon">
        <path
          fill="currentColor"
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.56V9h3.554v11.452z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="scene12-social__icon">
      <path
        fill="currentColor"
        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
      />
    </svg>
  );
}

export function Scene12Overlay({ progress, opacity = 1 }) {
  const [submitted, setSubmitted] = useState(false);

  const reveal = Math.min(1, progress / 0.2);
  const contentReveal = Math.min(1, Math.max(0, (progress - 0.08) / 0.25));

  if (opacity <= 0) return null;

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div
      className="scene12-overlay scene-interactive-layer"
      style={{
        opacity,
        background: `rgba(3, 3, 3, ${0.88 + reveal * 0.1})`,
      }}
    >
      <div
        className="scene12-tagline"
        style={{
          opacity: reveal,
          transform: `translateY(${(1 - reveal) * 24}px)`,
        }}
      >
        <p className="scene12-eyebrow">Final Frame</p>
        <h2 className="scene12-headline">Let&apos;s Build The Impossible.</h2>
      </div>

      <div
        className="scene12-body"
        style={{
          opacity: contentReveal,
          transform: `translateY(${(1 - contentReveal) * 20}px)`,
        }}
      >
        <aside className="scene12-contact">
          <div className="scene12-contact__group">
            <h3 className="scene12-contact__heading">Email</h3>
            <ul className="scene12-contact__list">
              {CONTACT_EMAILS.map((item) => (
                <li key={item.value}>
                  <a href={item.href} className="scene12-contact__link">
                    {item.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="scene12-contact__group">
            <h3 className="scene12-contact__heading">Phone</h3>
            <ul className="scene12-contact__list">
              {CONTACT_PHONES.map((item) => (
                <li key={item.value}>
                  <a href={item.href} className="scene12-contact__link">
                    {item.value}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <nav className="scene12-social" aria-label="Social media">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="scene12-social__link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={item.label}
              >
                <SocialIcon type={item.icon} />
              </a>
            ))}
          </nav>
        </aside>

        <div className="scene12-form-wrap">
          {submitted ? (
            <p className="scene12-success">Message received. We&apos;ll be in touch.</p>
          ) : (
            <form className="scene12-form" onSubmit={handleSubmit}>
              <div className="scene12-form__row">
                <label className="scene12-field">
                  <span>Name</span>
                  <input type="text" name="name" required placeholder="Your name" />
                </label>
                <label className="scene12-field">
                  <span>Email</span>
                  <input type="email" name="email" required placeholder="you@studio.com" />
                </label>
              </div>
              <label className="scene12-field">
                <span>Company</span>
                <input type="text" name="company" placeholder="Production / Studio" />
              </label>
              <label className="scene12-field">
                <span>Project Details</span>
                <textarea
                  name="message"
                  rows={4}
                  required
                  placeholder="Tell us about your shot, timeline, and scope..."
                />
              </label>
              <button type="submit" className="scene12-submit">
                Start a Project
              </button>
            </form>
          )}
        </div>
      </div>

      <footer className="scene12-footer" style={{ opacity: contentReveal * 0.75 }}>
        <span>© Rotomaker VFX</span>
        <span>Behind Every Impossible Shot</span>
      </footer>
    </div>
  );
}
