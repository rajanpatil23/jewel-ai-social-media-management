import { ReactNode, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
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
  Plug,
  PenSquare,
  LogOut,
  Menu,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/lib/auth";
import advoraLogo from "@/assets/advora-logo.png";
import ekadhiLogo from "@/assets/ekadhi-logo.webp";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/", label: "AI Studio", icon: Sparkles },
  { to: "/post", label: "Composer", icon: PenSquare },
  { to: "/schedule", label: "Scheduler", icon: CalendarDays },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/connections", label: "Connections", icon: Plug },
];

// Bottom tab bar — keep to 5 most-used items so it stays one-thumb friendly
const mobileTabs = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/", label: "Studio", icon: Sparkles },
  { to: "/post", label: "Post", icon: PenSquare, primary: true },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/analytics", label: "Stats", icon: BarChart3 },
];

const sectionTitle: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/": "AI Studio",
  "/post": "Composer",
  "/schedule": "Scheduler",
  "/analytics": "Analytics",
  "/connections": "Connections",
};

function NavItems({ pathname, collapsed, onPick }: { pathname: string; collapsed?: boolean; onPick?: () => void }) {
  return (
    <nav className="flex flex-col gap-0.5">
      {nav.map((item) => {
        const active =
          item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
        return (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onPick}
            title={collapsed ? item.label : undefined}
            className={`group flex items-center gap-2.5 rounded-md ${
              collapsed ? "justify-center px-0 py-2" : "px-2.5 py-2"
            } text-sm transition-colors ${
              active
                ? "bg-secondary text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
            }`}
          >
            <item.icon
              className={`h-4 w-4 shrink-0 ${
                active ? "text-[hsl(var(--primary-deep))]" : "text-muted-foreground/80"
              }`}
            />
            {!collapsed && <span className="truncate">{item.label}</span>}
          </NavLink>
        );
      })}
    </nav>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { user, logout, previewMode } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("advora.sidebar.collapsed") === "1";
  });
  const toggleSidebar = () => {
    setSidebarCollapsed((v) => {
      const nv = !v;
      try { localStorage.setItem("advora.sidebar.collapsed", nv ? "1" : "0"); } catch {}
      return nv;
    });
  };
  const initials = (user?.name || user?.email || "U")
    .split(/\s+/).map((s) => s[0]).slice(0, 2).join("").toUpperCase();
  const currentLabel =
    sectionTitle[pathname] ??
    nav.find((n) => n.to !== "/" && pathname.startsWith(n.to))?.label ??
    "Workspace";

  return (
    <div className="min-h-screen flex bg-muted/30 text-foreground">
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 ${
          sidebarCollapsed ? "w-14" : "w-60"
        }`}
      >
        <div className={`h-14 flex items-center border-b border-border ${sidebarCollapsed ? "justify-center px-0" : "gap-2.5 px-4"}`}>
          <img src={ekadhiLogo} alt="Ekadhi Jewels" className="h-7 w-7 object-contain shrink-0" />
          {!sidebarCollapsed && (
            <div className="leading-tight min-w-0">
              <div className="font-display text-[15px] tracking-tight truncate">Ekadhi Jewels</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground truncate">Workspace</div>
            </div>
          )}
        </div>

        <div className={`pt-4 pb-2 ${sidebarCollapsed ? "px-2" : "px-3"}`}>
          {!sidebarCollapsed && (
            <p className="px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 mb-1.5">
              Workspace
            </p>
          )}
          <NavItems pathname={pathname} collapsed={sidebarCollapsed} />
        </div>

        {!sidebarCollapsed && (
          <div className="px-3 pt-5">
            <p className="px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 mb-1.5">
              Account
            </p>
            <nav className="flex flex-col gap-0.5">
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`
                }
              >
                <Settings className="h-4 w-4" />
                Settings
              </NavLink>
              <a
                href="https://docs.lovable.dev"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                Help &amp; docs
              </a>
            </nav>
          </div>
        )}

        {!sidebarCollapsed && (
          <div className="mt-auto p-3">
            <div className="rounded-lg border border-border bg-secondary/40 p-3">
              <p className="text-xs font-medium">Pro plan</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">1,240 AI credits left</p>
              <div className="mt-2 h-1 rounded-full bg-border overflow-hidden">
                <div className="h-full w-3/4 bg-[hsl(var(--primary))]" />
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-14 border-b border-border bg-card/95 backdrop-blur">
          <div className="h-full px-3 md:px-6 flex items-center gap-2 md:gap-4">
            {/* Mobile menu trigger */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <button
                  className="md:hidden h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="h-14 flex items-center gap-2.5 px-4 border-b border-border">
                  <img src={ekadhiLogo} alt="Ekadhi Jewels" className="h-7 w-7 object-contain" />
                  <div className="leading-tight">
                    <div className="font-display text-[15px] tracking-tight">Ekadhi Jewels</div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Workspace</div>
                  </div>
                </div>
                <div className="px-3 pt-4">
                  <p className="px-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 mb-1.5">
                    Workspace
                  </p>
                  <NavItems pathname={pathname} onPick={() => setDrawerOpen(false)} />

                  <p className="px-2 mt-5 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 mb-1.5">
                    Account
                  </p>
                  <button
                    onClick={async () => { setDrawerOpen(false); await logout(); navigate("/login"); }}
                    className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Desktop sidebar toggle */}
            <button
              onClick={toggleSidebar}
              className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile compact brand */}
            <div className="md:hidden flex items-center gap-2 min-w-0">
              <img src={advoraLogo} alt="Advora" className="h-6 w-6 object-contain" />
              <span className="text-sm font-medium truncate">{currentLabel}</span>
            </div>

            {/* Desktop breadcrumb */}
            <div className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground min-w-0">
              <span className="hidden sm:inline">Ekadhi Jewels</span>
              <ChevronRight className="hidden sm:inline h-3.5 w-3.5" />
              <span className="text-foreground font-medium truncate">{currentLabel}</span>
            </div>

            <div className="ml-auto flex items-center gap-1.5 md:gap-2">
              <div className="relative hidden lg:block">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search posts, assets, analytics…"
                  className="h-9 w-72 pl-8 bg-background"
                />
              </div>
              <button
                aria-label="Notifications"
                className="h-9 w-9 inline-flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Bell className="h-4 w-4" />
              </button>
              <div className="hidden md:block h-6 w-px bg-border mx-1" />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-md p-0.5 hover:bg-secondary transition-colors">
                    <Avatar className="h-8 w-8 ring-1 ring-border">
                      <AvatarFallback className="bg-secondary text-foreground text-xs font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="text-sm font-medium truncate">{user?.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user?.email}</div>
                    {previewMode && (
                      <div className="mt-1 text-[10px] uppercase tracking-wider text-amber-600">Preview mode</div>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={async () => { await logout(); navigate("/login"); }}>
                    <LogOut className="h-4 w-4 mr-2" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full px-4 md:px-6 lg:px-8 py-5 md:py-8 pb-24 md:pb-8 bg-muted/30">
          <div className="mx-auto w-full max-w-[1500px]">{children}</div>
        </main>

        {/* Mobile bottom tab bar */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-card/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
          <ul className="grid grid-cols-5">
            {mobileTabs.map((t) => {
              const active = t.to === "/" ? pathname === "/" : pathname.startsWith(t.to);
              const Icon = t.icon;
              return (
                <li key={t.to}>
                  <NavLink
                    to={t.to}
                    className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium ${
                      active ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {t.primary ? (
                      <span className={`mb-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full ${
                        active ? "bg-[hsl(var(--primary))] text-primary-foreground" : "bg-secondary text-foreground"
                      } shadow-sm`}>
                        <Icon className="h-4 w-4" />
                      </span>
                    ) : (
                      <Icon className={`h-5 w-5 ${active ? "text-[hsl(var(--primary-deep))]" : ""}`} />
                    )}
                    <span>{t.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
