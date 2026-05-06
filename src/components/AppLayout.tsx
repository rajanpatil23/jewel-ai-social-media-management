import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Sparkles, CalendarDays, BarChart3 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/", label: "AI Studio", icon: Sparkles },
  { to: "/post", label: "Scheduler", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 h-16 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="h-full max-w-6xl mx-auto flex items-center gap-8 px-4 md:px-8">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-md bg-[hsl(var(--primary))] flex items-center justify-center shadow-[var(--shadow-gold)]">
              <span className="font-display text-primary-foreground text-sm">A</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-lg tracking-tight">Aurum</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm transition-colors ${
                    active
                      ? "text-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Avatar className="h-9 w-9 ring-1 ring-border">
              <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">MA</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-8 py-8 md:py-12">{children}</main>
    </div>
  );
}
