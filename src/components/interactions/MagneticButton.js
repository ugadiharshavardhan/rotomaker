"use client";

import { useMagnetic } from "@/hooks/useMagnetic";

export function MagneticButton({
  children,
  className = "",
  strength = 0.35,
  as: Tag = "button",
  ...props
}) {
  const ref = useMagnetic(strength);

  return (
    <Tag
      ref={ref}
      className={`magnetic-btn ${className}`.trim()}
      data-scan
      {...props}
    >
      {children}
    </Tag>
  );
}
