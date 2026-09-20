import { useEffect, useState } from "react";

/**
 * Custom hook to debounce any fast-changing value (e.g. search input).
 * Shields network queries and backend database from keystroke spam.
 *
 * @param value The value to debounce
 * @param delay Milliseconds to delay before updating (default 400ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
