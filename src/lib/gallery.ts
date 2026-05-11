import { useEffect, useState } from "react";
import { api, tryApi } from "@/lib/api";

export type GalleryItem = { src: string; label: string; createdAt: number };

const KEY = "creativeGallery";

function readLocal(): GalleryItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function writeLocal(items: GalleryItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 60)));
  window.dispatchEvent(new Event("gallery:update"));
}

// Generated images are persisted server-side by /api/ai/generate
// (see backend/routes/ai.php → persist_and_save_gallery), so here we just
// mirror them into local cache for instant UI updates and offline preview.
export async function addToGallery(items: { src: string; label: string }[]) {
  const now = Date.now();
  const incoming: GalleryItem[] = items.map((i, idx) => ({ ...i, createdAt: now - idx }));
  const seen = new Set(incoming.map((i) => i.src));
  const merged = [...incoming, ...readLocal().filter((i) => !seen.has(i.src))];
  writeLocal(merged);
}

export function useGallery(): GalleryItem[] {
  const [items, setItems] = useState<GalleryItem[]>(() => readLocal());

  useEffect(() => {
    const update = () => setItems(readLocal());
    window.addEventListener("gallery:update", update);
    window.addEventListener("storage", update);

    // Try to hydrate from backend
    (async () => {
      const r = await tryApi(() => api.get<{ items: GalleryItem[] }>("/gallery"));
      if (r?.items?.length) {
        const seen = new Set(r.items.map((i) => i.src));
        const merged = [...r.items, ...readLocal().filter((i) => !seen.has(i.src))];
        writeLocal(merged);
      }
    })();

    return () => {
      window.removeEventListener("gallery:update", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return items;
}
