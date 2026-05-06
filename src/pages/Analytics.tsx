import { useEffect, useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from "recharts";
import { api, tryApi } from "@/lib/api";
import { usePosts } from "@/lib/posts";
import { useConnections } from "@/lib/connections";
import { Loader2, AlertTriangle } from "lucide-react";

type Summary = {
  totals: { published?: number; scheduled?: number; drafts?: number; failed?: number; total?: number };
  recent: any[];
  insights: { page?: { data?: any[] }; ig?: { data?: any[] } | null; error?: string } | null;
};

export default function Analytics() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const { posts } = usePosts();
  const { isConnected } = useConnections();

  useEffect(() => {
    (async () => {
      const r = await tryApi(() => api.get<Summary>("/analytics/summary"));
      setData(r);
      setLoading(false);
    })();
  }, []);

  // Build a 12-week reach series from Page insights when available, else from local posts.
  const reachSeries = buildReachSeries(data, posts);
  const top = buildTopPosts(posts);

  const t = data?.totals || {};
  const cards = [
    { label: "Published", value: Number(t.published || 0) },
    { label: "Scheduled", value: Number(t.scheduled || 0) },
    { label: "Drafts",    value: Number(t.drafts || 0) },
    { label: "Failed",    value: Number(t.failed || 0) },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="space-y-2">
          <span className="text-xs uppercase tracking-[0.2em] text-[hsl(var(--primary-deep))]">Insights</span>
          <h1 className="font-display text-4xl tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Performance across Instagram and Facebook.
            {!isConnected("meta") && (
              <> {" "}<a href="/connections" className="underline">Connect Meta</a> to see real reach & engagement.</>
            )}
          </p>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cards.map(c => (
            <Card key={c.label} className="p-4">
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-display mt-1 tabular-nums">{c.value}</p>
            </Card>
          ))}
        </div>

        {data?.insights?.error && (
          <div className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Meta insights: {data.insights.error}
          </div>
        )}

        <Card className="p-6 rounded-xl border-border/70 shadow-[var(--shadow-elegant)]">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="font-display text-xl">Reach & Engagement</h2>
            <Badge variant="outline" className="text-[10px]">
              {data?.insights?.page?.data?.length ? "Meta Graph" : "From your posts"}
            </Badge>
          </div>
          <div className="h-72">
            {loading ? (
              <div className="h-full flex items-center justify-center text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reachSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Line type="monotone" dataKey="reach" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="engagement" stroke="hsl(var(--primary-deep))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6 rounded-xl border-border/70 shadow-[var(--shadow-elegant)]">
          <h2 className="font-display text-xl mb-4">Recent posts</h2>
          {top.length === 0 ? (
            <p className="text-sm text-muted-foreground">No posts yet. Create your first post to see it here.</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={top}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Bar dataKey="v" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </AppLayout>
  );
}

function buildReachSeries(data: Summary | null, posts: any[]) {
  const pageData = data?.insights?.page?.data || [];
  const impressions = pageData.find((m: any) => m.name === "page_impressions");
  const engagements = pageData.find((m: any) => m.name === "page_post_engagements");
  if (impressions?.values?.length) {
    return impressions.values.map((v: any, i: number) => ({
      day: new Date(v.end_time).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      reach: v.value || 0,
      engagement: engagements?.values?.[i]?.value || 0,
    }));
  }
  // Fallback: build a 12-week series from local posts
  const weeks = Array.from({ length: 12 }, (_, i) => ({ day: `W${i+1}`, reach: 0, engagement: 0 }));
  posts.forEach(p => {
    const when = new Date(p.scheduledAt || p.createdAt);
    const weeksAgo = Math.floor((Date.now() - when.getTime()) / (7*24*3600*1000));
    if (weeksAgo >= 0 && weeksAgo < 12) {
      const idx = 11 - weeksAgo;
      weeks[idx].reach += 1;
      weeks[idx].engagement += p.status === "published" ? 1 : 0;
    }
  });
  return weeks;
}

function buildTopPosts(posts: any[]) {
  return posts.slice(0, 6).map(p => ({
    name: (p.title || "Post").slice(0, 18),
    v: p.status === "published" ? 100 : p.status === "scheduled" ? 60 : 30,
  }));
}
