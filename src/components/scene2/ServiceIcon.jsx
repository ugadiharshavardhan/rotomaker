"use client";

export function ServiceIcon({ type, accent = false }) {
  const stroke = accent ? "#1a4d35" : "rgba(255,255,255,0.85)";

  switch (type) {
    case "spline":
      return (
        <svg viewBox="0 0 48 48" className="service-card__icon" aria-hidden="true">
          <path d="M6 32 C 14 8, 34 8, 42 32" fill="none" stroke={stroke} strokeWidth="1.5" />
          <circle cx="6" cy="32" r="2" fill={stroke} />
          <circle cx="24" cy="16" r="2" fill={stroke} />
          <circle cx="42" cy="32" r="2" fill={stroke} />
        </svg>
      );
    case "bars":
      return (
        <svg viewBox="0 0 48 48" className="service-card__icon" aria-hidden="true">
          {[8, 16, 24, 32, 40].map((x, i) => (
            <rect
              key={x}
              x={x - 1}
              y={38 - (i + 1) * 5}
              width="2"
              height={(i + 1) * 5}
              fill={stroke}
              opacity={0.5 + i * 0.1}
            />
          ))}
        </svg>
      );
    case "remove":
      return (
        <svg viewBox="0 0 48 48" className="service-card__icon" aria-hidden="true">
          <circle cx="24" cy="24" r="14" fill="none" stroke={stroke} strokeWidth="1.5" />
          <path d="M16 16 L32 32 M32 16 L16 32" stroke={stroke} strokeWidth="1.5" />
        </svg>
      );
    case "wire":
      return (
        <svg viewBox="0 0 48 48" className="service-card__icon" aria-hidden="true">
          {[10, 18, 26, 34].map((x) => (
            <circle key={x} cx={x} cy="24" r="3" fill="none" stroke={stroke} strokeWidth="1.5" />
          ))}
          <path d="M13 24 H35" stroke={stroke} strokeWidth="1" opacity="0.6" />
        </svg>
      );
    case "track":
      return (
        <svg viewBox="0 0 48 48" className="service-card__icon" aria-hidden="true">
          <circle cx="16" cy="24" r="8" fill="none" stroke={stroke} strokeWidth="1.5" />
          <circle cx="32" cy="24" r="8" fill="none" stroke={stroke} strokeWidth="1.5" />
          <circle cx="16" cy="24" r="2" fill={stroke} />
          <circle cx="32" cy="24" r="2" fill={stroke} />
        </svg>
      );
    case "key":
      return (
        <svg viewBox="0 0 48 48" className="service-card__icon" aria-hidden="true">
          <rect x="10" y="12" width="28" height="24" rx="2" fill="none" stroke={stroke} strokeWidth="1.5" />
          <path d="M24 12 V36" stroke={stroke} strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="18" cy="24" r="2" fill={stroke} />
          <circle cx="30" cy="24" r="2" fill={stroke} />
        </svg>
      );
    case "layers":
      return (
        <svg viewBox="0 0 48 48" className="service-card__icon" aria-hidden="true">
          <rect x="8" y="20" width="24" height="16" fill="none" stroke={stroke} strokeWidth="1.5" />
          <rect x="16" y="12" width="24" height="16" fill="none" stroke={stroke} strokeWidth="1.5" opacity="0.7" />
        </svg>
      );
    case "depth":
      return (
        <svg viewBox="0 0 48 48" className="service-card__icon" aria-hidden="true">
          <rect x="8" y="14" width="12" height="20" fill="none" stroke={stroke} strokeWidth="1.5" />
          <rect x="24" y="10" width="16" height="24" fill="none" stroke={stroke} strokeWidth="1.5" />
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="26"
              y1={14 + i * 4}
              x2="38"
              y2={14 + i * 4}
              stroke={stroke}
              strokeWidth="1"
              opacity="0.5"
            />
          ))}
        </svg>
      );
    default:
      return null;
  }
}
