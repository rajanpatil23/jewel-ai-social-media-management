import AppLayout from "@/components/AppLayout";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Users, Heart, MessageSquare, Share2, Bookmark, TrendingUp, Sparkles } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, PieChart, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { reachData, followerData, engagementBreakdown, aiRecommendations, recentPosts, productImages } from "@/lib/mockData";

const stats = [
  { label: "Reach", value: "412.4K", delta: "+24%", icon: Eye },
  { label: "Impressions", value: "1.2M", delta: "+18%", icon: Eye },
  { label: "Follower Growth", value: "+8.2K", delta: "+12%", icon: Users },
  { label: "Engagement Rate", value: "8.4%", delta: "+1.6pt", icon: TrendingUp },
  { label: "Likes", value: "48.2K", delta: "+22%", icon: Heart },
  { label: "Comments", value: "6.4K", delta: "+9%", icon: MessageSquare },
  { label: "Shares", value: "3.1K", delta: "+14%", icon: Share2 },
  { label: "Saves", value: "9.7K", delta: "+31%", icon: Bookmark },
];

const COLORS = ["hsl(42 65% 58%)", "hsl(45 85% 70%)", "hsl(38 55% 42%)", "hsl(42 30% 80%)"];

const tooltipStyle = { background: "hsl(0 0% 6%)", border: "1px solid hsl(42 20% 18%)", borderRadius: 8, fontSize: 12 };

export default function Analytics() {
  return (
    <AppLayout>
      <PageHeader eyebrow="Analytics" title="Performance Intelligence" description="Real-time engagement, reach and AI-driven recommendations." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <Card key={s.label} className="glass p-5 hover-lift">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <s.icon className="h-4 w-4 text-primary" />
            </div>
            <p className="font-display text-3xl gold-text mt-2">{s.value}</p>
            <p className="text-xs text-success mt-1">▲ {s.delta}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="glass p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div><h3 className="font-display text-2xl">Reach & Impressions</h3><p className="text-xs text-muted-foreground">Last 7 days</p></div>
            <Badge variant="outline" className="border-primary/30 text-primary">Weekly</Badge>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={reachData}>
              <defs>
                <linearGradient id="r" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="hsl(42 65% 58%)" stopOpacity={0.6} /><stop offset="100%" stopColor="hsl(42 65% 58%)" stopOpacity={0} /></linearGradient>
                <linearGradient id="i" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="hsl(45 85% 70%)" stopOpacity={0.4} /><stop offset="100%" stopColor="hsl(45 85% 70%)" stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(42 20% 18%)" />
              <XAxis dataKey="name" stroke="hsl(42 10% 60%)" fontSize={12} />
              <YAxis stroke="hsl(42 10% 60%)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area type="monotone" dataKey="impressions" stroke="hsl(45 85% 70%)" fill="url(#i)" strokeWidth={2} />
              <Area type="monotone" dataKey="reach" stroke="hsl(42 65% 58%)" fill="url(#r)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="glass p-6">
          <h3 className="font-display text-2xl mb-1">Engagement Mix</h3>
          <p className="text-xs text-muted-foreground mb-4">Breakdown · 30 days</p>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={engagementBreakdown} dataKey="value" innerRadius={55} outerRadius={90} paddingAngle={3}>
                {engagementBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {engagementBreakdown.map((e, i) => (
              <div key={e.name} className="flex items-center gap-2 text-xs"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} /><span className="text-muted-foreground">{e.name}</span><span className="ml-auto font-medium">{e.value.toLocaleString()}</span></div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <Card className="glass p-6">
          <h3 className="font-display text-2xl mb-1">Follower Growth</h3>
          <p className="text-xs text-muted-foreground mb-4">8 weeks</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={followerData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(42 20% 18%)" />
              <XAxis dataKey="name" stroke="hsl(42 10% 60%)" fontSize={12} />
              <YAxis stroke="hsl(42 10% 60%)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="value" stroke="hsl(45 85% 70%)" strokeWidth={2.5} dot={{ fill: "hsl(42 65% 58%)" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card className="glass p-6 lg:col-span-2">
          <h3 className="font-display text-2xl mb-1">Daily Engagement</h3>
          <p className="text-xs text-muted-foreground mb-4">Likes + comments + shares</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={reachData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(42 20% 18%)" />
              <XAxis dataKey="name" stroke="hsl(42 10% 60%)" fontSize={12} />
              <YAxis stroke="hsl(42 10% 60%)" fontSize={12} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="engagement" radius={[6,6,0,0]} fill="hsl(42 65% 58%)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass p-6">
          <h3 className="font-display text-2xl mb-1">Best Performing Posts</h3>
          <p className="text-xs text-muted-foreground mb-4">Top 4 by engagement</p>
          <div className="space-y-3">
            {recentPosts.map((p, i) => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30 border border-border/40">
                <div className="font-display text-2xl gold-text w-6 text-center">{i+1}</div>
                <img src={productImages[p.img as keyof typeof productImages]} alt="" className="h-12 w-12 rounded-lg object-cover" loading="lazy" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">{p.title}</p>
                  <p className="text-xs text-muted-foreground">{p.platform}</p>
                </div>
                <div className="text-right"><p className="font-medium text-sm">{p.likes.toLocaleString()}</p><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Engagement</p></div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="glass p-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-gradient-gold-soft blur-2xl" />
          <div className="relative">
            <Badge className="bg-gradient-gold text-primary-foreground mb-3"><Sparkles className="h-3 w-3 mr-1" /> Aurum AI</Badge>
            <h3 className="font-display text-2xl mb-1">AI Recommendations</h3>
            <p className="text-xs text-muted-foreground mb-4">Personalized for Maison Aurelia</p>
            <div className="space-y-3">
              {aiRecommendations.map((r, i) => (
                <div key={i} className="p-4 rounded-xl border border-border/60 bg-secondary/30 hover:border-primary/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-sm">{r.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{r.detail}</p>
                    </div>
                    <Badge variant="outline" className={r.priority === "High" ? "border-primary/40 text-primary" : "border-border text-muted-foreground"}>{r.priority}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
