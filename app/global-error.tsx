"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import { uiConfig } from "@/config/game";
import { messages } from "@/content/messages";

/**
 * Replaces the root layout when it fails, so it can't rely on globals.css
 * or next/font: styles are inline.
 */
export default function GlobalError({ error }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
    const t = setTimeout(() => window.location.replace("/"), uiConfig.errorReloadMs);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          background: "#0A0A0B",
          color: "#F4F1EA",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <title>{messages.errorScreen.title}</title>
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(32px, 8vw, 84px)",
            fontWeight: 900,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#E8C875",
          }}
        >
          {messages.errorScreen.title}
        </h1>
        <p style={{ margin: 0, fontSize: "clamp(16px, 3vw, 32px)", color: "#A8ABB2" }}>{messages.errorScreen.body}</p>
      </body>
    </html>
  );
}
