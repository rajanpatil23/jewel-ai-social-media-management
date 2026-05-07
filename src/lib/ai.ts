import { api, tryApi } from "@/lib/api";

export type GenerateInput = {
  prompt: string;
  count?: number;
  ratio?: string;
  scene?: string | null;
  reference_image?: string | null; // URL (preferred) or data URI
};
export type GenerateResult = {
  images: string[];
  mock?: boolean;
  using_own_key?: boolean;
};

export async function generateImages(input: GenerateInput): Promise<GenerateResult> {
  return await api.post<GenerateResult>("/ai/generate", input);
}

export async function uploadReference(file: File): Promise<string> {
  const r = await api.upload<{ url: string }>("/upload", file);
  return r.url;
}

export type AiSettings = {
  provider: "lovable" | "openai";
  model: string;
  has_own_key: boolean;
  using_default: boolean;
};

export async function getAiSettings(): Promise<AiSettings | null> {
  return await tryApi(() => api.get<AiSettings>("/settings/ai"));
}

export async function saveAiSettings(p: {
  provider: "lovable" | "openai";
  model: string;
  api_key?: string;
  clear_key?: boolean;
}) {
  return await api.post("/settings/ai", p);
}
