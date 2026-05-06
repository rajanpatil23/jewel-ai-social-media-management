import { useEffect, useState, useCallback } from "react";
import { api, tryApi } from "@/lib/api";

export type Connection = {
  id: string;
  provider: string;
  account_label: string;
  expires_at: string | null;
  created_at: string;
  meta?: Record<string, any>;
};

const KEY = "advora.connections";

function readLocal(): Connection[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function writeLocal(items: Connection[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("connections:update"));
}

// Returns "oauth" | "mock" | "preview" so the UI can react.
export async function connectMeta(): Promise<"oauth" | "mock" | "preview"> {
  const r = await tryApi(() =>
    api.post<{ mode: "oauth" | "mock"; url?: string; ok?: boolean }>("/connections/meta/connect"),
  );
  if (!r) {
    // No backend (preview) — fake a connection locally so the UI works.
    const local: Connection = {
      id: crypto.randomUUID(), provider: "meta",
      account_label: "Demo Meta (preview)",
      expires_at: null, created_at: new Date().toISOString(),
      meta: { mock: true },
    };
    writeLocal([...readLocal().filter(c => c.provider !== "meta"), local]);
    return "preview";
  }
  if (r.mode === "oauth" && r.url) {
    // Open Facebook OAuth in popup; backend posts a message back when done.
    const w = 600, h = 720;
    const left = window.screenX + (window.outerWidth - w) / 2;
    const top  = window.screenY + (window.outerHeight - h) / 2.5;
    const popup = window.open(r.url, "meta-oauth", `width=${w},height=${h},left=${left},top=${top}`);
    if (!popup) { window.location.href = r.url; return "oauth"; }
    await new Promise<void>((resolve) => {
      const onMsg = (ev: MessageEvent) => {
        if (ev.data?.type === "meta-connected") { window.removeEventListener("message", onMsg); resolve(); }
      };
      window.addEventListener("message", onMsg);
      const t = setInterval(() => { if (popup.closed) { clearInterval(t); window.removeEventListener("message", onMsg); resolve(); } }, 800);
    });
    return "oauth";
  }
  return "mock";
}

export async function disconnectMeta() {
  writeLocal(readLocal().filter(c => c.provider !== "meta"));
  await tryApi(() => api.post("/connections/meta/disconnect"));
}

export function useConnections() {
  const [items, setItems] = useState<Connection[]>(() => readLocal());

  const refresh = useCallback(async () => {
    const r = await tryApi(() => api.get<{ connections: Connection[] }>("/connections"));
    if (r?.connections) {
      writeLocal(r.connections);
      setItems(r.connections);
    }
  }, []);

  useEffect(() => {
    const update = () => setItems(readLocal());
    window.addEventListener("connections:update", update);
    refresh();
    return () => window.removeEventListener("connections:update", update);
  }, [refresh]);

  return { items, refresh, isConnected: (p: string) => items.some(c => c.provider === p) };
}
