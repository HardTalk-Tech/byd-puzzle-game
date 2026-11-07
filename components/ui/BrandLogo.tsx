import Image from "next/image";

export const BRAND_LOGO_SRC = "/brand/byd-logo.svg";

interface BrandLogoProps {
  className?: string;
  /** Only the first image on screen should load eagerly. */
  eager?: boolean;
}

/**
 * The BYD logo. `/brand/byd-logo.svg` is generated from
 * `/brand/byd-logo-white.png` by `npm run icons`.
 */
export function BrandLogo({ className = "h-[max(26px,4.2cqw)]", eager = false }: BrandLogoProps) {
  return (
    <Image
      src={BRAND_LOGO_SRC}
      alt="BYD"
      width={563}
      height={110}
      unoptimized
      draggable={false}
      loading={eager ? "eager" : "lazy"}
      className={`w-auto ${className}`}
    />
  );
}
