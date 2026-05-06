import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { toast } from "sonner";
import advoraLogo from "@/assets/advora-logo.png";

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation() as any;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      nav(loc.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : "Network error";
      toast.error(msg === "invalid_credentials" ? "Wrong email or password" : msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md p-8">
        <div className="flex items-center gap-2.5 mb-6">
          <img src={advoraLogo} alt="Advora" className="h-8 w-8" />
          <div>
            <div className="font-display text-lg">Advora</div>
            <div className="text-xs text-muted-foreground">Sign in to your workspace</div>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required
                   value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pwd">Password</Label>
            <Input id="pwd" type="password" autoComplete="current-password" required
                   value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          New to Advora?{" "}
          <Link to="/register" className="text-foreground font-medium hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
}
