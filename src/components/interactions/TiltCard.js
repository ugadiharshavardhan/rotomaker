"use client";

import { useTilt } from "@/hooks/useTilt";

export function TiltCard({
  children,
  className = "",
  maxTilt = 10,
  as: Tag = "div",
  ...props
}) {
  const ref = useTilt(maxTilt);

  return (
    <Tag
      ref={ref}
      className={`tilt-card float-card ${className}`.trim()}
      data-scan
      {...props}
    >
      {children}
    </Tag>
  );
}
