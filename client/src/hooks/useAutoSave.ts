import { useEffect, useRef } from "react";

/**
 * Sauvegarde automatique en localStorage avec debounce (500ms).
 * Appel : useAutoSave("cv_draft", formValues)
 */
export function useAutoSave<T>(key: string, data: T, delay = 500, enabled = true) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch { /* quota exceeded — ignorer */ }
    }, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [key, data, delay, enabled]);
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

/** Écrit immédiatement le brouillon (sans attendre le debounce de useAutoSave). */
export function writeDraftNow<T>(key: string, data: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
