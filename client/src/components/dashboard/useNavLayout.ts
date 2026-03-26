import { useCallback, useEffect, useState } from "react";

const KEY = "docugest_nav_layout";

export type NavLayoutMode = "top" | "sidebar";

export function useNavLayout() {
  const [mode, setModeState] = useState<NavLayoutMode>(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v === "sidebar" || v === "top") return v;
    } catch {
      /* ignore */
    }
    return "top";
  });

  useEffect(() => {
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);

  const setMode = useCallback((m: NavLayoutMode) => setModeState(m), []);

  return { mode, setMode };
}
