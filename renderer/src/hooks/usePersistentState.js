import { useState, useEffect } from "react";

export default function usePersistentState(key, initialValue, userId) {
  const storageKey = `${key}_${userId}`;

  const [value, setValue] = useState(() => {
    if (!userId) return initialValue;
    try {
      const saved = localStorage.getItem(storageKey);
      return saved !== null ? JSON.parse(saved) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    if (userId) {
      localStorage.setItem(storageKey, JSON.stringify(value));
    }
  }, [value, userId]);

  return [value, setValue];
}
