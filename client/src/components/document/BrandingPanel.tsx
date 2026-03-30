import { useRef } from "react";
import type { BrandSettings } from "../../hooks/useDocumentBranding";

const PALETTE = [
  { hex: "#1a6b4a", label: "Vert émeraude" },
  { hex: "#1e40af", label: "Bleu royal" },
  { hex: "#7c3aed", label: "Violet" },
  { hex: "#c2410c", label: "Orange pro" },
  { hex: "#0f766e", label: "Teal" },
  { hex: "#1e3a5f", label: "Marine" },
  { hex: "#7F1D1D", label: "Bordeaux" },
  { hex: "#374151", label: "Anthracite" },
];

interface BrandingPanelProps {
  brand: BrandSettings;
  onUploadLogo: (file: File) => void;
  onRemoveLogo: () => void;
  onColorChange: (hex: string) => void;
}

export default function BrandingPanel({ brand, onUploadLogo, onRemoveLogo, onColorChange }: BrandingPanelProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-card ring-1 ring-border/50">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400">
        <span>🎨</span> Personnalisation du document
      </h3>

      {/* Logo */}
      <div className="mb-4">
        <label className="mb-2 block text-xs font-semibold text-slate-700">
          Logo de votre organisation
          <span className="ml-1 font-normal text-slate-500">(optionnel, apparaît sur tous vos documents)</span>
        </label>
        <div className="flex items-center gap-3">
          {brand.logoDataUrl ? (
            <div className="relative">
              <img
                src={brand.logoDataUrl}
                alt="Logo"
                className="h-14 w-14 rounded-xl object-contain ring-2 ring-primary/30 bg-slate-50"
              />
              <button
                type="button"
                onClick={onRemoveLogo}
                className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] text-white shadow hover:bg-red-600"
                aria-label="Supprimer le logo"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 ring-2 ring-dashed ring-slate-300 text-slate-400 text-xl">
              🏢
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="rounded-xl bg-primary/10 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/15 transition"
            >
              {brand.logoDataUrl ? "Changer le logo" : "Ajouter un logo"}
            </button>
            <p className="mt-1 text-[10px] text-slate-400">PNG, JPG, SVG — max 2 Mo</p>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) onUploadLogo(f);
              }}
            />
          </div>
        </div>
      </div>

      {/* Couleur d'accentuation */}
      <div>
        <label className="mb-2 block text-xs font-semibold text-slate-700">Couleur du document</label>
        <div className="flex flex-wrap items-center gap-2">
          {PALETTE.map((p) => (
            <button
              key={p.hex}
              type="button"
              title={p.label}
              onClick={() => onColorChange(p.hex)}
              className="h-7 w-7 rounded-full shadow-sm ring-offset-1 transition hover:scale-110"
              style={{
                background: p.hex,
                outline: brand.accentColor === p.hex ? `3px solid ${p.hex}` : "none",
                outlineOffset: 2,
              }}
            />
          ))}
          {/* Custom color picker */}
          <label className="relative flex h-7 w-7 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-pink-400 via-yellow-300 to-blue-400 shadow-sm ring-offset-1 transition hover:scale-110" title="Couleur personnalisée">
            <span className="text-[10px] text-white font-black">+</span>
            <input
              type="color"
              value={brand.accentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </label>
          <span className="ml-1 rounded-lg border border-border/60 px-2 py-1 text-[11px] font-mono text-slate-600">{brand.accentColor}</span>
        </div>
      </div>
    </div>
  );
}
