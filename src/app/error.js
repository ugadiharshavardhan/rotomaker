"use client";

import { useEffect } from "react";

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error("[experience]", error);
  }, [error]);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#030303",
        color: "#fff",
        padding: "2rem",
        textAlign: "center",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <div>
        <p
          style={{
            letterSpacing: "0.28em",
            fontSize: "0.7rem",
            opacity: 0.5,
            marginBottom: "0.75rem",
          }}
        >
          ROTOMAKER
        </p>
        <h1 style={{ fontSize: "1.75rem", margin: "0 0 0.75rem", fontWeight: 600 }}>
          This page hit a snag
        </h1>
        <p style={{ opacity: 0.65, margin: "0 0 1.5rem", maxWidth: "28rem" }}>
          Something went wrong while loading the experience. Try again — your browser may have run
          out of graphics memory.
        </p>
        <button
          type="button"
          onClick={() => reset()}
          style={{
            appearance: "none",
            border: "1px solid rgba(255,255,255,0.28)",
            background: "transparent",
            color: "#fff",
            padding: "0.7rem 1.4rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            fontSize: "0.72rem",
            cursor: "pointer",
          }}
        >
          Reload
        </button>
      </div>
    </main>
  );
}
