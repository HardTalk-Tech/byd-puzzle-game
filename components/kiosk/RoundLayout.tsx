import type { ReactNode } from "react";

interface RoundLayoutProps {
  header: ReactNode;
  /** Target card, stats and timer bar (or the reveal title). */
  top: ReactNode;
  /** The square board, sized min(92% of width, 52% of height). */
  board: ReactNode;
  bottom: ReactNode;
}

/**
 * Shared layout for the reveal and game screens, so the board stays in
 * exactly the same place when play starts. Heights follow section 8.4:
 * header 6%, target 18% + stats 9% + timer 2%, board 55%, hint 6%.
 */
export function RoundLayout({ header, top, board, bottom }: RoundLayoutProps) {
  return (
    <div className="flex h-full flex-col justify-between py-[1.2cqh]">
      <header className="flex h-[6%] items-center justify-between px-[4cqw]">{header}</header>
      <section className="flex h-[29%] flex-col px-[4cqw]">{top}</section>
      <section className="flex h-[55%] items-center justify-center">
        <div className="relative w-[min(92cqw,52cqh)]">{board}</div>
      </section>
      <footer className="h-[6%]">{bottom}</footer>
    </div>
  );
}
