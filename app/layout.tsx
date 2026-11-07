import type { Metadata, Viewport } from "next";
import { Orbitron, Sora } from "next/font/google";
import { KioskGuards } from "@/components/system/KioskGuards";
import { ServiceWorkerRegister } from "@/components/system/ServiceWorkerRegister";
import { gameConfig } from "@/config/game";
import "./globals.css";

// Self-hosted at build time by next/font, so they work offline.
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  display: "swap",
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: gameConfig.gameTitle,
  description: "Swap the tiles. Rebuild the car. Beat the clock!",
  applicationName: gameConfig.gameTitle,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0B",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${orbitron.variable} ${sora.variable}`}>
      <body>
        <KioskGuards />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
