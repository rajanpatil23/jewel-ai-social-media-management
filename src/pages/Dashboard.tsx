import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Sparkles, CalendarDays, BarChart3, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Posts published", value: "128", trend: "+12%" },
  { label: "Avg. engagement", value: "6.4%", trend: "+0.8%" },
  { label: "Reach this month", value: "84.2k", trend: "+23%" },
  { label: "AI credits left", value: "1,240", trend: "" },
];

export default function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-10">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--primary-deep))]">Welcome back</span>
          <h1 className="font-display text-4xl tracking-tight">Maison Aurelia</h1>
          <p className="text-sm text-muted-foreground">AI-powered content creation for luxury jewelry brands.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="p-5 rounded-xl border-border/70 shadow-[var(--shadow-elegant)]">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="font-display text-3xl mt-1.5">{s.value}</p>
              {s.trend && (
                <p className="text-xs text-[hsl(var(--primary-deep))] mt-1 inline-flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> {s.trend}
                </p>
              )}
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {[
            { to: "/", icon: Sparkles, title: "AI Studio", desc: "Generate jewelry creatives with one prompt." },
            { to: "/post", icon: CalendarDays, title: "Scheduler", desc: "Publish to Instagram & Facebook in one click." },
            { to: "/analytics", icon: BarChart3, title: "Analytics", desc: "Track reach, engagement, and growth." },
          ].map((a) => (
            <Card key={a.to} className="p-6 rounded-xl border-border/70 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-gold)] transition-shadow">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary-deep))] flex items-center justify-center mb-4">
                <a.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl">{a.title}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">{a.desc}</p>
              <Button asChild variant="luxe" size="sm" className="rounded-md"><Link to={a.to}>Open</Link></Button>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
