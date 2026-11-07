import type { MetadataRoute } from "next";
import { gameConfig } from "@/config/game";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: gameConfig.gameTitle,
    short_name: "BYD Puzzle",
    description: "Swap the tiles. Rebuild the car. Beat the clock!",
    start_url: "/",
    scope: "/",
    display: "fullscreen",
    orientation: "portrait",
    background_color: "#0A0A0B",
    theme_color: "#0A0A0B",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
