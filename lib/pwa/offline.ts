import { CARS, PLACEHOLDER_IMAGE } from "@/config/cars";
import { APP_VERSION } from "@/config/game";

/** Same-origin files the page loaded that the service worker should keep (JS, CSS, fonts, images). */
export function loadedAppFiles(): string[] {
  if (typeof performance === "undefined") return [];
  const urls = performance
    .getEntriesByType("resource")
    .map((e) => e.name)
    .filter((u) => {
      try {
        const url = new URL(u);
        return url.origin === location.origin && /^\/(_next\/static|cars|brand|icons)\//.test(url.pathname);
      } catch {
        return false;
      }
    });
  return [...new Set(urls)];
}

/**
 * Offline-ready: "/", every car image and every static file this page
 * loaded are in the service worker cache.
 */
export async function checkOfflineReady(): Promise<boolean> {
  if (typeof window === "undefined" || !("caches" in window)) return false;
  const staticFiles = loadedAppFiles().filter((u) => new URL(u).pathname.startsWith("/_next/static/"));
  const required = ["/", PLACEHOLDER_IMAGE, ...CARS.map((c) => c.image), ...staticFiles];
  try {
    const hits = await Promise.all(required.map((u) => caches.match(u)));
    return hits.every(Boolean);
  } catch {
    return false;
  }
}

/** Registers /sw.js?v=<version> and hands it the files already loaded. */
export async function registerServiceWorker(): Promise<void> {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.register(`/sw.js?v=${encodeURIComponent(APP_VERSION)}`, {
    scope: "/",
    updateViaCache: "none",
  });
  const send = () => {
    const target = navigator.serviceWorker.controller ?? registration.active;
    target?.postMessage({ type: "CACHE_URLS", urls: loadedAppFiles() });
  };
  await navigator.serviceWorker.ready;
  send();
  // First install: send again once the new worker controls the page.
  navigator.serviceWorker.addEventListener("controllerchange", send, { once: true });
}
