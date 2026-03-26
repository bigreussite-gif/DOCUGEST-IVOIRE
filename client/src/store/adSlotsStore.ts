import { create } from "zustand";

export const AD_SLOTS_LS_KEY = "docugest_ad_slots_v1";

export type AdSlotItem = {
  slot: string;
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageDataUrl?: string;
  imageFit?: string;
  imageFrame?: string;
};

function buildBySlot(items: AdSlotItem[]): Record<string, AdSlotItem> {
  const bySlot: Record<string, AdSlotItem> = {};
  for (const it of items) {
    if (it?.slot) bySlot[it.slot] = it;
  }
  return bySlot;
}

function readCache(): { items: AdSlotItem[]; bySlot: Record<string, AdSlotItem> } {
  if (typeof window === "undefined") return { items: [], bySlot: {} };
  try {
    const raw = localStorage.getItem(AD_SLOTS_LS_KEY);
    if (!raw) return { items: [], bySlot: {} };
    const parsed = JSON.parse(raw) as { items?: AdSlotItem[] };
    const items = Array.isArray(parsed.items) ? parsed.items : [];
    return { items, bySlot: buildBySlot(items) };
  } catch {
    return { items: [], bySlot: {} };
  }
}

const cached = readCache();

let inflight: Promise<void> | null = null;
let lastNetworkFetch = 0;

type AdSlotsState = {
  items: AdSlotItem[];
  bySlot: Record<string, AdSlotItem>;
  isFetching: boolean;
  /** Réinjecte le cache disque (autre onglet ou après écriture locale). */
  rehydrateFromStorage: () => void;
  /** Une seule requête en vol ; mise à jour du cache persistant. */
  refresh: (opts?: { force?: boolean }) => Promise<void>;
};

/** Appelé après sauvegarde admin : rafraîchit tous les clients (même onglet + autres). */
export function notifyAdSlotsUpdated() {
  try {
    const bc = new BroadcastChannel("docugest-ads-updated");
    bc.postMessage({ t: Date.now() });
    bc.close();
  } catch {
    /* ignore */
  }
  void useAdSlotsStore.getState().refresh({ force: true });
}

export const useAdSlotsStore = create<AdSlotsState>((set, get) => ({
  items: cached.items,
  bySlot: cached.bySlot,
  isFetching: false,

  rehydrateFromStorage: () => {
    const { items, bySlot } = readCache();
    set({ items, bySlot });
  },

  refresh: async (opts) => {
    if (typeof window === "undefined") return;
    const force = opts?.force === true;
    const now = Date.now();
    // Évite les rafales (focus / visibilité) tout en laissant le premier chargement et refresh({ force: true }).
    if (!force && lastNetworkFetch > 0 && now - lastNetworkFetch < 45_000) {
      return inflight ?? Promise.resolve();
    }
    if (inflight) {
      if (!force) return inflight;
      await inflight;
    }

    inflight = (async () => {
      set({ isFetching: true });
      try {
        const r = await fetch("/api/ads/slots", { cache: "no-store", credentials: "same-origin" });
        const data = (await r.json()) as { items?: AdSlotItem[] };
        const items = Array.isArray(data.items) ? data.items : [];
        const bySlot = buildBySlot(items);
        lastNetworkFetch = Date.now();
        set({ items, bySlot, isFetching: false });
        try {
          localStorage.setItem(AD_SLOTS_LS_KEY, JSON.stringify({ items, t: lastNetworkFetch }));
        } catch {
          try {
            const slim = items.map((row) => ({
              ...row,
              imageDataUrl:
                row.imageDataUrl && row.imageDataUrl.length < 400_000 ? row.imageDataUrl : ""
            }));
            localStorage.setItem(AD_SLOTS_LS_KEY, JSON.stringify({ items: slim, t: lastNetworkFetch }));
          } catch {
            /* quota : l’app garde les données en mémoire pour la session */
          }
        }
      } catch {
        set({ isFetching: false });
      } finally {
        inflight = null;
      }
    })();

    return inflight;
  }
}));
