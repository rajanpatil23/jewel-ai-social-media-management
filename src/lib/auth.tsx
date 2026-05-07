import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, ApiError } from "@/lib/api";

export type AuthUser = { id: string; email: string; name: string };

type Ctx = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  // Preview/design mode means the PHP backend isn't reachable. The UI then
  // operates with a fake local user so designers can keep clicking around.
  previewMode: boolean;
};

const AuthCtx = createContext<Ctx | null>(null);

const PREVIEW_USER: AuthUser = { id: "preview", email: "preview@advora.app", name: "Preview User" };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await api.get<{ user: AuthUser }>("/auth/me");
        setUser(r.user);
      } catch (e) {
        if (e instanceof TypeError) {
          // No backend available → preview mode
          setPreviewMode(true);
          setUser(PREVIEW_USER);
        } else if (e instanceof ApiError && e.status === 401) {
          setUser(null);
        } else {
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    // DUMMY LOGIN (temporary — revert before pulling)
    setUser({ id: "dummy", email: email || "demo@advora.app", name: (email?.split("@")[0]) || "Demo User" });
    return;
    // eslint-disable-next-line no-unreachable
    const r = await api.post<{ user: AuthUser }>("/auth/login", { email, password });
    setUser(r.user);
  };
  const register = async (email: string, password: string, name: string) => {
    // DUMMY REGISTER (temporary — revert before pulling)
    setUser({ id: "dummy", email, name: name || email.split("@")[0] });
    return;
    // eslint-disable-next-line no-unreachable
    const r = await api.post<{ user: AuthUser }>("/auth/register", { email, password, name });
    setUser(r.user);
  };
  const logout = async () => {
    if (!previewMode) await api.post("/auth/logout").catch(() => {});
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, loading, login, register, logout, previewMode }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  const c = useContext(AuthCtx);
  if (!c) throw new Error("useAuth must be inside AuthProvider");
  return c;
}
