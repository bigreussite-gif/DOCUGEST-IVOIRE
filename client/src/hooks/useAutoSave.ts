import { useEffect, useRef } from "react";

/**
 * Sauvegarde automatique en localStorage avec debounce (500ms).
 * Appel : useAutoSave("cv_draft", formValues)
 */
export function useAutoSave<T>(key: string, data: T, delay = 500) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch { /* quota exceeded — ignorer */ }
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, data, delay]);
}

/** Lit un brouillon sauvegardé. */
export function readDraft<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

/** Supprime un brouillon. */
export function clearDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch { /* ignore */ }
}
