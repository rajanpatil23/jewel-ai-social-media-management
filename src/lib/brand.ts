import { api, tryApi } from "@/lib/api";

export type BrandIdentity = {
  brand_name: string;
  logo_url: string;
  colors: string[];
  font: string;
};

export async function getBrand(): Promise<BrandIdentity | null> {
  return await tryApi(() => api.get<BrandIdentity>("/settings/brand"));
}

export async function saveBrand(b: BrandIdentity) {
  return await api.post("/settings/brand", b);
}

export type TonePrefs = {
  tone: string;
  prefs: Record<string, boolean>;
};

export async function getTonePrefs(): Promise<TonePrefs | null> {
  return await tryApi(() => api.get<TonePrefs>("/settings/prefs"));
}

export async function saveTonePrefs(t: TonePrefs) {
  return await api.post("/settings/prefs", t);
}
