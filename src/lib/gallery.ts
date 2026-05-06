import { useEffect, useState } from "react";

export type GalleryItem = { src: string; label: string; createdAt: number };

const KEY = "creativeGallery";

function read(): GalleryItem[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function write(items: GalleryItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, 60)));
  window.dispatchEvent(new Event("gallery:update"));
}

export function addToGallery(items: { src: string; label: string }[]) {
  const now = Date.now();
  const incoming = items.map((i, idx) => ({ ...i, createdAt: now - idx }));
  const existing = read();
  // de-dupe by src
  const seen = new Set(incoming.map((i) => i.src));
  const merged = [...incoming, ...existing.filter((i) => !seen.has(i.src))];
  write(merged);
}

export function useGallery(): GalleryItem[] {
  const [items, setItems] = useState<GalleryItem[]>(() => read());
  useEffect(() => {
    const update = () => setItems(read());
    window.addEventListener("gallery:update", update);
    window.addEventListener("storage", update);
    return () => {
      window.removeEventListener("gallery:update", update);
      window.removeEventListener("storage", update);
    };
  }, []);
  return items;
}
