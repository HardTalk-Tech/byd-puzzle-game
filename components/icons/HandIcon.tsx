interface IconProps {
  className?: string;
}

/** Pointing hand (swipe hint). */
export function HandIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={className}>
      <path
        d="M17 24V9.5a3.5 3.5 0 0 1 7 0V22m0-2.5a3.5 3.5 0 0 1 7 0V24m0-2a3.5 3.5 0 0 1 7 0v8.5C38 38 33 44 25.5 44h-1.8c-4.4 0-7.4-1.8-9.9-5.2L8.6 31.6a3.4 3.4 0 0 1 5.2-4.4L17 30.5"
        stroke="currentColor"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M8 8l-3-3M12 5l-1-3M5 13l-3-1" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity=".7" />
    </svg>
  );
}
