export function BackspaceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" aria-hidden className={className}>
      <path
        d="M17 10h23a4 4 0 0 1 4 4v20a4 4 0 0 1-4 4H17L4 24l13-14Z"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M22 18l12 12M34 18L22 30" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
