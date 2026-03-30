import { useState, useCallback } from "react";
import { fileToDataUrl } from "../lib/brandColors";

const BRAND_KEY = "docugest_brand_v1";

export interface BrandSettings {
  logoDataUrl: string | null;
  accentColor: string;
}

const DEFAULTS: BrandSettings = {
  logoDataUrl: null,
  accentColor: "#1a6b4a",
};

function readBrand(): BrandSettings {
  try {
    const raw = localStorage.getItem(BRAND_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

export function useDocumentBranding() {
  const [brand, setBrand] = useState<BrandSettings>(readBrand);

  const updateBrand = useCallback((updates: Partial<BrandSettings>) => {
    setBrand((prev) => {
      const next = { ...prev, ...updates };
      try { localStorage.setItem(BRAND_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const uploadLogo = useCallback(async (file: File) => {
    try {
      const dataUrl = await fileToDataUrl(file);
      updateBrand({ logoDataUrl: dataUrl });
    } catch { /* ignore */ }
  }, [updateBrand]);

  const removeLogo = useCallback(() => updateBrand({ logoDataUrl: null }), [updateBrand]);

  return { brand, updateBrand, uploadLogo, removeLogo };
}

/** Read brand without React state (for pure render components) */
export function readBrandSync(): BrandSettings {
  return readBrand();
}
