import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/AppLayout";
import { ArrowRight, Sparkles, CalendarPlus, BarChart3, Instagram, Facebook, TrendingUp, Zap, Clock, Heart } from "lucide-react";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-jewelry.jpg";
import { kpis, recentPosts, productImages } from "@/lib/mockData";

const iconForKpi = [TrendingUp, Clock, Heart, Zap];

export default function Overview() {
  return (
    <AppLayout>
      {/* HERO */}
      <section className="relative overflow-hidden rounded-2xl glass-strong grain mb-10">
        <div className="absolute inset-0">
          <img src={heroImg} alt="Luxury jewelry" className="w-full h-full object-cover opacity-35" width={1920} height={1080} />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        </div>
        <div className="relative grid md:grid-cols-2 gap-8 p-8 md:p-14 items-center">
          <div className="space-y-6 animate-fade-in">
            <Badge variant="outline" className="border-primary/40 text-primary bg-primary/5 px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1.5" /> AI-Powered · Built for Jewelry
            </Badge>
            <h1 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05]">
              <span className="text-foreground">AI-Powered Social Media </span>
              <span className="gold-text">Platform for Luxury Jewelry Brands</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl">
              Create, schedule, publish, and optimize premium jewelry content with AI — crafted for ateliers, maisons, and bridal houses.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Button asChild variant="gold" size="lg"><Link to="/studio"><Sparkles className="h-4 w-4" /> Generate New Post</Link></Button>
              <Button asChild variant="luxe" size="lg"><Link to="/calendar"><CalendarPlus className="h-4 w-4" /> Schedule Campaign</Link></Button>
              <Button asChild variant="ghost" size="lg" className="text-foreground"><Link to="/analytics"><BarChart3 className="h-4 w-4" /> View Analytics <ArrowRight className="h-4 w-4" /></Link></Button>
            </div>
            <div className="flex items-center gap-4 pt-3 text-xs text-muted-foreground">
              <div className="flex -space-x-2">
                {(["ring","necklace","earrings"] as const).map(k => (
                  <img key={k} src={productImages[k]} alt="" className="h-8 w-8 rounded-full border border-primary/40 object-cover" />
                ))}
              </div>
              <span>Trusted by 240+ luxury jewelry maisons worldwide</span>
            </div>
          </div>
          <div className="relative hidden md:block animate-scale-in">
            <div className="absolute -inset-4 bg-gradient-gold opacity-20 blur-2xl rounded-full" />
            <Card className="glass-strong relative overflow-hidden p-0 rounded-2xl border-primary/30">
              <img src={productImages.ad} alt="AI generated jewelry creative" loading="lazy" width={1024} height={1024} className="w-full aspect-square object-cover" />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className="bg-background/70 backdrop-blur border-primary/40 text-primary">AI Generated</Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* KPI CARDS */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {kpis.map((kpi, i) => {
          const Icon = iconForKpi[i];
          return (
            <Card key={kpi.label} className="glass hover-lift relative overflow-hidden p-6 group">
              <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-gold-soft opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
                  <p className="font-display text-4xl mt-3 gold-text">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground mt-2">{kpi.hint}</p>
                </div>
                <div className="h-10 w-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 inline-flex items-center text-xs text-success font-medium">
                <TrendingUp className="h-3 w-3 mr-1" /> {kpi.delta}
              </div>
            </Card>
          );
        })}
      </section>

      {/* RECENT */}
      <section className="grid lg:grid-cols-3 gap-6">
        <Card className="glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display text-2xl">Recent Posts</h3>
              <p className="text-xs text-muted-foreground">Top published content this week</p>
            </div>
            <Button asChild variant="ghost" size="sm"><Link to="/dashboard">View all <ArrowRight className="h-3 w-3" /></Link></Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {recentPosts.map(p => (
              <div key={p.id} className="group flex gap-4 p-3 rounded-xl bg-secondary/30 border border-border/50 hover:border-primary/40 transition-colors">
                <img src={productImages[p.img as keyof typeof productImages]} alt={p.title} loading="lazy" className="h-20 w-20 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    {p.platform === "Instagram" || p.platform === "Both" ? <Instagram className="h-3 w-3 text-primary" /> : null}
                    {p.platform === "Facebook" || p.platform === "Both" ? <Facebook className="h-3 w-3 text-primary" /> : null}
                    <span>{p.platform}</span>
                  </div>
                  <p className="font-medium truncate mt-1">{p.title}</p>
                  <div className="flex gap-3 text-xs text-muted-foreground mt-2">
                    <span>♥ {p.likes.toLocaleString()}</span>
                    <span>💬 {p.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass p-6">
          <h3 className="font-display text-2xl mb-1">Quick Actions</h3>
          <p className="text-xs text-muted-foreground mb-5">Jump into your most-used flows</p>
          <div className="space-y-3">
            {[
              { label: "Generate AI Creative", icon: Sparkles, to: "/studio", desc: "Create a new ad in 30s" },
              { label: "Open Composer", icon: Megaphone1, to: "/composer", desc: "Draft a multi-platform post" },
              { label: "Schedule Campaign", icon: CalendarPlus, to: "/calendar", desc: "Plan the week ahead" },
              { label: "Performance Report", icon: BarChart3, to: "/analytics", desc: "See last 30 days" },
            ].map(a => (
              <Link key={a.label} to={a.to} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <div className="h-10 w-10 rounded-lg bg-gradient-gold-soft border border-primary/30 flex items-center justify-center text-primary"><a.icon className="h-4 w-4" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{a.label}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </AppLayout>
  );
}

import { Megaphone as Megaphone1 } from "lucide-react";
