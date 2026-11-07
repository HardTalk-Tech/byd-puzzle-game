import type { Car } from "@/config/cars";
import { GRID } from "@/lib/puzzle/board";

const escapeXml = (s: string) =>
  s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[c]!);

/**
 * Same design as public/cars/placeholder.svg (dark square, 16 numbered
 * cells) plus the model name, built in memory so it works offline and
 * makes testing easy before the real images exist.
 */
export function placeholderDataUrl(modelName: string): string {
  const size = 1600;
  const cell = size / GRID;
  const cells: string[] = [];
  for (let i = 0; i < GRID * GRID; i++) {
    const x = (i % GRID) * cell;
    const y = Math.floor(i / GRID) * cell;
    cells.push(
      `<rect x="${x + 12}" y="${y + 12}" width="${cell - 24}" height="${cell - 24}" rx="24" fill="#1E2024" stroke="#3A3D44" stroke-width="6"/>` +
        `<text x="${x + cell / 2}" y="${y + cell / 2}" fill="url(#g)" font-size="170">${i + 1}</text>`,
    );
  }
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9C7A2E"/><stop offset=".5" stop-color="#F3DC9A"/><stop offset="1" stop-color="#9C7A2E"/></linearGradient></defs>` +
    `<rect width="${size}" height="${size}" fill="#111214"/>` +
    `<g font-family="Arial Black, Arial, sans-serif" font-weight="900" text-anchor="middle" dominant-baseline="central">${cells.join("")}` +
    `<rect x="160" y="730" width="1280" height="140" rx="70" fill="#0A0A0B" fill-opacity=".85" stroke="url(#g)" stroke-width="5"/>` +
    `<text x="800" y="800" fill="#F4F1EA" font-size="78" letter-spacing="6">${escapeXml(modelName.toUpperCase())}</text></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

const cache = new Map<string, Promise<string>>();

/**
 * Loads and decodes the car image. Resolves with the image URL, or with
 * the numbered placeholder if the image can't be loaded. Never rejects.
 */
export function loadCarImage(car: Car): Promise<string> {
  const cached = cache.get(car.slug);
  if (cached) return cached;
  const promise = new Promise<string>((resolve) => {
    if (typeof window === "undefined") return resolve(car.image);
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => {
      img
        .decode()
        .catch(() => undefined)
        .finally(() => resolve(car.image));
    };
    img.onerror = () => {
      cache.delete(car.slug); // try again next time (e.g. after coming back online)
      resolve(placeholderDataUrl(car.name));
    };
    img.src = car.image;
  });
  cache.set(car.slug, promise);
  return promise;
}
