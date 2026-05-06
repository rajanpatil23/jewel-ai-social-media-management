import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Sparkles, CalendarDays, Megaphone, Instagram, Facebook,
  BarChart3, Settings, Workflow, Gem,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarHeader, SidebarFooter, useSidebar,
} from "@/components/ui/sidebar";

const main = [
  { title: "Overview", url: "/", icon: LayoutDashboard },
  { title: "Brand Dashboard", url: "/dashboard", icon: Gem },
  { title: "AI Content Studio", url: "/studio", icon: Sparkles },
  { title: "Post Composer", url: "/composer", icon: Megaphone },
  { title: "Content Calendar", url: "/calendar", icon: CalendarDays },
  { title: "Campaigns", url: "/campaigns", icon: Megaphone },
];
const channels = [
  { title: "Instagram", url: "/instagram", icon: Instagram },
  { title: "Facebook", url: "/facebook", icon: Facebook },
];
const insights = [
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Automation", url: "/automation", icon: Workflow },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (p: string) => p === "/" ? pathname === "/" : pathname.startsWith(p);

  const renderItem = (item: typeof main[number]) => (
    <SidebarMenuItem key={item.url}>
      <SidebarMenuButton asChild isActive={isActive(item.url)} tooltip={item.title}>
        <NavLink to={item.url} end={item.url === "/"} className="group">
          <item.icon className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="font-medium">{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="relative h-9 w-9 rounded-lg bg-gradient-gold flex items-center justify-center shadow-gold">
            <Gem className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-display text-lg gold-text">Aurum AI</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Luxury Suite</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{main.map(renderItem)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Channels</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{channels.map(renderItem)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Insights</SidebarGroupLabel>
          <SidebarGroupContent><SidebarMenu>{insights.map(renderItem)}</SidebarMenu></SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border">
        {!collapsed ? (
          <div className="m-2 rounded-lg glass p-3">
            <p className="text-xs text-muted-foreground">Demo workspace</p>
            <p className="text-sm font-medium gold-text">Maison Aurelia</p>
          </div>
        ) : (
          <div className="m-2 h-9 rounded-lg bg-gradient-gold-soft border border-border flex items-center justify-center">
            <span className="text-xs font-display gold-text">M</span>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
