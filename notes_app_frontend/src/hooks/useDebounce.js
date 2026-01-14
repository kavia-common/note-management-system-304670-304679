import { useEffect, useState } from "react";

// PUBLIC_INTERFACE
export function useDebounce(value, delayMs = 300) {
  /** Debounces any value; updates after delayMs. */
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);

  return debounced;
}
