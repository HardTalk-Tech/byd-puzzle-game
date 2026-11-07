import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CARS, PLACEHOLDER_IMAGE } from "@/config/cars";
import { BRAND_LOGO_SRC } from "@/components/ui/BrandLogo";

const sw = readFileSync("public/sw.js", "utf8");

describe("service worker precache list", () => {
  it("includes every car model from config/cars.ts", () => {
    const slugs = JSON.parse(/const CAR_SLUGS = (\[[^\]]*\])/.exec(sw)![1]) as string[];
    expect(slugs.sort()).toEqual(CARS.map((c) => c.slug).sort());
    for (const car of CARS) expect(car.image).toBe(`/cars/${car.slug}.webp`);
  });

  it("includes the shell, placeholder, logo and icons", () => {
    for (const path of ['"/"', "/manifest.webmanifest", PLACEHOLDER_IMAGE, BRAND_LOGO_SRC, "/icons/icon-192.png", "/icons/icon-512.png", "/icons/icon-512-maskable.png"]) {
      expect(sw).toContain(path);
    }
  });

  it("never caches /staff or cross-origin requests", () => {
    expect(sw).toContain("url.origin !== self.location.origin");
    expect(sw).not.toMatch(/staff.*respondWith/);
  });
});
