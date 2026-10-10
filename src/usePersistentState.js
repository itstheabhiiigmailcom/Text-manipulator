import { useEffect, useState } from 'react';

// useState that survives page changes and reloads via localStorage (JSON-encoded).
export default function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored === null ? initialValue : JSON.parse(stored);
    } catch (e) {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // Storage can be unavailable (private mode or full); the app still works without it.
    }
  }, [key, value]);

  return [value, setValue];
}
