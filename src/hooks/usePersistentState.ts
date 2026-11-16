import { useEffect, useState } from "react";

/** Works like useState, but remembers the value in this browser between visits. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = window.localStorage.getItem(key);
      return saved !== null ? (JSON.parse(saved) as T) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be blocked (private mode). The page still works without it.
    }
  }, [key, value]);

  return [value, setValue] as const;
}
