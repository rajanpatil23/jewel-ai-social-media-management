import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return children;
}
