import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  BarChart3,
  Search,
  Bell,
  HelpCircle,
  Settings,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import advoraLogo from "@/assets/advora-logo.png";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/", label: "AI Studio", icon: Sparkles },
  { to: "/post", label: "Scheduler", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
];

const sectionTitle: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/": "AI Studio",
  "/post": "Scheduler",
  "/analytics": "Analytics",
};

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const currentLabel =
    sectionTitle[pathname] ??
    nav.find((n) => n.to !== "/" && pathname.startsWith(n.to))?.label ??
    "Workspace";

  return (
    <div className="min-h-screen flex bg-muted/30 text-foreground">
      {/* Sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-r border-border bg-card">
        <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border">
          <img src={advoraLogo} alt="Advora" className="h-7 w-7 object-contain" />
          <div className="leading-tight">
            <div className="font-display text-[15px] tracking-tight">Advora</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Workspace</div>
          </div>
        </div>

        <div className="px-3 pt-4 pb-2">
          <p className="px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 mb-1.5">
            Workspace
          </p>
          <nav className="flex flex-col gap-0.5">
            {nav.map((item) => {
              const active =
                item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`group flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <item.icon
                    className={`h-4 w-4 ${
                      active ? "text-[hsl(var(--primary-deep))]" : "text-muted-foreground/80"
                    }`}
                  />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="px-3 pt-5">
          <p className="px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 mb-1.5">
            Account
          </p>
          <nav className="flex flex-col gap-0.5">
            <button className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
              <Settings className="h-4 w-4" />
              Settings
            </button>
            <button className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors">
              <HelpCircle className="h-4 w-4" />
              Help & docs
            </button>
          </nav>
        </div>

        <div className="mt-auto p-3">
          <div className="rounded-lg border border-border bg-secondary/40 p-3">
            <p className="text-xs font-medium">Pro plan</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">1,240 AI credits left</p>
            <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
              <div className="h-full w-3/4 bg-[hsl(var(--primary))]" />
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-card/95 backdrop-blur">
          <div className="h-full px-4 md:px-6 flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
              <span className="hidden sm:inline">Maison Aurelia</span>
              <ChevronRight className="hidden sm:inline h-3.5 w-3.5" />
              <span className="text-foreground font-medium truncate">{currentLabel}</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="relative hidden md:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search posts, assets, analytics…"
                  className="h-9 w-72 pl-8 bg-background"
                />
              </div>
              <button className="h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
                <Bell className="h-4 w-4" />
              </button>
              <div className="h-6 w-px bg-border mx-1" />
              <Avatar className="h-8 w-8 ring-1 ring-border">
                <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">
                  MA
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-6 md:py-8 bg-muted/30">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
