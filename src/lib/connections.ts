import { useEffect, useState, useCallback } from "react";
import { api, tryApi } from "@/lib/api";

export type Connection = {
  id: string;
  provider: string;
  account_label: string;
  expires_at: string | null;
  created_at: string;
};

const KEY = "advora.connections";

function readLocal(): Connection[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
}
function writeLocal(items: Connection[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("connections:update"));
}

export async function connectMeta(label = "Maison Aurelia (Meta)") {
  // NOTE: real Meta OAuth would redirect. For now, MOCK connect.
  const local: Connection = {
    id: crypto.randomUUID(),
    provider: "meta",
    account_label: label,
    expires_at: null,
    created_at: new Date().toISOString(),
  };
  const next = [...readLocal().filter(c => c.provider !== "meta"), local];
  writeLocal(next);
  await tryApi(() => api.post("/connections/meta/connect", { account_label: label }));
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
