import type { ReactNode } from "react";

interface RoundLayoutProps {
  header: ReactNode;
  /** Target card, prize banner, timer (or the reveal title). */
  top: ReactNode;
  /** The square board, sized min(92% of width, 52% of height). */
  board: ReactNode;
  /** Row right under the board (moves and best); empty on the reveal screen. */
  belowBoard?: ReactNode;
  bottom: ReactNode;
}

/**
 * Shared layout for the reveal and game screens, so the board stays in
 * exactly the same place when play starts. The board sits high (only the
 * card, banner and timer above it; moves and best below it) so taller
 * players don't have to reach down: header 5.5%, top 27%, board, row
 * under the board 7.5%, hint 6%.
 */
export function RoundLayout({ header, top, board, belowBoard, bottom }: RoundLayoutProps) {
  return (
    <div className="flex h-full flex-col justify-between py-[1.2cqh]">
      <header className="flex h-[5.5%] items-center justify-between px-[4cqw]">{header}</header>
      <section className="flex h-[27%] flex-col px-[4cqw]">{top}</section>
      <section className="flex shrink-0 justify-center">
        <div className="relative w-[min(92cqw,52cqh)]">{board}</div>
      </section>
      <section className="flex h-[7.5%] items-stretch justify-center px-[4cqw]">{belowBoard}</section>
      <footer className="h-[6%]">{bottom}</footer>
    </div>
  );
}
