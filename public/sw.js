/* Rebuild the BYD – hand-written service worker (section 12.2).
 *
 * Registered in production only as /sw.js?v=<APP_VERSION>. The version is
 * part of the cache name, so every deploy starts a fresh cache and the old
 * one is deleted on activate.
 *
 * Strategies (same-origin GET only; Firebase / Google APIs are never touched):
 *   /_next/static/*, /cars/*, /brand/*, /icons/*  → cache-first
 *   navigation to /                                → network-first (3 s), fallback cached /
 *   /manifest.webmanifest                          → network-first, fallback cache
 *   /staff and everything else                     → network only (not cached)
 */

const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const CACHE = `byd-puzzle-${VERSION}`;
const NAV_TIMEOUT_MS = 3000;

// Keep in sync with config/cars.ts (checked by tests/serviceWorker.test.ts).
const CAR_SLUGS = ["racco", "atto-1", "atto-2", "dolphin", "sealion-5", "sealion-6", "shark-6", "sealion-8", "atto-3"];

const PRECACHE = [
  "/",
  "/manifest.webmanifest",
  "/cars/placeholder.svg",
  ...CAR_SLUGS.map((slug) => `/cars/${slug}.webp`),
  "/brand/byd-logo.svg",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/icon-512-maskable.png",
];

const CACHE_FIRST = /^\/(_next\/static|cars|brand|icons)\//;

/** Cache one URL; a single failure must not stop the others. */
async function addToCache(cache, url) {
  try {
    const response = await fetch(new Request(url, { cache: "reload", credentials: "same-origin" }));
    if (response.ok) await cache.put(url, response);
  } catch {
    // Offline or missing: it will be cached on first use instead.
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(PRECACHE.map((url) => addToCache(cache, url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n.startsWith("byd-puzzle-") && n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

// The page sends the same-origin files it already loaded (JS, CSS, fonts,
// images) so they are available offline even though they were fetched
// before this service worker existed.
self.addEventListener("message", (event) => {
  const data = event.data;
  if (!data || data.type !== "CACHE_URLS" || !Array.isArray(data.urls)) return;
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      for (const raw of data.urls) {
        let url;
        try {
          url = new URL(raw, self.location.origin);
        } catch {
          continue;
        }
        if (url.origin !== self.location.origin || !CACHE_FIRST.test(url.pathname)) continue;
        if (await cache.match(url.href)) continue;
        await addToCache(cache, url.href);
      }
    })(),
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok && response.type === "basic") {
    const cache = await caches.open(CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request, cacheKey, timeoutMs) {
  const cache = await caches.open(CACHE);
  const network = fetch(request).then(async (response) => {
    if (response.ok) await cache.put(cacheKey, response.clone());
    return response;
  });
  network.catch(() => undefined); // handled below; avoids an unhandled rejection after a timeout
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), timeoutMs));
  try {
    const first = await Promise.race([network, timeout]);
    if (first) return first;
    // Slow network: use the cached copy if there is one, otherwise keep waiting.
    return (await caches.match(cacheKey)) || (await network);
  } catch {
    const cached = await caches.match(cacheKey);
    if (cached) return cached;
    throw new Error("Offline and not cached");
  }
}

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // Firebase, Google APIs: never intercepted

  if (CACHE_FIRST.test(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }
  if (request.mode === "navigate" && url.pathname === "/") {
    event.respondWith(networkFirst(request, "/", NAV_TIMEOUT_MS));
    return;
  }
  if (url.pathname === "/manifest.webmanifest") {
    event.respondWith(networkFirst(request, "/manifest.webmanifest", NAV_TIMEOUT_MS));
  }
  // Everything else (including /staff): network only.
});
