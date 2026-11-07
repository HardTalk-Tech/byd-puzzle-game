/** Puzzle piece ("Rebuild the car"). */
export function PuzzleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={className}>
      <path
        d="M8 14h9a4.5 4.5 0 1 1 9 0h9v9a4.5 4.5 0 1 1 0 9v9h-9a4.5 4.5 0 1 0-9 0H8v-9a4.5 4.5 0 1 0 0-9v-9Z"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}
