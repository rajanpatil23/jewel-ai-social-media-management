import { ReactNode } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Bell, Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-dark">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="sticky top-0 z-30 h-16 border-b border-border/60 bg-background/70 backdrop-blur-xl">
            <div className="h-full flex items-center gap-3 px-4 md:px-6">
              <SidebarTrigger className="text-muted-foreground hover:text-primary" />
              <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
                <div className="relative w-full">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search posts, campaigns, hashtags…" className="pl-9 bg-secondary/50 border-border/60" />
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Button variant="outline" size="sm" className="hidden sm:inline-flex gap-1.5 border-primary/30 text-primary hover:bg-primary/10 hover:text-primary">
                  <Sparkles className="h-3.5 w-3.5" /> AI Credits · 1,240
                </Button>
                <Button size="icon" variant="ghost" className="text-muted-foreground hover:text-primary">
                  <Bell className="h-4 w-4" />
                </Button>
                <Avatar className="h-9 w-9 border border-primary/40">
                  <AvatarFallback className="bg-gradient-gold text-primary-foreground font-display">MA</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-8 animate-fade-in">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
