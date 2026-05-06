import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { toast } from "sonner";
import advoraLogo from "@/assets/advora-logo.png";

const errMap: Record<string, string> = {
  email_taken:    "An account with that email already exists",
  weak_password:  "Password must be at least 8 characters",
  invalid_email:  "Please enter a valid email",
  invalid_name:   "Please enter your name",
};

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(email, password, name);
      toast.success("Welcome to Advora");
      nav("/dashboard", { replace: true });
    } catch (err) {
      const code = err instanceof ApiError ? err.message : "network_error";
      toast.error(errMap[code] || code);
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
            <div className="font-display text-lg">Create your workspace</div>
            <div className="text-xs text-muted-foreground">Built for jewellery brands</div>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Brand / your name</Label>
            <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" required
                   value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pwd">Password</Label>
            <Input id="pwd" type="password" autoComplete="new-password" required
                   minLength={8}
                   value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="text-[11px] text-muted-foreground">At least 8 characters.</p>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-foreground font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
