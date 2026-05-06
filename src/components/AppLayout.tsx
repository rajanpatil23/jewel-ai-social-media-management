import { ReactNode } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ImageIcon, Send, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const nav = [
  { to: "/", label: "Image Generation", icon: ImageIcon },
  { to: "/post", label: "Post to Meta", icon: Send },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur">
        <div className="h-full max-w-6xl mx-auto flex items-center gap-6 px-4 md:px-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold tracking-tight">Aurum AI</span>
          </div>
          <nav className="flex items-center gap-1 ml-2">
            {nav.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                    active
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-secondary text-foreground text-xs">MA</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
