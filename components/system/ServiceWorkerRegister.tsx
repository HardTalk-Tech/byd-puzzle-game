"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa/offline";

/** Registers the service worker in production only (not from /staff). */
export function ServiceWorkerRegister() {
  const pathname = usePathname();
  const isStaff = pathname?.startsWith("/staff") ?? false;

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || isStaff) return;
    const start = () => void registerServiceWorker().catch((err) => console.warn("Service worker registration failed", err));
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => window.removeEventListener("load", start);
  }, [isStaff]);

  return null;
}
