export interface Car {
  slug: string;
  name: string; // e.g. "BYD Atto 3"
  image: string; // e.g. "/cars/atto-3.webp"
}

const car = (slug: string, name: string): Car => ({
  slug,
  name,
  image: `/cars/${slug}.webp`,
});

/** The 9 BYD models. Only names are used: never hard-code car colours. */
export const CARS: Car[] = [
  car("racco", "BYD Racco"),
  car("atto-1", "BYD Atto 1"),
  car("atto-2", "BYD Atto 2"),
  car("dolphin", "BYD Dolphin"),
  car("sealion-5", "BYD Sealion 5"),
  car("sealion-6", "BYD Sealion 6"),
  car("shark-6", "BYD Shark 6"),
  car("sealion-8", "BYD Sealion 8"),
  car("atto-3", "BYD Atto 3"),
];

export const PLACEHOLDER_IMAGE = "/cars/placeholder.svg";

export function findCar(slug: string): Car | undefined {
  return CARS.find((c) => c.slug === slug);
}
