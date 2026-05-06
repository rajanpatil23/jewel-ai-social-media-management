// Tiny fetch wrapper. Same-origin → cookies (session) flow automatically.
// All endpoints live under /api/* (served by PHP on Hostinger).

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(message: string, status: number, data: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(`/api${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
    ...opts,
  });
  let data: any = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    throw new ApiError(data?.error || `http_${res.status}`, res.status, data);
  }
  return data as T;
}

export const api = {
  get:  <T>(p: string) => request<T>(p),
  post: <T>(p: string, body?: any) => request<T>(p, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch:<T>(p: string, body?: any) => request<T>(p, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  del:  <T>(p: string) => request<T>(p, { method: "DELETE" }),
  upload: async <T>(p: string, file: File): Promise<T> => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api${p}`, { method: "POST", body: fd, credentials: "include" });
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(data?.error || `http_${res.status}`, res.status, data);
    return data as T;
  },
};

// Helper used by stores to silently fall back to localStorage if the PHP
// backend isn't reachable (e.g. inside the Lovable preview where there is no
// PHP server). This way the UI keeps working in design mode.
export async function tryApi<T>(fn: () => Promise<T>): Promise<T | null> {
  try { return await fn(); } catch (e) {
    if (e instanceof ApiError && e.status >= 500) return null;
    if (e instanceof TypeError) return null; // network / no backend
    throw e;
  }
}
