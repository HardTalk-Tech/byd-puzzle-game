"use client";

import { useId } from "react";

/** A unique, url()-safe id for an SVG gradient. */
export function useGradientId(prefix: string): string {
  return `${prefix}-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export const GOLD_STOPS = [
  { offset: "0", color: "#9C7A2E" },
  { offset: "0.3", color: "#C9A24A" },
  { offset: "0.5", color: "#F3DC9A" },
  { offset: "0.7", color: "#C9A24A" },
  { offset: "1", color: "#9C7A2E" },
];
