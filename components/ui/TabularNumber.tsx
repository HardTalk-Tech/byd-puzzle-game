interface TabularNumberProps {
  value: string | number;
  className?: string;
}

/**
 * Renders a number with fixed-width digits so timers and counters don't
 * jump (Orbitron has no tabular figures of its own).
 */
export function TabularNumber({ value, className = "" }: TabularNumberProps) {
  const text = String(value);
  return (
    <span className={`tabular inline-flex ${className}`} aria-label={text}>
      {text.split("").map((ch, i) => (
        <span
          key={i}
          aria-hidden
          className="inline-block text-center"
          style={{ width: /\d/.test(ch) ? "0.82em" : "0.36em" }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
